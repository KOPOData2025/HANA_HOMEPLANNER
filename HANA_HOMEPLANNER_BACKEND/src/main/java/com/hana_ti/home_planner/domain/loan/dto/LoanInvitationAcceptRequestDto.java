package com.hana_ti.home_planner.domain.loan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoanInvitationAcceptRequestDto {

    @NotBlank(message = "공동대출자 CI는 필수입니다")
    @Size(max = 88, message = "CI는 88자를 초과할 수 없습니다")
    private String jointCi;

    public LoanInvitationAcceptRequestDto(String jointCi) {
        this.jointCi = jointCi;
    }
}
