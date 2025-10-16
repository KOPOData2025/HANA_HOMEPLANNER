package com.hana_ti.home_planner.domain.house.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousePriceInfoPageResponseDto {
    
    private List<HousePriceInfoResponseDto> content; // 현재 페이지 데이터
    private int currentPage; // 현재 페이지 (0부터 시작)
    private int totalPages; // 전체 페이지 수
    private long totalElements; // 전체 데이터 수
    private int currentPageSize; // 현재 페이지 크기
    private boolean hasNext; // 다음 페이지 존재 여부
    private boolean hasPrevious; // 이전 페이지 존재 여부
    private boolean isFirst; // 첫 페이지 여부
    private boolean isLast; // 마지막 페이지 여부
    
    public static HousePriceInfoPageResponseDto from(Page<HousePriceInfoResponseDto> page) {
        return HousePriceInfoPageResponseDto.builder()
                .content(page.getContent())
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .currentPageSize(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }
}
