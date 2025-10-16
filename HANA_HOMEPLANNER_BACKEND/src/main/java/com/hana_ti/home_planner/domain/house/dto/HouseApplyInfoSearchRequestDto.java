package com.hana_ti.home_planner.domain.house.dto;

import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

@Data
public class HouseApplyInfoSearchRequestDto {
    
    private String sido;        // 시/도 (예: "서울특별시")
    private String sigungu;     // 시/군/구 (예: "강남구")
    private String emd;         // 읍/면/동 (예: "삼성동")
    private BigDecimal area;    // 주택공급면적 (m²)
    private Integer page = 0;   // 페이지 번호 (기본값: 0)
    private Integer size = 20;  // 페이지 크기 (기본값: 20)
    
    /**
     * Pageable 객체로 변환
     */
    public Pageable toPageable() {
        return PageRequest.of(page, size);
    }
    
    /**
     * emdPrefix 생성 (LIKE 검색용)
     */
    public String getEmdPrefix() {
        if (emd == null || emd.trim().isEmpty()) {
            return null;
        }
        return emd.trim() + "%";
    }
}
