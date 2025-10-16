package com.hana_ti.home_planner.domain.financial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanRecommendationRequestDto {
    
    // 소득 기준
    @NotNull(message = "연소득은 필수입니다")
    @DecimalMin(value = "0", message = "연소득은 0원 이상이어야 합니다")
    private BigDecimal annualIncome; // 부부합산 연소득 (원 단위)

    // 대상 주택 정보
    @NotNull(message = "주택가격은 필수입니다")
    @DecimalMin(value = "0", message = "주택가격은 0원 이상이어야 합니다")
    private BigDecimal housePrice; // 매매가 (원 단위)
    
    @NotNull(message = "전용면적은 필수입니다")
    @DecimalMin(value = "0", message = "전용면적은 0㎡ 이상이어야 합니다")
    private BigDecimal exclusiveArea; // 전용 면적 (㎡ 단위)

    // 신청자 자격 조건
    @NotNull(message = "순자산은 필수입니다")
    @DecimalMin(value = "0", message = "순자산은 0원 이상이어야 합니다")
    private BigDecimal netAssets; // 순자산 (원 단위, 디딤돌대출용)
    
    @JsonProperty("isFirstTimeBuyer")
    private boolean isFirstTimeBuyer; // 생애최초 주택구입자 여부
    
    @JsonProperty("isNewlywed")
    private boolean isNewlywed; // 신혼부부(7년 이내) 여부
    
    @Min(value = 0, message = "자녀 수는 0명 이상이어야 합니다")
    private Integer numberOfChildren; // 만 19세 미만 자녀 수
    
    @JsonProperty("hasNewbornInTwoYears")
    private boolean hasNewbornInTwoYears; // 2년 내 출산(입양) 여부
}
