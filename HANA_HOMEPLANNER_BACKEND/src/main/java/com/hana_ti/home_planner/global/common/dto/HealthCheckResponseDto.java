package com.hana_ti.home_planner.global.common.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class HealthCheckResponseDto {

    private String status;
    private String message;
    private LocalDateTime timestamp;
    private String version;
    private Map<String, Object> details;

    public static HealthCheckResponseDto success(String message, Map<String, Object> details) {
        return HealthCheckResponseDto.builder()
                .status("UP")
                .message(message)
                .timestamp(LocalDateTime.now())
                .version("1.0.0")
                .details(details)
                .build();
    }

    public static HealthCheckResponseDto failure(String message, Map<String, Object> details) {
        return HealthCheckResponseDto.builder()
                .status("DOWN")
                .message(message)
                .timestamp(LocalDateTime.now())
                .version("1.0.0")
                .details(details)
                .build();
    }

    public static HealthCheckResponseDto simple(String status, String message) {
        return HealthCheckResponseDto.builder()
                .status(status)
                .message(message)
                .timestamp(LocalDateTime.now())
                .version("1.0.0")
                .build();
    }
}