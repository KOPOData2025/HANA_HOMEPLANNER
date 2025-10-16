package com.hana_ti.home_planner.domain.loan.dto;

import com.hana_ti.home_planner.domain.loan.entity.LoanContract;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoanContractResponseDto {

    private String loanId;
    private String appId;
    private String userId;
    private String productId;
    private BigDecimal loanAmount;
    private BigDecimal interestRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String repayType;
    private String repayTypeDescription;
    private String disburseAccountId;
    private String loanAccountId;
    private String accountId;
    private String status;
    private String statusDescription;
    private LocalDateTime createdAt;

    /**
     * LoanContract 엔티티를 LoanContractResponseDto로 변환
     */
    public static LoanContractResponseDto from(LoanContract loanContract) {
        return LoanContractResponseDto.builder()
                .loanId(loanContract.getLoanId())
                .appId(loanContract.getAppId())
                .userId(loanContract.getUserId())
                .productId(loanContract.getProductId())
                .loanAmount(loanContract.getLoanAmount())
                .interestRate(loanContract.getInterestRate())
                .startDate(loanContract.getStartDate())
                .endDate(loanContract.getEndDate())
                .repayType(loanContract.getRepayType() != null ? loanContract.getRepayType().name() : null)
                .repayTypeDescription(loanContract.getRepayType() != null ? loanContract.getRepayType().getDescription() : null)
                .disburseAccountId(loanContract.getDisburseAccountId())
                .loanAccountId(loanContract.getLoanAccountId())
                .accountId(loanContract.getAccountId())
                .status(loanContract.getStatus() != null ? loanContract.getStatus().name() : null)
                .statusDescription(loanContract.getStatus() != null ? loanContract.getStatus().getDescription() : null)
                .createdAt(loanContract.getCreatedAt())
                .build();
    }
}
