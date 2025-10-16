package com.hana_ti.home_planner.domain.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountInvitationResponseDto {

    private String inviteId;
    private String accountId;
    private String inviterId;
    private com.hana_ti.home_planner.domain.bank.entity.AccountInvitation.Role role;
    private com.hana_ti.home_planner.domain.bank.entity.AccountInvitation.InvitationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
