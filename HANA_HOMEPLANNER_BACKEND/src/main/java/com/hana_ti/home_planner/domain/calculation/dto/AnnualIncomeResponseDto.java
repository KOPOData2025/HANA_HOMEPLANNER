package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualIncomeResponseDto {
    
    // === 기본 정보 ===
    private Long userId; // 사용자 ID
    private String userName; // 사용자명
    private String ci; // CI (개인식별정보)
    
    // === 소득 정보 ===
    private BigDecimal actualAnnualIncome; // 실제 연소득 (원)
    private BigDecimal estimatedAnnualIncome; // 추정 연소득 (원)
    private BigDecimal finalAnnualIncome; // 최종 적용 연소득 (원)
    
    // === 계산 상세 정보 ===
    private Integer transactionCount; // 거래 건수
    private BigDecimal averageMonthlyIncome; // 월평균 소득 (원)
    private BigDecimal totalIncomeAmount; // 총 소득 금액 (원)
    private BigDecimal bonusAmount; // 상여금 (원)
    private BigDecimal overtimeAmount; // 초과근무수당 (원)
    
    // === 계산 방식 정보 ===estimatedAnnualIncome
    private String calculationMethod; // 계산 방식 (실제소득, 추정소득, 혼합)
    private String dataSource; // 데이터 출처 (MyData, 추정)
    private Boolean isEstimated; // 추정 여부
    
    // === 추가 정보 ===
    private List<String> incomeSources; // 소득원 목록
    private String incomeStability; // 소득 안정성 (안정, 보통, 불안정)
    private BigDecimal incomeGrowthRate; // 소득 증가율 (%)
    
    // === 메타 정보 ===
    private LocalDateTime calculatedAt; // 계산 시점
    private String calculationStatus; // 계산 상태 (SUCCESS, PARTIAL, FAILED)
    private List<String> warnings; // 경고 메시지
    private List<String> errors; // 오류 메시지
    private Boolean fallbackUsed; // 대체 로직 사용 여부
}
