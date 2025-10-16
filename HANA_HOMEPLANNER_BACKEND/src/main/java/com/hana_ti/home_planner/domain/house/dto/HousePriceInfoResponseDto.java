package com.hana_ti.home_planner.domain.house.dto;

import com.hana_ti.home_planner.domain.house.entity.HousePricesInfo;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class HousePriceInfoResponseDto {

    private BigDecimal houseManagementNumber;
    private String houseType;
    private BigDecimal houseSupplyArea;
    private BigDecimal generalSupplyHouseholds;
    private BigDecimal specialSupplyHouseholds;
    private BigDecimal specialSupplyMultiChildHouseholds;
    private BigDecimal specialSupplyNewlywedHouseholds;
    private BigDecimal specialSupplyFirstTimeHouseholds;
    private BigDecimal specialSupplyElderlyParentSupportHouseholds;
    private BigDecimal specialSupplyInstitutionRecommendedHouseholds;
    private BigDecimal specialSupplyInstitutionRecommendedOtherHouseholds;
    private BigDecimal specialSupplyTransferredInstitutionHouseholds;
    private BigDecimal supplyAmountMaxSalePrice;
    private String supplyLocation;
    
    // 주소 정보 필드 추가
    private String sido;
    private String sigungu;
    private String eupmyeondong;

    public static HousePriceInfoResponseDto from(HousePricesInfo housePricesInfo) {
        return HousePriceInfoResponseDto.builder()
                .houseManagementNumber(housePricesInfo.getHouseManagementNumber())
                .houseType(housePricesInfo.getHouseType())
                .houseSupplyArea(housePricesInfo.getHouseSupplyArea())
                .generalSupplyHouseholds(housePricesInfo.getGeneralSupplyHouseholds())
                .specialSupplyHouseholds(housePricesInfo.getSpecialSupplyHouseholds())
                .specialSupplyMultiChildHouseholds(housePricesInfo.getSpecialSupplyMultiChildHouseholds())
                .specialSupplyNewlywedHouseholds(housePricesInfo.getSpecialSupplyNewlywedHouseholds())
                .specialSupplyFirstTimeHouseholds(housePricesInfo.getSpecialSupplyFirstTimeHouseholds())
                .specialSupplyElderlyParentSupportHouseholds(housePricesInfo.getSpecialSupplyElderlyParentSupportHouseholds())
                .specialSupplyInstitutionRecommendedHouseholds(housePricesInfo.getSpecialSupplyInstitutionRecommendedHouseholds())
                .specialSupplyInstitutionRecommendedOtherHouseholds(housePricesInfo.getSpecialSupplyInstitutionRecommendedOtherHouseholds())
                .specialSupplyTransferredInstitutionHouseholds(housePricesInfo.getSpecialSupplyTransferredInstitutionHouseholds())
                .supplyAmountMaxSalePrice(housePricesInfo.getSupplyAmountMaxSalePrice())
                .build();
    }
    
    /**
     * 주소 정보 설정
     */
    public void setAddressInfo(String sido, String sigungu, String eupmyeondong) {
        this.sido = sido;
        this.sigungu = sigungu;
        this.eupmyeondong = eupmyeondong;
    }
}
