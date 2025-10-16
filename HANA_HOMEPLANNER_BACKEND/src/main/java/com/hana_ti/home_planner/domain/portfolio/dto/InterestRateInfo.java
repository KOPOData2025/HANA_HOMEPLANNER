package com.hana_ti.home_planner.domain.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterestRateInfo {
    
    /**
     * 대출 금리 (%)
     */
    private BigDecimal loanInterestRate;
    
    /**
     * 적금 금리 (%)
     */
    private BigDecimal savingsInterestRate;
    
    /**
     * 금리 차이 (대출 금리 - 적금 금리)
     */
    private BigDecimal rateDifference;
    
    /**
     * 금리 비교 기반 추천
     */
    private String recommendation;
}
