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
public class DtiCalculationRequestDto {

    @NotBlank(message = "지역은 필수입니다")
    private String region;

    @NotNull(message = "희망 금리는 필수입니다")
    @DecimalMin(value = "0", message = "희망 금리는 0% 이상이어야 합니다")
    @DecimalMax(value = "20", message = "희망 금리는 20% 이하여야 합니다")
    private BigDecimal desiredInterestRate;

    @NotNull(message = "희망 대출기간은 필수입니다")
    @Min(value = 1, message = "희망 대출기간은 1년 이상이어야 합니다")
    @Max(value = 50, message = "희망 대출기간은 50년 이하여야 합니다")
    private Integer desiredLoanPeriod;

    @NotNull(message = "희망 대출금액은 필수입니다")
    @DecimalMin(value = "0", message = "희망 대출금액은 0원 이상이어야 합니다")
    private BigDecimal desiredLoanAmount;

    @DecimalMin(value = "0", message = "DTI 한도는 0% 이상이어야 합니다")
    @DecimalMax(value = "100", message = "DTI 한도는 100% 이하여야 합니다")
    private BigDecimal dtiLimit; // DTI 한도 (기본값: 40%)

    @Pattern(regexp = "원리금균등|원금균등|만기일시", message = "상환방식은 원리금균등, 원금균등, 만기일시 중 하나여야 합니다")
    @Builder.Default
    private String repayMethod = "원리금균등"; // 기본값 설정
}
