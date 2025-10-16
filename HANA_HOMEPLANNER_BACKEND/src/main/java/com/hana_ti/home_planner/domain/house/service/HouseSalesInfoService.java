package com.hana_ti.home_planner.domain.house.service;

import com.hana_ti.home_planner.domain.house.dto.HouseDetailResponseDto;
import com.hana_ti.home_planner.domain.house.dto.HouseSalesInfoResponseDto;
import com.hana_ti.home_planner.domain.house.entity.HouseSalesInfo;
import com.hana_ti.home_planner.domain.house.repository.HouseSalesInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class HouseSalesInfoService {

    private final HouseSalesInfoRepository houseSalesInfoRepository;

    // 정규식 패턴 (공급위치에서 시도, 시군구, 읍면동 추출)
    private static final Pattern ADDRESS_PATTERN = Pattern.compile("^([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)");

    /**
     * 주소 기반 검색 (페이징 포함)
     */
    public Page<HouseSalesInfoResponseDto> searchByAddressWithPaging(
            String sido, String sigungu, String eupmyeondong, 
            int page, int size) {
        log.info("주소 기반 주택 판매 정보 검색 시작 (페이징 포함) - 시도: {}, 시군구: {}, 읍면동: {}, 페이지: {}, 크기: {}", 
                sido, sigungu, eupmyeondong, page, size);

        // 페이징 설정
        Pageable pageable = PageRequest.of(page, size);

        // 읍면동 검색을 위한 LIKE 패턴 설정
        String emdPrefix = StringUtils.hasText(eupmyeondong) ? "%" + eupmyeondong + "%" : null;

        // Repository에서 검색
        Page<HouseSalesInfo> houseSalesInfoPage = houseSalesInfoRepository.searchByAddress(
                sido, sigungu, eupmyeondong, emdPrefix, pageable
        );

        // DTO 변환 및 지역 정보 설정
        Page<HouseSalesInfoResponseDto> dtoPage = houseSalesInfoPage.map(entity -> {
            HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
            
            // 정규식으로 지역 정보 파싱하여 DTO에 설정
            String[] addressInfo = parseAddress(entity.getSupplyLocation());
            dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
            
            return dto;
        });

        log.info("주소 기반 검색 완료 - 현재 페이지: {}, 전체 페이지: {}, 전체 데이터: {}", 
                dtoPage.getNumber(), dtoPage.getTotalPages(), dtoPage.getTotalElements());

        return dtoPage;
    }

    /**
     * 모든 주택 판매 정보 조회 (페이징 포함)
     */
    public Page<HouseSalesInfoResponseDto> getAllHouseSalesInfoWithPaging(int page, int size) {
        log.info("모든 주택 판매 정보 조회 시작 (페이징 포함) - 페이지: {}, 크기: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "recruitmentAnnouncementDate"));
        Page<HouseSalesInfo> houseSalesInfoPage = houseSalesInfoRepository.findAll(pageable);

        // DTO 변환 및 지역 정보 설정
        Page<HouseSalesInfoResponseDto> dtoPage = houseSalesInfoPage.map(entity -> {
            HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
            
            // 정규식으로 지역 정보 파싱하여 DTO에 설정
            String[] addressInfo = parseAddress(entity.getSupplyLocation());
            dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
            
            return dto;
        });

        log.info("모든 주택 판매 정보 조회 완료 - 현재 페이지: {}, 전체 페이지: {}, 전체 데이터: {}", 
                dtoPage.getNumber(), dtoPage.getTotalPages(), dtoPage.getTotalElements());

        return dtoPage;
    }

    /**
     * 모든 주택 판매 정보 조회 (페이징 없음)
     */
    public List<HouseSalesInfoResponseDto> getAllHouseSalesInfo() {
        log.info("모든 주택 판매 정보 조회 시작 (페이징 없음)");

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findAll();

        // DTO 변환 및 지역 정보 설정
        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    
                    // 정규식으로 지역 정보 파싱하여 DTO에 설정
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("모든 주택 판매 정보 조회 완료 - 조회된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 공급지역명으로 검색
     */
    public List<HouseSalesInfoResponseDto> searchBySupplyAreaName(String supplyAreaName) {
        log.info("공급지역명으로 검색 시작 - 공급지역명: {}", supplyAreaName);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findBySupplyAreaNameContaining(supplyAreaName);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("공급지역명 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 공급규모 범위로 검색
     */
    public List<HouseSalesInfoResponseDto> searchBySupplyScaleRange(Long minScale, Long maxScale) {
        log.info("공급규모 범위로 검색 시작 - 최소: {}, 최대: {}", minScale, maxScale);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findBySupplyScaleBetween(minScale, maxScale);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("공급규모 범위 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 모집공고일 범위로 검색
     */
    public List<HouseSalesInfoResponseDto> searchByRecruitmentDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("모집공고일 범위로 검색 시작 - 시작일: {}, 종료일: {}", startDate, endDate);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findByRecruitmentAnnouncementDateBetween(startDate, endDate);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("모집공고일 범위 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 투기과열지구별 검색
     */
    public List<HouseSalesInfoResponseDto> searchBySpeculationOverheatedArea(String speculationOverheatedArea) {
        log.info("투기과열지구별 검색 시작 - 투기과열지구: {}", speculationOverheatedArea);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findBySpeculationOverheatedArea(speculationOverheatedArea);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("투기과열지구별 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 입주예정월별 검색
     */
    public List<HouseSalesInfoResponseDto> searchByMoveInExpectedMonth(String moveInExpectedMonth) {
        log.info("입주예정월별 검색 시작 - 입주예정월: {}", moveInExpectedMonth);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findByMoveInExpectedMonthContaining(moveInExpectedMonth);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("입주예정월별 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 주택구분코드명으로 검색
     */
    public List<HouseSalesInfoResponseDto> searchByHouseTypeCodeName(String houseTypeCodeName) {
        log.info("주택구분코드명으로 검색 시작 - 주택구분코드명: {}", houseTypeCodeName);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findByHouseTypeCodeName(houseTypeCodeName);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("주택구분코드명 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 조정대상지역별 검색
     */
    public List<HouseSalesInfoResponseDto> searchByAdjustmentTargetArea(String adjustmentTargetArea) {
        log.info("조정대상지역별 검색 시작 - 조정대상지역: {}", adjustmentTargetArea);

        List<HouseSalesInfo> houseSalesInfos = houseSalesInfoRepository.findByAdjustmentTargetArea(adjustmentTargetArea);

        List<HouseSalesInfoResponseDto> dtos = houseSalesInfos.stream()
                .map(entity -> {
                    HouseSalesInfoResponseDto dto = HouseSalesInfoResponseDto.from(entity);
                    String[] addressInfo = parseAddress(entity.getSupplyLocation());
                    dto.setAddressInfo(addressInfo[0], addressInfo[1], addressInfo[2]);
                    return dto;
                })
                .collect(Collectors.toList());

        log.info("조정대상지역별 검색 완료 - 검색된 정보 수: {}개", dtos.size());

        return dtos;
    }

    /**
     * 전체 주택 상세 정보 조회 (좌표 포함)
     * 주택 판매 정보, 주소 좌표, 가격 정보 요약을 통합하여 조회합니다.
     */
    public List<HouseDetailResponseDto> getAllHouseDetailsWithCoordinates() {
        log.info("전체 주택 상세 정보 조회 시작 (좌표 포함)");

        List<Object[]> rawResults = houseSalesInfoRepository.findAllHouseDetailsWithCoordinatesRaw();

        List<HouseDetailResponseDto> detailDtos = rawResults.stream()
                .map(this::mapToHouseDetailResponseDto)
                .collect(Collectors.toList());

        log.info("전체 주택 상세 정보 조회 완료 - 조회된 정보 수: {}개", detailDtos.size());

        return detailDtos;
    }

    /**
     * Object[] 배열을 HouseDetailResponseDto로 매핑
     */
    private HouseDetailResponseDto mapToHouseDetailResponseDto(Object[] row) {
        return HouseDetailResponseDto.builder()
                // 기본 주택 정보 (0-17)
                .houseManagementNumber(convertToLong(row[0]))
                .houseName(convertToString(row[1]))
                .houseTypeCodeName(convertToString(row[2]))
                .houseDetailTypeCodeName(convertToString(row[3]))
                .supplyAreaName(convertToString(row[4]))
                .supplyLocation(convertToString(row[5]))
                .supplyScale(convertToLong(row[6]))
                .recruitmentAnnouncementDate(convertToString(row[7]))
                .homepageUrl(convertToString(row[8]))
                .moveInExpectedMonth(convertToString(row[9]))
                .speculationOverheatedArea(convertToString(row[10]))
                .adjustmentTargetArea(convertToString(row[11]))
                .salePriceCeilingSystem(convertToString(row[12]))
                .improvementProject(convertToString(row[13]))
                .publicHousingDistrict(convertToString(row[14]))
                .largeScaleLandDevelopmentDistrict(convertToString(row[15]))
                .metropolitanPrivatePublicHousingDistrict(convertToString(row[16]))
                .recruitmentAnnouncementHomepageUrl(convertToString(row[17]))
                // 주소 정보 (18-21)
                .sido(convertToString(row[18]))
                .sigungu(convertToString(row[19]))
                .eupmyeondong(convertToString(row[20]))
                .roadNm(convertToString(row[21]))
                // 좌표 정보 (22-23)
                .lat(convertToBigDecimal(row[22]))
                .lon(convertToBigDecimal(row[23]))
                // 가격 정보 요약 (24-30)
                .totalHouseTypes(convertToInteger(row[24]))
                .minSupplyArea(convertToBigDecimal(row[25]))
                .maxSupplyArea(convertToBigDecimal(row[26]))
                .minSalePrice(convertToBigDecimal(row[27]))
                .maxSalePrice(convertToBigDecimal(row[28]))
                .totalGeneralSupplyHouseholds(convertToBigDecimal(row[29]))
                .totalSpecialSupplyHouseholds(convertToBigDecimal(row[30]))
                .build();
    }

    /**
     * 타입 변환 유틸리티 메서드들
     */
    private String convertToString(Object obj) {
        return obj != null ? obj.toString() : null;
    }

    private Long convertToLong(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        }
        try {
            return Long.parseLong(obj.toString());
        } catch (NumberFormatException e) {
            log.warn("Long 변환 실패: {}", obj);
            return null;
        }
    }

    private Integer convertToInteger(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) {
            return ((Number) obj).intValue();
        }
        try {
            return Integer.parseInt(obj.toString());
        } catch (NumberFormatException e) {
            log.warn("Integer 변환 실패: {}", obj);
            return null;
        }
    }

    private BigDecimal convertToBigDecimal(Object obj) {
        if (obj == null) return null;
        if (obj instanceof BigDecimal) {
            return (BigDecimal) obj;
        }
        if (obj instanceof Number) {
            return BigDecimal.valueOf(((Number) obj).doubleValue());
        }
        try {
            return new BigDecimal(obj.toString());
        } catch (NumberFormatException e) {
            log.warn("BigDecimal 변환 실패: {}", obj);
            return null;
        }
    }

    /**
     * 주소 파싱 유틸리티 메소드
     * 공급위치에서 시도, 시군구, 읍면동을 추출
     */
    private String[] parseAddress(String address) {
        if (!StringUtils.hasText(address)) {
            return new String[]{"", "", ""};
        }

        Matcher matcher = ADDRESS_PATTERN.matcher(address.trim());
        if (matcher.find()) {
            return new String[]{
                matcher.group(1), // 시도
                matcher.group(2), // 시군구
                matcher.group(3)  // 읍면동
            };
        }

        // 패턴이 매치되지 않는 경우 원본 주소를 첫 번째 요소에 넣고 나머지는 빈 문자열
        return new String[]{address, "", ""};
    }
}
