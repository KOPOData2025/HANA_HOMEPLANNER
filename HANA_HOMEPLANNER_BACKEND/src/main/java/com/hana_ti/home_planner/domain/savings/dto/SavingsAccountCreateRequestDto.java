package com.hana_ti.home_planner.domain.savings.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsAccountCreateRequestDto {

    @NotBlank(message = "상품 ID는 필수입니다")
    @Size(max = 36, message = "상품 ID는 36자를 초과할 수 없습니다")
    private String productId;

    @NotNull(message = "시작일은 필수입니다")
    @FutureOrPresent(message = "시작일은 미래 날짜여야 합니다")
    private LocalDate startDate;

    private LocalDate endDate; // 선택사항

    @NotNull(message = "월 납입액은 필수입니다")
    @DecimalMin(value = "0.01", message = "월 납입액은 0.01원 이상이어야 합니다")
    @DecimalMax(value = "999999999999.99", message = "월 납입액은 999,999,999,999.99원을 초과할 수 없습니다")
    private BigDecimal monthlyAmount;

    @DecimalMin(value = "0.00", message = "초기 입금액은 0원 이상이어야 합니다")
    @DecimalMax(value = "999999999999.99", message = "초기 입금액은 999,999,999,999.99원을 초과할 수 없습니다")
    private BigDecimal initialDeposit; // 선택사항: 초기 입금액

    @Size(max = 36, message = "자동이체 계좌 ID는 36자를 초과할 수 없습니다")
    private String autoDebitAccountId; // 선택사항: 자동이체 계좌 ID

    @Size(max = 50, message = "입출금 계좌번호는 50자를 초과할 수 없습니다")
    private String sourceAccountNumber; // 선택사항: 입출금 계좌번호 (초기 입금 시 사용)
    
    private LocalDate autoDebitDate; // 선택사항: 자동이체 희망일 (YYYY-MM-DD 형식)
}
