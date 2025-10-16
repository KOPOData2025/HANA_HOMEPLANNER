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
public class ExistingDebtInfo {
    
    /**
     * 기존 부채 연간 상환액
     */
    private BigDecimal existingAnnualPayment;
    
    /**
     * 기존 부채 월간 상환액
     */
    private BigDecimal existingMonthlyPayment;
    
    /**
     * 기존 부채 건수
     */
    private Integer existingLoanCount;
}
