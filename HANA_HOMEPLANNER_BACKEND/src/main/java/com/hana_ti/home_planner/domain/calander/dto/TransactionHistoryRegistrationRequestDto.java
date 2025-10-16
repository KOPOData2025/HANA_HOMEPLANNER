package com.hana_ti.home_planner.domain.calander.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionHistoryRegistrationRequestDto {
    private String accountId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    @Builder.Default
    private boolean includeAllTransactions = true;
}
