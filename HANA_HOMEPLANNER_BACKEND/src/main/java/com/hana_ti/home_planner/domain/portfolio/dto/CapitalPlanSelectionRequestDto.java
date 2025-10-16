package com.hana_ti.home_planner.domain.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapitalPlanSelectionRequestDto {

    @Min(value = 1, message = "주택관리번호는 1 이상이어야 합니다")
    private Long houseMngNo; // 주택관리번호 (예: 2025000379)

    private String savingsId; // 추천 적금 상품 PROD_ID
    private String loanId; // 추천 대출 상품 PROD_ID

    // 선택한 포트폴리오 플랜 정보
    @NotBlank(message = "플랜 타입은 필수입니다")
    @Pattern(regexp = "^(보수형|균형형|공격형)$", message = "플랜 타입은 보수형, 균형형, 공격형 중 하나여야 합니다")
    private String planType;

    @Size(max = 200, message = "플랜 이름은 200자를 초과할 수 없습니다")
    private String planName; // 플랜 이름 (예: "안전한 주택 구매 계획")

    @NotNull(message = "대출 금액은 필수입니다")
    @DecimalMin(value = "0", message = "대출 금액은 0원 이상이어야 합니다")
    private BigDecimal loanAmount;

    @NotNull(message = "필요 월 적금액은 필수입니다")
    @DecimalMin(value = "0", message = "필요 월 적금액은 0원 이상이어야 합니다")
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
}
