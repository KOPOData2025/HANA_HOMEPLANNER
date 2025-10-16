# -*- coding: utf-8 -*-
import os
import io
import json
import logging
import traceback
from datetime import datetime
from pathlib import Path

import requests
import pdfplumber
import boto3
from bs4 import BeautifulSoup
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from pymongo.write_concern import WriteConcern

try:
    import google.generativeai as genai
except ImportError:
    print("❌ 'google-generativeai' 라이브러리가 없습니다. pip install google-generativeai 필요.")
    genai = None

# =========================
# 로깅 설정
# =========================
logging.basicConfig(level=logging.ERROR, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# 환경변수 로드
from dotenv import load_dotenv
load_dotenv()

# =========================
# 환경변수 설정
# =========================
JSON_DIR = os.getenv("JSON_DIR", "./jsons")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_NAME = "gemini-2.5-flash"
PDF_DETAIL_PAGE_BASE = "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do"

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "")
AWS_REGION = "ap-northeast-2"
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")

MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "home_planner")
MONGO_COLLECTION_JSON = os.getenv("MONGO_COLLECTION_JSON", "applyhome_json")
MONGO_COLLECTION_DATA = os.getenv("MONGO_COLLECTION_DATA", "applyhome_data")

# 환경변수 로드 확인 로그
print("=" * 50)
print("🔧 Gemini API 환경변수 로드 확인")
print("=" * 50)
print(f"JSON_DIR: {JSON_DIR}")
print(f"GEMINI_API_KEY: {GEMINI_API_KEY[:10]}..." if GEMINI_API_KEY else "GEMINI_API_KEY: (비어있음)")
print(f"GEMINI_MODEL_NAME: {GEMINI_MODEL_NAME}")
print(f"S3_BUCKET_NAME: {S3_BUCKET_NAME}")
print(f"AWS_REGION: {AWS_REGION}")
print(f"AWS_ACCESS_KEY_ID: {AWS_ACCESS_KEY_ID[:10]}..." if AWS_ACCESS_KEY_ID else "AWS_ACCESS_KEY_ID: (비어있음)")
print(f"AWS_SECRET_ACCESS_KEY: {AWS_SECRET_ACCESS_KEY[:10]}..." if AWS_SECRET_ACCESS_KEY else "AWS_SECRET_ACCESS_KEY: (비어있음)")
print(f"MONGO_URI: {MONGO_URI}")
print(f"MONGO_DB_NAME: {MONGO_DB_NAME}")
print(f"MONGO_COLLECTION_JSON: {MONGO_COLLECTION_JSON}")
print(f"MONGO_COLLECTION_DATA: {MONGO_COLLECTION_DATA}")
print("=" * 50)

