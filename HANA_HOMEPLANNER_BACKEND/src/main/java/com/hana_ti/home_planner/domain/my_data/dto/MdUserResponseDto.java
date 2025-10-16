package com.hana_ti.home_planner.domain.my_data.dto;

import com.hana_ti.home_planner.domain.my_data.entity.MdUser;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MdUserResponseDto {

    private Long userId;
    private String name;
    private String ci;
    private LocalDate birthDate;
    private String phone;
    private LocalDateTime createdAt;

    public static MdUserResponseDto from(MdUser mdUser) {
        return MdUserResponseDto.builder()
                .userId(mdUser.getUserId())
                .name(mdUser.getName())
                .ci(mdUser.getCi())
                .birthDate(mdUser.getBirthDate())
                .phone(mdUser.getPhone())
                .createdAt(mdUser.getCreatedAt())
                .build();
    }
}
