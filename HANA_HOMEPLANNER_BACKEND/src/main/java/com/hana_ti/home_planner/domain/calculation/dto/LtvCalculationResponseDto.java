package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LtvCalculationResponseDto {

    private Long userId;
    private BigDecimal housePrice;
    private String region;
    private String regionType; // 수도권, 비수도권, 투기과열지구, 조정대상지역
    private Integer ltvLimit; // LTV 한도 (%)
    private BigDecimal desiredLoanAmount;
    private BigDecimal calculatedLtv; // 계산된 LTV (%)
    private String ltvStatus; // 적정, 초과, 미달
    private BigDecimal maxAllowedLoanAmount; // 최대 대출 가능 금액
    private BigDecimal annualIncome; // 연소득
    private BigDecimal existingLoanBalance; // 기존 대출 잔액
    private BigDecimal totalMonthlyPayment; // 월 상환액
    private BigDecimal dti; // DTI (%)
    private BigDecimal dsr; // DSR (%)
    private List<String> recommendations; // 권장사항
    private String calculationDate; // 계산일시

    // === 확장된 응답 필드들 ===
    
    private BigDecimal adjustedLtv; // 규제 및 특례 적용 후 최종 LTV (%)
    private BigDecimal stressRate; // 스트레스 금리 (%)
    private BigDecimal availableMonthlyPayment; // 연소득 기반 월 상환 가능액
    private List<String> ltvWarnings; // LTV 조정 내역 메시지 배열
    private List<String> regulatoryNotices; // 규제 안내 사항 메시지 배열
    private String borrowerTypeText; // 대출자 유형 설명
    private String creditImpact; // 신용등급이 한도에 미치는 영향
    private Boolean dsrCapApplied; // DSR 상한 적용 여부
    private Integer dsrLimit; // 적용된 DSR 최대 허용치 (%)
    private String dsrStatus; // DSR 상태 (적정, 초과, 미달)
    private BigDecimal stressMonthlyPayment; // 스트레스 금리 적용 월 상환액
    private BigDecimal existingLoanMonthlyPayment; // 기존 대출 월 상환액
    private String housingStatus; // 주택 보유 현황
    private String borrowerType; // 대출자 유형
    private String creditGrade; // 신용등급
    private BigDecimal downPaymentRatio; // 보증금 비율 (%)
    private BigDecimal collateralRatio; // 담보 인정 비율 (%)
    private BigDecimal dsrRatio; // 희망 DSR 기준치 (%)
    private BigDecimal existingLoanRepayment; // 기존 연간 원리금 상환액
    
    // === 오류 및 경고 정보 ===
    private List<String> warnings; // 경고 메시지 목록
    private List<String> errors; // 오류 메시지 목록
    private String calculationStatus; // 계산 상태 (SUCCESS, PARTIAL_SUCCESS, FAILED)
    private String fallbackUsed; // 대체 로직 사용 여부
}
