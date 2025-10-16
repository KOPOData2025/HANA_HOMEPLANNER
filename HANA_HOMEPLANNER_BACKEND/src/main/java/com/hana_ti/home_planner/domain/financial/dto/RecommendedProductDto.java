package com.hana_ti.home_planner.domain.financial.dto;

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
public class RecommendedProductDto {
    
    private String productId; // 상품 ID (DB 연계용)
    private String productName; // 추천 상품명
    private String productType; // 상품 분류 (예: "디딤돌 대출")
    private String description; // 추천 이유 요약
    private String estimatedInterestRate; // 예상 금리 (예: "연 1.6% ~ 3.3%")
    private BigDecimal maxLoanAmount; // 최대 대출 한도 (원 단위)
    private List<String> keyFeatures; // 주요 특징 목록
    private String bankName; // 은행명
    private BigDecimal minInterestRate; // 최저 금리
    private BigDecimal maxInterestRate; // 최고 금리
    private Integer maxLoanPeriodMonths; // 최대 대출 기간 (개월)
    private String repayMethod; // 상환 방법
    private BigDecimal baseInterestRate; // 기본금리
    private BigDecimal preferentialInterestRate; // 우대금리
    private Integer gracePeriodMonths; // 거치기간(개월)
    private BigDecimal earlyRepayPenaltyRate; // 중도상환위약금율
    private String repaymentFrequency; // 상환주기
    private Integer minCreditScore; // 최소신용점수
    private String targetDescription; // 대상설명
    private String securityType; // 담보유형
    private String guaranteeRequirement; // 보증요구사항
    private String documentUrl; // 문서URL
}
