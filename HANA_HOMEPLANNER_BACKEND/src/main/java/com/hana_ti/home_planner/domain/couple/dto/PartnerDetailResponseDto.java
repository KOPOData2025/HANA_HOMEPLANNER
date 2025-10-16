package com.hana_ti.home_planner.domain.couple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerDetailResponseDto {

    private String partnerUserId;
    private String name;           // 성명
    private String phoneNumber;   // 휴대폰번호
    private String email;         // 이메일
    private String coupleId;
    private String coupleStatus;

    public static PartnerDetailResponseDto of(String partnerUserId, String name, 
                                             String phoneNumber, String email, String coupleId, String coupleStatus) {
        return PartnerDetailResponseDto.builder()
                .partnerUserId(partnerUserId)
                .name(name)
                .phoneNumber(phoneNumber)
                .email(email)
                .coupleId(coupleId)
                .coupleStatus(coupleStatus)
                .build();
    }
}
