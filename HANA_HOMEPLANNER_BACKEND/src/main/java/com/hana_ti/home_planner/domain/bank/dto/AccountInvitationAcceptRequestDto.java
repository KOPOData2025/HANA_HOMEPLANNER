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
public class AccountInvitationAcceptRequestDto {

    @NotBlank(message = "초대 ID는 필수입니다")
    @Size(max = 36, message = "초대 ID는 36자를 초과할 수 없습니다")
    private String inviteId;
}
