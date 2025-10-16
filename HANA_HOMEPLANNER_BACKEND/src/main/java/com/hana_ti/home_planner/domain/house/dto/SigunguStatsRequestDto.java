package com.hana_ti.home_planner.domain.house.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SigunguStatsRequestDto {

    /**
     * 주택구분코드명 (예: 아파트, 오피스텔)
     */
    private String houseDivisionName;

    /**
     * 주택상세구분코드명 (예: 민영, 국민)
     */
    private String houseDetailDivisionName;

    /**
     * 투기과열지구 여부 (Y/N)
     */
    private String speculationOverheated;

    /**
     * 조정대상지역 여부 (Y/N)
     */
    private String adjustmentTargetArea;

    /**
     * 분양가상한제 여부 (Y/N)
     */
    private String salePriceCeiling;

    /**
     * 정비사업 여부 (Y/N)
     */
    private String improvementProject;

    /**
     * 공공주택지구 여부 (Y/N)
     */
    private String publicHousingDistrict;

    /**
     * 대규모택지개발지구 여부 (Y/N)
     */
    private String largeScaleLandDevelopment;

    /**
     * 수도권내민영공공주택지구 여부 (Y/N)
     */
    private String metropolitanPrivatePublicHousing;
}
