package com.hana_ti.home_planner.domain.bank.dto;

import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class TransactionHistoryResponseDto {

    private String txnId;
    private String accountId;
    private String txnType;
    private String txnTypeDescription;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private LocalDate txnDate;

    /**
     * TransactionHistory 엔티티를 TransactionHistoryResponseDto로 변환
     */
    public static TransactionHistoryResponseDto from(TransactionHistory transactionHistory) {
        return TransactionHistoryResponseDto.builder()
                .txnId(transactionHistory.getTxnId())
                .accountId(transactionHistory.getAccountId())
                .txnType(transactionHistory.getTxnType() != null ? transactionHistory.getTxnType().name() : null)
                .txnTypeDescription(transactionHistory.getTxnType() != null ? transactionHistory.getTxnType().getDescription() : null)
                .amount(transactionHistory.getAmount())
                .balanceAfter(transactionHistory.getBalanceAfter())
                .description(transactionHistory.getDescription())
                .txnDate(transactionHistory.getTxnDate())
                .build();
    }
}
