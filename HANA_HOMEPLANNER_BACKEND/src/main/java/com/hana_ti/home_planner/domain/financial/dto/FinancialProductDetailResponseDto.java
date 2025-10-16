package com.hana_ti.home_planner.domain.financial.dto;

import com.hana_ti.home_planner.domain.bank.entity.BankStatus;
import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class FinancialProductDetailResponseDto {

    // 기본 금융상품 정보
    private String productId;
    private String productName;
    private ProductType productType;
    private String productTypeDescription;
    private BankInfoDto bank;

    // 적금상품 상세 정보 (SAVINGS 타입일 때만)
    private SavingsProductDetailDto savingsProduct;

    // 대출상품 상세 정보 (LOAN 타입일 때만)
    private LoanProductDetailDto loanProduct;

    @Getter
    @Builder
    public static class BankInfoDto {
        private String bankId;
        private String bankName;
        private Integer bankCode;
        private BankStatus status;
        private String statusDescription;
    }

    @Getter
    @Builder
    public static class SavingsProductDetailDto {
        private String paymentMethod;                    // 납입방법
        private Boolean isCompoundInterestApplied;       // 복리적용여부
        private Boolean isTaxPreferenceApplied;          // 세제우대적용여부
        private Integer paymentDelayPeriodMonths;       // 납입유예기간(개월)
        private BigDecimal earlyWithdrawPenaltyRate;    // 중도해지위약금율
        private BigDecimal preferentialInterestRate;     // 우대금리
        private LocalDate updatedAt;                    // 수정일
        private Integer termMonths;                      // 약정기간(개월)
        private BigDecimal minDepositAmount;            // 최소납입금액
        private BigDecimal maxDepositAmount;            // 최대납입금액
        private BigDecimal baseInterestRate;            // 기본금리
        private String productDescription;              // 상품설명
        private String documentUrl;                     // 문서URL
        private String targetDescription;               // 대상설명
        private String interestPaymentMethod;           // 이자지급방법
        private String status;                          // 상태
    }

    @Getter
    @Builder
    public static class LoanProductDetailDto {
        private String loanType;                         // 대출유형
        private String interestRateType;                // 금리유형
        private BigDecimal minInterestRate;              // 최소금리
        private BigDecimal maxInterestRate;              // 최대금리
        private BigDecimal minLoanAmount;                // 최소대출금액
        private BigDecimal maxLoanAmount;                // 최대대출금액
        private Integer maxLoanPeriodMonths;            // 최대대출기간(개월)
        private String repaymentMethod;                  // 상환방법
        private String loanProductDescription;           // 대출상품설명
        private LocalDate updatedAt;                    // 수정일
        private BigDecimal maxIncome;                   // 최대소득
        private BigDecimal maxHousePrice;                // 최대주택가격
        private BigDecimal maxAssets;                   // 최대자산
        private BigDecimal maxArea;                      // 최대면적
        private String targetType;                       // 대상유형
        private BigDecimal baseInterestRate;              // 기본금리
        private BigDecimal preferentialInterestRate;      // 우대금리
        private Integer gracePeriodMonths;               // 거치기간(개월)
        private BigDecimal earlyRepayPenaltyRate;        // 중도상환위약금율
        private String repaymentFrequency;               // 상환주기
        private Integer minCreditScore;                  // 최소신용점수
        private String targetDescription;               // 대상설명
        private String securityType;                     // 담보유형
        private String guaranteeRequirement;             // 보증요구사항
        private String documentUrl;                      // 문서URL
    }

    public static FinancialProductDetailResponseDto fromSavingsProduct(SavingsProduct savingsProduct, FinancialProduct financialProduct) {
        BankInfoDto bankInfo = BankInfoDto.builder()
                .bankId(financialProduct.getBank().getBankId())
                .bankName(financialProduct.getBank().getBankName())
                .bankCode(financialProduct.getBank().getBankCode())
                .status(financialProduct.getBank().getStatus())
                .statusDescription(financialProduct.getBank().getStatus().getDescription())
                .build();

        SavingsProductDetailDto savingsDetail = SavingsProductDetailDto.builder()
                .paymentMethod(savingsProduct.getPaymentMethod())
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
                .targetDescription(savingsProduct.getTargetDescription())
                .interestPaymentMethod(savingsProduct.getInterestPaymentMethod())
                .status(savingsProduct.getStatus())
                .build();

        return FinancialProductDetailResponseDto.builder()
                .productId(financialProduct.getProductId())
                .productName(financialProduct.getProductName())
                .productType(financialProduct.getProductType())
                .productTypeDescription(financialProduct.getProductType().getDescription())
                .bank(bankInfo)
                .savingsProduct(savingsDetail)
                .loanProduct(null)
                .build();
    }

    public static FinancialProductDetailResponseDto fromLoanProduct(LoanProduct loanProduct, FinancialProduct financialProduct) {
        BankInfoDto bankInfo = BankInfoDto.builder()
                .bankId(financialProduct.getBank().getBankId())
                .bankName(financialProduct.getBank().getBankName())
                .bankCode(financialProduct.getBank().getBankCode())
                .status(financialProduct.getBank().getStatus())
                .statusDescription(financialProduct.getBank().getStatus().getDescription())
                .build();

        LoanProductDetailDto loanDetail = LoanProductDetailDto.builder()
                .loanType(loanProduct.getLoanType())
                .interestRateType(loanProduct.getInterestRateType())
                .minInterestRate(loanProduct.getMinInterestRate())
                .maxInterestRate(loanProduct.getMaxInterestRate())
                .minLoanAmount(loanProduct.getMinLoanAmount())
                .maxLoanAmount(loanProduct.getMaxLoanAmount())
                .maxLoanPeriodMonths(loanProduct.getMaxLoanPeriodMonths())
                .repaymentMethod(loanProduct.getRepaymentMethod())
                .loanProductDescription(loanProduct.getLoanProductDescription())
                .updatedAt(loanProduct.getUpdatedAt())
                .maxIncome(loanProduct.getMaxIncome())
                .maxHousePrice(loanProduct.getMaxHousePrice())
                .maxAssets(loanProduct.getMaxAssets())
                .maxArea(loanProduct.getMaxArea())
                .targetType(loanProduct.getTargetType())
                .baseInterestRate(loanProduct.getBaseInterestRate())
                .preferentialInterestRate(loanProduct.getPreferentialInterestRate())
                .gracePeriodMonths(loanProduct.getGracePeriodMonths())
                .earlyRepayPenaltyRate(loanProduct.getEarlyRepayPenaltyRate())
                .repaymentFrequency(loanProduct.getRepaymentFrequency())
                .minCreditScore(loanProduct.getMinCreditScore())
                .targetDescription(loanProduct.getTargetDescription())
                .securityType(loanProduct.getSecurityType())
                .guaranteeRequirement(loanProduct.getGuaranteeRequirement())
                .documentUrl(loanProduct.getDocumentUrl())
                .build();

        return FinancialProductDetailResponseDto.builder()
                .productId(financialProduct.getProductId())
                .productName(financialProduct.getProductName())
                .productType(financialProduct.getProductType())
                .productTypeDescription(financialProduct.getProductType().getDescription())
                .bank(bankInfo)
                .savingsProduct(null)
                .loanProduct(loanDetail)
                .build();
    }
}
