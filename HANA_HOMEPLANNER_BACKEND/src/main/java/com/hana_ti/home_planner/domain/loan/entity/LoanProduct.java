package com.hana_ti.home_planner.domain.loan.entity;

import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "LN_PROD")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoanProduct {

    @Id
    @Column(name = "PROD_ID", length = 36, nullable = false)
    private String productId;

    @Column(name = "LOAN_TYP", length = 100, nullable = false)
    private String loanType;

    @Column(name = "INT_RT_TYP", length = 50, nullable = false)
    private String interestRateType;

    @Column(name = "MIN_INT_RT", precision = 5, scale = 3)
    private BigDecimal minInterestRate;

    @Column(name = "MAX_INT_RT", precision = 5, scale = 3)
    private BigDecimal maxInterestRate;

    @Column(name = "MIN_LN_AMT", precision = 18, scale = 2)
    private BigDecimal minLoanAmount;

    @Column(name = "MAX_LN_AMT", precision = 18, scale = 2)
    private BigDecimal maxLoanAmount;

    @Column(name = "MAX_LN_PRD_MTHS")
    private Integer maxLoanPeriodMonths;

    @Column(name = "REPAY_MTHD", length = 50)
    private String repaymentMethod;

    @Column(name = "LN_PROD_DESC", length = 255)
    private String loanProductDescription;

    @Column(name = "UPD_AT")
    private LocalDate updatedAt;

    @Column(name = "MAX_INCOME", precision = 18)
    private BigDecimal maxIncome;

    @Column(name = "MAX_HOUSE_PRICE", precision = 18)
    private BigDecimal maxHousePrice;

    @Column(name = "MAX_ASSETS", precision = 18)
    private BigDecimal maxAssets;

    @Column(name = "MAX_AREA", precision = 5, scale = 2)
    private BigDecimal maxArea;

    @Column(name = "TARGET_TYPE", length = 100)
    private String targetType;

    @Column(name = "BASE_INT_RT", precision = 5, scale = 3)
    private BigDecimal baseInterestRate;

    @Column(name = "PREF_INT_RT", precision = 5, scale = 3)
    private BigDecimal preferentialInterestRate;

    @Column(name = "GRACE_PRD_MTHS")
    private Integer gracePeriodMonths;

    @Column(name = "EARLY_REPAY_PENALTY_RT", precision = 5, scale = 3)
    private BigDecimal earlyRepayPenaltyRate;

    @Column(name = "REPAY_FREQ", length = 20)
    private String repaymentFrequency;

    @Column(name = "MIN_CREDIT_SCORE", precision = 5)
    private Integer minCreditScore;

    @Column(name = "TARGET_DESC", length = 255)
    private String targetDescription;

    @Column(name = "SECURITY_TYPE", length = 50)
    private String securityType;

    @Column(name = "GUARANTEE_REQ", length = 50)
    private String guaranteeRequirement;

    @Column(name = "DOC_URL", length = 500)
    private String documentUrl;

    // FinancialProduct와의 관계를 제거하여 ProductType enum 오류 방지
    // 필요한 경우 별도로 조회

    public static LoanProduct create(String productId, String loanType, String interestRateType,
                                   BigDecimal minInterestRate, BigDecimal maxInterestRate,
                                   BigDecimal minLoanAmount, BigDecimal maxLoanAmount,
                                   Integer maxLoanPeriodMonths, String repaymentMethod,
                                   String loanProductDescription, BigDecimal maxIncome,
                                   BigDecimal maxHousePrice, BigDecimal maxAssets,
                                   BigDecimal maxArea, String targetType, BigDecimal baseInterestRate,
                                   BigDecimal preferentialInterestRate, Integer gracePeriodMonths,
                                   BigDecimal earlyRepayPenaltyRate, String repaymentFrequency,
                                   Integer minCreditScore, String targetDescription,
                                   String securityType, String guaranteeRequirement, String documentUrl) {
        LoanProduct loanProduct = new LoanProduct();
        loanProduct.productId = productId;
        loanProduct.loanType = loanType;
        loanProduct.interestRateType = interestRateType;
        loanProduct.minInterestRate = minInterestRate;
        loanProduct.maxInterestRate = maxInterestRate;
        loanProduct.minLoanAmount = minLoanAmount;
        loanProduct.maxLoanAmount = maxLoanAmount;
        loanProduct.maxLoanPeriodMonths = maxLoanPeriodMonths;
        loanProduct.repaymentMethod = repaymentMethod;
        loanProduct.loanProductDescription = loanProductDescription;
        loanProduct.maxIncome = maxIncome;
        loanProduct.maxHousePrice = maxHousePrice;
        loanProduct.maxAssets = maxAssets;
        loanProduct.maxArea = maxArea;
        loanProduct.targetType = targetType;
        loanProduct.baseInterestRate = baseInterestRate;
        loanProduct.preferentialInterestRate = preferentialInterestRate;
        loanProduct.gracePeriodMonths = gracePeriodMonths;
        loanProduct.earlyRepayPenaltyRate = earlyRepayPenaltyRate;
        loanProduct.repaymentFrequency = repaymentFrequency;
        loanProduct.minCreditScore = minCreditScore;
        loanProduct.targetDescription = targetDescription;
        loanProduct.securityType = securityType;
        loanProduct.guaranteeRequirement = guaranteeRequirement;
        loanProduct.documentUrl = documentUrl;
        loanProduct.updatedAt = LocalDate.now();
        return loanProduct;
    }
}
