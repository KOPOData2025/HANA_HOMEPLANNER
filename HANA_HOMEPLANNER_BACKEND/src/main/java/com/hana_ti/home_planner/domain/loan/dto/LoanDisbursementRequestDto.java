package com.hana_ti.home_planner.domain.loan.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class LoanDisbursementRequestDto {

    @NotBlank(message = "대출 계약 ID는 필수입니다")
    @Size(max = 36, message = "대출 계약 ID는 36자를 초과할 수 없습니다")
    private String loanId;

    @NotNull(message = "실행 금액은 필수입니다")
    @DecimalMin(value = "1000", message = "실행 금액은 최소 1,000원 이상이어야 합니다")
    @DecimalMax(value = "1000000000", message = "실행 금액은 최대 1,000,000,000원을 초과할 수 없습니다")
    private BigDecimal amount;

    public LoanDisbursementRequestDto(String loanId, BigDecimal amount) {
        this.loanId = loanId;
        this.amount = amount;
    }
}
