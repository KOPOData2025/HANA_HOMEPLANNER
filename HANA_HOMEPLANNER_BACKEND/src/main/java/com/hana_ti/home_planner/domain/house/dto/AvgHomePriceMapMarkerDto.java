package com.hana_ti.home_planner.domain.house.dto;

import com.hana_ti.home_planner.domain.house.entity.AvgHomePrice;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;


@Getter
@Builder
public class AvgHomePriceMapMarkerDto {

    private String region;
    private BigDecimal year;
    private PriceInfo priceInfo;

    @Getter
    @Builder
    public static class PriceInfo {
        private BigDecimal size60Less;
        private BigDecimal size60Over85Less;
        private BigDecimal size85More;
        
        // 평균 가격 계산 (3개 크기별 평균)
        public BigDecimal getAveragePrice() {
            BigDecimal total = BigDecimal.ZERO;
            int count = 0;
            
            if (size60Less != null && size60Less.compareTo(BigDecimal.ZERO) > 0) {
                total = total.add(size60Less);
                count++;
            }
            if (size60Over85Less != null && size60Over85Less.compareTo(BigDecimal.ZERO) > 0) {
                total = total.add(size60Over85Less);
                count++;
            }
            if (size85More != null && size85More.compareTo(BigDecimal.ZERO) > 0) {
                total = total.add(size85More);
                count++;
            }
            
            return count > 0 ? total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        }
    }

    public static AvgHomePriceMapMarkerDto from(AvgHomePrice avgHomePrice) {
        PriceInfo priceInfo = PriceInfo.builder()
                .size60Less(avgHomePrice.getSize60Less())
                .size60Over85Less(avgHomePrice.getSize60Over85Less())
                .size85More(avgHomePrice.getSize85More())
                .build();

        return AvgHomePriceMapMarkerDto.builder()
                .region(avgHomePrice.getRegion())
                .year(avgHomePrice.getYear())
                .priceInfo(priceInfo)
                .build();
    }
}