package com.hana_ti.home_planner.domain.house.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousePriceInfoPageRequestDto {
    
    @Builder.Default
    private int page = 0; // 0부터 시작 (Spring Data JPA 기본값)
    
    @Builder.Default
    private int size = 20; // 기본 페이지 크기
    
    @Builder.Default
    private String sortBy = "houseManagementNumber"; // 기본 정렬 필드
    
    @Builder.Default
    private String sortDirection = "ASC"; // 기본 정렬 방향 (ASC, DESC)
    
    // 검색 조건들
    private String sido;
    private String sigungu;
    private String eupmyeondong;
    private String houseType;
    private String location;
    private String priceRange; // "min-max" 형식 (예: "500000000-1000000000")
    private String areaRange; // "min-max" 형식 (예: "70-90")
    private String minHouseholds; // 최소 세대수
    
    public int getPage() {
        return Math.max(0, page);
    }
    
    public int getSize() {
        return Math.min(100, Math.max(1, size)); // 1~100 사이로 제한
    }
}
