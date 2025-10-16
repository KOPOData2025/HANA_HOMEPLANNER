package com.hana_ti.home_planner.domain.house.dto;

import com.hana_ti.home_planner.domain.house.entity.HouseSalesInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseSalesInfoResponseDto {

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

    // 지역 정보 (정규식으로 파싱된 결과)
    private String sido;
    private String sigungu;
    private String eupmyeondong;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static HouseSalesInfoResponseDto from(HouseSalesInfo entity) {
        return HouseSalesInfoResponseDto.builder()
                .houseManagementNumber(entity.getHouseManagementNumber())
                .houseName(entity.getHouseName())
                .houseTypeCodeName(entity.getHouseTypeCodeName())
                .houseDetailTypeCodeName(entity.getHouseDetailTypeCodeName())
                .supplyAreaName(entity.getSupplyAreaName())
                .supplyLocation(entity.getSupplyLocation())
                .supplyScale(entity.getSupplyScale())
                .recruitmentAnnouncementDate(formatDate(entity.getRecruitmentAnnouncementDate()))
                .homepageUrl(entity.getHomepageUrl())
                .moveInExpectedMonth(entity.getMoveInExpectedMonth())
                .speculationOverheatedArea(entity.getSpeculationOverheatedArea())
                .adjustmentTargetArea(entity.getAdjustmentTargetArea())
                .salePriceCeilingSystem(entity.getSalePriceCeilingSystem())
                .improvementProject(entity.getImprovementProject())
                .publicHousingDistrict(entity.getPublicHousingDistrict())
                .largeScaleLandDevelopmentDistrict(entity.getLargeScaleLandDevelopmentDistrict())
                .metropolitanPrivatePublicHousingDistrict(entity.getMetropolitanPrivatePublicHousingDistrict())
                .recruitmentAnnouncementHomepageUrl(entity.getRecruitmentAnnouncementHomepageUrl())
                .build();
    }

    private static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    /**
     * 지역 정보 설정 (정규식 파싱 결과)
     */
    public void setAddressInfo(String sido, String sigungu, String eupmyeondong) {
        this.sido = sido;
        this.sigungu = sigungu;
        this.eupmyeondong = eupmyeondong;
    }
}
