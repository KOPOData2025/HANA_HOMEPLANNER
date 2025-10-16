package com.hana_ti.home_planner.domain.bank.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ACCOUNT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Account {

    @Id
    @Column(name = "ACCOUNT_ID", length = 36, nullable = false)
    private String accountId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "PROD_ID", length = 36, nullable = false)
    private String productId;

    @Column(name = "ACCOUNT_NUM", length = 50, unique = true, nullable = false)
    private String accountNum;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACCOUNT_TYPE", length = 20)
    private AccountType accountType;

    @Column(name = "BALANCE", precision = 18, scale = 2)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private AccountStatus status;

    @Column(name = "CREATED_AT")
    private LocalDate createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDate updatedAt;

    public static Account create(String accountId, String userId, String productId, 
                                String accountNum, AccountType accountType, 
                                BigDecimal balance, AccountStatus status) {
        Account account = new Account();
        account.accountId = accountId;
        account.userId = userId;
        account.productId = productId;
        account.accountNum = accountNum;
        account.accountType = accountType;
        account.balance = balance;
        account.status = status;
        account.createdAt = LocalDate.now();
        account.updatedAt = LocalDate.now();
        return account;
    }

    public void updateBalance(BigDecimal newBalance) {
        this.balance = newBalance;
        this.updatedAt = LocalDate.now();
    }

    public void updateStatus(AccountStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDate.now();
    }

    public void withdraw(BigDecimal amount) {
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalArgumentException("잔액이 부족합니다. 현재 잔액: " + this.balance + ", 요청 금액: " + amount);
        }
        this.balance = this.balance.subtract(amount);
        this.updatedAt = LocalDate.now();
    }

    public void deposit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
        this.updatedAt = LocalDate.now();
    }

    public enum AccountType {
        SAVING("적금"),
        JOINT_SAVING("공동적금"),
        LOAN("대출"),
        JOINT_LOAN("공동대출"),
        DEMAND("입출금");

        private final String description;

        AccountType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum AccountStatus {
        ACTIVE("활성"),
        INACTIVE("비활성"),
        CLOSED("해지");

        private final String description;

        AccountStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
