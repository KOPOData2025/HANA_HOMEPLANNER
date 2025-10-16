package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimpleAnnualIncomeResponseDto {
    
    private Long userId; // 사용자 ID
    private String userName; // 사용자명
    private BigDecimal annualIncome; // 연평균 소득 (원)
    private String calculationMethod; // 계산 방식 (실제소득, 추정소득, 기본값)
}
