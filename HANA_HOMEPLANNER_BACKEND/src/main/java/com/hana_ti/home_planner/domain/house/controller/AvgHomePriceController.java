package com.hana_ti.home_planner.domain.house.controller;

import com.hana_ti.home_planner.domain.house.dto.AvgHomePriceMapMarkerDto;
import com.hana_ti.home_planner.domain.house.dto.AvgHomePriceResponseDto;
import com.hana_ti.home_planner.domain.house.service.AvgHomePriceService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/house/avg-price")
@RequiredArgsConstructor
@Slf4j
public class AvgHomePriceController {

    private final AvgHomePriceService avgHomePriceService;

    /**
     * 모든 지역의 평균 주택 가격 정보 조회
     * GET /api/house/avg-price
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AvgHomePriceResponseDto>>> getAllAvgHomePrices() {
        log.info("모든 지역의 평균 주택 가격 정보 조회 API 호출");
        
        List<AvgHomePriceResponseDto> avgHomePrices = avgHomePriceService.getAllAvgHomePrices();
        
        log.info("모든 지역의 평균 주택 가격 정보 조회 완료 - 조회된 데이터 개수: {}", avgHomePrices.size());
        
        return ResponseEntity.ok(ApiResponse.success("평균 주택 가격 정보 조회 완료", avgHomePrices));
    }

    /**
     * 지도 마커용 평균 주택 가격 정보 조회
     * GET /api/house/avg-price/map-markers
     */
    @GetMapping("/map-markers")
    public ResponseEntity<ApiResponse<List<AvgHomePriceMapMarkerDto>>> getAllAvgHomePricesForMap() {
        log.info("지도 마커용 평균 주택 가격 정보 조회 API 호출");
        
        List<AvgHomePriceMapMarkerDto> mapMarkers = avgHomePriceService.getAllAvgHomePricesForMap();
        
        log.info("지도 마커용 평균 주택 가격 정보 조회 완료 - 조회된 마커 개수: {}", mapMarkers.size());
        
        return ResponseEntity.ok(ApiResponse.success("지도 마커용 데이터 조회 완료", mapMarkers));
    }
}