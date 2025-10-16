package com.hana_ti.home_planner.domain.calculation.constants;

import java.math.BigDecimal;

public final class CalculationConstants {

    private CalculationConstants() {
        // 유틸리티 클래스이므로 인스턴스화 방지
    }

    // ==================== 기본 상수 ====================
    
    /** 백분율 계산용 상수 */
    public static final BigDecimal PERCENTAGE_DIVISOR = BigDecimal.valueOf(100);
    
    /** 연간 개월수 */
    public static final BigDecimal MONTHS_PER_YEAR = BigDecimal.valueOf(12);
    
    /** 기본 소수점 자릿수 */
    public static final int DEFAULT_SCALE = 6;
    
    /** 금액 계산용 소수점 자릿수 */
    public static final int AMOUNT_SCALE = 0;
    
    /** 비율 계산용 소수점 자릿수 */
    public static final int RATIO_SCALE = 4;

    // ==================== DTI/DSR 관련 상수 ====================
    
    /** 기본 DTI 한도 (%) */
    public static final BigDecimal DEFAULT_DTI_LIMIT = BigDecimal.valueOf(40);
    
    /** 기본 DSR 한도 (%) */
    public static final BigDecimal DEFAULT_DSR_LIMIT = BigDecimal.valueOf(40);
    
    /** DTI/DSR 경고 임계값 (%) */
    public static final BigDecimal DTI_DSR_WARNING_THRESHOLD = BigDecimal.valueOf(5);

    // ==================== LTV 관련 상수 ====================
    
    /** 무주택자/일시적1주택/신혼부부 - 규제지역 LTV 한도 (%) */
    public static final Integer LTV_LIMIT_NONE_HOUSE_REGULATION = 40;
    
    /** 무주택자/일시적1주택/신혼부부 - 일반지역 LTV 한도 (%) */
    public static final Integer LTV_LIMIT_NONE_HOUSE_NORMAL = 70;
    
    /** 생애최초 - 규제지역 LTV 한도 (%) */
    public static final Integer LTV_LIMIT_FIRST_TIME_REGULATION = 70;
    
    /** 생애최초 - 일반지역 LTV 한도 (%) */
    public static final Integer LTV_LIMIT_FIRST_TIME_NORMAL = 80;
    
    /** 다주택자 LTV 한도 (%) */
    public static final Integer LTV_LIMIT_MULTI_HOUSE = 0;
    
    /** LTV 경고 임계값 (%) */
    public static final Integer LTV_WARNING_THRESHOLD = 5;

    // ==================== 스트레스 금리 관련 상수 ====================
    
    /** 수도권 스트레스 금리 증가폭 (%) */
    public static final BigDecimal STRESS_RATE_METROPOLITAN = BigDecimal.valueOf(1.5);
    
    /** 기타 지역 스트레스 금리 증가폭 (%) */
    public static final BigDecimal STRESS_RATE_OTHER_REGION = BigDecimal.valueOf(0.75);
    
    /** 스트레스 금리 상한선 (%) */
    public static final BigDecimal STRESS_RATE_MAX_LIMIT = BigDecimal.valueOf(5);

    // ==================== 신용등급별 담보 인정 비율 조정값 ====================
    
    /** 신용등급 1등급 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_1_ADJUSTMENT = BigDecimal.valueOf(5);
    
    /** 신용등급 2등급 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_2_ADJUSTMENT = BigDecimal.valueOf(2);
    
    /** 신용등급 4등급 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_4_ADJUSTMENT = BigDecimal.valueOf(-5);
    
    /** 신용등급 5등급 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_5_ADJUSTMENT = BigDecimal.valueOf(-10);
    
    /** 신용등급 6등급 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_6_ADJUSTMENT = BigDecimal.valueOf(-20);
    
    /** 신용등급 7등급 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_7_ADJUSTMENT = BigDecimal.valueOf(-30);
    
    /** 신용등급 기본 조정값 (%) */
    public static final BigDecimal CREDIT_GRADE_DEFAULT_ADJUSTMENT = BigDecimal.valueOf(-10);
    
    /** 담보 인정 비율 최소값 (%) */
    public static final BigDecimal MIN_COLLATERAL_RATIO = BigDecimal.valueOf(30);
    
    /** 담보 인정 비율 최대값 (%) */
    public static final BigDecimal MAX_COLLATERAL_RATIO = BigDecimal.valueOf(100);
    
    /** 담보 인정 비율 기본값 (%) */
    public static final BigDecimal DEFAULT_COLLATERAL_RATIO = BigDecimal.valueOf(100);

    // ==================== 지역 규제 관련 상수 ====================
    
    /** 규제 지역명 배열 */
    public static final String[] REGULATION_REGIONS = {"강남구", "서초구", "송파구", "용산구"};
    
    /** 수도권 지역명 배열 */
    public static final String[] METROPOLITAN_REGIONS = {"서울", "경기", "인천"};

    // ==================== 주택보유현황 관련 상수 ====================
    
    /** 무주택자 */
    public static final String HOUSING_STATUS_NONE = "무주택자";
    
    /** 일시적1주택 */
    public static final String HOUSING_STATUS_TEMPORARY_SINGLE = "일시적1주택";
    
    /** 신혼부부 */
    public static final String HOUSING_STATUS_NEWLYWED = "신혼부부";
    
    /** 생애최초 */
    public static final String HOUSING_STATUS_FIRST_TIME = "생애최초";
    
    /** 다주택자 */
    public static final String HOUSING_STATUS_MULTI = "다주택자";

    // ==================== 상환방식 관련 상수 ====================
    
    /** 원리금균등상환 */
    public static final String REPAY_METHOD_EQUAL_PAYMENT = "EPI";
    
    /** 원금균등상환 */
    public static final String REPAY_METHOD_EQUAL_PRINCIPAL = "EP";
    
    /** 만기일시상환 */
    public static final String REPAY_METHOD_BULLET = "BULLET";

    // ==================== 기타 상수 ====================
    
    /** 기본 연소득 (원) */
    public static final BigDecimal DEFAULT_ANNUAL_INCOME = BigDecimal.valueOf(30000000);
    
    /** 기존 대출 잔여기간 가정 (개월) */
    public static final int ASSUMED_REMAINING_MONTHS = 60;
}
