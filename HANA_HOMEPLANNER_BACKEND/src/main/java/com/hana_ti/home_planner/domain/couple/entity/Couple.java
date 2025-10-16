package com.hana_ti.home_planner.domain.couple.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "couples")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Couple {

    @Id
    @Column(name = "couple_id", length = 36)
    private String coupleId;

    @Column(name = "user_id_1", length = 36, nullable = false)
    private String userId1;

    @Column(name = "user_id_2", length = 36, nullable = false)
    private String userId2;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private CoupleStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public Couple(String coupleId, String userId1, String userId2, CoupleStatus status) {
        this.coupleId = coupleId;
        this.userId1 = userId1;
        this.userId2 = userId2;
        this.status = status != null ? status : CoupleStatus.ACTIVE;
    }

    /**
     * 커플 상태 업데이트
     */
    public void updateStatus(CoupleStatus status) {
        this.status = status;
    }

    /**
     * 커플 상태 열거형
     */
    public enum CoupleStatus {
        ACTIVE,     // 활성
        INACTIVE,   // 비활성
        DELETED     // 삭제됨
    }
}
