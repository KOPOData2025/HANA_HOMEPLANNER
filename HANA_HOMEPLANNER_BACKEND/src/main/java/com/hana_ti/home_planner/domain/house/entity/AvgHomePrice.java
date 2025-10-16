package com.hana_ti.home_planner.domain.house.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "avg_home_price")
@IdClass(AvgHomePriceId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AvgHomePrice {

    @Column(name = "SIZE_60_LESS")
    private BigDecimal size60Less;

    @Id
    @Column(name = "YEAR")
    private BigDecimal year;

    @Id
    @Column(name = "REGION", length = 26)
    private String region;

    @Column(name = "SIZE_60_OVER_85_LESS")
    private BigDecimal size60Over85Less;

    @Column(name = "SIZE_85_MORE")
    private BigDecimal size85More;

    public static AvgHomePrice create(BigDecimal size60Less, BigDecimal year, String region,
                                    BigDecimal size60Over85Less, BigDecimal size85More) {
        AvgHomePrice avgHomePrice = new AvgHomePrice();
        avgHomePrice.size60Less = size60Less;
        avgHomePrice.year = year;
        avgHomePrice.region = region;
        avgHomePrice.size60Over85Less = size60Over85Less;
        avgHomePrice.size85More = size85More;
        return avgHomePrice;
    }
}