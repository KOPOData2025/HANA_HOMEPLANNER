package com.hana_ti.scheduler.domain.savings.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsPaymentRequestDto {

    @NotNull(message = "처리 날짜는 필수입니다")
    private LocalDate processDate;
}
