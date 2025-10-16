package com.hana_ti.home_planner.domain.house.controller;

import com.hana_ti.home_planner.domain.house.dto.HouseDetailResponseDto;
import com.hana_ti.home_planner.domain.house.service.HouseSalesInfoService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/house")
@RequiredArgsConstructor
@Slf4j
public class HouseDetailController {

    private final HouseSalesInfoService houseSalesInfoService;

    /**
     * 전체 주택 상세 정보 조회 (좌표 포함)
     * GET /api/house/details
     * 
     * 주택 판매 정보, 주소 좌표, 가격 정보 요약을 통합하여 제공합니다.
     * - 주택 기본 정보 (주택명, 공급지역, 공급규모 등)
     * - 주소 정보 (시도, 시군구, 읍면동, 도로명)
     * - 좌표 정보 (위도, 경도)
     * - 가격 정보 요약 (주택형 수, 면적 범위, 분양가 범위, 세대수 등)
     */
    @GetMapping("/details")
    public ResponseEntity<ApiResponse<List<HouseDetailResponseDto>>> getAllHouseDetails() {
        log.info("전체 주택 상세 정보 조회 API 호출 (좌표 포함)");

        List<HouseDetailResponseDto> result = houseSalesInfoService.getAllHouseDetailsWithCoordinates();

        log.info("전체 주택 상세 정보 조회 완료 - 조회된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("주택 상세 정보 조회 완료", result));
    }
}
