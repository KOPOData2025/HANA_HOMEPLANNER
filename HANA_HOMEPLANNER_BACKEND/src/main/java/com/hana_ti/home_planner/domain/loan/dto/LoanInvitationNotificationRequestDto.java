package com.hana_ti.home_planner.domain.loan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoanInvitationNotificationRequestDto {

    @NotBlank(message = "초대 ID는 필수입니다")
    @Size(max = 36, message = "초대 ID는 36자를 초과할 수 없습니다")
    private String inviteId;

    @NotBlank(message = "수신자 전화번호는 필수입니다")
    @Pattern(regexp = "^01[0-9]-[0-9]{4}-[0-9]{4}$", message = "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)")
    private String phoneNumber;

    public LoanInvitationNotificationRequestDto(String inviteId, String phoneNumber) {
        this.inviteId = inviteId;
        this.phoneNumber = phoneNumber;
    }
}
