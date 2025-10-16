package com.hana_ti.home_planner.domain.house.controller;

import com.hana_ti.home_planner.domain.house.dto.SigunguStatsRequestDto;
import com.hana_ti.home_planner.domain.house.dto.SigunguStatsResponseDto;
import com.hana_ti.home_planner.domain.house.service.SigunguStatsService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/house/sigungu-stats")
@RequiredArgsConstructor
@Slf4j
public class SigunguStatsController {

    private final SigunguStatsService sigunguStatsService;

    /**
     * 시군구별 분양가 집계 조회 (POST - 복잡한 필터 조건)
     * POST /api/house/sigungu-stats
     * 
     * @param requestDto 필터 조건이 포함된 요청 DTO
     * @return 시군구별 분양가 집계 결과
     */
    @PostMapping
    public ResponseEntity<ApiResponse<List<SigunguStatsResponseDto>>> getSigunguStats(
            @RequestBody SigunguStatsRequestDto requestDto) {
        log.info("시군구별 분양가 집계 조회 API 호출 (POST) - 요청: {}", requestDto);

        List<SigunguStatsResponseDto> results = sigunguStatsService.getSigunguStats(requestDto);

        log.info("시군구별 분양가 집계 조회 완료 - 결과 수: {}개", results.size());

        return ResponseEntity.ok(ApiResponse.success("시군구별 분양가 집계 조회 완료", results));
    }

