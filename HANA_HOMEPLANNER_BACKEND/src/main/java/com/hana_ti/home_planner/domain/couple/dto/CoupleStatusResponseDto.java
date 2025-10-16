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
public class CoupleStatusResponseDto {

    private boolean hasCouple;           // 커플 연동 여부
    private String coupleId;             // 커플 ID (연동된 경우)
    private String partnerUserId;        // 상대방 사용자 ID (연동된 경우)
    private String status;               // 커플 상태 (ACTIVE, INACTIVE, DELETED)
    private LocalDateTime createdAt;     // 커플 관계 생성일 (연동된 경우)
    private String message;              // 상태 메시지

    /**
     * 커플이 연동되지 않은 경우의 응답 생성
     */
    public static CoupleStatusResponseDto noCouple() {
        return CoupleStatusResponseDto.builder()
                .hasCouple(false)
                .message("연동된 커플이 없습니다.")
                .build();
    }

    /**
     * 커플이 연동된 경우의 응답 생성
     */
    public static CoupleStatusResponseDto hasCouple(String coupleId, String partnerUserId, 
                                                   String status, LocalDateTime createdAt) {
        return CoupleStatusResponseDto.builder()
                .hasCouple(true)
                .coupleId(coupleId)
                .partnerUserId(partnerUserId)
                .status(status)
                .createdAt(createdAt)
                .message("연동된 커플이 있습니다.")
                .build();
    }
}
