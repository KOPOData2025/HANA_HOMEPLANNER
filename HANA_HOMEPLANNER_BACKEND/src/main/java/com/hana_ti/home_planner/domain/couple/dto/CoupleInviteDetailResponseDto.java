package com.hana_ti.home_planner.domain.couple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoupleInviteDetailResponseDto {
    
    private String inviteId;
    private String userId;
    private String token;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
    private boolean isExpired;
    
    /**
     * 엔티티로부터 DTO 생성
     */
    public static CoupleInviteDetailResponseDto from(com.hana_ti.home_planner.domain.couple.entity.CoupleInvite coupleInvite) {
        return CoupleInviteDetailResponseDto.builder()
                .inviteId(coupleInvite.getInviteId())
                .userId(coupleInvite.getUserId())
                .token(coupleInvite.getToken())
                .status(coupleInvite.getStatus().name())
                .createdAt(coupleInvite.getCreatedAt())
                .expiredAt(coupleInvite.getExpiredAt())
                .isExpired(coupleInvite.isExpired())
                .build();
    }
}
