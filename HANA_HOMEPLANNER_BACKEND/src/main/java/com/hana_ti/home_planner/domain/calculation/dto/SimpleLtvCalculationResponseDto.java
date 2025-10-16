package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimpleLtvCalculationResponseDto {
    
    // 1. 지역 규제 정보
    private String region;
    private String regionType; // 투기과열지구, 일반지역
    private boolean isRegulationArea;
    
    // 2. 사용자 신청 조건 및 LTV 한도
    private String housingStatus; // 주택보유현황
    private Integer ltvLimit; // LTV 한도 (%)
    
    // 3. 대출 가능 금액 계산
    private BigDecimal housePrice; // 주택가격
    private BigDecimal maxLoanAmount; // 최대 대출 가능 금액
    
    // 4. 대출 상환 계산 (최대 대출 가능 금액 기준)
    private Integer loanPeriod; // 대출 개월수
    private BigDecimal totalRepaymentAmount; // 총 갚아야 하는 금액
    private BigDecimal monthlyPayment; // 개월당 지불해야 하는 금액
    private BigDecimal interestRate; // 금리
    
    // 5. 스트레스 DSR 계산
    private BigDecimal stressRate; // 스트레스 금리
    private BigDecimal stressMonthlyPayment; // 스트레스 금리 적용 월상환액
    private BigDecimal stressTotalRepaymentAmount; // 스트레스 금리 적용 총상환액
    
    // 계산 정보
    private String calculationDate;
    private String message;
}
