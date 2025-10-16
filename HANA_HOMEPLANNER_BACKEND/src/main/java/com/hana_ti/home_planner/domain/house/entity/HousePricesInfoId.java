package com.hana_ti.home_planner.domain.house.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HousePricesInfoId implements Serializable {
    private BigDecimal houseManagementNumber;
    private String houseType;
}
