package com.hana_ti.home_planner.domain.couple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerInfoResponseDto {

    private String partnerUserId;        // 파트너 사용자 ID
    private String partnerEmail;         // 파트너 이메일
    private String partnerName;          // 파트너 이름
    private String partnerPhoneNumber;   // 파트너 전화번호
    private String partnerUserType;      // 파트너 사용자 타입
    private String coupleId;             // 커플 ID
    private String coupleStatus;         // 커플 상태
    private LocalDateTime coupleCreatedAt; // 커플 관계 생성일
    private String message;              // 응답 메시지

    /**
     * 파트너 정보가 없는 경우의 응답 생성
     */
    public static PartnerInfoResponseDto noPartner() {
        return PartnerInfoResponseDto.builder()
                .message("연동된 파트너가 없습니다.")
                .build();
    }

    /**
     * 파트너 정보가 있는 경우의 응답 생성
     */
    public static PartnerInfoResponseDto withPartner(String partnerUserId, String partnerEmail, 
                                                   String partnerName, String partnerPhoneNumber,
                                                   String partnerUserType, String coupleId,
                                                   String coupleStatus, LocalDateTime coupleCreatedAt) {
        return PartnerInfoResponseDto.builder()
                .partnerUserId(partnerUserId)
                .partnerEmail(partnerEmail)
                .partnerName(partnerName)
                .partnerPhoneNumber(partnerPhoneNumber)
                .partnerUserType(partnerUserType)
                .coupleId(coupleId)
                .coupleStatus(coupleStatus)
                .coupleCreatedAt(coupleCreatedAt)
                .message("파트너 정보 조회가 완료되었습니다.")
                .build();
    }
}
