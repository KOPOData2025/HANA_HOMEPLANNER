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
public class SmsVerificationResponseDto {

    private String phoneNumber;
    private boolean success;
    private String status;
    private LocalDateTime sentAt;
    private String message;

    public static SmsVerificationResponseDto success(String phoneNumber) {
        return SmsVerificationResponseDto.builder()
                .phoneNumber(phoneNumber)
                .success(true)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .message("인증번호가 발송되었습니다.")
                .build();
    }

    public static SmsVerificationResponseDto failure(String phoneNumber, String errorStatus, String errorMessage) {
        return SmsVerificationResponseDto.builder()
                .phoneNumber(phoneNumber)
                .success(false)
                .status(errorStatus)
                .sentAt(LocalDateTime.now())
                .message(errorMessage)
                .build();
    }
}
