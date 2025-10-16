package com.hana_ti.scheduler.domain.bank.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ACCOUNT_PARTICIPANT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountParticipant {

    @Id
    @Column(name = "PARTICIPANT_ID", length = 36, nullable = false)
    private String participantId;

    @Column(name = "ACCOUNT_ID", length = 36, nullable = false)
    private String accountId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", length = 20, nullable = false)
    private Role role;

    @Column(name = "CONTRIBUTION_RT", precision = 5, scale = 2)
    private BigDecimal contributionRate;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    /**
     * 계좌 참여자 생성
     */
    public static AccountParticipant create(String participantId, String accountId, String userId, 
                                         Role role, BigDecimal contributionRate) {
        AccountParticipant participant = new AccountParticipant();
        participant.participantId = participantId;
        participant.accountId = accountId;
        participant.userId = userId;
        participant.role = role;
        participant.contributionRate = contributionRate;
        participant.createdAt = LocalDateTime.now();
        participant.updatedAt = LocalDateTime.now();
        return participant;
    }

    /**
     * 계좌 참여자 역할 열거형
     */
    public enum Role {
        PRIMARY("주계좌"),
        JOINT("공동계좌");

        private final String description;

        Role(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
