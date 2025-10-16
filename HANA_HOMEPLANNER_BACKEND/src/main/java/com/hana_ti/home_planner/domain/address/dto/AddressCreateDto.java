package com.hana_ti.home_planner.domain.address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressCreateDto {
    private String sido;
    private String sigungu;
    private String eupmyeondong;
    private String roadNm;
    private BigDecimal lat;
    private BigDecimal lon;
}