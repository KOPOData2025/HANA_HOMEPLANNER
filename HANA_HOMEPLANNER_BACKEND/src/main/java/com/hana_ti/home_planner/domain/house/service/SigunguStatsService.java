package com.hana_ti.home_planner.domain.house.service;

import com.hana_ti.home_planner.domain.house.dto.SigunguStatsRequestDto;
import com.hana_ti.home_planner.domain.house.dto.SigunguStatsResponseDto;
import com.hana_ti.home_planner.domain.house.repository.SigunguStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SigunguStatsService {

    private final SigunguStatsRepository sigunguStatsRepository;

    /**
     * 시군구별 분양가 집계 조회
     * 
     * @param requestDto 필터 조건이 포함된 요청 DTO
     * @return 시군구별 분양가 집계 결과 리스트
     */
    public List<SigunguStatsResponseDto> getSigunguStats(SigunguStatsRequestDto requestDto) {
        log.info("시군구별 분양가 집계 조회 시작 - 필터 조건: {}", requestDto);

        // 네이티브 쿼리 실행
        List<Object[]> rawResults = sigunguStatsRepository.getSigunguStats(
                requestDto.getHouseDivisionName(),
                requestDto.getHouseDetailDivisionName(),
                requestDto.getSpeculationOverheated(),
                requestDto.getAdjustmentTargetArea(),
                requestDto.getSalePriceCeiling(),
                requestDto.getImprovementProject(),
                requestDto.getPublicHousingDistrict(),
                requestDto.getLargeScaleLandDevelopment(),
                requestDto.getMetropolitanPrivatePublicHousing()
        );

        // Object[] 결과를 DTO로 변환
        List<SigunguStatsResponseDto> results = rawResults.stream()
                .map(SigunguStatsResponseDto::fromNativeQueryResult)
                .collect(Collectors.toList());

        log.info("시군구별 분양가 집계 조회 완료 - 결과 수: {}개", results.size());

        // 로그에 집계 정보 출력
        if (!results.isEmpty()) {
            long totalComplexes = results.stream()
                    .mapToLong(SigunguStatsResponseDto::getComplexCount)
                    .sum();
            
            log.info("전체 집계 결과 - 총 시군구 수: {}개, 총 단지 수: {}개", 
                    results.size(), totalComplexes);

            // 지역별 집계 정보
            results.stream()
                    .collect(Collectors.groupingBy(SigunguStatsResponseDto::getRegionLarge))
                    .forEach((region, regionResults) -> {
                        long regionComplexes = regionResults.stream()
                                .mapToLong(SigunguStatsResponseDto::getComplexCount)
                                .sum();
                        log.info("지역별 집계 - {}: {}개 시군구, {}개 단지", 
                                region, regionResults.size(), regionComplexes);
                    });
        }

        return results;
    }

    /**
     * 필터 없이 전체 시군구별 분양가 집계 조회
     * 
     * @return 전체 시군구별 분양가 집계 결과 리스트
     */
    public List<SigunguStatsResponseDto> getAllSigunguStats() {
        log.info("전체 시군구별 분양가 집계 조회 시작 (필터 없음)");

        SigunguStatsRequestDto emptyRequest = SigunguStatsRequestDto.builder().build();
        return getSigunguStats(emptyRequest);
    }

    /**
     * 특정 지역만 조회 (서울/경기/인천)
     * 결과를 필터링하여 특정 지역만 반환
     * 
     * @param regionLarge 대분류 지역 (서울/경기/인천)
     * @param requestDto 필터 조건
     * @return 특정 지역의 시군구별 분양가 집계 결과
     */
    public List<SigunguStatsResponseDto> getSigunguStatsByRegion(String regionLarge, SigunguStatsRequestDto requestDto) {
        log.info("특정 지역 시군구별 분양가 집계 조회 시작 - 지역: {}", regionLarge);

        List<SigunguStatsResponseDto> allResults = getSigunguStats(requestDto);
        
        List<SigunguStatsResponseDto> filteredResults = allResults.stream()
                .filter(result -> regionLarge.equals(result.getRegionLarge()))
                .collect(Collectors.toList());

        log.info("특정 지역 시군구별 분양가 집계 조회 완료 - 지역: {}, 결과 수: {}개", 
                regionLarge, filteredResults.size());

        return filteredResults;
    }
}
