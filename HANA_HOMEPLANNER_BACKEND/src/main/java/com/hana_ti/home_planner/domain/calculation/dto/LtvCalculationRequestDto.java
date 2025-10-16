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
public class LtvCalculationRequestDto {

    @NotNull(message = "주택가격은 필수입니다")
    @DecimalMin(value = "0", message = "주택가격은 0 이상이어야 합니다")
    private BigDecimal housePrice;

    @NotBlank(message = "지역은 필수입니다")
    private String region;

    @DecimalMin(value = "0", message = "희망 대출금액은 0 이상이어야 합니다")
    private BigDecimal desiredLoanAmount;

    @Min(value = 1, message = "대출기간은 1년 이상이어야 합니다")
    @Max(value = 50, message = "대출기간은 50년 이하여야 합니다")
    private Integer loanPeriod;

    @DecimalMin(value = "0", message = "금리는 0% 이상이어야 합니다")
    @DecimalMax(value = "20", message = "금리는 20% 이하여야 합니다")
    private BigDecimal interestRate;

    private String houseType; // 주택 유형 (선택사항)
    private BigDecimal houseSize; // 주택 면적 (선택사항)

    // === 확장된 필드들 ===
    
    @NotBlank(message = "주택 보유 현황은 필수입니다")
    private String housingStatus; // 무주택자, 단주택자, 다주택자

    @NotBlank(message = "대출자 유형은 필수입니다")
    private String borrowerType; // 생애최초, 신혼부부, 청년층, 일반

    @NotBlank(message = "신용등급은 필수입니다")
    private String creditGrade; // AAA, AA, A, BBB, BB, B, CCC, CC, C, D

    @DecimalMin(value = "0", message = "보증금 비율은 0% 이상이어야 합니다")
    @DecimalMax(value = "100", message = "보증금 비율은 100% 이하여야 합니다")
    private BigDecimal downPaymentRatio; // 보증금/계약금 비율 (%)

    @DecimalMin(value = "0", message = "담보 인정 비율은 0% 이상이어야 합니다")
    @DecimalMax(value = "100", message = "담보 인정 비율은 100% 이하여야 합니다")
    private BigDecimal collateralRatio; // 은행 담보 인정 비율 (%)

    @DecimalMin(value = "0", message = "희망 DSR 기준치는 0% 이상이어야 합니다")
    @DecimalMax(value = "100", message = "희망 DSR 기준치는 100% 이하여야 합니다")
    private BigDecimal dsrRatio; // 희망 DSR 기준치 (%)

    @DecimalMin(value = "0", message = "기존 연간 원리금 상환액은 0 이상이어야 합니다")
    private BigDecimal existingLoanRepayment; // 기존 연간 원리금 상환액
}