PROMPT = """
다음은 한 **청약 입주자모집공고 PDF**입니다. 

본문을 분석하여 아래 제시된 **JSON 스키마**에 맞춰 결과를 출력해 주세요. 

⚠️ 중요 규칙:
- 반드시 JSON 데이터만 출력 (설명, 주석, 불필요한 텍스트 제거).
- 공고문에 해당 정보가 없으면 `null` 또는 `""` 처리.
- 동일한 항목이 여러 개일 경우 배열(List)로 모두 출력.
- 공급금액, 납부일, 주택형 등은 PDF에 있는 만큼 동적으로 배열 크기를 맞춰 출력.
- 숫자는 `Number`, 금액은 원 단위 정수(Number), 날짜는 `"YYYY-MM-DD"` 형식 문자열로 작성.

---

### 🎯 JSON 스키마
```json
{
  "주택유형": "",
  "해당지역": "",
  "기타지역": "",
  "규제지역여부": "",
  "재당첨제한": "",
  "전매제한": "",
  "거주의무기간": "",
  "분양가상한제": "",
  "택지유형": "",
  "계약금상납일": "",
  "잔금처리일": "",
  "신청자격": {
    "특별공급": {
      "기관추천": {
        "청약통장 자격 요건": {
          "가입 여부": "",
          "가입 개월 수": 0,
          "예치금 충족 여부": "",
          "필요 예치금": 0
        },
        "세대주 요건": "",
        "소득 또는 자산 기준": ""
      },
      "다자녀가구": { "청약통장 자격 요건": { "가입 여부": "", "가입 개월 수": 0, "예치금 충족 여부": "", "필요 예치금": 0 }, "세대주 요건": "", "소득 또는 자산 기준": "" },
      "신혼부부": { "청약통장 자격 요건": { "가입 여부": "", "가입 개월 수": 0, "예치금 충족 여부": "", "필요 예치금": 0 }, "세대주 요건": "", "소득 또는 자산 기준": "" },
      "노부모부양": { "청약통장 자격 요건": { "가입 여부": "", "가입 개월 수": 0, "예치금 충족 여부": "", "필요 예치금": 0 }, "세대주 요건": "", "소득 또는 자산 기준": "" },
      "생애최초": { "청약통장 자격 요건": { "가입 여부": "", "가입 개월 수": 0, "예치금 충족 여부": "", "필요 예치금": 0 }, "세대주 요건": "", "소득 또는 자산 기준": "" }
    },
    "일반공급": {
      "1순위": { "청약통장 자격 요건": { "가입 여부": "", "가입 개월 수": 0, "예치금 충족 여부": "", "필요 예치금": 0 }, "세대주 요건": "", "소득 또는 자산 기준": "" },
      "2순위": { "청약통장 자격 요건": { "가입 여부": "", "가입 개월 수": 0, "예치금 충족 여부": "", "필요 예치금": 0 }, "세대주 요건": "", "소득 또는 자산 기준": "" }
    }
  },
  "특별공급 세대수": {
    "기관추천": { "주택형": 0 },
    "다자녀가구": { "주택형": 0 },
    "신혼부부": { "주택형": 0 },
    "노부모 부양": { "주택형": 0 },
    "생애최초": { "주택형": 0 }
  },
  "일반공급 세대수": {
    "일반공급": { "주택형": 0 }
  },
  "공급 금액 및 납부일": {
    "납부일": [
      { "구분": "계약금", "납부일": "" },
      { "구분": "중도금 1차", "납부일": "" },
      { "구분": "중도금 2차", "납부일": "" },
      { "구분": "잔금", "납부일": "" }
    ],
    "주택형": [
      {
        "타입": "",
        "계약금": ["", ""],
        "중도금": ["", "", ""],
        "잔금": ""
      }
    ]
  },
  "신청 기준": {
    "무주택": "",
    "자산": {
      "자산 체크 여부": "",
      "부동산": 0,
      "자동차": 0
    },
    "소득 기준": {
      "우선공급": 0,
      "일반공급": 0
    }
  }
}
```
"""


# =========================
# Helper Functions
# =========================
def get_first_pdf_link(detail_page_url: str):
    """상세 페이지에서 getAtchmnfl.do 링크를 추출 (리스트로 반환)."""
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(detail_page_url, headers=headers, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "getAtchmnfl.do" in href:
                if href.startswith("/"):
                    href = "https://static.applyhome.co.kr" + href
                links.append(href)

        if not links:
            log.error("❌ PDF 링크를 찾을 수 없습니다.")
            return []

        log.info(f"🔗 {len(links)}개의 PDF 링크 발견: {links}")
        return links

    except Exception as e:
        log.error(f"❌ PDF 링크 추출 실패: {e}")
        log.debug(traceback.format_exc())
        return []

def get_pdf_bytes(url: str) -> bytes:
    """PDF 다운로드."""
    try:
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
        return resp.content
    except Exception as e:
        log.error(f"❌ PDF 다운로드 실패: {e}")
        log.debug(traceback.format_exc())
        return None

def upload_to_s3(s3_client, pdf_bytes: bytes, object_name: str) -> str:
    """S3 업로드 후 URL 반환."""
    try:
        s3_client.upload_fileobj(
            io.BytesIO(pdf_bytes),
            S3_BUCKET_NAME,
            object_name,
            ExtraArgs={'ContentType': 'application/pdf'}
        )
        return f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_name}"
    except Exception as e:
        log.error(f"❌ S3 업로드 실패: {e}")
        log.debug(traceback.format_exc())
        return None

