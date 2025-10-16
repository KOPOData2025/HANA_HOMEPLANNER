package com.hana_ti.home_planner.domain.couple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoupleInviteResponseDto {

    private String inviteToken;
    private String inviteUrl;

    /**
     * 엔티티로부터 DTO 생성
     */
    public static CoupleInviteResponseDto from(String token, String frontendUrl) {
        return CoupleInviteResponseDto.builder()
                .inviteToken(token)
                .inviteUrl(frontendUrl + "/couple/invite/" + token)
                .build();
    }
}
