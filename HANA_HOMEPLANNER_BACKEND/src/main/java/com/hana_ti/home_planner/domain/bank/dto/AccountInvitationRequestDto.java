package com.hana_ti.home_planner.domain.bank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountInvitationRequestDto {

    @NotBlank(message = "계좌번호는 필수입니다")
    @Size(max = 50, message = "계좌번호는 50자를 초과할 수 없습니다")
    private String accountNumber;
}
