package com.hana_ti.home_planner.domain.house.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class AvgHomePriceId implements Serializable {

    private String region;
    private BigDecimal year;
}