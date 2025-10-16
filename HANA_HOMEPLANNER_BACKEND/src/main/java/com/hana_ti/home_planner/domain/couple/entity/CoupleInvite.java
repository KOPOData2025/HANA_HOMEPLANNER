package com.hana_ti.home_planner.domain.couple.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "couple_invite")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CoupleInvite {

    @Id
    @Column(name = "invite_id", length = 36)
    private String inviteId;

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "token", length = 100, unique = true, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private InviteStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Builder
    public CoupleInvite(String userId, String token, InviteStatus status, LocalDateTime expiredAt) {
        this.inviteId = UUID.randomUUID().toString();
        this.userId = userId;
        this.token = token;
        this.status = status != null ? status : InviteStatus.PENDING;
        this.expiredAt = expiredAt;
    }

    /**
     * 초대 상태 업데이트
     */
    public void updateStatus(InviteStatus status) {
        this.status = status;
    }

    /**
     * 초대 만료 여부 확인
     */
    public boolean isExpired() {
        return expiredAt != null && LocalDateTime.now().isAfter(expiredAt);
    }

    /**
     * 초대 상태 열거형
     */
    public enum InviteStatus {
        PENDING,    // 대기 중
        ACCEPTED,   // 수락됨
        REJECTED,   // 거절됨
        EXPIRED     // 만료됨
    }
}
