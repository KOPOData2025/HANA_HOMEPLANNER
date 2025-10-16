package com.hana_ti.home_planner.domain.my_data.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_INSURANCE_LOAN")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MdInsuranceLoan {

    @Id
    @Column(name = "INS_LOAN_ID")
    private Long insLoanId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ORG_CODE", length = 10, nullable = false)
    private String orgCode;

    @Column(name = "CONTRACT_ID", length = 50, nullable = false)
    private String contractId;

    @Column(name = "LOAN_TYPE", length = 20)
    private String loanType;

    @Column(name = "PRINCIPAL_AMT", precision = 18, scale = 2)
    private BigDecimal principalAmt;

    @Column(name = "BALANCE_AMT", precision = 18, scale = 2)
    private BigDecimal balanceAmt;

    @Column(name = "INT_RATE", precision = 5, scale = 2)
    private BigDecimal intRate;

    @Column(name = "MATURITY_DATE")
    private LocalDate maturityDate;

    @Column(name = "NEXT_PAY_DATE")
    private LocalDate nextPayDate;

    @Column(name = "REPAY_METHOD", length = 20)
    private String repayMethod;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
