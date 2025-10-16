package com.hana_ti.home_planner.domain.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapitalPlanSelectionResponseDto {

    private Long selectionId;
    private String userId;
    private Long houseMngNo; // 주택관리번호 (예: 2025000379)
    private String savingsId;
    private String loanId;

    // 선택한 포트폴리오 플랜 정보
    private String planType;
    private String planName; // 플랜 이름 (예: "안전한 주택 구매 계획")
    private BigDecimal loanAmount;
    private BigDecimal requiredMonthlySaving;
    private BigDecimal totalSavingAtMoveIn;
    private BigDecimal shortfallCovered;
    private String planComment;
    private String planRecommendation;

    // 희망 적금 분석 정보
    private BigDecimal desiredMonthlySaving;
    private BigDecimal desiredSavingMaturityAmount;
    private BigDecimal shortfallAfterDesiredSaving;
    private String comparisonStatus;
    private String comparisonComment;
    private String comparisonRecommendation;

    private LocalDateTime createdAt;
}
