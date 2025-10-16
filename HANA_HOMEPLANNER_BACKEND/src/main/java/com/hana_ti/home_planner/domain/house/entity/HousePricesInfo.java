package com.hana_ti.home_planner.domain.house.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "house_prices_info")
@IdClass(HousePricesInfoId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HousePricesInfo {

    @Id
    @Column(name = "주택관리번호")
    private BigDecimal houseManagementNumber;

    @Id
    @Column(name = "주택형", length = 26)
    private String houseType;

    @Column(name = "주택공급면적", precision = 38, scale = 4)
    private BigDecimal houseSupplyArea;

    @Column(name = "일반공급세대수")
    private BigDecimal generalSupplyHouseholds;

    @Column(name = "특별공급세대수")
    private BigDecimal specialSupplyHouseholds;

    @Column(name = "특별공급_다자녀가구세대수")
    private BigDecimal specialSupplyMultiChildHouseholds;

    @Column(name = "특별공급_신혼부부세대수")
    private BigDecimal specialSupplyNewlywedHouseholds;

    @Column(name = "특별공급_생애최초세대수")
    private BigDecimal specialSupplyFirstTimeHouseholds;

    @Column(name = "특별공급_노부모부양세대수")
    private BigDecimal specialSupplyElderlyParentSupportHouseholds;

    @Column(name = "특별공급_기관추천세대수")
    private BigDecimal specialSupplyInstitutionRecommendedHouseholds;

    @Column(name = "특별공급_기관추천기타세대수")
    private BigDecimal specialSupplyInstitutionRecommendedOtherHouseholds;

    @Column(name = "특별공급_이전기관세대수")
    private BigDecimal specialSupplyTransferredInstitutionHouseholds;

    @Column(name = "공급금액_분양최고금액")
    private BigDecimal supplyAmountMaxSalePrice;

    public static HousePricesInfo create(BigDecimal houseManagementNumber, String houseType,
                                         BigDecimal houseSupplyArea, BigDecimal generalSupplyHouseholds,
                                         BigDecimal specialSupplyHouseholds, BigDecimal specialSupplyMultiChildHouseholds,
                                         BigDecimal specialSupplyNewlywedHouseholds, BigDecimal specialSupplyFirstTimeHouseholds,
                                         BigDecimal specialSupplyElderlyParentSupportHouseholds, BigDecimal specialSupplyInstitutionRecommendedHouseholds,
                                         BigDecimal specialSupplyInstitutionRecommendedOtherHouseholds, BigDecimal specialSupplyTransferredInstitutionHouseholds,
                                         BigDecimal supplyAmountMaxSalePrice) {
        HousePricesInfo housePricesInfo = new HousePricesInfo();
        housePricesInfo.houseManagementNumber = houseManagementNumber;
        housePricesInfo.houseType = houseType;
        housePricesInfo.houseSupplyArea = houseSupplyArea;
        housePricesInfo.generalSupplyHouseholds = generalSupplyHouseholds;
        housePricesInfo.specialSupplyHouseholds = specialSupplyHouseholds;
        housePricesInfo.specialSupplyMultiChildHouseholds = specialSupplyMultiChildHouseholds;
        housePricesInfo.specialSupplyNewlywedHouseholds = specialSupplyNewlywedHouseholds;
        housePricesInfo.specialSupplyFirstTimeHouseholds = specialSupplyFirstTimeHouseholds;
        housePricesInfo.specialSupplyElderlyParentSupportHouseholds = specialSupplyElderlyParentSupportHouseholds;
        housePricesInfo.specialSupplyInstitutionRecommendedHouseholds = specialSupplyInstitutionRecommendedHouseholds;
        housePricesInfo.specialSupplyInstitutionRecommendedOtherHouseholds = specialSupplyInstitutionRecommendedOtherHouseholds;
        housePricesInfo.specialSupplyTransferredInstitutionHouseholds = specialSupplyTransferredInstitutionHouseholds;
        housePricesInfo.supplyAmountMaxSalePrice = supplyAmountMaxSalePrice;
        return housePricesInfo;
    }
}
