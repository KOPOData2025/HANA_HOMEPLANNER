package com.hana_ti.home_planner.domain.calculation.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCalculationRequestDto {
    
    // 부동산 정보
    @NotNull(message = "매매가는 필수입니다")
    @DecimalMin(value = "0.0", inclusive = false, message = "매매가는 0보다 커야 합니다")
    private BigDecimal housePrice; // 매매가 (분양가)
    
    @NotBlank(message = "주택 소재지(지역)는 필수입니다")
    private String region; // 주택 소재지 (서울/경기/인천/기타)
    
    // 개인/소득 정보
    @NotNull(message = "본인 연소득은 필수입니다")
    @DecimalMin(value = "0.0", inclusive = false, message = "본인 연소득은 0보다 커야 합니다")
    private BigDecimal annualIncome; // 본인 연소득
    
    @Builder.Default
    @DecimalMin(value = "0.0", message = "배우자 연소득은 0 이상이어야 합니다")
    private BigDecimal spouseAnnualIncome = BigDecimal.ZERO; // 배우자 연소득 (선택)
    
    @Builder.Default
    private Boolean includeSpouseIncome = false; // 배우자 소득 합산 여부
    
    @NotNull(message = "기존 대출 월상환액은 필수입니다")
    @DecimalMin(value = "0.0", message = "기존 대출 월상환액은 0 이상이어야 합니다")
    private BigDecimal existingLoanMonthlyPayment; // 기존 보유 대출의 월상환액
    
    @NotBlank(message = "주택 보유 수는 필수입니다")
    @Pattern(regexp = "^(무주택|1주택\\(처분조건부\\)|다주택)$", message = "주택 보유 수는 '무주택', '1주택(처분조건부)', '다주택' 중 하나여야 합니다")
    private String houseOwnershipStatus; // 주택 보유 수
    
    @Builder.Default
    private Boolean isFirstTimeBuyer = false; // 생애최초 구입 여부
    
    // 추가 정보 (정책모기지 대상 확인용)
    @Builder.Default
    private Boolean isNewlywed = false; // 신혼부부 여부
    
    @Builder.Default
    @Min(value = 0, message = "자녀 수는 0 이상이어야 합니다")
    private Integer childrenCount = 0; // 자녀 수
    
    // 희망 대출 조건
    @Builder.Default
    @Min(value = 10, message = "대출 기간은 최소 10년이어야 합니다")
    @Max(value = 50, message = "대출 기간은 최대 50년이어야 합니다")
    private Integer loanTermYears = 30; // 대출 기간 (년)
    
    @Builder.Default
    @DecimalMin(value = "0.0", message = "예상 대출 금리는 0 이상이어야 합니다")
    private BigDecimal expectedInterestRate = new BigDecimal("4.5"); // 예상 대출 금리 (%)
    
    // 계산 옵션
    @Builder.Default
    private Boolean useMyData = true; // MyData 사용 여부 (JWT 토큰이 있을 때)
}
