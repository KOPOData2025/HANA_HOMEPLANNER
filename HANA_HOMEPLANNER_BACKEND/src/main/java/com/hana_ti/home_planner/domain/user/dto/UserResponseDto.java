package com.hana_ti.home_planner.domain.user.dto;

import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.entity.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private String userId;
    private String email;
    private String userNm;
    private String phnNum;
    private UserType userTyp;
    private LocalDateTime updAt;
    private String addrId;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .userNm(user.getUserNm())
                .phnNum(user.getPhnNum())
                .userTyp(user.getUserTyp())
                .updAt(user.getUpdAt())
                .addrId(user.getAddress().getAddrId())
                .build();
    }
}