package com.hana_ti.scheduler.domain.loan.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "LOAN_REPAYMENT_SCHEDULE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoanRepaymentSchedule {

    @Id
    @Column(name = "REPAY_ID", length = 36, nullable = false)
    private String repayId;

    @Column(name = "LOAN_ID", length = 36, nullable = false)
    private String loanId;

    @Column(name = "DUE_DATE", nullable = false)
    private LocalDate dueDate;

    @Column(name = "PRINCIPAL_DUE", precision = 15, scale = 2, nullable = false)
    private BigDecimal principalDue;

    @Column(name = "INTEREST_DUE", precision = 15, scale = 2, nullable = false)
    private BigDecimal interestDue;

    @Column(name = "TOTAL_DUE", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalDue;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private RepaymentStatus status;

    @Column(name = "PAID_AT")
    private LocalDateTime paidAt;

    public static LoanRepaymentSchedule create(String repayId, String loanId, LocalDate dueDate,
                                             BigDecimal principalDue, BigDecimal interestDue,
                                             BigDecimal totalDue) {
        LoanRepaymentSchedule schedule = new LoanRepaymentSchedule();
        schedule.repayId = repayId;
        schedule.loanId = loanId;
        schedule.dueDate = dueDate;
        schedule.principalDue = principalDue;
        schedule.interestDue = interestDue;
        schedule.totalDue = totalDue;
        schedule.status = RepaymentStatus.PENDING;
        return schedule;
    }

    public void markAsPaid() {
        this.status = RepaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsOverdue() {
        this.status = RepaymentStatus.OVERDUE;
    }

    public void updateAmounts(BigDecimal principalDue, BigDecimal interestDue, BigDecimal totalDue) {
        this.principalDue = principalDue;
        this.interestDue = interestDue;
        this.totalDue = totalDue;
    }

    public boolean isOverdue() {
        return LocalDate.now().isAfter(dueDate) && status == RepaymentStatus.PENDING;
    }

    public enum RepaymentStatus {
        PENDING("대기중"),
        PAID("상환완료"),
        OVERDUE("연체");

        private final String description;

        RepaymentStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
