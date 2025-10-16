package com.hana_ti.my_data.domain.my_data.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_BANK_LOAN")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MdBankLoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOAN_ID")
    private Long loanId;

    @Column(name = "ACCOUNT_ID", nullable = false)
    private Long accountId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ORG_CODE", length = 10, nullable = false)
    private String orgCode;

    @Column(name = "LOAN_TYPE", length = 50)
    private String loanType;

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

    @Builder
    public MdBankLoan(Long accountId, Long userId, String orgCode, String loanType, 
                     BigDecimal principalAmt, BigDecimal balanceAmt, BigDecimal intRate, 
                     String repayMethod, LocalDate maturityDate, LocalDate nextPayDate) {
        this.accountId = accountId;
        this.userId = userId;
        this.orgCode = orgCode;
        this.loanType = loanType;
        this.principalAmt = principalAmt;
        this.balanceAmt = balanceAmt;
        this.intRate = intRate;
        this.repayMethod = repayMethod;
        this.maturityDate = maturityDate;
        this.nextPayDate = nextPayDate;
        this.createdAt = LocalDateTime.now();
    }
}
