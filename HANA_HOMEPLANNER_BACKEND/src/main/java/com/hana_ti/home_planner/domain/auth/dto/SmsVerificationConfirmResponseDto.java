package com.hana_ti.home_planner.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmsVerificationConfirmResponseDto {

    private String phoneNumber;
    private String name;
    private String ci;
    private boolean success;
    private String status;
    private LocalDateTime verifiedAt;
    private String message;

    public static SmsVerificationConfirmResponseDto success(String phoneNumber, String name, String ci) {
        return SmsVerificationConfirmResponseDto.builder()
                .phoneNumber(phoneNumber)
                .name(name)
                .ci(ci)
                .success(true)
                .status("VERIFIED")
                .verifiedAt(LocalDateTime.now())
                .message("인증번호가 확인되었습니다.")
                .build();
    }

    public static SmsVerificationConfirmResponseDto failure(String phoneNumber, String errorStatus, String errorMessage) {
        return SmsVerificationConfirmResponseDto.builder()
                .phoneNumber(phoneNumber)
                .success(false)
                .status(errorStatus)
                .verifiedAt(LocalDateTime.now())
                .message(errorMessage)
                .build();
    }
}
