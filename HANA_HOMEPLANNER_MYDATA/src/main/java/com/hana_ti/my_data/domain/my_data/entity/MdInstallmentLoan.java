package com.hana_ti.my_data.domain.my_data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_INSTALLMENT_LOAN")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MdInstallmentLoan {

    @Id
    @Column(name = "INST_LOAN_ID")
    private Long instLoanId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ORG_CODE", length = 10, nullable = false)
    private String orgCode;

    @Column(name = "PRODUCT_NAME", length = 200)
    private String productName;

    @Column(name = "PRINCIPAL_AMT", precision = 18, scale = 2)
    private BigDecimal principalAmt;

    @Column(name = "BALANCE_AMT", precision = 18, scale = 2)
    private BigDecimal balanceAmt;

    @Column(name = "INT_RATE", precision = 5, scale = 2)
    private BigDecimal intRate;

    @Column(name = "REPAY_METHOD", length = 20)
    private String repayMethod;

    @Column(name = "MATURITY_DATE")
    private LocalDate maturityDate;

    @Column(name = "NEXT_PAY_DATE")
    private LocalDate nextPayDate;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
