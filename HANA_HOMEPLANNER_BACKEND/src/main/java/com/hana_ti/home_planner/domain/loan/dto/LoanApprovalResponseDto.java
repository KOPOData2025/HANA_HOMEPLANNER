package com.hana_ti.home_planner.domain.loan.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoanApprovalResponseDto {

    private String loanApplicationId;
    private String loanContractId;
    private String loanAccountId;
    private String loanAccountNumber;
    private String userId;
    private String productId;
    private BigDecimal loanAmount;
    private BigDecimal interestRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer termMonths;
    private String repayType;
    private String disburseAccountId;
    private String accountId;
    private String status;
    private LocalDateTime approvedAt;
    private String reviewerId;
    private String remarks;
    private Integer repaymentScheduleCount;

    /**
     * 대출 승인 결과 정보를 ResponseDto로 생성
     */
    public static LoanApprovalResponseDto create(String loanApplicationId, String loanContractId,
                                                String loanAccountId, String loanAccountNumber,
                                                String userId, String productId,
                                                BigDecimal loanAmount, BigDecimal interestRate,
                                                LocalDate startDate, LocalDate endDate,
                                                Integer termMonths, String repayType,
                                                String disburseAccountId, String accountId, String status,
                                                LocalDateTime approvedAt, String reviewerId,
                                                String remarks, Integer repaymentScheduleCount) {
        return LoanApprovalResponseDto.builder()
                .loanApplicationId(loanApplicationId)
                .loanContractId(loanContractId)
                .loanAccountId(loanAccountId)
                .loanAccountNumber(loanAccountNumber)
                .userId(userId)
                .productId(productId)
                .loanAmount(loanAmount)
                .interestRate(interestRate)
                .startDate(startDate)
                .endDate(endDate)
                .termMonths(termMonths)
                .repayType(repayType)
                .disburseAccountId(disburseAccountId)
                .accountId(accountId)
                .status(status)
                .approvedAt(approvedAt)
                .reviewerId(reviewerId)
                .remarks(remarks)
                .repaymentScheduleCount(repaymentScheduleCount)
                .build();
    }
}