def analyze_with_gemini(model, pdf_bytes: bytes) -> dict:
    """PDF 텍스트 추출 → Gemini로 JSON 생성."""
    try:
        full_text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

        if not full_text.strip():
            log.error("❌ PDF에서 텍스트 추출 실패.")
            return None

        response = model.generate_content(f"{PROMPT}\n\n--- PDF 본문 ---\n\n{full_text}")
        json_str = response.text.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-3].strip()

        return json.loads(json_str)
    except Exception as e:
        log.error(f"❌ Gemini 분석 실패: {e}")
        log.debug(traceback.format_exc())
        return None

# =========================
# 메인 실행
# =========================
def main(house_manage_no: str, pblanc_no: str, pdf_detail_url: str = None):
    if not genai:
        log.error("❌ google-generativeai 미설치. 중단.")
        return

    # 초기화
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")

        db = client.get_database(MONGO_DB_NAME, write_concern=WriteConcern(w=1, wtimeout=5000))
        data_collection = db[MONGO_COLLECTION_DATA]
        json_collection = db[MONGO_COLLECTION_JSON]
    except Exception as e:
        log.error(f"❌ 초기화 실패: {e}")
        log.debug(traceback.format_exc())
        return

    if not pdf_detail_url:
        pdf_detail_url = f"{PDF_DETAIL_PAGE_BASE}?houseManageNo={house_manage_no}&pblancNo={pblanc_no}"

    # ✅ PDF 링크 목록에서 첫 번째만 사용
    pdf_links = get_first_pdf_link(pdf_detail_url)
    if not pdf_links:
        log.error("❌ PDF 링크 없음, 종료.")
        return

    pdf_download_url = pdf_links[0]  # ✅ 첫 번째 링크만 사용
    log.info(f"📄 선택된 PDF 링크: {pdf_download_url}")

    # PDF 다운로드
    pdf_bytes = get_pdf_bytes(pdf_download_url)
    if not pdf_bytes:
        log.error("❌ PDF 다운로드 실패, 종료.")
        return

    # S3 업로드
    file_id = f"{house_manage_no}_{pblanc_no}_1"
    s3_path = f"pdfs/{file_id}.pdf"
    s3_url = upload_to_s3(s3_client, pdf_bytes, s3_path)
    if not s3_url:
        log.error("❌ S3 업로드 실패, 종료.")
        return

    # Gemini 분석
    json_result = analyze_with_gemini(gemini_model, pdf_bytes)
    if not json_result:
        log.error("❌ 분석 실패, 종료.")
        return

    json_result["_id"] = file_id

    # 로컬 JSON 저장
    try:
        Path(JSON_DIR).mkdir(exist_ok=True)
        json_path = Path(JSON_DIR) / f"{file_id}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(json_result, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log.error(f"❌ JSON 파일 저장 실패: {e}")
        log.debug(traceback.format_exc())

    # MongoDB 저장
    try:
        json_collection.update_one({"_id": file_id}, {"$set": json_result}, upsert=True)
        data_collection.update_one(
            {"_id": house_manage_no},
            {"$addToSet": {"s3_pdf_urls": s3_url}, "$setOnInsert": {"createdAt": datetime.utcnow()}},
            upsert=True
        )
    except PyMongoError as e:
        log.error(f"❌ MongoDB 쓰기 실패: {e}")
        log.debug(traceback.format_exc())
    finally:
        try:
            client.close()
        except Exception:
            pass


if __name__ == "__main__":
    main(
        house_manage_no="2025000450",
        pblanc_no="2025000450",
        pdf_detail_url="https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000450&pblancNo=2025000450"
    )
