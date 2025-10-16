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
public class SmsSendResponseDto {

    private String phoneNumber;
    private String message;
    private boolean success;
    private String status;
    private LocalDateTime sentAt;

    public static SmsSendResponseDto success(String phoneNumber, String message) {
        return SmsSendResponseDto.builder()
                .phoneNumber(phoneNumber)
                .message(message)
                .success(true)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
    }

    public static SmsSendResponseDto failure(String phoneNumber, String message, String errorStatus) {
        return SmsSendResponseDto.builder()
                .phoneNumber(phoneNumber)
                .message(message)
                .success(false)
                .status(errorStatus)
                .sentAt(LocalDateTime.now())
                .build();
    }
}
