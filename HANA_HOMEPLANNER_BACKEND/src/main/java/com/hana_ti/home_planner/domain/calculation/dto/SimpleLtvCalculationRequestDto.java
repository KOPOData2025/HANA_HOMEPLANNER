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
public class SimpleLtvCalculationRequestDto {

    @NotNull(message = "주택가격은 필수입니다")
    @DecimalMin(value = "0", message = "주택가격은 0 이상이어야 합니다")
    private BigDecimal housePrice;

    @NotBlank(message = "지역은 필수입니다")
    private String region;

    @NotBlank(message = "주택 보유 현황은 필수입니다")
    private String housingStatus; // 무주택자, 일시적1주택, 신혼부부, 생애최초, 다주택자

    @NotNull(message = "금리는 필수입니다")
    @DecimalMin(value = "0", message = "금리는 0% 이상이어야 합니다")
    @DecimalMax(value = "20", message = "금리는 20% 이하여야 합니다")
    private BigDecimal interestRate;

    @NotNull(message = "대출기간은 필수입니다")
    @Min(value = 1, message = "대출기간은 1년 이상이어야 합니다")
    @Max(value = 50, message = "대출기간은 50년 이하여야 합니다")
    private Integer loanPeriod;

    @Pattern(regexp = "원리금균등|원금균등|만기일시", message = "상환방식은 원리금균등, 원금균등, 만기일시 중 하나여야 합니다")
    @Builder.Default
    private String repayMethod = "원리금균등"; // 기본값 설정
}
