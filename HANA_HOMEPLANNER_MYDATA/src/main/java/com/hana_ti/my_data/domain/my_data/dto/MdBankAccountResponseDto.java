package com.hana_ti.my_data.domain.my_data.dto;

import com.hana_ti.my_data.domain.my_data.entity.MdBankAccount;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MdBankAccountResponseDto {

    private Long accountId;
    private Long userId;
    private String orgCode;
    private String accountNum;
    private String accountType;
    private String accountName;
    private BigDecimal balanceAmt;
    private String status;
    private LocalDate openedDate;
    private String consentYn;
    private LocalDateTime createdAt;

    public static MdBankAccountResponseDto from(MdBankAccount mdBankAccount) {
        return MdBankAccountResponseDto.builder()
                .accountId(mdBankAccount.getAccountId())
                .userId(mdBankAccount.getUserId())
                .orgCode(mdBankAccount.getOrgCode())
                .accountNum(mdBankAccount.getAccountNum())
                .accountType(mdBankAccount.getAccountType())
                .accountName(mdBankAccount.getAccountName())
                .balanceAmt(mdBankAccount.getBalanceAmt())
                .status(mdBankAccount.getStatus())
                .openedDate(mdBankAccount.getOpenedDate())
                .consentYn(mdBankAccount.getConsentYn())
                .createdAt(mdBankAccount.getCreatedAt())
                .build();
    }
}
