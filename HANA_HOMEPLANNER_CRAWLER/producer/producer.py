import os
import time
import requests
import json
import sys
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler
from kafka import KafkaProducer
import redis
from logging.handlers import TimedRotatingFileHandler
from pymongo import MongoClient
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# ==============================
# 환경변수 설정
# ==============================
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC_NAME = os.getenv("KAFKA_TOPIC_NAME", "cheongyak.new_notice")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_TTL = int(os.getenv("REDIS_TTL", "2592000"))
MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "home_planner")
MONGO_COLLECTION_DATA = os.getenv("MONGO_COLLECTION_DATA", "applyhome_data")

# 환경변수 로드 확인 로그
print("=" * 50)
print("🔧 Producer 환경변수 로드 확인")
print("=" * 50)
print(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")
print(f"KAFKA_TOPIC_NAME: {KAFKA_TOPIC_NAME}")
print(f"REDIS_HOST: {REDIS_HOST}")
print(f"REDIS_PORT: {REDIS_PORT}")
print(f"REDIS_TTL: {REDIS_TTL}")
print(f"MONGO_URI: {MONGO_URI}")
print(f"MONGO_DB_NAME: {MONGO_DB_NAME}")
print(f"MONGO_COLLECTION_DATA: {MONGO_COLLECTION_DATA}")
print("=" * 50)

## DB 연결
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
collection = db[MONGO_COLLECTION_DATA]

# ==============================
# 로그 설정
# ==============================
LOG_FILE = "scheduler.log"

# 포맷 설정
log_formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
)

# 콘솔 로그 핸들러
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(log_formatter)

# 파일 로그 핸들러 (매일 회전)
file_handler = TimedRotatingFileHandler(LOG_FILE, when="midnight", interval=1, encoding="utf-8")
file_handler.suffix = "%Y-%m-%d"
file_handler.setFormatter(log_formatter)

# 루트 로거 설정
logging.basicConfig(level=logging.INFO, handlers=[console_handler, file_handler])
logger = logging.getLogger(__name__)

# ==============================
# Kafka 설정
# ==============================
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BOOTSTRAP_SERVERS],
    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
)

# ==============================
# Redis 설정
# ==============================
try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
    r.ping()
    logger.info("✅ Redis 연결 성공")
except Exception as e:
    logger.error(f"❌ Redis 연결 실패: {e}")
    sys.exit(1)

# ==============================
# 청약홈 API 설정
# ==============================
API_URL = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail"
SERVICE_KEY = os.getenv("CHEONGYAK_SERVICE_KEY", "")


def get_date_range():
    """오늘 ~ 한 달 후 날짜 범위 반환"""
    today = datetime.now()
    one_month_later = today + timedelta(days=30)
    return today.strftime("%Y-%m-%d"), one_month_later.strftime("%Y-%m-%d")


def is_new_notice(notice_id: str) -> bool:
    """Redis에 notice_id 존재 여부 확인 및 저장"""
    if not notice_id:
        return False
    key = f"notice:{notice_id}"
    if r.exists(key):
        return False  # 이미 존재함
    r.set(key, 1, ex=REDIS_TTL)
    return True


def fetch_notices():
    """청약홈 API 호출"""
    start_date, end_date = get_date_range()
    params = {
        "page": 1,
        "perPage": 100,
        "serviceKey": SERVICE_KEY,
        "cond[RCRIT_PBLANC_DE::GTE]": start_date,
        "cond[RCRIT_PBLANC_DE::LTE]": end_date,
    }

    res = requests.get(API_URL, params=params, timeout=15)
    res.raise_for_status()
    data = res.json()
    return data.get("data", [])


def check_and_publish():
    """새 공고 감지 후 Kafka 발행"""
    start_date, end_date = get_date_range()
    logger.info(f"🕐 청약홈 새 공고 감시 중... (범위: {start_date} ~ {end_date})")

    try:
        notices = fetch_notices()
        new_count = 0
        for n in notices:
            notice_id = n.get("HOUSE_MANAGE_NO")
            
            # ✅ Redis 중복 확인
            if is_new_notice(notice_id):
                new_count += 1
                # ✅ 1. applyhome_data에 raw 데이터 저장
                n["_id"] = notice_id
                collection.update_one({"_id": notice_id}, {"$set": n}, upsert=True)
                logger.info(f"📦 MongoDB 저장 완료: {notice_id}")

                # ✅ 2. Kafka 발행 (좌표 계산용 데이터만)
                producer.send(KAFKA_TOPIC_NAME, value={
                    "notice_id": notice_id,
                    "region": n.get("HSSPLY_ADRES"),
                    "title": n.get("HOUSE_NM"),
                    "url": f"https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo={notice_id}&pblancNo={notice_id}"
                })

        if new_count == 0:
            logger.info("ℹ️ 새로운 공고 없음.")
        else:
            producer.flush()
            logger.info(f"✅ Kafka에 {new_count}건 발행 완료.")

    except Exception as e:
        logger.error(f"❌ 오류 발생: {e}", exc_info=True)


# ==============================
# 스케줄러 설정
# ==============================
scheduler = BlockingScheduler(timezone="Asia/Seoul")
scheduler.add_job(check_and_publish, 'interval', minutes=5, id='notice_polling')


def graceful_shutdown():
    """Kafka Producer 및 스케줄러 안전 종료"""
    logger.info("🛑 종료 신호 감지! Kafka Producer 및 스케줄러 종료 중...")
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            logger.info("🕓 스케줄러 종료 완료.")
    except Exception:
        pass

    try:
        producer.flush()
        producer.close()
        logger.info("💾 Kafka Producer 종료 완료.")
    except Exception:
        pass

    logger.info("👋 프로그램이 안전하게 종료되었습니다.")
    sys.exit(0)


# ==============================
# 메인 실행부
# ==============================
if __name__ == "__main__":
    logger.info("🚀 청약홈 새 공고 감시 & Kafka 발행 스케줄러 시작")

    try:
        check_and_publish()  # 즉시 1회 실행
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        graceful_shutdown()
