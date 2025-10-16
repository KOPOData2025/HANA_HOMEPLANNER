package com.hana_ti.scheduler.domain.loan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class LoanPaymentTestRequestDto {

    @NotNull(message = "대상일은 필수입니다")
    private LocalDate targetDate;

    public LoanPaymentTestRequestDto(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
}
