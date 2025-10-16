package com.hana_ti.home_planner.domain.bank.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bnk")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bank {

    @Id
    @Column(name = "bnk_id", length = 36)
    private String bankId;

    @Column(name = "bnk_nm", length = 100, nullable = false)
    private String bankName;

    @Column(name = "bnk_cd", nullable = false)
    private Integer bankCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private BankStatus status;

    public static Bank create(String bankId, String bankName, Integer bankCode, BankStatus status) {
        Bank bank = new Bank();
        bank.bankId = bankId;
        bank.bankName = bankName;
        bank.bankCode = bankCode;
        bank.status = status;
        return bank;
    }
}
