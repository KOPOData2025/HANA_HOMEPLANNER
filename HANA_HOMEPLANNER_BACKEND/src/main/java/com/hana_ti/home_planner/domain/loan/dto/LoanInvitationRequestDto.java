package com.hana_ti.home_planner.domain.loan.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoanInvitationRequestDto {

    private String appId;
    private String inviterId;
    private String role;
    private String jointName;
    private String jointPhone;
    private String jointCi;

    public LoanInvitationRequestDto(String appId, String inviterId, String role, 
                                  String jointName, String jointPhone, String jointCi) {
        this.appId = appId;
        this.inviterId = inviterId;
        this.role = role;
        this.jointName = jointName;
        this.jointPhone = jointPhone;
        this.jointCi = jointCi;
    }
}
