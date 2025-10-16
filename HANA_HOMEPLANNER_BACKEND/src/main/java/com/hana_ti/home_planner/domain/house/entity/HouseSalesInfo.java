package com.hana_ti.home_planner.domain.house.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "house_sales_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseSalesInfo {

    @Id
    @Column(name = "주택관리번호")
    private Long houseManagementNumber;

    @Column(name = "주택명", length = 128)
    private String houseName;

    @Column(name = "주택구분코드명", length = 26)
    private String houseTypeCodeName;

    @Column(name = "주택상세구분코드명", length = 26)
    private String houseDetailTypeCodeName;

    @Column(name = "공급지역명", length = 26)
    private String supplyAreaName;

    @Column(name = "공급위치", length = 255)
    private String supplyLocation;

    @Column(name = "공급규모")
    private Long supplyScale;

    @Column(name = "모집공고일")
    private LocalDate recruitmentAnnouncementDate;

    @Column(name = "홈페이지주소", length = 128)
    private String homepageUrl;

    @Column(name = "입주예정월", length = 26)
    private String moveInExpectedMonth;

    @Column(name = "투기과열지구", length = 26)
    private String speculationOverheatedArea;

    @Column(name = "조정대상지역", length = 26)
    private String adjustmentTargetArea;

    @Column(name = "분양가상한제", length = 26)
    private String salePriceCeilingSystem;

    @Column(name = "정비사업", length = 26)
    private String improvementProject;

    @Column(name = "공공주택지구", length = 26)
    private String publicHousingDistrict;

    @Column(name = "대규모택지개발지구", length = 26)
    private String largeScaleLandDevelopmentDistrict;

    @Column(name = "수도권내민영공공주택지구", length = 26)
    private String metropolitanPrivatePublicHousingDistrict;

    @Column(name = "모집공고홈페이지주소", length = 256)
    private String recruitmentAnnouncementHomepageUrl;
}