    /**
     * 시군구별 분양가 집계 조회 (GET - 쿼리 파라미터)
     * GET /api/house/sigungu-stats?houseDivisionName=아파트&speculationOverheated=Y
     * 
     * @param houseDivisionName 주택구분코드명
     * @param houseDetailDivisionName 주택상세구분코드명
     * @param speculationOverheated 투기과열지구 여부
     * @param adjustmentTargetArea 조정대상지역 여부
     * @param salePriceCeiling 분양가상한제 여부
     * @param improvementProject 정비사업 여부
     * @param publicHousingDistrict 공공주택지구 여부
     * @param largeScaleLandDevelopment 대규모택지개발지구 여부
     * @param metropolitanPrivatePublicHousing 수도권내민영공공주택지구 여부
     * @return 시군구별 분양가 집계 결과
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SigunguStatsResponseDto>>> getSigunguStatsWithParams(
            @RequestParam(required = false) String houseDivisionName,
            @RequestParam(required = false) String houseDetailDivisionName,
            @RequestParam(required = false) String speculationOverheated,
            @RequestParam(required = false) String adjustmentTargetArea,
            @RequestParam(required = false) String salePriceCeiling,
            @RequestParam(required = false) String improvementProject,
            @RequestParam(required = false) String publicHousingDistrict,
            @RequestParam(required = false) String largeScaleLandDevelopment,
            @RequestParam(required = false) String metropolitanPrivatePublicHousing) {
        
        log.info("시군구별 분양가 집계 조회 API 호출 (GET) - 주택구분: {}, 투기과열: {}, 조정대상: {}", 
                houseDivisionName, speculationOverheated, adjustmentTargetArea);

        SigunguStatsRequestDto requestDto = SigunguStatsRequestDto.builder()
                .houseDivisionName(houseDivisionName)
                .houseDetailDivisionName(houseDetailDivisionName)
                .speculationOverheated(speculationOverheated)
                .adjustmentTargetArea(adjustmentTargetArea)
                .salePriceCeiling(salePriceCeiling)
                .improvementProject(improvementProject)
                .publicHousingDistrict(publicHousingDistrict)
                .largeScaleLandDevelopment(largeScaleLandDevelopment)
                .metropolitanPrivatePublicHousing(metropolitanPrivatePublicHousing)
                .build();

        List<SigunguStatsResponseDto> results = sigunguStatsService.getSigunguStats(requestDto);

        return ResponseEntity.ok(ApiResponse.success("시군구별 분양가 집계 조회 완료", results));
    }

    /**
     * 전체 시군구별 분양가 집계 조회 (필터 없음)
     * GET /api/house/sigungu-stats/all
     * 
     * @return 전체 시군구별 분양가 집계 결과
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<SigunguStatsResponseDto>>> getAllSigunguStats() {
        log.info("전체 시군구별 분양가 집계 조회 API 호출");

        List<SigunguStatsResponseDto> results = sigunguStatsService.getAllSigunguStats();

        return ResponseEntity.ok(ApiResponse.success("전체 시군구별 분양가 집계 조회 완료", results));
    }

    /**
     * 특정 지역의 시군구별 분양가 집계 조회
     * GET /api/house/sigungu-stats/region/{regionLarge}
     * 
     * @param regionLarge 대분류 지역 (서울/경기/인천)
     * @param houseDivisionName 주택구분코드명
     * @param houseDetailDivisionName 주택상세구분코드명
     * @param speculationOverheated 투기과열지구 여부
     * @param adjustmentTargetArea 조정대상지역 여부
     * @param salePriceCeiling 분양가상한제 여부
     * @param improvementProject 정비사업 여부
     * @param publicHousingDistrict 공공주택지구 여부
     * @param largeScaleLandDevelopment 대규모택지개발지구 여부
     * @param metropolitanPrivatePublicHousing 수도권내민영공공주택지구 여부
     * @return 특정 지역의 시군구별 분양가 집계 결과
     */
    @GetMapping("/region/{regionLarge}")
    public ResponseEntity<ApiResponse<List<SigunguStatsResponseDto>>> getSigunguStatsByRegion(
            @PathVariable String regionLarge,
            @RequestParam(required = false) String houseDivisionName,
            @RequestParam(required = false) String houseDetailDivisionName,
            @RequestParam(required = false) String speculationOverheated,
            @RequestParam(required = false) String adjustmentTargetArea,
            @RequestParam(required = false) String salePriceCeiling,
            @RequestParam(required = false) String improvementProject,
            @RequestParam(required = false) String publicHousingDistrict,
            @RequestParam(required = false) String largeScaleLandDevelopment,
            @RequestParam(required = false) String metropolitanPrivatePublicHousing) {
        
        log.info("특정 지역 시군구별 분양가 집계 조회 API 호출 - 지역: {}", regionLarge);

        SigunguStatsRequestDto requestDto = SigunguStatsRequestDto.builder()
                .houseDivisionName(houseDivisionName)
                .houseDetailDivisionName(houseDetailDivisionName)
                .speculationOverheated(speculationOverheated)
                .adjustmentTargetArea(adjustmentTargetArea)
                .salePriceCeiling(salePriceCeiling)
                .improvementProject(improvementProject)
                .publicHousingDistrict(publicHousingDistrict)
                .largeScaleLandDevelopment(largeScaleLandDevelopment)
                .metropolitanPrivatePublicHousing(metropolitanPrivatePublicHousing)
                .build();

        List<SigunguStatsResponseDto> results = sigunguStatsService.getSigunguStatsByRegion(regionLarge, requestDto);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("%s 지역 시군구별 분양가 집계 조회 완료", regionLarge), results));
    }

    /**
     * 투기과열지구만 조회하는 편의 메소드
     * GET /api/house/sigungu-stats/overheated
     * 
     * @return 투기과열지구 시군구별 분양가 집계 결과
     */
    @GetMapping("/overheated")
    public ResponseEntity<ApiResponse<List<SigunguStatsResponseDto>>> getOverheatedSigunguStats() {
        log.info("투기과열지구 시군구별 분양가 집계 조회 API 호출");

        SigunguStatsRequestDto requestDto = SigunguStatsRequestDto.builder()
                .speculationOverheated("Y")
                .build();

        List<SigunguStatsResponseDto> results = sigunguStatsService.getSigunguStats(requestDto);

        return ResponseEntity.ok(ApiResponse.success("투기과열지구 시군구별 분양가 집계 조회 완료", results));
    }

    /**
     * 조정대상지역만 조회하는 편의 메소드
     * GET /api/house/sigungu-stats/adjustment
     * 
     * @return 조정대상지역 시군구별 분양가 집계 결과
     */
    @GetMapping("/adjustment")
    public ResponseEntity<ApiResponse<List<SigunguStatsResponseDto>>> getAdjustmentSigunguStats() {
        log.info("조정대상지역 시군구별 분양가 집계 조회 API 호출");

        SigunguStatsRequestDto requestDto = SigunguStatsRequestDto.builder()
                .adjustmentTargetArea("Y")
                .build();

        List<SigunguStatsResponseDto> results = sigunguStatsService.getSigunguStats(requestDto);

        return ResponseEntity.ok(ApiResponse.success("조정대상지역 시군구별 분양가 집계 조회 완료", results));
    }
}
