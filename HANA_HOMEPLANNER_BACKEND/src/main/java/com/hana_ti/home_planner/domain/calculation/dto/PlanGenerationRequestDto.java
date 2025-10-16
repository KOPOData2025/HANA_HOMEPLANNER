package com.hana_ti.home_planner.domain.calculation.dto;

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
public class PlanGenerationRequestDto {

    @NotNull(message = "주택가격은 필수입니다")
    @DecimalMin(value = "0", message = "주택가격은 0 이상이어야 합니다")
    private BigDecimal housePrice;

    @NotBlank(message = "지역은 필수입니다")
    private String region;

    @NotNull(message = "연소득은 필수입니다")
    @DecimalMin(value = "0", message = "연소득은 0 이상이어야 합니다")
    private BigDecimal annualIncome;

    @DecimalMin(value = "0", message = "기존 대출 월상환액은 0 이상이어야 합니다")
    @Builder.Default
    private BigDecimal existingLoanMonthlyPayment = BigDecimal.ZERO;

    @NotNull(message = "LTV 한도는 필수입니다")
    @Min(value = 1, message = "LTV 한도는 1% 이상이어야 합니다")
    @Max(value = 100, message = "LTV 한도는 100% 이하여야 합니다")
    private Integer ltvLimit;

    @NotNull(message = "최대 대출 가능 금액은 필수입니다")
    @DecimalMin(value = "0", message = "최대 대출 가능 금액은 0 이상이어야 합니다")
    private BigDecimal maxAllowedLoanAmount;

    @NotNull(message = "DSR 한도는 필수입니다")
    @Min(value = 1, message = "DSR 한도는 1% 이상이어야 합니다")
    @Max(value = 100, message = "DSR 한도는 100% 이하여야 합니다")
    private Integer dsrLimit;

    @NotNull(message = "적용 금리는 필수입니다")
    @DecimalMin(value = "0", message = "적용 금리는 0% 이상이어야 합니다")
    @DecimalMax(value = "20", message = "적용 금리는 20% 이하여야 합니다")
    private BigDecimal rateAssumed;

    @NotNull(message = "스트레스 금리는 필수입니다")
    @DecimalMin(value = "0", message = "스트레스 금리는 0% 이상이어야 합니다")
    @DecimalMax(value = "20", message = "스트레스 금리는 20% 이하여야 합니다")
    private BigDecimal stressRate;

    @NotNull(message = "대출기간은 필수입니다")
    @Min(value = 1, message = "대출기간은 1년 이상이어야 합니다")
    @Max(value = 50, message = "대출기간은 50년 이하여야 합니다")
    private Integer termYears;

    @NotBlank(message = "상환방식은 필수입니다")
    private String repaymentType; // EPI, EP

    @DecimalMin(value = "0", message = "가용 월상환액은 0 이상이어야 합니다")
    private BigDecimal availableMonthlyPayment; // 사용자가 설정한 월상환 가능액
}
