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
@Table(name = "MD_BANK_TRANSACTION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MdBankTransaction {

    @Id
    @Column(name = "TRANSACTION_ID")
    private Long transactionId;

    @Column(name = "ACCOUNT_ID", nullable = false)
    private Long accountId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ORG_CODE", length = 10, nullable = false)
    private String orgCode;

    @Column(name = "TRANSACTION_DATE", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "TRANSACTION_TYPE", length = 10)
    private String transactionType;

    @Column(name = "AMOUNT", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "BALANCE_AFTER", precision = 18, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "DESCRIPTION", length = 200)
    private String description;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
