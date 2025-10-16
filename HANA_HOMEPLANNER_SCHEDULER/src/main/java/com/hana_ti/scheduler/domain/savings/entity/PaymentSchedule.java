package com.hana_ti.scheduler.domain.savings.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PAYMENT_SCHEDULE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentSchedule {

    @Id
    @Column(name = "PAYMENT_ID", length = 36, nullable = false)
    private String paymentId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "ACCOUNT_ID", length = 36, nullable = false)
    private String accountId;

    @Column(name = "DUE_DATE", nullable = false)
    private LocalDate dueDate;

    @Column(name = "AMOUNT", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private PaymentStatus status;

    @Column(name = "PAID_AT")
    private LocalDate paidAt;


    public static PaymentSchedule create(String paymentId, String userId, String accountId, 
                                       LocalDate dueDate, BigDecimal amount, PaymentStatus status) {
        PaymentSchedule payment = new PaymentSchedule();
        payment.paymentId = paymentId;
        payment.userId = userId;
        payment.accountId = accountId;
        payment.dueDate = dueDate;
        payment.amount = amount;
        payment.status = status != null ? status : PaymentStatus.PENDING;
        return payment;
    }

    public void updateStatus(PaymentStatus newStatus) {
        this.status = newStatus;
    }

    public void markAsPaid(LocalDate paidAt) {
        this.status = PaymentStatus.PAID;
        this.paidAt = paidAt;
    }

    public enum PaymentStatus {
        PENDING("대기"),
        PAID("납입완료"),
        OVERDUE("연체"),
        CANCELLED("취소");

        private final String description;

        PaymentStatus(String description) {
            this.description = description;
        }

    }
}
