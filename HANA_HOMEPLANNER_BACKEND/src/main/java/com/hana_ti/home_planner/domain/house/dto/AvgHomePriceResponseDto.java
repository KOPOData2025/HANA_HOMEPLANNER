package com.hana_ti.home_planner.domain.house.dto;

import com.hana_ti.home_planner.domain.house.entity.AvgHomePrice;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AvgHomePriceResponseDto {

    private BigDecimal size60Less;
    private BigDecimal year;
    private String region;
    private BigDecimal size60Over85Less;
    private BigDecimal size85More;

    public static AvgHomePriceResponseDto from(AvgHomePrice avgHomePrice) {
        return AvgHomePriceResponseDto.builder()
                .size60Less(avgHomePrice.getSize60Less())
                .year(avgHomePrice.getYear())
                .region(avgHomePrice.getRegion())
                .size60Over85Less(avgHomePrice.getSize60Over85Less())
                .size85More(avgHomePrice.getSize85More())
                .build();
    }
}