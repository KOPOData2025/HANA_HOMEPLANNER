package com.hana_ti.scheduler.domain.bank.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "TRANSACTION_HISTORY")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TransactionHistory {

    @Id
    @Column(name = "TXN_ID", length = 36, nullable = false)
    private String txnId;

    @Column(name = "ACCOUNT_ID", length = 36, nullable = false)
    private String accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "TXN_TYPE", length = 20, nullable = false)
    private TransactionType txnType;

    @Column(name = "AMOUNT", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "BALANCE_AFTER", precision = 18, scale = 2, nullable = false)
    private BigDecimal balanceAfter;

    @Column(name = "DESCRIPTION", length = 200)
    private String description;

    @Column(name = "TXN_DATE", nullable = false)
    private LocalDate txnDate;

    public static TransactionHistory create(String txnId, String accountId, 
                                          TransactionType txnType, BigDecimal amount, 
                                          BigDecimal balanceAfter, String description) {
        TransactionHistory transaction = new TransactionHistory();
        transaction.txnId = txnId;
        transaction.accountId = accountId;
        transaction.txnType = txnType;
        transaction.amount = amount;
        transaction.balanceAfter = balanceAfter;
        transaction.description = description;
        transaction.txnDate = LocalDate.now();
        return transaction;
    }

    public enum TransactionType {
        DEPOSIT("입금"),
        INTEREST("이자"),
        WITHDRAWAL("출금"),
        LOAN_OUT("대출실행"),
        LOAN_IN("대출수령");

        private final String description;

        TransactionType(String description) {
            this.description = description;
        }
    }
}
