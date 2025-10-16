package com.hana_ti.home_planner.domain.auth.dto;

import com.hana_ti.home_planner.domain.user.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn; // Access Token 만료 시간 (초 단위)
    private UserResponseDto user;
    
    public static LoginResponseDto of(String accessToken, String refreshToken, Long expiresIn, UserResponseDto user) {
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}