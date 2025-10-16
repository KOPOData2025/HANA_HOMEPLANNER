package com.hana_ti.home_planner.domain.my_data.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalUserResponseDto {
    private Long userId;
    private String name;
    private String ci;
    private String birthDate;
    private String phone;
    private String createdAt; // LocalDateTime 대신 String으로 받음
}
