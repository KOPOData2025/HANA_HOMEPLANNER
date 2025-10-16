package com.hana_ti.home_planner.domain.user.dto;

import com.hana_ti.home_planner.domain.bank.dto.AccountResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.TransactionHistoryResponseDto;
import com.hana_ti.home_planner.domain.savings.dto.PaymentScheduleResponseDto;
import com.hana_ti.home_planner.domain.savings.dto.UserSavingsResponseDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AccountDetailResponseDto {

    private AccountResponseDto account;
    private UserSavingsResponseDto userSavings;
    private List<PaymentScheduleResponseDto> paymentSchedules;
    private List<TransactionHistoryResponseDto> transactionHistories;

    /**
     * 계좌 상세 정보 생성
     */
    public static AccountDetailResponseDto create(AccountResponseDto account,
                                                UserSavingsResponseDto userSavings,
                                                List<PaymentScheduleResponseDto> paymentSchedules,
                                                List<TransactionHistoryResponseDto> transactionHistories) {
        return AccountDetailResponseDto.builder()
                .account(account)
                .userSavings(userSavings)
                .paymentSchedules(paymentSchedules)
                .transactionHistories(transactionHistories)
                .build();
    }
}
