package com.hana_ti.home_planner.domain.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapitalRecommendationRequestDto {
    
    @NotNull(message = "주택 가격은 필수입니다")
    @DecimalMin(value = "0", message = "주택 가격은 0원 이상이어야 합니다")
    private BigDecimal housePrice; // 주택 가격
    
    @NotNull(message = "연소득은 필수입니다")
    @DecimalMin(value = "0", message = "연소득은 0원 이상이어야 합니다")
    private BigDecimal annualIncome; // 연소득
    
    @NotNull(message = "현재 보유 자산은 필수입니다")
    @DecimalMin(value = "0", message = "현재 보유 자산은 0원 이상이어야 합니다")
    private BigDecimal currentCash; // 현재 보유 자산
    
    @NotNull(message = "희망 월 적금액은 필수입니다")
    @DecimalMin(value = "0", message = "희망 월 적금액은 0원 이상이어야 합니다")
    private BigDecimal desiredMonthlySaving; // 희망 월 적금액
    
    
    @NotNull(message = "잔금일은 필수입니다")
    @Future(message = "잔금일은 미래 날짜여야 합니다")
    private LocalDate moveInDate; // 잔금일
    
    @NotNull(message = "대출 최대 가능 금액은 필수입니다")
    @DecimalMin(value = "0", message = "대출 최대 가능 금액은 0원 이상이어야 합니다")
    private BigDecimal loanAvailable; // 대출 최대 가능 금액
}
