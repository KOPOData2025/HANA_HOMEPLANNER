package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoupleDsrCalculationResponseDto {
    
    // 1. 사용자 정보
    private String region;
    private BigDecimal coupleTotalAnnualIncome; // 부부 합계 연소득
    private BigDecimal spouseAnnualIncome; // 배우자 연소득
    private BigDecimal dsrLimit; // DSR 한도 (%)
    
    // 2. 부부 합계 기존 대출 정보
    private BigDecimal coupleExistingLoanAnnualPayment; // 부부 합계 기존 대출 연간 원리금
    private Integer coupleExistingLoanCount; // 부부 합계 기존 대출 건수
    
    // 3. 신규 대출 정보
    private BigDecimal desiredLoanAmount; // 희망 대출금액
    private BigDecimal desiredInterestRate; // 희망 금리
    private Integer desiredLoanPeriod; // 희망 대출기간
    
    // 4. 기본 금리 적용 결과
    private BigDecimal baseMonthlyPayment; // 기본 금리 월상환액
    private BigDecimal baseAnnualPayment; // 기본 금리 연상환액
    private BigDecimal baseTotalPayment; // 기본 금리 총상환액
    private BigDecimal baseDsr; // 기본 금리 DSR (%)
    
    // 5. 스트레스 금리 적용 결과
    private BigDecimal stressRate; // 스트레스 금리
    private BigDecimal stressMonthlyPayment; // 스트레스 금리 월상환액
    private BigDecimal stressAnnualPayment; // 스트레스 금리 연상환액
    private BigDecimal stressTotalPayment; // 스트레스 금리 총상환액
    private BigDecimal stressDsr; // 스트레스 금리 DSR (%)
    
    // 6. DSR 상태
    private String baseDsrStatus; // 기본 금리 DSR 상태 (적정/주의/위험)
    private String stressDsrStatus; // 스트레스 금리 DSR 상태 (적정/주의/위험)
    
    // 7. DSR 한도 기준 대출금액 정보
    private BigDecimal maxLoanAmountForBaseRate; // 기본 금리 기준 DSR 한도 대출금액
    private BigDecimal maxLoanAmountForStressRate; // 스트레스 금리 기준 DSR 한도 대출금액
    private BigDecimal maxMonthlyPaymentForBaseRate; // 기본 금리 기준 DSR 한도 월상환액
    private BigDecimal maxMonthlyPaymentForStressRate; // 스트레스 금리 기준 DSR 한도 월상환액
    private BigDecimal maxAnnualPaymentForBaseRate; // 기본 금리 기준 DSR 한도 연상환액
    private BigDecimal maxAnnualPaymentForStressRate; // 스트레스 금리 기준 DSR 한도 연상환액
    
    // 8. 계산 정보
    private String calculationDate;
    private String message;
}
