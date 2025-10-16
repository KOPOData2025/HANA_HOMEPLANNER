package com.hana_ti.home_planner.domain.financial.dto;

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
public class SavingsRecommendationRequestDto {
    
    @NotNull(message = "목표 금액은 필수입니다")
    @DecimalMin(value = "0", message = "목표 금액은 0원 이상이어야 합니다")
    private BigDecimal targetAmount; // 목표 금액 (잔금 부족액)
    
    @NotNull(message = "남은 개월수는 필수입니다")
    @Min(value = 1, message = "남은 개월수는 1개월 이상이어야 합니다")
    @Max(value = 120, message = "남은 개월수는 120개월 이하여야 합니다")
    private Integer remainingMonths; // 남은 개월수
    
    @NotNull(message = "월 저축액은 필수입니다")
    @DecimalMin(value = "0", message = "월 저축액은 0원 이상이어야 합니다")
    private BigDecimal monthlySaving; // 사용자가 가능한 월 저축액
}
