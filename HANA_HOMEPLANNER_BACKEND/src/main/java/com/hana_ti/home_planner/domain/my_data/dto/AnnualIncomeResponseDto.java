package com.hana_ti.home_planner.domain.my_data.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualIncomeResponseDto {

    private Long userId;
    private Long accountId; // 계좌별 조회 시 사용
    private BigDecimal annualIncome;
    private String period; // 조회 기간 (최근 12개월)
    private Integer transactionCount; // 급여 거래 건수
    private BigDecimal averageMonthlyIncome; // 월 평균 급여
}
