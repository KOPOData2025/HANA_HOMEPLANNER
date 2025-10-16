package com.hana_ti.home_planner.domain.savings.entity;

import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sv_prod")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavingsProduct {

    @Id
    @Column(name = "prod_id", length = 36)
    private String productId;

    @Column(name = "pay_mthd", length = 50, nullable = false)
    private String paymentMethod;

    @Column(name = "is_cmpnd_int_apld", length = 1, nullable = false)
    private String isCompoundInterestApplied;

    @Column(name = "is_tx_pref_apld", length = 1, nullable = false)
    private String isTaxPreferenceApplied;

    @Column(name = "pay_dly_prd_mths")
    private Integer paymentDelayPeriodMonths;

    @Column(name = "erly_wdrw_pnlty_rt", precision = 5, scale = 3)
    private BigDecimal earlyWithdrawPenaltyRate;

    @Column(name = "pref_int_rt", precision = 5, scale = 3)
    private BigDecimal preferentialInterestRate;

    @Column(name = "upd_at")
    private LocalDate updatedAt;

    @Column(name = "term_mths")
    private Integer termMonths;

    @Column(name = "min_dep_amt", precision = 15, scale = 2)
    private BigDecimal minDepositAmount;

    @Column(name = "max_dep_amt", precision = 15, scale = 2)
    private BigDecimal maxDepositAmount;

    @Column(name = "base_int_rt", precision = 5, scale = 3)
    private BigDecimal baseInterestRate;

    @Column(name = "prod_desc", length = 500)
    private String productDescription;

    @Column(name = "doc_url", length = 500)
    private String documentUrl;

    @Column(name = "target_desc", length = 500)
    private String targetDescription;

    @Column(name = "int_pay_mthd", length = 100)
    private String interestPaymentMethod;

    @Column(name = "status", length = 20)
    private String status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prod_id")
    private FinancialProduct financialProduct;

    public static SavingsProduct create(String productId, String paymentMethod,
                                      boolean isCompoundInterestApplied, boolean isTaxPreferenceApplied,
                                      Integer paymentDelayPeriodMonths, BigDecimal earlyWithdrawPenaltyRate,
                                      BigDecimal preferentialInterestRate, Integer termMonths,
                                      BigDecimal minDepositAmount, BigDecimal maxDepositAmount,
                                      BigDecimal baseInterestRate, String productDescription,
                                      String documentUrl, String targetDescription, String interestPaymentMethod,
                                      String status, FinancialProduct financialProduct) {
        SavingsProduct savingsProduct = new SavingsProduct();
        savingsProduct.productId = productId;
        savingsProduct.paymentMethod = paymentMethod;
        savingsProduct.isCompoundInterestApplied = isCompoundInterestApplied ? "Y" : "N";
        savingsProduct.isTaxPreferenceApplied = isTaxPreferenceApplied ? "Y" : "N";
        savingsProduct.paymentDelayPeriodMonths = paymentDelayPeriodMonths;
        savingsProduct.earlyWithdrawPenaltyRate = earlyWithdrawPenaltyRate;
        savingsProduct.preferentialInterestRate = preferentialInterestRate;
        savingsProduct.termMonths = termMonths;
        savingsProduct.minDepositAmount = minDepositAmount;
        savingsProduct.maxDepositAmount = maxDepositAmount;
        savingsProduct.baseInterestRate = baseInterestRate;
        savingsProduct.productDescription = productDescription;
        savingsProduct.documentUrl = documentUrl;
        savingsProduct.targetDescription = targetDescription;
        savingsProduct.interestPaymentMethod = interestPaymentMethod;
        savingsProduct.status = status != null ? status : "ACTIVE";
        savingsProduct.updatedAt = LocalDate.now();
        savingsProduct.financialProduct = financialProduct;
        return savingsProduct;
    }

    // 편의 메서드
    public boolean isCompoundInterestApplied() {
        return "Y".equals(this.isCompoundInterestApplied);
    }

    public boolean isTaxPreferenceApplied() {
        return "Y".equals(this.isTaxPreferenceApplied);
    }
}
