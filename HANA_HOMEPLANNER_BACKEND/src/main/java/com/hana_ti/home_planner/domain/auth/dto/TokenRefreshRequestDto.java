package com.hana_ti.home_planner.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRefreshRequestDto {
    
    @NotBlank(message = "Refresh Token은 필수입니다")
    private String refreshToken;
}
