package com.hana_ti.home_planner.domain.calculation.util;

import com.hana_ti.home_planner.domain.calculation.constants.CalculationConstants;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Slf4j
public final class CalculationUtil {

    private CalculationUtil() {
        // 유틸리티 클래스이므로 인스턴스화 방지
    }

    // ==================== 기본 계산 메서드 ====================

    /**
     * 백분율 계산
     * @param value 계산할 값
     * @param percentage 백분율
     * @return 계산 결과
     */
    public static BigDecimal calculatePercentage(BigDecimal value, BigDecimal percentage) {
        if (value == null || percentage == null) {
            return BigDecimal.ZERO;
        }
        return value.multiply(percentage).divide(CalculationConstants.PERCENTAGE_DIVISOR, 
                CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 비율 계산 (백분율로 반환)
     * @param numerator 분자
     * @param denominator 분모
     * @return 비율 (백분율)
     */
    public static BigDecimal calculateRatio(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return numerator.divide(denominator, CalculationConstants.RATIO_SCALE, RoundingMode.HALF_UP)
                .multiply(CalculationConstants.PERCENTAGE_DIVISOR);
    }

    /**
     * 연간 금액을 월간 금액으로 변환
     * @param annualAmount 연간 금액
     * @return 월간 금액
     */
    public static BigDecimal convertAnnualToMonthly(BigDecimal annualAmount) {
        if (annualAmount == null) {
            return BigDecimal.ZERO;
        }
        return annualAmount.divide(CalculationConstants.MONTHS_PER_YEAR, 
                CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 월간 금액을 연간 금액으로 변환
     * @param monthlyAmount 월간 금액
     * @return 연간 금액
     */
    public static BigDecimal convertMonthlyToAnnual(BigDecimal monthlyAmount) {
        if (monthlyAmount == null) {
            return BigDecimal.ZERO;
        }
        return monthlyAmount.multiply(CalculationConstants.MONTHS_PER_YEAR);
    }

    // ==================== LTV 관련 계산 메서드 ====================

    /**
     * LTV 비율 계산
     * @param loanAmount 대출금액
     * @param housePrice 주택가격
     * @return LTV 비율 (%)
     */
    public static BigDecimal calculateLtvRatio(BigDecimal loanAmount, BigDecimal housePrice) {
        if (housePrice == null || housePrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return calculateRatio(loanAmount, housePrice);
    }

    /**
     * LTV 한도 기준 최대 대출 가능 금액 계산
     * @param housePrice 주택가격
     * @param ltvLimit LTV 한도 (%)
     * @return 최대 대출 가능 금액
     */
    public static BigDecimal calculateMaxAllowedLoanAmount(BigDecimal housePrice, Integer ltvLimit) {
        if (housePrice == null || ltvLimit == null) {
            return BigDecimal.ZERO;
        }
        return housePrice.multiply(BigDecimal.valueOf(ltvLimit))
                .divide(CalculationConstants.PERCENTAGE_DIVISOR, 
                        CalculationConstants.AMOUNT_SCALE, RoundingMode.DOWN);
    }

    /**
     * 담보 인정 비율을 적용한 최대 대출 가능 금액 계산
     * @param housePrice 주택가격
     * @param ltvLimit LTV 한도 (%)
     * @param collateralRatio 담보 인정 비율 (%)
     * @return 최대 대출 가능 금액
     */
    public static BigDecimal calculateMaxAllowedLoanAmountWithCollateral(BigDecimal housePrice, 
                                                                        Integer ltvLimit, 
                                                                        BigDecimal collateralRatio) {
        if (housePrice == null || ltvLimit == null || collateralRatio == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal effectiveLtvLimit = BigDecimal.valueOf(ltvLimit)
                .multiply(collateralRatio)
                .divide(CalculationConstants.PERCENTAGE_DIVISOR, 2, RoundingMode.HALF_UP);
        
        return housePrice.multiply(effectiveLtvLimit)
                .divide(CalculationConstants.PERCENTAGE_DIVISOR, 
                        CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
    }

    // ==================== 월상환액 계산 메서드 ====================

    /**
     * 원리금균등상환 월상환액 계산
     * @param loanAmount 대출금액
     * @param annualRate 연금리 (%)
     * @param loanPeriodYears 대출기간 (년)
     * @return 월상환액
     */
    public static BigDecimal calculateEqualPayment(BigDecimal loanAmount, BigDecimal annualRate, int loanPeriodYears) {
        if (loanAmount == null || annualRate == null || loanPeriodYears <= 0) {
            return BigDecimal.ZERO;
        }
        
        int totalMonths = loanPeriodYears * 12;
        BigDecimal monthlyRate = annualRate.divide(CalculationConstants.PERCENTAGE_DIVISOR, 
                CalculationConstants.DEFAULT_SCALE, RoundingMode.HALF_UP)
                .divide(CalculationConstants.MONTHS_PER_YEAR, 
                        CalculationConstants.DEFAULT_SCALE, RoundingMode.HALF_UP);
        
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return loanAmount.divide(BigDecimal.valueOf(totalMonths), 
                    CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
        }
        
        BigDecimal power = BigDecimal.ONE.add(monthlyRate).pow(totalMonths);
        BigDecimal monthlyPayment = loanAmount.multiply(monthlyRate).multiply(power)
                .divide(power.subtract(BigDecimal.ONE), 
                        CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
        
        return BigDecimal.valueOf(monthlyPayment.longValue()).setScale(CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 원금균등상환 월상환액 계산
     * @param loanAmount 대출금액
     * @param annualRate 연금리 (%)
     * @param loanPeriodYears 대출기간 (년)
     * @return 월상환액
     */
    public static BigDecimal calculateEqualPrincipal(BigDecimal loanAmount, BigDecimal annualRate, int loanPeriodYears) {
        if (loanAmount == null || annualRate == null || loanPeriodYears <= 0) {
            return BigDecimal.ZERO;
        }
        
        int totalMonths = loanPeriodYears * 12;
        BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(totalMonths), 
                CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
        
        BigDecimal monthlyRate = annualRate.divide(CalculationConstants.PERCENTAGE_DIVISOR, 
                CalculationConstants.DEFAULT_SCALE, RoundingMode.HALF_UP)
                .divide(CalculationConstants.MONTHS_PER_YEAR, 
                        CalculationConstants.DEFAULT_SCALE, RoundingMode.HALF_UP);
        
        BigDecimal firstMonthInterest = loanAmount.multiply(monthlyRate);
        BigDecimal firstMonthPayment = monthlyPrincipal.add(firstMonthInterest);
        
        return BigDecimal.valueOf(firstMonthPayment.longValue()).setScale(CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 만기일시상환 연간 이자 계산
     * @param loanAmount 대출금액
     * @param annualRate 연금리 (%)
     * @param isMaturityYear 만기년도 여부
     * @return 연간 이자
     */
    public static BigDecimal calculateBulletAnnual(BigDecimal loanAmount, BigDecimal annualRate, boolean isMaturityYear) {
        if (loanAmount == null || annualRate == null) {
            return BigDecimal.ZERO;
        }
        
        if (isMaturityYear) {
            // 만기년도: 원금 + 이자
            BigDecimal annualInterest = calculatePercentage(loanAmount, annualRate);
            return loanAmount.add(annualInterest);
        } else {
            // 일반년도: 이자만
            return calculatePercentage(loanAmount, annualRate);
        }
    }

    // ==================== DTI/DSR 관련 계산 메서드 ====================

    /**
     * DTI 비율 계산
     * @param monthlyPayment 월상환액
     * @param annualIncome 연소득
     * @return DTI 비율 (%)
     */
    public static BigDecimal calculateDti(BigDecimal monthlyPayment, BigDecimal annualIncome) {
        if (monthlyPayment == null || annualIncome == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal annualPayment = convertMonthlyToAnnual(monthlyPayment);
        return calculateRatio(annualPayment, annualIncome);
    }

    /**
     * DSR 비율 계산
     * @param newLoanMonthlyPayment 신규 대출 월상환액
     * @param existingLoanMonthlyPayment 기존 대출 월상환액
     * @param annualIncome 연소득
     * @return DSR 비율 (%)
     */
    public static BigDecimal calculateDsr(BigDecimal newLoanMonthlyPayment, 
                                        BigDecimal existingLoanMonthlyPayment, 
                                        BigDecimal annualIncome) {
        if (annualIncome == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal totalMonthlyPayment = BigDecimal.ZERO;
        if (newLoanMonthlyPayment != null) {
            totalMonthlyPayment = totalMonthlyPayment.add(newLoanMonthlyPayment);
        }
        if (existingLoanMonthlyPayment != null) {
            totalMonthlyPayment = totalMonthlyPayment.add(existingLoanMonthlyPayment);
        }
        
        BigDecimal annualPayment = convertMonthlyToAnnual(totalMonthlyPayment);
        return calculateRatio(annualPayment, annualIncome);
    }

    /**
     * 연소득 기반 월 상환 가능액 계산
     * @param annualIncome 연소득
     * @param dsrLimit DSR 한도 (%)
     * @return 월 상환 가능액
     */
    public static BigDecimal calculateAvailableMonthlyPayment(BigDecimal annualIncome, Integer dsrLimit) {
        if (dsrLimit == null || annualIncome == null || annualIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal maxAnnualPayment = calculatePercentage(annualIncome, BigDecimal.valueOf(dsrLimit));
        return convertAnnualToMonthly(maxAnnualPayment);
    }

    // ==================== 스트레스 금리 관련 메서드 ====================

    /**
     * 지역별 스트레스 금리 계산
     * @param region 지역명
     * @param baseRate 기본 금리 (%)
     * @return 스트레스 금리 (%)
     */
    public static BigDecimal calculateStressRate(String region, BigDecimal baseRate) {
        if (region == null || baseRate == null) {
            return baseRate;
        }
        
        BigDecimal stressRate;
        
        if (isMetropolitanRegion(region)) {
            // 수도권: +1.5%p
            stressRate = baseRate.add(CalculationConstants.STRESS_RATE_METROPOLITAN);
            log.info("수도권 스트레스 금리 적용 - 기본금리: {}%, 스트레스금리: {}%", baseRate, stressRate);
        } else {
            // 기타 지역: +0.75%p
            stressRate = baseRate.add(CalculationConstants.STRESS_RATE_OTHER_REGION);
            log.info("기타지역 스트레스 금리 적용 - 기본금리: {}%, 스트레스금리: {}%", baseRate, stressRate);
        }
        
        return stressRate;
    }

    // ==================== 지역 규제 관련 메서드 ====================

    /**
     * 규제 지역 여부 판단
     * @param region 지역명
     * @return 규제 지역 여부
     */
    public static boolean isRegulationRegion(String region) {
        if (region == null) {
            return false;
        }
        
        log.info("규제 지역 여부 판단 시작: {}", region);
        
        for (String regulationRegion : CalculationConstants.REGULATION_REGIONS) {
            if (region.contains(regulationRegion)) {
                log.info("규제 지역 확인됨 - 지역: {}, 규제지역: {}", region, regulationRegion);
                return true;
            }
        }
        
        log.info("규제 지역 아님 - 지역: {}", region);
        return false;
    }

    /**
     * 수도권 지역 여부 판단
     * @param region 지역명
     * @return 수도권 지역 여부
     */
    public static boolean isMetropolitanRegion(String region) {
        if (region == null) {
            return false;
        }
        
        for (String metropolitanRegion : CalculationConstants.METROPOLITAN_REGIONS) {
            if (region.contains(metropolitanRegion)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 사용자 조건에 따른 LTV 한도 계산
     * @param region 지역명
     * @param housingStatus 주택보유현황
     * @return LTV 한도 (%)
     */
    public static Integer getLtvLimit(String region, String housingStatus) {
        if (region == null || housingStatus == null) {
            return CalculationConstants.LTV_LIMIT_NONE_HOUSE_NORMAL;
        }
        
        log.info("LTV 한도 계산 시작 - 지역: {}, 주택보유현황: {}", region, housingStatus);
        
        boolean isRegulationArea = isRegulationRegion(region);
        Integer ltvLimit;
        
        switch (housingStatus) {
            case CalculationConstants.HOUSING_STATUS_NONE:
            case CalculationConstants.HOUSING_STATUS_TEMPORARY_SINGLE:
            case CalculationConstants.HOUSING_STATUS_NEWLYWED:
                ltvLimit = isRegulationArea ? 
                        CalculationConstants.LTV_LIMIT_NONE_HOUSE_REGULATION : 
                        CalculationConstants.LTV_LIMIT_NONE_HOUSE_NORMAL;
                break;
                
            case CalculationConstants.HOUSING_STATUS_FIRST_TIME:
                ltvLimit = isRegulationArea ? 
                        CalculationConstants.LTV_LIMIT_FIRST_TIME_REGULATION : 
                        CalculationConstants.LTV_LIMIT_FIRST_TIME_NORMAL;
                break;
                
            case CalculationConstants.HOUSING_STATUS_MULTI:
                ltvLimit = CalculationConstants.LTV_LIMIT_MULTI_HOUSE;
                break;
                
            default:
                // 기본값: 무주택자와 동일
                ltvLimit = isRegulationArea ? 
                        CalculationConstants.LTV_LIMIT_NONE_HOUSE_REGULATION : 
                        CalculationConstants.LTV_LIMIT_NONE_HOUSE_NORMAL;
                log.warn("알 수 없는 주택보유현황: {}, 기본값 적용", housingStatus);
                break;
        }
        
        log.info("LTV 한도 계산 완료 - 지역: {}, 주택보유현황: {}, 규제지역: {}, LTV한도: {}%", 
                region, housingStatus, isRegulationArea, ltvLimit);
        
        return ltvLimit;
    }

    // ==================== 신용등급 관련 메서드 ====================

    /**
     * 신용등급에 따른 담보 인정 비율 적용
     * @param creditGrade 신용등급
     * @param collateralRatio 기본 담보 인정 비율 (%)
     * @return 조정된 담보 인정 비율 (%)
     */
    public static BigDecimal applyCreditGradeImpact(String creditGrade, BigDecimal collateralRatio) {
        if (collateralRatio == null) {
            collateralRatio = CalculationConstants.DEFAULT_COLLATERAL_RATIO;
        }
        
        BigDecimal adjustment = BigDecimal.ZERO;
        
        if (creditGrade != null) {
            switch (creditGrade) {
                case "1":
                    adjustment = CalculationConstants.CREDIT_GRADE_1_ADJUSTMENT;
                    break;
                case "2":
                    adjustment = CalculationConstants.CREDIT_GRADE_2_ADJUSTMENT;
                    break;
                case "4":
                    adjustment = CalculationConstants.CREDIT_GRADE_4_ADJUSTMENT;
                    break;
                case "5":
                    adjustment = CalculationConstants.CREDIT_GRADE_5_ADJUSTMENT;
                    break;
                case "6":
                    adjustment = CalculationConstants.CREDIT_GRADE_6_ADJUSTMENT;
                    break;
                case "7":
                    adjustment = CalculationConstants.CREDIT_GRADE_7_ADJUSTMENT;
                    break;
                default:
                    adjustment = CalculationConstants.CREDIT_GRADE_DEFAULT_ADJUSTMENT;
                    break;
            }
        } else {
            adjustment = CalculationConstants.CREDIT_GRADE_DEFAULT_ADJUSTMENT;
        }
        
        BigDecimal adjustedRatio = collateralRatio.add(adjustment);
        
        // 30%~100% 범위로 제한
        return adjustedRatio.max(CalculationConstants.MIN_COLLATERAL_RATIO)
                .min(CalculationConstants.MAX_COLLATERAL_RATIO);
    }

    // ==================== 기타 유틸리티 메서드 ====================

    /**
     * 잔여 개월수 계산
     * @param maturityDate 만기일
     * @return 잔여 개월수
     */
    public static int calculateRemainingMonths(LocalDate maturityDate) {
        if (maturityDate == null) {
            return CalculationConstants.ASSUMED_REMAINING_MONTHS;
        }
        
        LocalDate currentDate = LocalDate.now();
        long monthsBetween = ChronoUnit.MONTHS.between(currentDate, maturityDate);
        
        return Math.max(1, (int) monthsBetween);
    }

    /**
     * 상태 판단 (초과/적정/부족)
     * @param calculatedValue 계산된 값
     * @param limit 한도
     * @param threshold 임계값
     * @return 상태 문자열
     */
    public static String determineStatus(BigDecimal calculatedValue, BigDecimal limit, BigDecimal threshold) {
        if (calculatedValue.compareTo(limit) > 0) {
            return "초과";
        } else if (calculatedValue.compareTo(limit.subtract(threshold)) < 0) {
            return "부족";
        } else {
            return "적정";
        }
    }

    /**
     * 상태 판단 (초과/적정/부족) - Integer 버전
     * @param calculatedValue 계산된 값
     * @param limit 한도
     * @param threshold 임계값
     * @return 상태 문자열
     */
    public static String determineStatus(BigDecimal calculatedValue, Integer limit, Integer threshold) {
        return determineStatus(calculatedValue, BigDecimal.valueOf(limit), BigDecimal.valueOf(threshold));
    }
}
