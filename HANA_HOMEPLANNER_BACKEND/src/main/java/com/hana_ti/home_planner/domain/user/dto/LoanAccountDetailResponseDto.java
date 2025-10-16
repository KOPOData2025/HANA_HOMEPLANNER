package com.hana_ti.home_planner.domain.user.dto;

import com.hana_ti.home_planner.domain.bank.dto.TransactionHistoryResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanRepaymentScheduleResponseDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class LoanAccountDetailResponseDto {

    private List<LoanRepaymentScheduleResponseDto> repaymentSchedules;
    private List<TransactionHistoryResponseDto> transactionHistories;

    /**
     * 대출 계좌 상세 정보 생성
     */
    public static LoanAccountDetailResponseDto create(List<LoanRepaymentScheduleResponseDto> repaymentSchedules,
                                                    List<TransactionHistoryResponseDto> transactionHistories) {
        return LoanAccountDetailResponseDto.builder()
                .repaymentSchedules(repaymentSchedules)
                .transactionHistories(transactionHistories)
                .build();
    }
}
