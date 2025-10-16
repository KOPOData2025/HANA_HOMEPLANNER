package com.hana_ti.home_planner.domain.bank.dto;

import com.hana_ti.home_planner.domain.bank.entity.Bank;
import com.hana_ti.home_planner.domain.bank.entity.BankStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BankResponseDto {

    private String bankId;
    private String bankName;
    private Integer bankCode;
    private BankStatus status;
    private String statusDescription;

    public static BankResponseDto from(Bank bank) {
        return BankResponseDto.builder()
                .bankId(bank.getBankId())
                .bankName(bank.getBankName())
                .bankCode(bank.getBankCode())
                .status(bank.getStatus())
                .statusDescription(bank.getStatus().getDescription())
                .build();
    }
}
