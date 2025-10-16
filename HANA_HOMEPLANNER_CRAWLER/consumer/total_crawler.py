# -*- coding: utf-8 -*-
import os
import re
import time
import requests
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# =========================
# 환경변수 설정
# =========================
NCP_MAPS_KEY_ID = os.getenv("NCP_MAPS_KEY_ID", "")
NCP_MAPS_KEY = os.getenv("NCP_MAPS_KEY", "")
MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "home_planner")
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_DATA", "applyhome_data")

# 환경변수 로드 확인 로그
print("=" * 50)
print("🔧 Total Crawler 환경변수 로드 확인")
print("=" * 50)
print(f"NCP_MAPS_KEY_ID: {NCP_MAPS_KEY_ID[:10]}..." if NCP_MAPS_KEY_ID else "NCP_MAPS_KEY_ID: (비어있음)")
print(f"NCP_MAPS_KEY: {NCP_MAPS_KEY[:10]}..." if NCP_MAPS_KEY else "NCP_MAPS_KEY: (비어있음)")
print(f"MONGO_URI: {MONGO_URI}")
print(f"MONGO_DB_NAME: {MONGO_DB_NAME}")
print(f"MONGO_COLLECTION_NAME: {MONGO_COLLECTION_NAME}")
print("=" * 50)

# =========================
# 네이버 지도 API 설정
# =========================
GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode"
NAVER_API_HEADERS = {
    "X-NCP-APIGW-API-KEY-ID": NCP_MAPS_KEY_ID,
    "X-NCP-APIGW-API-KEY": NCP_MAPS_KEY,
}

SLEEP_SEC = 0.2
RETRY_MAX = 3
TIMEOUT = 7


def tidy(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())

def drop_parentheses(s: str) -> str:
    return tidy(re.sub(r"\(.*?\)", "", s))

def drop_suffixes(s: str) -> str:
    s = re.sub(r"(번지\s*일원|일원)\b", "", s)
    s = re.sub(r"(외\s*\d*\s*필지|외)\b", "", s)
    s = re.sub(r"(지구\s*내|지구내)\b", "", s)
    s = re.sub(r"\b일대\b", "", s)
    return tidy(s)

def normalize_candidates(addr: str):
    cands = [tidy(addr)]
    cands.append(drop_parentheses(addr))
    cands.append(drop_suffixes(addr))
    return list(dict.fromkeys(cands))  # 중복 제거


def geocode(query: str):
    """네이버 API로 주소를 좌표로 변환"""
    if not query:
        return None
    params = {"query": query}
    for attempt in range(1, RETRY_MAX + 1):
        try:
            resp = requests.get(GEOCODE_URL, headers=NAVER_API_HEADERS, params=params, timeout=TIMEOUT)
            resp.raise_for_status()
            data = resp.json()
            addrs = data.get("addresses", [])
            if addrs:
                x, y = addrs[0].get("x"), addrs[0].get("y")
                if x and y:
                    return {"x": float(x), "y": float(y)}
        except Exception as e:
            if attempt == RETRY_MAX:
                print(f"❌ geocode 실패 ({query}): {e}")
            time.sleep(0.5 * attempt)
    return None


def update_coordinates(notice_id: str, region: str):
    """notice_id와 region을 받아 좌표를 계산 후 MongoDB에 업데이트"""
    print(f"\n[DEBUG] 🧭 update_coordinates 호출됨 — ID={notice_id}, region={region}")

    if not NCP_MAPS_KEY_ID or not NCP_MAPS_KEY:
        print("[경고] 네이버 API 키가 비어 있습니다.")
        return

    if not notice_id or not region:
        print("❌ notice_id 또는 region 값이 비어 있습니다.")
        return

    # 1️⃣ Mongo 연결
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_DB_NAME]
        coll = db[MONGO_COLLECTION_NAME]
        client.admin.command("ping")
        print("✅ MongoDB 연결 성공")
    except (ConnectionFailure, OperationFailure) as e:
        print(f"❌ MongoDB 연결 실패: {e}")
        return

    # 2️⃣ 좌표 계산
    xy = None
    for q in normalize_candidates(region):
        xy = geocode(q)
        if xy:
            print(f"✅ 좌표 획득 성공 — x: {xy['x']}, y: {xy['y']}")
            break
        time.sleep(SLEEP_SEC)
    if not xy:
        xy = {"x": None, "y": None}
        print("⚠️ 좌표를 찾을 수 없습니다.")

    # 3️⃣ MongoDB 업데이트
    try:
        coll.update_one(
            {"_id": notice_id},
            {"$set": {
                "x": xy["x"],
                "y": xy["y"],
                "geocode_status": "OK" if xy["x"] else "NOT_FOUND"
            }},
            upsert=False
        )
        print(f"📦 MongoDB 업데이트 완료 (ID: {notice_id})")
    except Exception as e:
        print(f"❌ MongoDB 업데이트 실패: {e}")
    finally:
        client.close()
        print("🔌 MongoDB 연결 종료")
