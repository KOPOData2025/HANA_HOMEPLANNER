package com.hana_ti.home_planner.domain.house.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SigunguStatsResponseDto {

    /**
     * 대분류 지역 (서울/경기/인천)
     */
    private String regionLarge;

    /**
     * 시군구명 (예: 고양시, 강남구, 강화군)
     */
    private String sigungu;

    /**
     * 단지수
     */
    private Long complexCount;

    /**
     * 최소 분양가
     */
    private BigDecimal minPrice;

    /**
     * 평균 분양가
     */
    private BigDecimal avgPrice;

    /**
     * 최대 분양가
     */
    private BigDecimal maxPrice;

    /**
     * 세대수 가중평균 분양가
     */
    private BigDecimal weightedAvgPrice;

    /**
     * 네이티브 쿼리 결과를 DTO로 변환하는 정적 팩토리 메소드
     */
    public static SigunguStatsResponseDto fromNativeQueryResult(Object[] result) {
        return SigunguStatsResponseDto.builder()
                .regionLarge((String) result[0])
                .sigungu((String) result[1])
                .complexCount(((Number) result[2]).longValue())
                .minPrice(result[3] != null ? new BigDecimal(result[3].toString()) : null)
                .avgPrice(result[4] != null ? new BigDecimal(result[4].toString()) : null)
                .maxPrice(result[5] != null ? new BigDecimal(result[5].toString()) : null)
                .weightedAvgPrice(result[6] != null ? new BigDecimal(result[6].toString()) : null)
                .build();
    }
}
