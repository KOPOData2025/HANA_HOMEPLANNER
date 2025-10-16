package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCalculationResponseDto {
    
    // 핵심 대출 결과
    private BigDecimal maxLoanAmount; // 최대 대출 가능 금액
    private BigDecimal monthlyPayment; // 월 예상 상환액
    private BigDecimal requiredOwnFunds; // 필요 자기 자본 (현금)
    
    // 상세 분석
    private LoanLimitAnalysis limitAnalysis; // 대출 한도 결정 요인
    private PolicyMortgageInfo policyMortgageInfo; // 정책모기지 정보
    private InterestAnalysis interestAnalysis; // 이자 분석
    
    // 입력 정보 요약
    private InputSummary inputSummary; // 입력 정보 요약
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoanLimitAnalysis {
        private BigDecimal ltvLimit; // LTV 기준 한도
        private BigDecimal dsrLimit; // DSR 기준 한도
        private String limitingFactor; // 한도 결정 요인 ("LTV", "DSR")
        private String limitingFactorDescription; // 한도 결정 요인 설명
        private BigDecimal ltvRatio; // 실제 LTV 비율
        private BigDecimal dsrRatio; // 실제 DSR 비율
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PolicyMortgageInfo {
        private Boolean isEligible; // 정책모기지 대상 여부
        private String productType; // 추천 상품 유형 ("디딤돌", "보금자리", "일반")
        private String productDescription; // 상품 설명
        private BigDecimal recommendedInterestRate; // 추천 금리
        private String benefits; // 혜택 설명
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterestAnalysis {
        private BigDecimal totalInterest; // 총 예상 이자
        private BigDecimal totalPayment; // 총 상환액 (원금 + 이자)
        private BigDecimal interestRatio; // 이자 비율 (총 이자 / 총 상환액)
        private BigDecimal monthlyInterest; // 월 이자 (첫 달 기준)
        private BigDecimal monthlyPrincipal; // 월 원금 (첫 달 기준)
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InputSummary {
        private BigDecimal housePrice; // 매매가
        private String region; // 지역
        private BigDecimal totalAnnualIncome; // 총 연소득 (본인 + 배우자)
        private BigDecimal existingLoanAnnualPayment; // 기존 대출 연상환액
        private String houseOwnershipStatus; // 주택 보유 상태
        private Integer loanTermYears; // 대출 기간
        private BigDecimal interestRate; // 적용 금리
        private Boolean isFirstTimeBuyer; // 생애최초 구입 여부
        private Boolean isNewlywed; // 신혼부부 여부
        private Integer childrenCount; // 자녀 수
    }
}
