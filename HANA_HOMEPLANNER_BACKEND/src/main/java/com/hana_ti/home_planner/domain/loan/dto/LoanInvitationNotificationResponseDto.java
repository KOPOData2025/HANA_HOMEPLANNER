package com.hana_ti.home_planner.domain.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanInvitationNotificationResponseDto {

    private String inviteId;
    private String phoneNumber;
    private String message;
    private String registrationLink;
    private boolean success;
    private String status;
    private LocalDateTime sentAt;

    public static LoanInvitationNotificationResponseDto success(String inviteId, String phoneNumber, 
                                                               String message, String registrationLink) {
        return LoanInvitationNotificationResponseDto.builder()
                .inviteId(inviteId)
                .phoneNumber(phoneNumber)
                .message(message)
                .registrationLink(registrationLink)
                .success(true)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
    }

    public static LoanInvitationNotificationResponseDto failure(String inviteId, String phoneNumber, 
                                                               String errorStatus, String errorMessage) {
        return LoanInvitationNotificationResponseDto.builder()
                .inviteId(inviteId)
                .phoneNumber(phoneNumber)
                .success(false)
                .status(errorStatus)
                .sentAt(LocalDateTime.now())
                .build();
    }
}
