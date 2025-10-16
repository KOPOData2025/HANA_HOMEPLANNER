package com.hana_ti.home_planner.domain.financial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsRecommendationResponseDto {
    
    private RecommendedSavingsProductDto recommendedProduct;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedSavingsProductDto {
        private String prodId; // 상품 ID
        private String prodName; // 상품명
        private String bankName; // 은행명
        private Integer termMonths; // 상품 기간 (개월)
        private BigDecimal monthlyDeposit; // 월 납입액
        private BigDecimal expectedMaturityAmount; // 예상 만기 수령액
        private BigDecimal interestRate; // 금리 (기본+우대)
        private boolean isTaxPrefer; // 세제혜택 여부
        private String docUrl; // 문서 URL
        private String targetDescription; // 대상설명
        private String interestPaymentMethod; // 이자지급방법
        private String status; // 상태
        private String comment; // 코멘트 (목표금액 대비 달성률)
    }
}
