package com.hana_ti.scheduler.domain.savings.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "USER_SAVINGS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSavings {

    @Id
    @Column(name = "USER_SAVINGS_ID", length = 36)
    private String userSavingsId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "PROD_ID", length = 36, nullable = false)
    private String productId;

    @Column(name = "ACCOUNT_ID", length = 36, nullable = false)
    private String accountId;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Column(name = "MONTHLY_AMOUNT", precision = 15, scale = 2, nullable = false)
    private BigDecimal monthlyAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private SavingsStatus status;

    @Column(name = "CREATED_AT")
    private LocalDate createdAt;

    @Column(name = "AUTO_DEBIT_ACCOUNT_ID", length = 36)
    private String autoDebitAccountId;

    public static UserSavings create(String userSavingsId, String userId, String productId, 
                                   String accountId, LocalDate startDate, LocalDate endDate,
                                   BigDecimal monthlyAmount, SavingsStatus status, String autoDebitAccountId) {
        UserSavings userSavings = new UserSavings();
        userSavings.userSavingsId = userSavingsId;
        userSavings.userId = userId;
        userSavings.productId = productId;
        userSavings.accountId = accountId;
        userSavings.startDate = startDate;
        userSavings.endDate = endDate;
        userSavings.monthlyAmount = monthlyAmount;
        userSavings.status = status != null ? status : SavingsStatus.ACTIVE;
        userSavings.autoDebitAccountId = (autoDebitAccountId != null && !autoDebitAccountId.trim().isEmpty()) 
                ? autoDebitAccountId.trim() : null;
        userSavings.createdAt = LocalDate.now();
        return userSavings;
    }

    public enum SavingsStatus {
        ACTIVE("활성"),
        INACTIVE("비활성"),
        COMPLETED("완료"),
        CANCELLED("취소");

        private final String description;

        SavingsStatus(String description) {
            this.description = description;
        }

    }
}
