package com.hana_ti.home_planner.domain.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsMaturityPayoutRequestDto {

    @NotNull(message = "지급받을 계좌번호는 필수입니다")
    @NotBlank(message = "지급받을 계좌번호는 비어있을 수 없습니다")
    @Pattern(regexp = "^[0-9-]+$", message = "계좌번호는 숫자와 하이픈(-)만 입력 가능합니다")
    private String targetAccountNumber;
}
