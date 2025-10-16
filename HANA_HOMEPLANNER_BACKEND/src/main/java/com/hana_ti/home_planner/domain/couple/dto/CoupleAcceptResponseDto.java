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
public class CoupleAcceptResponseDto {

    private String coupleId;
    private String userId1;
    private String userId2;
    private String status;
    private LocalDateTime createdAt;

    /**
     * 엔티티로부터 DTO 생성
     */
    public static CoupleAcceptResponseDto from(com.hana_ti.home_planner.domain.couple.entity.Couple couple) {
        return CoupleAcceptResponseDto.builder()
                .coupleId(couple.getCoupleId())
                .userId1(couple.getUserId1())
                .userId2(couple.getUserId2())
                .status(couple.getStatus().name())
                .createdAt(couple.getCreatedAt())
                .build();
    }
}
