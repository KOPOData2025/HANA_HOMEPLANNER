package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanGenerationResponseDto {

    private Long userId;
    private BigDecimal housePrice;
    private String region;
    private BigDecimal annualIncome;
    private BigDecimal existingLoanMonthlyPayment;
    private Integer ltvLimit;
    private BigDecimal maxAllowedLoanAmount;
    private Integer dsrLimit;
    private BigDecimal rateAssumed;
    private BigDecimal stressRate;
    private Integer termYears;
    private String repaymentType;
    private BigDecimal availableMonthlyPayment;
    
    private List<PlanDto> plans; // 3종 플랜 목록
    private String calculationDate; // 계산일시
    private String calculationStatus; // 계산 상태 (SUCCESS, PARTIAL_SUCCESS, FAILED)
    private List<String> warnings; // 경고 메시지 목록
    private List<String> errors; // 오류 메시지 목록
}
