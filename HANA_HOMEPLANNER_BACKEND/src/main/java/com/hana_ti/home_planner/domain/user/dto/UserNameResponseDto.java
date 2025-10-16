package com.hana_ti.home_planner.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNameResponseDto {
    private String userId;
    private String userNm;
    
    public static UserNameResponseDto from(String userId, String userNm) {
        return UserNameResponseDto.builder()
                .userId(userId)
                .userNm(userNm)
                .build();
    }
}
