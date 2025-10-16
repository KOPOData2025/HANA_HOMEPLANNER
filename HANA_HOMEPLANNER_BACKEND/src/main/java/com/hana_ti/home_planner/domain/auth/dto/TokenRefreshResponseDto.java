package com.hana_ti.home_planner.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRefreshResponseDto {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn; // Access Token 만료 시간 (초 단위)
    private String message;
    
    public static TokenRefreshResponseDto of(String accessToken, String refreshToken, Long expiresIn, String message) {
        return TokenRefreshResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .message(message)
                .build();
    }
}
