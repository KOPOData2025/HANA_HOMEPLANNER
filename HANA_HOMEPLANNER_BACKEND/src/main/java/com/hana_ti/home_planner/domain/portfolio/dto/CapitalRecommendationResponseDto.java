package com.hana_ti.home_planner.domain.portfolio.dto;

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
public class CapitalRecommendationResponseDto {
    
    private List<CapitalPlanDto> capitalPlans;
    private AnalysisDto analysis;
    private DesiredSavingAnalysisDto desiredSavingAnalysis;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CapitalPlanDto {
        private String planType; // 플랜 타입 (보수형, 균형형, 공격형)
        private BigDecimal loanAmount; // 대출 금액
        private BigDecimal requiredMonthlySaving; // 필요한 월 적금액
        private BigDecimal totalSavingAtMoveIn; // 잔금일 총 적금액 (원금 + 이자)
        private BigDecimal shortfallCovered; // 부족액 충당 금액
        private String comment; // 코멘트
        private String recommendation; // 추천 이유
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalysisDto {
        private BigDecimal housePrice; // 주택 가격
        private BigDecimal currentCash; // 현재 보유 자산
        private BigDecimal totalLoanAvailable; // 총 대출 가능 금액
        private BigDecimal totalShortfall; // 총 부족액 (주택가격 - 현재자산 - 대출가능액)
        private long monthsUntilMoveIn; // 잔금일까지 남은 개월
        private String feasibilityStatus; // 실현 가능성 (FEASIBLE/CHALLENGING/IMPOSSIBLE)
        private String feasibilityComment; // 실현 가능성 코멘트
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DesiredSavingAnalysisDto {
        private BigDecimal desiredMonthlySaving; // 희망 월 적금액
        private BigDecimal desiredSavingMaturityAmount; // 희망 적금액으로 만기시 받을 수 있는 금액
        private BigDecimal shortfallAfterDesiredSaving; // 희망 적금액 적용 후 남은 부족액
        private String comparisonStatus; // 비교 결과 (SUFFICIENT/INSUFFICIENT/EXCESS)
        private String comparisonComment; // 비교 분석 코멘트
        private String recommendation; // 희망 적금액에 대한 추천 사항
    }
}
