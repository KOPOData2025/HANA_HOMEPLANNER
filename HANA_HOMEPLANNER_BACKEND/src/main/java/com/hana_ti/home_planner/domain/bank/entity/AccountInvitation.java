package com.hana_ti.home_planner.domain.bank.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ACCOUNT_INVITATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountInvitation {

    @Id
    @Column(name = "INVITE_ID", length = 36, nullable = false)
    private String inviteId;

    @Column(name = "ACCOUNT_ID", length = 36, nullable = false)
    private String accountId;

    @Column(name = "INVITER_ID", length = 36, nullable = false)
    private String inviterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", length = 20, nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private InvitationStatus status;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "RESPONDED_AT")
    private LocalDateTime respondedAt;

    /**
     * 계좌 초대 생성
     */
    public static AccountInvitation create(String inviteId, String accountId, String inviterId, Role role) {
        AccountInvitation invitation = new AccountInvitation();
        invitation.inviteId = inviteId;
        invitation.accountId = accountId;
        invitation.inviterId = inviterId;
        invitation.role = role;
        invitation.status = InvitationStatus.PENDING;
        invitation.createdAt = LocalDateTime.now();
        invitation.respondedAt = null;
        return invitation;
    }

    /**
     * 초대 수락
     */
    public void accept() {
        this.status = InvitationStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * 초대 거절
     */
    public void reject() {
        this.status = InvitationStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * 초대 만료
     */
    public void expire() {
        this.status = InvitationStatus.EXPIRED;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * 초대 역할 열거형
     */
    public enum Role {
        JOINT("공동참여자");

        private final String description;

        Role(String description) {
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
