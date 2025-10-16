package com.hana_ti.home_planner.domain.house.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HousePriceAreaStatsDto {
    
    private String sigungu;           // 시군구 (예: 경기도 가평군)
    private String areaRange;         // 면적구간 (예: 102㎡ 이상)
    private Long typeCount;           // 타입수
    private Long totalHouseholds;     // 총공급세대수
    private BigDecimal avgPrice;      // 평균분양가 (만원)
    
    // 정적 팩토리 메서드
    public static HousePriceAreaStatsDto of(String sigungu, String areaRange, 
                                          Long typeCount, Long totalHouseholds, BigDecimal avgPrice) {
        return HousePriceAreaStatsDto.builder()
                .sigungu(sigungu)
                .areaRange(areaRange)
                .typeCount(typeCount)
                .totalHouseholds(totalHouseholds)
                .avgPrice(avgPrice)
                .build();
    }
}
