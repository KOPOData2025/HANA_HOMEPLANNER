package com.hana_ti.home_planner.domain.bank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountInvitationResponseRequestDto {

    @NotBlank(message = "초대 ID는 필수입니다")
    @Size(max = 36, message = "초대 ID는 36자를 초과할 수 없습니다")
    private String inviteId;

    @NotNull(message = "응답 상태는 필수입니다")
    private com.hana_ti.home_planner.domain.bank.entity.AccountInvitation.InvitationStatus status;
}
