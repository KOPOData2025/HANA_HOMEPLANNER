package com.hana_ti.home_planner.domain.house.controller;

import com.hana_ti.home_planner.domain.house.dto.HousePriceInfoResponseDto;
import com.hana_ti.home_planner.domain.house.service.HousePriceInfoService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.dto.ErrorResponse;
import com.hana_ti.home_planner.global.util.NumberUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/house/price-info")
@RequiredArgsConstructor
@Slf4j
public class HousePriceInfoController {

    private final HousePriceInfoService housePriceInfoService;

    /**
     * 모든 주택 가격 정보 조회 (페이징 포함)
     * GET /api/house/price-info?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<HousePriceInfoResponseDto>>> getAllHousePriceInfoWithPaging(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        log.info("모든 주택 가격 정보 조회 API 호출 (페이징) - 페이지: {}, 크기: {}", page, size);

        Page<HousePriceInfoResponseDto> result = housePriceInfoService.getAllHousePriceInfoWithPaging(page, size);

        return ResponseEntity.ok(ApiResponse.success("주택 가격 정보 조회 완료", result));
    }

    /**
     * 모든 주택 가격 정보 조회 (페이징 없음)
     * GET /api/house/price-info/all
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> getAllHousePriceInfo() {
        log.info("모든 주택 가격 정보 조회 API 호출 (페이징 없음)");

        List<HousePriceInfoResponseDto> result = housePriceInfoService.getAllHousePriceInfo();

        return ResponseEntity.ok(ApiResponse.success("주택 가격 정보 조회 완료", result));
    }

    /**
     * 복합키로 특정 주택 가격 정보 조회
     * GET /api/house/price-info/{houseManagementNumber}/{houseType}
     */
    @GetMapping("/{houseManagementNumber}/{houseType}")
    public ResponseEntity<?> getHousePriceInfoById(
            @PathVariable String houseManagementNumber,
            @PathVariable String houseType) {
        log.info("주택 가격 정보 상세 조회 API 호출 - 주택관리번호: {}, 주택형: {}", houseManagementNumber, houseType);

        // 주택관리번호 유효성 검증
        if (!NumberUtil.isValidHouseManagementNumber(houseManagementNumber)) {
            log.warn("유효하지 않은 주택관리번호: {}", houseManagementNumber);
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.builder()
                            .code("INVALID_HOUSE_MANAGEMENT_NUMBER")
                            .message("유효하지 않은 주택관리번호입니다. 주택관리번호는 양의 정수여야 합니다: " + houseManagementNumber)
                            .build());
        }

        BigDecimal houseManagementNumberDecimal = NumberUtil.safeParseBigDecimal(houseManagementNumber)
                .orElseThrow(() -> new IllegalArgumentException("주택관리번호 변환 실패"));

        Optional<HousePriceInfoResponseDto> result = housePriceInfoService
                .findByHouseManagementNumberAndHouseType(houseManagementNumberDecimal, houseType);

