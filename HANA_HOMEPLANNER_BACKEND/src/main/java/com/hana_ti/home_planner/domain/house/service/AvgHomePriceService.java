package com.hana_ti.home_planner.domain.house.service;

import com.hana_ti.home_planner.domain.house.dto.AvgHomePriceMapMarkerDto;
import com.hana_ti.home_planner.domain.house.dto.AvgHomePriceResponseDto;
import com.hana_ti.home_planner.domain.house.entity.AvgHomePrice;
import com.hana_ti.home_planner.domain.house.repository.AvgHomePriceRepository;
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
public class AvgHomePriceService {

    private final AvgHomePriceRepository avgHomePriceRepository;

    /**
     * 모든 지역의 평균 주택 가격 정보 조회
     */
    public List<AvgHomePriceResponseDto> getAllAvgHomePrices() {
        log.info("모든 지역의 평균 주택 가격 정보 조회 시작");
        
        List<AvgHomePrice> avgHomePrices = avgHomePriceRepository.findAll();
        
        log.info("조회된 평균 주택 가격 정보 개수: {}", avgHomePrices.size());
        
        return avgHomePrices.stream()
                .map(AvgHomePriceResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 지도 마커용 평균 주택 가격 정보 조회
     */
    public List<AvgHomePriceMapMarkerDto> getAllAvgHomePricesForMap() {
        log.info("지도 마커용 평균 주택 가격 정보 조회 시작");
        
        List<AvgHomePrice> avgHomePrices = avgHomePriceRepository.findAll();
        
        log.info("조회된 지도 마커용 평균 주택 가격 정보 개수: {}", avgHomePrices.size());
        
        return avgHomePrices.stream()
                .map(AvgHomePriceMapMarkerDto::from)
                .collect(Collectors.toList());
    }
}