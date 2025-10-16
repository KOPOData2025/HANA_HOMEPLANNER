package com.hana_ti.home_planner.domain.financial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanRecommendationResponseDto {
    
    private List<RecommendedProductDto> recommendations; // 추천 상품 목록
    private Integer totalRecommendations; // 총 추천 상품 수
    private String recommendationSummary; // 추천 요약
    private LocalDateTime recommendationDate; // 추천 일시
    private String message; // 응답 메시지
}
