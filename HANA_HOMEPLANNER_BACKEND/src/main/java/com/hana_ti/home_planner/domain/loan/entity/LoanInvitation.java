package com.hana_ti.home_planner.domain.loan.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "LOAN_INVITATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoanInvitation {

    @Id
    @Column(name = "INVITE_ID", length = 36, nullable = false)
    private String inviteId;

    @Column(name = "APP_ID", length = 36, nullable = false)
    private String appId;

    @Column(name = "INVITER_ID", length = 36, nullable = false)
    private String inviterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", length = 20, nullable = false)
    private InvitationRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20, nullable = false)
    private InvitationStatus status;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "RESPONSE_AT")
    private LocalDateTime responseAt;

    @Column(name = "JOINT_NAME", length = 100)
    private String jointName;

    @Column(name = "JOINT_PHONE", length = 30)
    private String jointPhone;

    @Column(name = "JOINT_CI", length = 88)
    private String jointCi;

    @Builder
    public LoanInvitation(String inviteId, String appId, String inviterId, 
                        InvitationRole role, InvitationStatus status,
                        String jointName, String jointPhone, String jointCi) {
        this.inviteId = inviteId;
        this.appId = appId;
        this.inviterId = inviterId;
        this.role = role;
        this.status = status != null ? status : InvitationStatus.PENDING;
        this.jointName = jointName;
        this.jointPhone = jointPhone;
        this.jointCi = jointCi;
    }

    /**
     * 초대 생성 팩토리 메서드
     */
    public static LoanInvitation create(String inviteId, String appId, String inviterId, InvitationRole role) {
        return LoanInvitation.builder()
                .inviteId(inviteId)
                .appId(appId)
                .inviterId(inviterId)
                .role(role)
                .status(InvitationStatus.PENDING)
                .build();
    }

    /**
     * 공동 대출자 정보와 함께 초대 생성 팩토리 메서드
     */
    public static LoanInvitation createWithJointInfo(String inviteId, String appId, String inviterId, 
                                                   InvitationRole role, String jointName, String jointPhone, String jointCi) {
        return LoanInvitation.builder()
                .inviteId(inviteId)
                .appId(appId)
                .inviterId(inviterId)
                .role(role)
                .status(InvitationStatus.PENDING)
                .jointName(jointName)
                .jointPhone(jointPhone)
                .jointCi(jointCi)
                .build();
    }

    /**
     * 초대 상태 업데이트
     */
    public void updateStatus(InvitationStatus newStatus) {
        this.status = newStatus;
        this.responseAt = LocalDateTime.now();
    }

    /**
     * 공동 대출자 정보 업데이트
     */
    public void updateJointInfo(String jointName, String jointPhone, String jointCi) {
        this.jointName = jointName;
        this.jointPhone = jointPhone;
        this.jointCi = jointCi;
    }

    /**
     * 초대 역할 열거형
     */
    public enum InvitationRole {
        PRIMARY("주계좌"),
        JOINT("공동계좌");

        private final String description;

        InvitationRole(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 초대 상태 열거형
     */
    public enum InvitationStatus {
        PENDING("대기중"),
        ACCEPTED("수락"),
        REJECTED("거절"),
        EXPIRED("만료");

        private final String description;

        InvitationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
