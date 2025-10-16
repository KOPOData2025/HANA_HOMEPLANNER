package com.hana_ti.home_planner.domain.calculation.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@Slf4j
public class PlanCalculationUtil {

    private static final int CALCULATION_SCALE = 10;
    private static final int RESULT_SCALE = 2;
    private static final int BINARY_SEARCH_ITERATIONS = 40;

    /**
     * 원리금균등 월상환액 계산 (PMT)
     * @param rateMonthly 월 금리 (소수점 형태, 예: 0.0034)
     * @param months 대출기간 (개월)
     * @param principal 대출원금
     * @return 월상환액
     */
    public BigDecimal calculatePMT(BigDecimal rateMonthly, int months, BigDecimal principal) {
        if (rateMonthly.compareTo(BigDecimal.ZERO) == 0) {
            // 금리가 0%인 경우
            return principal.divide(BigDecimal.valueOf(months), RESULT_SCALE, RoundingMode.HALF_UP);
        }

        // PMT = P * r / (1 - (1 + r)^(-n))
        BigDecimal one = BigDecimal.ONE;
        BigDecimal onePlusRate = one.add(rateMonthly);
        
        // (1 + r)^n 계산
        BigDecimal powerTerm = onePlusRate.pow(months);
        
        // 1 / (1 + r)^n = (1 + r)^(-n)
        BigDecimal inversePowerTerm = one.divide(powerTerm, CALCULATION_SCALE, RoundingMode.HALF_UP);
        
        BigDecimal denominator = one.subtract(inversePowerTerm);
        
        return principal.multiply(rateMonthly)
                .divide(denominator, RESULT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * DSR 계산
     * @param monthlyPayment 월상환액
     * @param existingLoanMonthlyPayment 기존 대출 월상환액
     * @param annualIncome 연소득
     * @return DSR 비율 (%)
     */
    public BigDecimal calculateDSR(BigDecimal monthlyPayment, BigDecimal existingLoanMonthlyPayment, 
                                 BigDecimal annualIncome) {
        if (annualIncome.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalMonthlyPayment = monthlyPayment.add(existingLoanMonthlyPayment);
        BigDecimal annualPayment = totalMonthlyPayment.multiply(BigDecimal.valueOf(12));
        
        return annualPayment.divide(annualIncome, CALCULATION_SCALE, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(RESULT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * LTV 계산
     * @param loanAmount 대출금액
     * @param housePrice 주택가격
     * @return LTV 비율 (%)
     */
    public BigDecimal calculateLTV(BigDecimal loanAmount, BigDecimal housePrice) {
        if (housePrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return loanAmount.divide(housePrice, CALCULATION_SCALE, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(RESULT_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * 이분탐색을 통한 목표 DSR 달성 대출금액 찾기
     * @param targetDSRRatio 목표 DSR 비율 (예: 0.98 = 98%)
     * @param rateMonthly 월 금리
     * @param months 대출기간 (개월)
     * @param existingLoanMonthlyPayment 기존 대출 월상환액
     * @param annualIncome 연소득
     * @param maxLoanAmount 최대 대출 가능 금액
     * @param housePrice 주택가격
     * @param ltvLimit LTV 한도 (%)
     * @return 목표 DSR을 달성하는 대출금액
     */
    public BigDecimal findLoanAmountByTargetDSR(BigDecimal targetDSRRatio, BigDecimal rateMonthly, 
                                              int months, BigDecimal existingLoanMonthlyPayment,
                                              BigDecimal annualIncome, BigDecimal maxLoanAmount,
                                              BigDecimal housePrice, BigDecimal ltvLimit) {
        
        // DSR 한도 40%를 먼저 적용 (절대 초과 방지)
        BigDecimal dsrLimit = BigDecimal.valueOf(40);
        BigDecimal targetDSR = targetDSRRatio.multiply(dsrLimit); // 목표 DSR = 비율 × 40%
        
        // 목표 DSR이 40%를 초과하지 않도록 보장
        if (targetDSR.compareTo(dsrLimit) > 0) {
            targetDSR = dsrLimit; // 40%로 제한
        }
        
        BigDecimal ltvMaxAmount = housePrice.multiply(ltvLimit).divide(BigDecimal.valueOf(100), RESULT_SCALE, RoundingMode.HALF_UP);
        BigDecimal maxAllowedAmount = maxLoanAmount.min(ltvMaxAmount);
        
        // 기존 대출 DSR 확인
        BigDecimal existingDSR = calculateDSR(BigDecimal.ZERO, existingLoanMonthlyPayment, annualIncome);
        
        // 기존 대출이 DSR 한도를 초과하는 경우, 기존 대출을 무시하고 새로운 대출만으로 계산
        if (existingDSR.compareTo(dsrLimit) >= 0) {
            existingLoanMonthlyPayment = BigDecimal.ZERO;
            existingDSR = BigDecimal.ZERO; // 기존 대출을 0으로 설정했으므로 DSR도 0으로 리셋
        }
        
        // 기존 대출만으로도 목표 DSR을 초과하는 경우, 0원 반환
        if (existingDSR.compareTo(targetDSR) >= 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal low = BigDecimal.ZERO;
        BigDecimal high = maxAllowedAmount;
        BigDecimal bestAmount = BigDecimal.ZERO;
        
        for (int i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
            BigDecimal mid = low.add(high).divide(BigDecimal.valueOf(2), RESULT_SCALE, RoundingMode.HALF_UP);
            
            if (mid.compareTo(BigDecimal.ZERO) == 0) {
                break;
            }
            
            BigDecimal monthlyPayment = calculatePMT(rateMonthly, months, mid);
            BigDecimal dsr = calculateDSR(monthlyPayment, existingLoanMonthlyPayment, annualIncome);
            
            // DSR이 40%를 초과하면 즉시 중단
            if (dsr.compareTo(dsrLimit) > 0) {
                high = mid;
                continue;
            }
            
            if (dsr.compareTo(targetDSR) <= 0) {
                bestAmount = mid;
                low = mid;
            } else {
                high = mid;
            }
            
            // 수렴 조건: 차이가 1원 이하
            if (high.subtract(low).compareTo(BigDecimal.ONE) <= 0) {
                break;
            }
        }
        
        return bestAmount;
    }

    /**
     * 안전 가드 검증
     * @param loanAmount 대출금액
     * @param housePrice 주택가격
     * @param ltvLimit LTV 한도
     * @param maxAllowedLoanAmount 최대 대출 가능 금액
     * @param rateMonthly 월 금리
     * @param months 대출기간
     * @param existingLoanMonthlyPayment 기존 대출 월상환액
     * @param annualIncome 연소득
     * @param dsrLimit DSR 한도
     * @param stressRateMonthly 스트레스 테스트 월 금리
     * @return 검증 결과 정보
     */
    public GuardResult validateGuards(BigDecimal loanAmount, BigDecimal housePrice, BigDecimal ltvLimit,
                                    BigDecimal maxAllowedLoanAmount, BigDecimal rateMonthly, int months,
                                    BigDecimal existingLoanMonthlyPayment, BigDecimal annualIncome,
                                    BigDecimal dsrLimit, BigDecimal stressRateMonthly) {
        
        // LTV 검증
        BigDecimal ltv = calculateLTV(loanAmount, housePrice);
        if (ltv.compareTo(ltvLimit) > 0) {
            return GuardResult.builder()
                    .isValid(false)
                    .reason("LTV 한도 초과")
                    .build();
        }
        
        // 최대 대출 가능 금액 검증
        if (loanAmount.compareTo(maxAllowedLoanAmount) > 0) {
            return GuardResult.builder()
                    .isValid(false)
                    .reason("최대 대출 가능 금액 초과")
                    .build();
        }
        
        // 일반 DSR 검증 (실제 DSR 한도 적용)
        BigDecimal monthlyPayment = calculatePMT(rateMonthly, months, loanAmount);
        BigDecimal dsr = calculateDSR(monthlyPayment, existingLoanMonthlyPayment, annualIncome);
        
        // DSR 한도를 초과하는 경우 실패 (절대 허용하지 않음)
        if (dsr.compareTo(dsrLimit) > 0) {
            return GuardResult.builder()
                    .isValid(false)
                    .reason("DSR 한도 초과: " + dsr + "% > " + dsrLimit + "% (절대 허용 불가)")
                    .build();
        }
        
        // 스트레스 테스트 DSR 검증 (DSR 40% 절대 초과 방지)
        BigDecimal stressMonthlyPayment = calculatePMT(stressRateMonthly, months, loanAmount);
        BigDecimal stressDsr = calculateDSR(stressMonthlyPayment, existingLoanMonthlyPayment, annualIncome);
        
        // 스트레스 테스트에서도 DSR 40%를 초과하면 실패 (절대 허용하지 않음)
        if (stressDsr.compareTo(dsrLimit) > 0) {
            return GuardResult.builder()
                    .isValid(false)
                    .reason("스트레스 테스트 DSR 초과: " + stressDsr + "% > " + dsrLimit + "% (절대 허용 불가)")
                    .build();
        }
        
        return GuardResult.builder()
                .isValid(true)
                .monthlyPayment(monthlyPayment)
                .dsr(dsr)
                .ltv(ltv)
                .stressMonthlyPayment(stressMonthlyPayment)
                .stressDsr(stressDsr)
                .build();
    }

    /**
     * 안전 가드 검증 결과 클래스
     */
    @lombok.Data
    @lombok.Builder
    public static class GuardResult {
        private boolean isValid;
        private String reason;
        private BigDecimal monthlyPayment;
        private BigDecimal dsr;
        private BigDecimal ltv;
        private BigDecimal stressMonthlyPayment;
        private BigDecimal stressDsr;
    }
}
