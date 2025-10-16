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
public class DtiCalculationResponseDto {
    
    // 1. 사용자 정보
    private String region;
    private BigDecimal annualIncome; // 연소득
    private BigDecimal dtiLimit; // DTI 한도 (%)
    private BigDecimal maxAllowedAnnualPayment; // 최대 허용 연간 상환액
    
    // 2. 기존 대출 정보
    private BigDecimal existingMortgageAnnualPayment; // 기존 주택담보대출 연간 원리금
    private BigDecimal existingOtherLoanAnnualInterest; // 기존 기타대출 연간 이자
    private BigDecimal totalExistingAnnualPayment; // 기존 대출 총 연간 상환액
    private Integer existingLoanCount; // 기존 대출 건수
    
    // 3. 신규 대출 정보
    private BigDecimal desiredInterestRate; // 희망 금리
    private BigDecimal desiredLoanPeriod; // 희망 대출기간
    private BigDecimal desiredLoanAmount; // 희망 대출금액
    private BigDecimal desiredLoanAnnualPayment; // 희망 대출 연간 원리금
    private BigDecimal desiredLoanMonthlyPayment; // 희망 대출 월상환액
    
    // 4. DTI 계산 결과
    private BigDecimal totalAnnualPayment; // 총 연간 상환액 (기존 + 희망대출)
    private BigDecimal dtiRatio; // DTI 비율
    private String dtiStatus; // DTI 상태 (PASS, FAIL)
    private BigDecimal availableAnnualPayment; // 추가 대출 가능 연간 상환액
    
    // 5. DTI 한도 기준 대출금액 정보
    private BigDecimal maxLoanAmountForDtiLimit; // DTI 한도 기준 최대 대출금액
    private BigDecimal maxMonthlyPaymentForDtiLimit; // DTI 한도 기준 최대 월상환액
    private BigDecimal maxAnnualPaymentForDtiLimit; // DTI 한도 기준 최대 연상환액
    
    // 6. 계산 정보
    private String calculationDate;
    private String message;
}
