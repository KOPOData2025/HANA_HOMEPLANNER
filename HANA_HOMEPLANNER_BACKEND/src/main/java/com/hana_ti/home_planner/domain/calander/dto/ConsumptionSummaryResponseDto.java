package com.hana_ti.home_planner.domain.calander.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumptionSummaryResponseDto {

    // 조회 기준 정보
    private Integer year;
    private Integer month;
    
    // 1. 기본 소비 통계
    private BasicStatistics basicStatistics;
    
    // 2. 카테고리별 소비 분석
    private CategoryAnalysis categoryAnalysis;
    
    // 3. 금융 상품 관련 분석
    private FinancialProductAnalysis financialProductAnalysis;
    
    // 4. 소비 인사이트 및 추천
    private ConsumptionInsights consumptionInsights;
    
    // 5. 목표 기반 분석
    private GoalBasedAnalysis goalBasedAnalysis;

    /**
     * 기본 소비 통계
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BasicStatistics {
        private BigDecimal totalIncome;          // 총 입금액
        private BigDecimal totalExpense;         // 총 출금액
        private BigDecimal netAmount;            // 순자산 변화 (입금 - 출금)
        private BigDecimal avgDailyExpense;      // 일평균 소비액
        private Integer totalTransactionCount;   // 총 거래 건수
        private Integer incomeCount;             // 입금 건수
        private Integer expenseCount;            // 출금 건수
        
        // 전월 대비 변화
        private BigDecimal expenseChangeRate;    // 전월 대비 소비 증감율 (%)
        private String expenseChangeTrend;       // 증가/감소/유지
    }

    /**
     * 카테고리별 소비 분석
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryAnalysis {
        private List<CategoryExpense> categoryExpenses;      // 카테고리별 소비
        private List<CategoryExpense> topCategories;         // TOP 5 카테고리
        private String mostExpensiveCategory;                // 가장 많이 소비한 카테고리
        private BigDecimal mostExpensiveAmount;              // 가장 많이 소비한 금액
    }

    /**
     * 카테고리별 소비 항목
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryExpense {
        private String category;              // 카테고리명
        private String categoryDescription;   // 카테고리 설명
        private BigDecimal amount;            // 소비액
        private Integer count;                // 거래 건수
        private BigDecimal percentage;        // 전체 소비 대비 비율 (%)
    }

    /**
     * 금융 상품 관련 분석
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialProductAnalysis {
        // 대출 관련
        private BigDecimal loanRepaymentAmount;      // 대출 상환액
        private Integer loanRepaymentCount;          // 대출 상환 건수
        private BigDecimal loanRepaymentRate;        // 대출 상환 비율 (총 소비 대비 %)
        
        // 적금 관련
        private BigDecimal savingsDepositAmount;     // 적금 납입액
        private Integer savingsDepositCount;         // 적금 납입 건수
        private BigDecimal savingsDepositRate;       // 적금 납입 비율 (총 입금 대비 %)
        
        // 카드 관련
        private BigDecimal cardExpenseAmount;        // 카드 사용액
        private Integer cardExpenseCount;            // 카드 사용 건수
        private BigDecimal cardExpenseRate;          // 카드 사용 비율 (총 소비 대비 %)
    }

    /**
     * 소비 인사이트 및 추천
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsumptionInsights {
        private List<String> insights;                      // 소비 인사이트 (문자열 리스트)
        private List<String> recommendations;               // 추천 사항
        private ConsumptionPattern consumptionPattern;      // 소비 패턴
        private List<String> savingOpportunities;           // 절약 기회
    }

    /**
     * 소비 패턴
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsumptionPattern {
        private BigDecimal fixedExpenseRate;        // 고정비 비율 (%)
        private BigDecimal variableExpenseRate;     // 변동비 비율 (%)
        private String consumptionConcentration;    // 소비 집중도 (높음/보통/낮음)
        private String spendingTrend;               // 소비 트렌드 (증가/감소/유지)
    }

    /**
     * 목표 기반 분석
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalBasedAnalysis {
        // 적금 목표
        private SavingsGoal savingsGoal;
        
        // 대출 목표
        private LoanGoal loanGoal;
        
        // 소비 목표
        private ExpenseGoal expenseGoal;
    }

    /**
     * 적금 목표
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavingsGoal {
        private BigDecimal plannedAmount;          // 계획된 적금액
        private BigDecimal actualAmount;           // 실제 적금액
        private BigDecimal achievementRate;        // 달성률 (%)
        private String status;                     // 상태 (달성/미달성/초과달성)
        private List<String> suggestions;          // 제안 사항
    }

    /**
     * 대출 목표
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoanGoal {
        private BigDecimal plannedRepayment;       // 계획된 상환액
        private BigDecimal actualRepayment;        // 실제 상환액
        private BigDecimal achievementRate;        // 달성률 (%)
        private String status;                     // 상태 (정상/지연/조기상환)
        private List<String> suggestions;          // 제안 사항
    }

    /**
     * 소비 목표
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseGoal {
        private BigDecimal targetExpense;          // 목표 소비액
        private BigDecimal actualExpense;          // 실제 소비액
        private BigDecimal achievementRate;        // 달성률 (%)
        private String status;                     // 상태 (목표 내/초과/미달)
        private BigDecimal remainingBudget;        // 남은 예산
        private List<String> suggestions;          // 제안 사항
    }
}

