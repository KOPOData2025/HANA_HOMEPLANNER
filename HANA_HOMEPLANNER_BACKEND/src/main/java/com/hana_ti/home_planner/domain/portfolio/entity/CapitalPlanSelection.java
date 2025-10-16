package com.hana_ti.home_planner.domain.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "capital_plan_selection")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapitalPlanSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "selection_id")
    private Long selectionId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "house_mng_no", precision = 20)
    private Long houseMngNo; // 주택관리번호 (예: 2025000379)

    @Column(name = "savings_id", length = 50)
    private String savingsId; // 추천 적금 상품 PROD_ID

    @Column(name = "loan_id", length = 50)
    private String loanId; // 추천 대출 상품 PROD_ID

    // 선택한 포트폴리오 플랜 정보
    @Column(name = "plan_type", nullable = false, length = 50)
    private String planType; // 보수형 / 균형형 / 공격형

    @Column(name = "plan_name", length = 200)
    private String planName; // 플랜 이름 (예: "안전한 주택 구매 계획")

    @Column(name = "loan_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "required_monthly_saving", nullable = false, precision = 18, scale = 2)
    private BigDecimal requiredMonthlySaving;

    @Column(name = "total_saving_at_movein", precision = 18, scale = 2)
    private BigDecimal totalSavingAtMoveIn;

    @Column(name = "shortfall_covered", precision = 18, scale = 2)
    private BigDecimal shortfallCovered;

    @Column(name = "plan_comment", length = 1000)
    private String planComment;

    @Column(name = "plan_recommendation", length = 1000)
    private String planRecommendation;

    // 희망 적금 분석 정보
    @Column(name = "desired_monthly_saving", precision = 18, scale = 2)
    private BigDecimal desiredMonthlySaving;

    @Column(name = "desired_saving_maturity_amt", precision = 18, scale = 2)
    private BigDecimal desiredSavingMaturityAmount;

    @Column(name = "shortfall_after_desired", precision = 18, scale = 2)
    private BigDecimal shortfallAfterDesiredSaving;

    @Column(name = "comparison_status", length = 20)
    private String comparisonStatus; // SUFFICIENT / INSUFFICIENT

    @Column(name = "comparison_comment", length = 1000)
    private String comparisonComment;

    @Column(name = "comparison_recommendation", length = 1000)
    private String comparisonRecommendation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
