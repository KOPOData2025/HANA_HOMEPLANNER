package com.hana_ti.home_planner.domain.loan.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "LOAN_APPLICATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoanApplication {

    @Id
    @Column(name = "APP_ID", length = 36, nullable = false)
    private String appId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "PROD_ID", length = 36, nullable = false)
    private String productId;

    @Column(name = "REQUEST_AMOUNT", precision = 18, scale = 2, nullable = false)
    private BigDecimal requestAmount;

    @Column(name = "REQUEST_TERM", nullable = false)
    private Integer requestTerm; // 희망 기간(개월)

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private ApplicationStatus status;

    @Column(name = "SUBMITTED_AT")
    private LocalDateTime submittedAt;

    @Column(name = "REVIEWED_AT")
    private LocalDateTime reviewedAt;

    @Column(name = "REVIEWER_ID", length = 36)
    private String reviewerId;

    @Column(name = "REMARKS", length = 500)
    private String remarks;

    @Column(name = "DISBURSE_ACCOUNT_ID", length = 36)
    private String disburseAccountId;

    @Column(name = "IS_JOINT", length = 1, nullable = false)
    private String isJoint = "N"; // 기본값 'N'

    @Column(name = "DISBURSE_DATE")
    private LocalDate disburseDate; // 희망 상환일

    public static LoanApplication create(String appId, String userId, String productId,
                                       BigDecimal requestAmount, Integer requestTerm,
                                       String disburseAccountId, String isJoint, LocalDate disburseDate) {
        LoanApplication application = new LoanApplication();
        application.appId = appId;
        application.userId = userId;
        application.productId = productId;
        application.requestAmount = requestAmount;
        application.requestTerm = requestTerm;
        application.status = "Y".equals(isJoint) ? ApplicationStatus.WAITING_FOR_JOINT : ApplicationStatus.PENDING;
        application.submittedAt = LocalDateTime.now();
        application.disburseAccountId = disburseAccountId;
        application.isJoint = isJoint != null ? isJoint : "N"; // 기본값 'N'
        application.disburseDate = disburseDate;
        return application;
    }

    public void updateStatus(ApplicationStatus newStatus, String reviewerId, String remarks) {
        this.status = newStatus;
        this.reviewerId = reviewerId;
        this.remarks = remarks;
        this.reviewedAt = LocalDateTime.now();
    }

    public void updateDisburseAccount(String disburseAccountId) {
        this.disburseAccountId = disburseAccountId;
    }

    public void updateIsJoint(String isJoint) {
        this.isJoint = isJoint != null ? isJoint : "N";
    }

    public enum ApplicationStatus {
        PENDING("심사중"),
        WAITING_FOR_JOINT("공동대출자 대기중"),
        JOINT_ACCEPTED("공동대출자 수락"),
        UNDER_REVIEW("심사중"),
        APPROVED("승인"),
        REJECTED("거절");

        private final String description;

        ApplicationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