        if (result.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("주택 가격 정보 상세 조회 완료", result.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 주택관리번호로 주택 가격 정보 조회
     * GET /api/house/price-info/management-number/{houseManagementNumber}
     */
    @GetMapping("/management-number/{houseManagementNumber}")
    public ResponseEntity<?> getHousePriceInfoByManagementNumber(
            @PathVariable String houseManagementNumber) {
        log.info("주택관리번호로 주택 가격 정보 조회 API 호출 - 주택관리번호: {}", houseManagementNumber);

        // 주택관리번호 유효성 검증
        if (!NumberUtil.isValidHouseManagementNumber(houseManagementNumber)) {
            log.warn("유효하지 않은 주택관리번호: {}", houseManagementNumber);
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.builder()
                            .code("INVALID_HOUSE_MANAGEMENT_NUMBER")
                            .message("유효하지 않은 주택관리번호입니다. 주택관리번호는 양의 정수여야 합니다: " + houseManagementNumber)
                            .build());
        }

        BigDecimal houseManagementNumberDecimal = NumberUtil.safeParseBigDecimal(houseManagementNumber)
                .orElseThrow(() -> new IllegalArgumentException("주택관리번호 변환 실패"));

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchByHouseManagementNumber(houseManagementNumberDecimal);

        log.info("주택관리번호로 주택 가격 정보 조회 완료 - 조회된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("주택관리번호 검색 완료", result));
    }

    /**
     * 주택형별 검색
     * GET /api/house/price-info/search/house-type?type={houseType}
     */
    @GetMapping("/search/house-type")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> searchByHouseType(
            @RequestParam(name = "type") String houseType) {
        log.info("주택형별 검색 API 호출 - 주택형: {}", houseType);

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchByHouseType(houseType);

        log.info("주택형별 검색 완료 - 검색된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("주택형별 검색 완료", result));
    }

    /**
     * 분양최고금액 범위별 검색
     * GET /api/house/price-info/search/price-range?min={minPrice}&max={maxPrice}
     */
    @GetMapping("/search/price-range")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> searchByPriceRange(
            @RequestParam(name = "min") BigDecimal minPrice,
            @RequestParam(name = "max") BigDecimal maxPrice) {
        log.info("분양최고금액 범위별 검색 API 호출 - 최소: {}, 최대: {}", minPrice, maxPrice);

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchByPriceRange(minPrice, maxPrice);

        log.info("분양최고금액 범위별 검색 완료 - 검색된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("가격 범위별 검색 완료", result));
    }

    /**
     * 분양최고금액 이하 검색
     * GET /api/house/price-info/search/max-price?max={maxPrice}
     */
    @GetMapping("/search/max-price")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> searchByMaxPrice(
            @RequestParam(name = "max") BigDecimal maxPrice) {
        log.info("분양최고금액 이하 검색 API 호출 - 최대 금액: {}", maxPrice);

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchByMaxPrice(maxPrice);

        log.info("분양최고금액 이하 검색 완료 - 검색된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("최대 금액 이하 검색 완료", result));
    }

    /**
     * 주택공급면적 범위별 검색
     * GET /api/house/price-info/search/area-range?min={minArea}&max={maxArea}
     */
    @GetMapping("/search/area-range")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> searchBySupplyAreaRange(
            @RequestParam(name = "min") BigDecimal minArea,
            @RequestParam(name = "max") BigDecimal maxArea) {
        log.info("주택공급면적 범위별 검색 API 호출 - 최소: {}㎡, 최대: {}㎡", minArea, maxArea);

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchBySupplyAreaRange(minArea, maxArea);

        log.info("주택공급면적 범위별 검색 완료 - 검색된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("공급면적 범위별 검색 완료", result));
    }

    /**
     * 일반공급세대수 기준 검색
     * GET /api/house/price-info/search/min-general-households?count={minHouseholds}
     */
    @GetMapping("/search/min-general-households")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> searchByMinGeneralSupplyHouseholds(
            @RequestParam(name = "count") BigDecimal minHouseholds) {
        log.info("일반공급세대수 기준 검색 API 호출 - 최소 세대수: {}", minHouseholds);

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchByMinGeneralSupplyHouseholds(minHouseholds);

        log.info("일반공급세대수 기준 검색 완료 - 검색된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("일반공급세대수 기준 검색 완료", result));
    }

    /**
     * 특별공급세대수 기준 검색
     * GET /api/house/price-info/search/min-special-households?count={minHouseholds}
     */
    @GetMapping("/search/min-special-households")
    public ResponseEntity<ApiResponse<List<HousePriceInfoResponseDto>>> searchByMinSpecialSupplyHouseholds(
            @RequestParam(name = "count") BigDecimal minHouseholds) {
        log.info("특별공급세대수 기준 검색 API 호출 - 최소 세대수: {}", minHouseholds);

        List<HousePriceInfoResponseDto> result = housePriceInfoService.searchByMinSpecialSupplyHouseholds(minHouseholds);

        log.info("특별공급세대수 기준 검색 완료 - 검색된 정보 수: {}개", result.size());

        return ResponseEntity.ok(ApiResponse.success("특별공급세대수 기준 검색 완료", result));
    }

    /**
     * 복합 검색 조건으로 페이징 처리된 결과 조회
     * GET /api/house/price-info/search/complex?houseType={houseType}&minPrice={minPrice}&maxPrice={maxPrice}&minArea={minArea}&maxArea={maxArea}&minHouseholds={minHouseholds}&page={page}&size={size}
     */
    @GetMapping("/search/complex")
    public ResponseEntity<ApiResponse<Page<HousePriceInfoResponseDto>>> searchByComplexConditions(
            @RequestParam(name = "houseType", required = false) String houseType,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "minArea", required = false) BigDecimal minArea,
            @RequestParam(name = "maxArea", required = false) BigDecimal maxArea,
            @RequestParam(name = "minHouseholds", required = false) BigDecimal minHouseholds,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        log.info("복합 검색 API 호출 - 주택형: {}, 가격범위: {}-{}, 면적범위: {}-{}, 최소세대수: {}", 
                houseType, minPrice, maxPrice, minArea, maxArea, minHouseholds);

        Page<HousePriceInfoResponseDto> result = housePriceInfoService.searchByComplexConditions(
                houseType, minPrice, maxPrice, minArea, maxArea, minHouseholds, page, size);

        return ResponseEntity.ok(ApiResponse.success("복합 검색 완료", result));
    }

    /**
     * 주택형별 평균 분양최고금액 조회
     * GET /api/house/price-info/stats/average-price-by-house-type
     */
    @GetMapping("/stats/average-price-by-house-type")
    public ResponseEntity<ApiResponse<List<Object[]>>> getAverageMaxSalePriceByHouseType() {
        log.info("주택형별 평균 분양최고금액 조회 API 호출");

        List<Object[]> result = housePriceInfoService.getAverageMaxSalePriceByHouseType();

        return ResponseEntity.ok(ApiResponse.success("주택형별 평균 분양최고금액 조회 완료", result));
    }

    /**
     * 주택공급면적별 평균 분양최고금액 조회
     * GET /api/house/price-info/stats/average-price-by-supply-area
     */
    @GetMapping("/stats/average-price-by-supply-area")
    public ResponseEntity<ApiResponse<List<Object[]>>> getAverageMaxSalePriceBySupplyArea() {
        log.info("주택공급면적별 평균 분양최고금액 조회 API 호출");

        List<Object[]> result = housePriceInfoService.getAverageMaxSalePriceBySupplyArea();

        return ResponseEntity.ok(ApiResponse.success("주택공급면적별 평균 분양최고금액 조회 완료", result));
    }
}