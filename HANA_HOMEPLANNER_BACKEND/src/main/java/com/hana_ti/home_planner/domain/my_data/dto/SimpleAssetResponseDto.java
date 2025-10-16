package com.hana_ti.home_planner.domain.my_data.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class SimpleAssetResponseDto {
    
    private Long userId;
    private BigDecimal totalAssets;
    
    public static SimpleAssetResponseDto of(Long userId, BigDecimal totalAssets) {
        return SimpleAssetResponseDto.builder()
                .userId(userId)
                .totalAssets(totalAssets)
                .build();
    }
}
