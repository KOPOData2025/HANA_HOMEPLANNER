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
public class FinancialHealthAnalysis {
    
    /**
     * 최대 허용 저축액 (월소득의 20%)
     */
    private BigDecimal maxAffordableSaving;
    
    /**
     * 예산이 건전한지 여부
     */
    private boolean isBudgetHealthy;
    
    /**
     * 저축 능력
     */
    private BigDecimal savingsCapacity;
    
    /**
     * 현재 고정 지출 비율
     */
    private BigDecimal currentFixedRatio;
    
    /**
     * 현재 변동 지출 비율
     */
    private BigDecimal currentVariableRatio;
    
    /**
     * 고정 지출이 과도한지 여부
     */
    private boolean isFixedExpensesExcessive;
    
    /**
     * 변동 지출이 과도한지 여부
     */
    private boolean isVariableExpensesExcessive;
}
