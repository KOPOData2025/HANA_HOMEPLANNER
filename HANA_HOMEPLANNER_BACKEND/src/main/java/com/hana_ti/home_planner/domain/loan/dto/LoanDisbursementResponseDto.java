package com.hana_ti.home_planner.domain.loan.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoanDisbursementResponseDto {

    private String loanId;
    private String loanAccountId;
    private String loanAccountNumber;
    private BigDecimal loanAccountBalance;
    private String demandAccountId;
    private String demandAccountNumber;
    private BigDecimal demandAccountBalance;
    private BigDecimal disbursedAmount;
    private String status;
    private LocalDateTime disbursedAt;
    private String transactionId;

    /**
     * 대출 실행 결과 정보를 ResponseDto로 생성
     */
    public static LoanDisbursementResponseDto create(String loanId, String loanAccountId,
                                                   String loanAccountNumber, BigDecimal loanAccountBalance,
                                                   String demandAccountId, String demandAccountNumber,
                                                   BigDecimal demandAccountBalance, BigDecimal disbursedAmount,
                                                   String status, LocalDateTime disbursedAt, String transactionId) {
        return LoanDisbursementResponseDto.builder()
                .loanId(loanId)
                .loanAccountId(loanAccountId)
                .loanAccountNumber(loanAccountNumber)
                .loanAccountBalance(loanAccountBalance)
                .demandAccountId(demandAccountId)
                .demandAccountNumber(demandAccountNumber)
                .demandAccountBalance(demandAccountBalance)
                .disbursedAmount(disbursedAmount)
                .status(status)
                .disbursedAt(disbursedAt)
                .transactionId(transactionId)
                .build();
    }
}
