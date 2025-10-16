package com.hana_ti.home_planner.domain.house.service;

import com.hana_ti.home_planner.domain.house.dto.HousePriceInfoResponseDto;
import com.hana_ti.home_planner.domain.house.entity.HousePricesInfo;
import com.hana_ti.home_planner.domain.house.repository.HousePriceInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class HousePriceInfoService {

    private final HousePriceInfoRepository housePriceInfoRepository;

    /**
     * 모든 주택 가격 정보 조회 (페이징 포함)
     */
    public Page<HousePriceInfoResponseDto> getAllHousePriceInfoWithPaging(int page, int size) {
        log.info("모든 주택 가격 정보 조회 시작 (페이징 포함) - 페이지: {}, 크기: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "houseManagementNumber"));
        Page<HousePricesInfo> housePricesInfoPage = housePriceInfoRepository.findAll(pageable);

        Page<HousePriceInfoResponseDto> dtoPage = housePricesInfoPage.map(HousePriceInfoResponseDto::from);

        log.info("모든 주택 가격 정보 조회 완료 - 현재 페이지: {}, 전체 페이지: {}, 전체 데이터: {}", 
                dtoPage.getNumber(), dtoPage.getTotalPages(), dtoPage.getTotalElements());

        return dtoPage;
    }

    /**
     * 모든 주택 가격 정보 조회 (페이징 없음)
     */
    public List<HousePriceInfoResponseDto> getAllHousePriceInfo() {
        log.info("모든 주택 가격 정보 조회 시작 (페이징 없음)");

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findAll();

        List<HousePriceInfoResponseDto> dtos = housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());

        log.info("모든 주택 가격 정보 조회 완료 - 조회된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 주택관리번호로 검색
     */
    public List<HousePriceInfoResponseDto> searchByHouseManagementNumber(BigDecimal houseManagementNumber) {
        log.info("주택관리번호로 검색 시작 - 주택관리번호: {}", houseManagementNumber);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findByHouseManagementNumber(houseManagementNumber);

        List<HousePriceInfoResponseDto> dtos = housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());

        log.info("주택관리번호 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 복합키로 특정 주택 가격 정보 조회
     */
    public Optional<HousePriceInfoResponseDto> findByHouseManagementNumberAndHouseType(
            BigDecimal houseManagementNumber, String houseType) {
        log.info("복합키로 주택 가격 정보 조회 시작 - 주택관리번호: {}, 주택형: {}", houseManagementNumber, houseType);

        Optional<HousePricesInfo> housePricesInfo = housePriceInfoRepository
                .findByHouseManagementNumberAndHouseType(houseManagementNumber, houseType);

        if (housePricesInfo.isPresent()) {
            log.info("복합키 조회 완료 - 정보 찾음");
            return Optional.of(HousePriceInfoResponseDto.from(housePricesInfo.get()));
        } else {
            log.info("복합키 조회 완료 - 정보 없음");
            return Optional.empty();
        }
    }

    /**
     * 주택형별 검색
     */
    public List<HousePriceInfoResponseDto> searchByHouseType(String houseType) {
        log.info("주택형 검색 시작 - 주택형: {}", houseType);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findByHouseType(houseType);

        log.info("주택형 검색 결과: {}개", housePricesInfos.size());

        return housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 분양최고금액 범위별 검색
     */
    public List<HousePriceInfoResponseDto> searchByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        log.info("분양최고금액 범위 검색 시작 - 최소: {}, 최대: {}", minPrice, maxPrice);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findByPriceRange(minPrice, maxPrice);

        log.info("가격 범위 검색 결과: {}개", housePricesInfos.size());

        return housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 분양최고금액 이하 검색
     */
    public List<HousePriceInfoResponseDto> searchByMaxPrice(BigDecimal maxPrice) {
        log.info("분양최고금액 이하 검색 시작 - 최대 금액: {}", maxPrice);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findByMaxPriceLessThanEqual(maxPrice);

        log.info("최대 금액 이하 검색 결과: {}개", housePricesInfos.size());

        return housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 주택공급면적 범위별 검색
     */
    public List<HousePriceInfoResponseDto> searchBySupplyAreaRange(BigDecimal minArea, BigDecimal maxArea) {
        log.info("주택공급면적 범위 검색 시작 - 최소: {}㎡, 최대: {}㎡", minArea, maxArea);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findBySupplyAreaRange(minArea, maxArea);

        log.info("공급면적 범위 검색 결과: {}개", housePricesInfos.size());

        return housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 일반공급세대수 기준 검색
     */
    public List<HousePriceInfoResponseDto> searchByMinGeneralSupplyHouseholds(BigDecimal minHouseholds) {
        log.info("일반공급세대수 기준 검색 시작 - 최소 세대수: {}", minHouseholds);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findByMinGeneralSupplyHouseholds(minHouseholds);

        log.info("일반공급세대수 기준 검색 결과: {}개", housePricesInfos.size());

        return housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 특별공급세대수 기준 검색
     */
    public List<HousePriceInfoResponseDto> searchByMinSpecialSupplyHouseholds(BigDecimal minHouseholds) {
        log.info("특별공급세대수 기준 검색 시작 - 최소 세대수: {}", minHouseholds);

        List<HousePricesInfo> housePricesInfos = housePriceInfoRepository.findByMinSpecialSupplyHouseholds(minHouseholds);

        log.info("특별공급세대수 기준 검색 결과: {}개", housePricesInfos.size());

        return housePricesInfos.stream()
                .map(HousePriceInfoResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 복합 검색 조건으로 페이징 처리된 결과 조회
     */
    public Page<HousePriceInfoResponseDto> searchByComplexConditions(
            String houseType, BigDecimal minPrice, BigDecimal maxPrice, 
            BigDecimal minArea, BigDecimal maxArea, BigDecimal minHouseholds,
            int page, int size) {
        log.info("복합 검색 시작 - 주택형: {}, 가격범위: {}-{}, 면적범위: {}-{}, 최소세대수: {}", 
                houseType, minPrice, maxPrice, minArea, maxArea, minHouseholds);

        Pageable pageable = PageRequest.of(page, size);
        Page<HousePricesInfo> housePricesInfoPage = housePriceInfoRepository.findByComplexSearch(
                houseType, minPrice, maxPrice, minArea, maxArea, minHouseholds, pageable);

        Page<HousePriceInfoResponseDto> dtoPage = housePricesInfoPage.map(HousePriceInfoResponseDto::from);

        log.info("복합 검색 완료 - 현재 페이지: {}, 전체 페이지: {}, 전체 데이터: {}", 
                dtoPage.getNumber(), dtoPage.getTotalPages(), dtoPage.getTotalElements());

        return dtoPage;
    }

    /**
     * 주택형별 평균 분양최고금액 조회
     */
    public List<Object[]> getAverageMaxSalePriceByHouseType() {
        log.info("주택형별 평균 분양최고금액 조회 시작");

        List<Object[]> results = housePriceInfoRepository.findAverageMaxSalePriceByHouseType();

        log.info("주택형별 평균 분양최고금액 조회 완료 - 결과 수: {}", results.size());

        return results;
    }

    /**
     * 주택공급면적별 평균 분양최고금액 조회
     */
    public List<Object[]> getAverageMaxSalePriceBySupplyArea() {
        log.info("주택공급면적별 평균 분양최고금액 조회 시작");

        List<Object[]> results = housePriceInfoRepository.findAverageMaxSalePriceBySupplyArea();

        log.info("주택공급면적별 평균 분양최고금액 조회 완료 - 결과 수: {}", results.size());

        return results;
    }
}