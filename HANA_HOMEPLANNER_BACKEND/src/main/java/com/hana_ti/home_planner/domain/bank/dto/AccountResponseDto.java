package com.hana_ti.home_planner.domain.bank.dto;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class AccountResponseDto {

    private String accountId;
    private String userId;
    private String productId;
    private String accountNum;
    private String accountType;
    private String accountTypeDescription;
    private BigDecimal balance;
    private String status;
    private String statusDescription;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    /**
     * Account 엔티티를 AccountResponseDto로 변환
     */
    public static AccountResponseDto from(Account account) {
        return AccountResponseDto.builder()
                .accountId(account.getAccountId())
                .userId(account.getUserId())
                .productId(account.getProductId())
                .accountNum(account.getAccountNum())
                .accountType(account.getAccountType() != null ? account.getAccountType().name() : null)
                .accountTypeDescription(account.getAccountType() != null ? account.getAccountType().getDescription() : null)
                .balance(account.getBalance())
                .status(account.getStatus() != null ? account.getStatus().name() : null)
                .statusDescription(account.getStatus() != null ? account.getStatus().getDescription() : null)
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
