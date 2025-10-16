package com.hana_ti.home_planner.domain.house.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseDetailResponseDto {

    // 주택 기본 정보 (HouseSalesInfo 기반)
    private Long houseManagementNumber;
    private String houseName;
    private String houseTypeCodeName;
    private String houseDetailTypeCodeName;
    private String supplyAreaName;
    private String supplyLocation;
    private Long supplyScale;
    private String recruitmentAnnouncementDate;
    private String homepageUrl;
    private String moveInExpectedMonth;
    private String speculationOverheatedArea;
    private String adjustmentTargetArea;
    private String salePriceCeilingSystem;
    private String improvementProject;
    private String publicHousingDistrict;
    private String largeScaleLandDevelopmentDistrict;
    private String metropolitanPrivatePublicHousingDistrict;
    private String recruitmentAnnouncementHomepageUrl;

    // 주소 정보 (Address 기반)
    private String sido;
    private String sigungu;
    private String eupmyeondong;
    private String roadNm;
    
    // 좌표 정보
    private BigDecimal lat;
    private BigDecimal lon;

    // 가격 정보 요약 (HousePricesInfo 기반)
    private Integer totalHouseTypes; // 해당 주택의 총 주택형 수
    private BigDecimal minSupplyArea; // 최소 공급면적
    private BigDecimal maxSupplyArea; // 최대 공급면적
    private BigDecimal minSalePrice; // 최소 분양가
    private BigDecimal maxSalePrice; // 최대 분양가
    private BigDecimal totalGeneralSupplyHouseholds; // 총 일반공급세대수
    private BigDecimal totalSpecialSupplyHouseholds; // 총 특별공급세대수

    /**
     * 주택 기본 정보 설정 (Builder 패턴 보완)
     */
    public static HouseDetailResponseDto.HouseDetailResponseDtoBuilder withBasicInfo(
            Long houseManagementNumber, String houseName, String houseTypeCodeName,
            String supplyAreaName, String supplyLocation) {
        return HouseDetailResponseDto.builder()
                .houseManagementNumber(houseManagementNumber)
                .houseName(houseName)
                .houseTypeCodeName(houseTypeCodeName)
                .supplyAreaName(supplyAreaName)
                .supplyLocation(supplyLocation);
    }

    /**
     * 좌표 정보 설정
     */
    public HouseDetailResponseDto withCoordinates(BigDecimal lat, BigDecimal lon) {
        this.lat = lat;
        this.lon = lon;
        return this;
    }

    /**
     * 가격 정보 요약 설정
     */
    public HouseDetailResponseDto withPriceSummary(
            Integer totalHouseTypes, BigDecimal minSupplyArea, BigDecimal maxSupplyArea,
            BigDecimal minSalePrice, BigDecimal maxSalePrice,
            BigDecimal totalGeneralSupplyHouseholds, BigDecimal totalSpecialSupplyHouseholds) {
        this.totalHouseTypes = totalHouseTypes;
        this.minSupplyArea = minSupplyArea;
        this.maxSupplyArea = maxSupplyArea;
        this.minSalePrice = minSalePrice;
        this.maxSalePrice = maxSalePrice;
        this.totalGeneralSupplyHouseholds = totalGeneralSupplyHouseholds;
        this.totalSpecialSupplyHouseholds = totalSpecialSupplyHouseholds;
        return this;
    }
}
