package com.hana_ti.home_planner.domain.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JointSavingsInviteCreateRequestDto {
    
    @NotNull(message = "초대ID는 필수입니다")
    @NotBlank(message = "초대ID는 비어있을 수 없습니다")
    private String inviteId;
    
    @NotNull(message = "시작일은 필수입니다")
    @Future(message = "시작일은 미래 날짜여야 합니다")
    private LocalDate startDate;
    
    @NotNull(message = "만기일은 필수입니다")
    @Future(message = "만기일은 미래 날짜여야 합니다")
    private LocalDate endDate;
    
    @NotNull(message = "월납입액은 필수입니다")
    @DecimalMin(value = "0.0", inclusive = false, message = "월납입액은 0보다 커야 합니다")
    private BigDecimal monthlyAmount;
    
    @DecimalMin(value = "0.0", message = "초기입금액은 0 이상이어야 합니다")
    private BigDecimal initialDeposit;
    
    @NotNull(message = "출금계좌번호는 필수입니다")
    @Pattern(regexp = "^[0-9-]+$", message = "출금계좌번호는 숫자와 하이픈(-)만 입력 가능합니다")
    private String sourceAccountNumber;
}
