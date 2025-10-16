package com.hana_ti.home_planner.domain.loan.dto;

import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class LoanProductResponseDto {

    private String productId;
    private String productName;
    private String loanType;
    private String loanTypeDescription;
    private String interestRateType;
    private String interestRateTypeDescription;
    private BigDecimal minInterestRate;
    private BigDecimal maxInterestRate;
    private BigDecimal minLoanAmount;
    private BigDecimal maxLoanAmount;
    private Integer maxLoanPeriodMonths;
    private String repaymentMethod;
    private String repaymentMethodDescription;
    private String loanProductDescription;
    private LocalDate updatedAt;
    private BankInfoDto bank;

    @Getter
    @Builder
    public static class BankInfoDto {
        private String bankId;
        private String bankName;
        private Integer bankCode;
    }

    public static LoanProductResponseDto from(LoanProduct loanProduct, FinancialProduct financialProduct) {
        BankInfoDto bankInfo = BankInfoDto.builder()
                .bankId(financialProduct != null && financialProduct.getBank() != null ? 
                        financialProduct.getBank().getBankId() : "UNKNOWN")
                .bankName(financialProduct != null && financialProduct.getBank() != null ? 
                        financialProduct.getBank().getBankName() : "은행명 없음")
                .bankCode(financialProduct != null && financialProduct.getBank() != null ? 
                        financialProduct.getBank().getBankCode() : 0)
                .build();

        return LoanProductResponseDto.builder()
                .productId(loanProduct.getProductId())
                .productName(financialProduct != null ? financialProduct.getProductName() : "상품명 없음")
                .loanType(loanProduct.getLoanType())
                .loanTypeDescription(getLoanTypeDescription(loanProduct.getLoanType()))
                .interestRateType(loanProduct.getInterestRateType())
                .interestRateTypeDescription(getInterestRateTypeDescription(loanProduct.getInterestRateType()))
                .minInterestRate(loanProduct.getMinInterestRate())
                .maxInterestRate(loanProduct.getMaxInterestRate())
                .minLoanAmount(loanProduct.getMinLoanAmount())
                .maxLoanAmount(loanProduct.getMaxLoanAmount())
                .maxLoanPeriodMonths(loanProduct.getMaxLoanPeriodMonths())
                .repaymentMethod(loanProduct.getRepaymentMethod())
                .repaymentMethodDescription(getRepaymentMethodDescription(loanProduct.getRepaymentMethod()))
                .loanProductDescription(loanProduct.getLoanProductDescription())
                .updatedAt(loanProduct.getUpdatedAt())
                .bank(bankInfo)
                .build();
    }

    // 기존 메서드와의 호환성을 위한 오버로드
    public static LoanProductResponseDto from(LoanProduct loanProduct) {
        return from(loanProduct, null);
    }

    private static String getLoanTypeDescription(String loanType) {
        if (loanType == null) return null;
        switch (loanType) {
            case "주택담보대출":
                return "주택을 담보로 하는 대출";
            case "전세대출":
                return "전세금을 위한 대출";
            case "신용대출":
                return "담보 없이 신용으로 받는 대출";
            default:
                return loanType;
        }
    }

    private static String getInterestRateTypeDescription(String interestRateType) {
        if (interestRateType == null) return null;
        switch (interestRateType) {
            case "변동금리":
                return "시장금리에 따라 변동하는 금리";
            case "고정금리":
                return "계약기간 동안 고정된 금리";
            case "혼합금리":
                return "고정금리와 변동금리를 혼합한 금리";
            default:
                return interestRateType;
        }
    }

    private static String getRepaymentMethodDescription(String repaymentMethod) {
        if (repaymentMethod == null) return null;
        switch (repaymentMethod) {
            case "원리금균등상환":
                return "매월 동일한 금액으로 원금과 이자를 함께 상환";
            case "원금균등상환":
                return "매월 동일한 원금과 이자를 함께 상환";
            case "만기일시상환":
                return "만기에 원금을 한 번에 상환하고 이자는 매월 지급";
            default:
                return repaymentMethod;
        }
    }
}
