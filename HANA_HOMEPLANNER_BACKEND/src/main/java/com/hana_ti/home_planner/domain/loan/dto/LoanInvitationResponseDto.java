package com.hana_ti.home_planner.domain.loan.dto;

import com.hana_ti.home_planner.domain.loan.entity.LoanInvitation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LoanInvitationResponseDto {

    private String inviteId;
    private String appId;
    private String inviterId;
    private String role;
    private String roleDescription;
    private String status;
    private String statusDescription;
    private LocalDateTime createdAt;
    private LocalDateTime responseAt;
    private String jointName;
    private String jointPhone;
    private String jointCi;

    /**
     * LoanInvitation 엔티티를 ResponseDto로 변환
     */
    public static LoanInvitationResponseDto from(LoanInvitation invitation) {
        return LoanInvitationResponseDto.builder()
                .inviteId(invitation.getInviteId())
                .appId(invitation.getAppId())
                .inviterId(invitation.getInviterId())
                .role(invitation.getRole().name())
                .roleDescription(invitation.getRole().getDescription())
                .status(invitation.getStatus().name())
                .statusDescription(invitation.getStatus().getDescription())
                .createdAt(invitation.getCreatedAt())
                .responseAt(invitation.getResponseAt())
                .jointName(invitation.getJointName())
                .jointPhone(invitation.getJointPhone())
                .jointCi(invitation.getJointCi())
                .build();
    }
}
