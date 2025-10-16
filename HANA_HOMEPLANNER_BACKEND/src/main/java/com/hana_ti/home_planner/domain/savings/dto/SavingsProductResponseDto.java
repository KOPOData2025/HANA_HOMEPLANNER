package com.hana_ti.home_planner.domain.savings.dto;

import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class SavingsProductResponseDto {

    private String productId;
    private String productName;
    private String paymentMethod;
    private String paymentMethodDescription;
    private boolean isCompoundInterestApplied;
    private boolean isTaxPreferenceApplied;
    private Integer paymentDelayPeriodMonths;
    private BigDecimal earlyWithdrawPenaltyRate;
    private BigDecimal preferentialInterestRate;
    private LocalDate updatedAt;
    private Integer termMonths;
    private BigDecimal minDepositAmount;
    private BigDecimal maxDepositAmount;
    private BigDecimal baseInterestRate;
    private String productDescription;
    private String documentUrl;
    private BankInfoDto bank;

    @Getter
    @Builder
    public static class BankInfoDto {
        private String bankId;
        private String bankName;
        private Integer bankCode;
    }

    public static SavingsProductResponseDto from(SavingsProduct savingsProduct) {
        BankInfoDto bankInfo = BankInfoDto.builder()
                .bankId(savingsProduct.getFinancialProduct().getBank().getBankId())
                .bankName(savingsProduct.getFinancialProduct().getBank().getBankName())
                .bankCode(savingsProduct.getFinancialProduct().getBank().getBankCode())
                .build();

        return SavingsProductResponseDto.builder()
                .productId(savingsProduct.getProductId())
                .productName(savingsProduct.getFinancialProduct().getProductName())
                .paymentMethod(savingsProduct.getPaymentMethod())
                .paymentMethodDescription(getPaymentMethodDescription(savingsProduct.getPaymentMethod()))
                .isCompoundInterestApplied(savingsProduct.isCompoundInterestApplied())
                .isTaxPreferenceApplied(savingsProduct.isTaxPreferenceApplied())
                .paymentDelayPeriodMonths(savingsProduct.getPaymentDelayPeriodMonths())
                .earlyWithdrawPenaltyRate(savingsProduct.getEarlyWithdrawPenaltyRate())
                .preferentialInterestRate(savingsProduct.getPreferentialInterestRate())
                .updatedAt(savingsProduct.getUpdatedAt())
                .termMonths(savingsProduct.getTermMonths())
                .minDepositAmount(savingsProduct.getMinDepositAmount())
                .maxDepositAmount(savingsProduct.getMaxDepositAmount())
                .baseInterestRate(savingsProduct.getBaseInterestRate())
                .productDescription(savingsProduct.getProductDescription())
                .documentUrl(savingsProduct.getDocumentUrl())
                .bank(bankInfo)
                .build();
    }

    /**
     * 상환방식 설명 반환
     */
    private static String getPaymentMethodDescription(String paymentMethod) {
        if (paymentMethod == null) {
            return "상환방식 정보 없음";
        }
        
        return switch (paymentMethod) {
            case "자유적립식" -> "자유롭게 적립하는 방식";
            case "정기적립식" -> "정기적으로 적립하는 방식";
            case "거치식" -> "거치식 적립 방식";
            default -> paymentMethod;
        };
    }
}
