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
public class PlanDto {

    private String type; // BALANCED, EASY, FRUGAL
    private BigDecimal loanAmount; // 대출금액
    private BigDecimal monthly; // 월상환액
    private BigDecimal ltv; // LTV 비율
    private BigDecimal dsr; // DSR 비율
    private BigDecimal stressMonthly; // 스트레스 테스트 월상환액
    private BigDecimal stressDsr; // 스트레스 테스트 DSR 비율
    private Integer termYears; // 대출기간 (년)
    private BigDecimal rateAssumed; // 적용 금리
    private String repaymentType; // 상환방식 (EPI, EP)
    private String description; // 플랜 설명
    private String recommendation; // 권장사항
    private Boolean isRecommended; // 추천 여부
}
