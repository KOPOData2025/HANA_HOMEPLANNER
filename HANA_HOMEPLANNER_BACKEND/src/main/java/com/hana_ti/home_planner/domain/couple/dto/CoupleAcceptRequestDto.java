package com.hana_ti.home_planner.domain.couple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoupleAcceptRequestDto {

    @NotBlank(message = "초대 토큰은 필수입니다.")
    private String inviteToken;

    @NotBlank(message = "수락자 ID는 필수입니다.")
    private String acceptorId;
}
