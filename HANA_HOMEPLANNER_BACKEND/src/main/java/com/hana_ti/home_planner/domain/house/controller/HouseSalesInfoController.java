package com.hana_ti.home_planner.domain.house.controller;

import com.hana_ti.home_planner.domain.house.dto.HouseSalesInfoResponseDto;
import com.hana_ti.home_planner.domain.house.service.HouseSalesInfoService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/house/sales-info")
@RequiredArgsConstructor
@Slf4j
public class HouseSalesInfoController {

    private final HouseSalesInfoService houseSalesInfoService;

    /**
     * 주소 기반 검색 (페이징 포함)
     * GET /api/house/sales-info/search/address?sido=서울&sigungu=강남구&eupmyeondong=역삼동&page=0&size=10
     */
    @GetMapping("/search/address")
    public ResponseEntity<ApiResponse<Page<HouseSalesInfoResponseDto>>> searchByAddress(
            @RequestParam(name = "sido", required = false) String sido,
            @RequestParam(name = "sigungu", required = false) String sigungu,
            @RequestParam(name = "eupmyeondong", required = false) String eupmyeondong,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        log.info("주소 기반 검색 API 호출 - 시도: {}, 시군구: {}, 읍면동: {}, 페이지: {}, 크기: {}", 
                sido, sigungu, eupmyeondong, page, size);

        Page<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchByAddressWithPaging(
                sido, sigungu, eupmyeondong, page, size);

        return ResponseEntity.ok(ApiResponse.success("주소 기반 검색 완료", result));
    }

    /**
     * 모든 주택 판매 정보 조회 (페이징 포함)
     * GET /api/house/sales-info?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<HouseSalesInfoResponseDto>>> getAllHouseSalesInfoWithPaging(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        log.info("모든 주택 판매 정보 조회 API 호출 (페이징) - 페이지: {}, 크기: {}", page, size);

        Page<HouseSalesInfoResponseDto> result = houseSalesInfoService.getAllHouseSalesInfoWithPaging(page, size);

        return ResponseEntity.ok(ApiResponse.success("주택 판매 정보 조회 완료", result));
    }

    /**
     * 모든 주택 판매 정보 조회 (페이징 없음)
     * GET /api/house/sales-info/all
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> getAllHouseSalesInfo() {
        log.info("모든 주택 판매 정보 조회 API 호출 (페이징 없음)");

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.getAllHouseSalesInfo();

        return ResponseEntity.ok(ApiResponse.success("주택 판매 정보 조회 완료", result));
    }

    /**
     * 공급지역명으로 검색
     * GET /api/house/sales-info/search/supply-area?areaName=서울
     */
    @GetMapping("/search/supply-area")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchBySupplyAreaName(
            @RequestParam(name = "areaName") String supplyAreaName) {
        log.info("공급지역명으로 검색 API 호출 - 공급지역명: {}", supplyAreaName);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchBySupplyAreaName(supplyAreaName);

        return ResponseEntity.ok(ApiResponse.success("공급지역명 검색 완료", result));
    }

    /**
     * 공급규모 범위로 검색
     * GET /api/house/sales-info/search/supply-scale?minScale=100&maxScale=1000
     */
    @GetMapping("/search/supply-scale")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchBySupplyScaleRange(
            @RequestParam(name = "minScale") Long minScale,
            @RequestParam(name = "maxScale") Long maxScale) {
        log.info("공급규모 범위로 검색 API 호출 - 최소: {}, 최대: {}", minScale, maxScale);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchBySupplyScaleRange(minScale, maxScale);

        return ResponseEntity.ok(ApiResponse.success("공급규모 범위 검색 완료", result));
    }

    /**
     * 모집공고일 범위로 검색
     * GET /api/house/sales-info/search/recruitment-date?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/search/recruitment-date")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchByRecruitmentDateRange(
            @RequestParam(name = "startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("모집공고일 범위로 검색 API 호출 - 시작일: {}, 종료일: {}", startDate, endDate);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchByRecruitmentDateRange(startDate, endDate);

        return ResponseEntity.ok(ApiResponse.success("모집공고일 범위 검색 완료", result));
    }

    /**
     * 투기과열지구별 검색
     * GET /api/house/sales-info/search/speculation-overheated?area=Y
     */
    @GetMapping("/search/speculation-overheated")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchBySpeculationOverheatedArea(
            @RequestParam(name = "area") String speculationOverheatedArea) {
        log.info("투기과열지구별 검색 API 호출 - 투기과열지구: {}", speculationOverheatedArea);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchBySpeculationOverheatedArea(speculationOverheatedArea);

        return ResponseEntity.ok(ApiResponse.success("투기과열지구별 검색 완료", result));
    }

    /**
     * 입주예정월별 검색
     * GET /api/house/sales-info/search/move-in-month?month=2025년12월
     */
    @GetMapping("/search/move-in-month")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchByMoveInExpectedMonth(
            @RequestParam(name = "month") String moveInExpectedMonth) {
        log.info("입주예정월별 검색 API 호출 - 입주예정월: {}", moveInExpectedMonth);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchByMoveInExpectedMonth(moveInExpectedMonth);

        return ResponseEntity.ok(ApiResponse.success("입주예정월별 검색 완료", result));
    }

    /**
     * 주택구분코드명으로 검색
     * GET /api/house/sales-info/search/house-type?type=아파트
     */
    @GetMapping("/search/house-type")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchByHouseTypeCodeName(
            @RequestParam(name = "type") String houseTypeCodeName) {
        log.info("주택구분코드명으로 검색 API 호출 - 주택구분코드명: {}", houseTypeCodeName);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchByHouseTypeCodeName(houseTypeCodeName);

        return ResponseEntity.ok(ApiResponse.success("주택구분코드명 검색 완료", result));
    }

    /**
     * 조정대상지역별 검색
     * GET /api/house/sales-info/search/adjustment-target?area=Y
     */
    @GetMapping("/search/adjustment-target")
    public ResponseEntity<ApiResponse<List<HouseSalesInfoResponseDto>>> searchByAdjustmentTargetArea(
            @RequestParam(name = "area") String adjustmentTargetArea) {
        log.info("조정대상지역별 검색 API 호출 - 조정대상지역: {}", adjustmentTargetArea);

        List<HouseSalesInfoResponseDto> result = houseSalesInfoService.searchByAdjustmentTargetArea(adjustmentTargetArea);

        return ResponseEntity.ok(ApiResponse.success("조정대상지역별 검색 완료", result));
    }
}
