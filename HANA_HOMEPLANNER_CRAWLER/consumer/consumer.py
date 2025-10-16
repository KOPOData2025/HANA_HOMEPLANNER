# -*- coding: utf-8 -*-
import os
import json
import logging
import time
from datetime import datetime, timedelta
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from dotenv import load_dotenv

# 내부 모듈 import
from total_crawler import update_coordinates
from gemini_api import main as run_gemini_processing_task

# 환경변수 로드
load_dotenv()

# =========================
# 환경변수 설정
# =========================
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC_NAME = os.getenv("KAFKA_TOPIC_NAME", "cheongyak.new_notice")

# 환경변수 로드 확인 로그
print("=" * 50)
print("🔧 Consumer 환경변수 로드 확인")
print("=" * 50)
print(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")
print(f"KAFKA_TOPIC_NAME: {KAFKA_TOPIC_NAME}")
print("=" * 50)

# =========================
# 로깅 설정
# =========================
logger = logging.getLogger("consumer")
logger.setLevel(logging.INFO)
logger.propagate = False
formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")

file_handler = logging.FileHandler("consumer.log", encoding="utf-8")
file_handler.setFormatter(formatter)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(stream_handler)

logger.info("🚀 Kafka Consumer 시작됨 — 토픽 감시 중: %s", KAFKA_TOPIC_NAME)

# =========================
# Kafka Consumer 생성 함수
# =========================
def create_consumer():
    """Kafka Consumer 생성"""
    return KafkaConsumer(
        KAFKA_TOPIC_NAME,
        bootstrap_servers=[KAFKA_BOOTSTRAP_SERVERS],
        auto_offset_reset='latest',
        enable_auto_commit=True,
        group_id='cheongyak-consumer-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8')),
    )

# =========================
# 재접속 로직이 있는 Consumer 연결
# =========================
def connect_with_retry(max_retries=10, retry_delay=5):
    """재시도 로직이 있는 Consumer 연결"""
    for attempt in range(max_retries):
        try:
            logger.info(f"🔄 Kafka 연결 시도 {attempt + 1}/{max_retries}")
            consumer = create_consumer()
            logger.info("✅ Kafka Consumer 연결 성공!")
            return consumer
        except NoBrokersAvailable as e:
            logger.error(f"❌ Kafka 연결 실패 (시도 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"⏳ {retry_delay}초 후 재시도...")
                time.sleep(retry_delay)
            else:
                logger.error("❌ 최대 재시도 횟수 초과. 프로그램 종료.")
                raise
        except Exception as e:
            logger.error(f"❌ 예상치 못한 오류: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise

# =========================
# 메인 실행부
# =========================
try:
    consumer = connect_with_retry()
    
    # =========================
    # 메시지 루프
    # =========================
    for message in consumer:
        try:
            notice = message.value
            notice_id = notice.get("notice_id")
            region = notice.get("region")
            pdf_url = notice.get("url")
            title = notice.get("title")

            logger.info("=" * 70)
            logger.info(f"📩 새 공고 수신 — {title} ({notice_id}) / {region}")
            logger.info(f"🔗 상세 페이지: {pdf_url}")

            # =============================
            # Step 1️⃣ 좌표 업데이트
            # =============================
            try:
                logger.info(f"🧭 [Step1] 좌표 계산 및 MongoDB 업데이트 시작")
                update_coordinates(notice_id=notice_id, region=region)
                logger.info(f"✅ [Step1 완료] 좌표 업데이트 완료 ({notice_id})")
            except Exception as e:
                logger.error(f"❌ Step1 오류: {e}", exc_info=True)
                continue  # Step2 진행하지 않음

            # =============================
            # Step 2️⃣ PDF → Gemini 분석
            # =============================
            try:
                logger.info("🤖 [Step2] Gemini PDF 분석 시작")
                logger.info("🔗 PDF 상세 페이지 URL: %s", pdf_url)
                run_gemini_processing_task(
                    house_manage_no=notice_id,
                    pblanc_no=notice_id,
                    pdf_detail_url=pdf_url   # 상세 페이지 URL 전달
                )
                logger.info("✅ [Step2 완료] Gemini 분석 및 MongoDB 저장 완료")
            except Exception as e:
                logger.error(f"❌ Step2 오류 (Gemini 분석 실패): {e}", exc_info=True)
                continue

            logger.info(f"🎯 전체 파이프라인 완료 — 공고ID: {notice_id}")
            logger.info("=" * 70 + "\n")

        except Exception as e:
            logger.error(f"❌ 전체 처리 중 예외 발생: {e}", exc_info=True)

except KeyboardInterrupt:
    logger.info("🛑 사용자에 의해 중단됨")
except Exception as e:
    logger.error(f"❌ 치명적 오류: {e}")
finally:
    if 'consumer' in locals():
        consumer.close()
        logger.info("🔌 Kafka Consumer 연결 종료")
