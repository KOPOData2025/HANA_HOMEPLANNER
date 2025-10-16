package com.hana_ti.home_planner.global.common.controller;

import com.hana_ti.home_planner.global.common.dto.HealthCheckResponseDto;
import com.hana_ti.home_planner.global.common.service.HealthCheckService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthCheckController {

    private final HealthCheckService healthCheckService;

    /**
     * 서버 헬스체크
     * GET /api/health/server
     */
    @GetMapping("/server")
    public ResponseEntity<ApiResponse<HealthCheckResponseDto>> checkServerHealth() {
        log.info("서버 헬스체크 API 호출");
        
        HealthCheckResponseDto response = healthCheckService.checkServerHealth();
        
        if ("UP".equals(response.getStatus())) {
            log.info("서버 헬스체크 API 응답 성공");
            return ResponseEntity.ok(ApiResponse.success("서버 상태 확인 완료", response));
        } else {
            log.warn("서버 헬스체크 API 응답 실패");
            return ResponseEntity.status(503).body(ApiResponse.error("서버 상태 확인 실패"));
        }
    }

    /**
     * 데이터베이스 헬스체크
     * GET /api/health/database
     */
    @GetMapping("/database")
    public ResponseEntity<ApiResponse<HealthCheckResponseDto>> checkDatabaseHealth() {
        log.info("데이터베이스 헬스체크 API 호출");
        
        HealthCheckResponseDto response = healthCheckService.checkDatabaseHealth();
        
        if ("UP".equals(response.getStatus())) {
            log.info("데이터베이스 헬스체크 API 응답 성공");
            return ResponseEntity.ok(ApiResponse.success("데이터베이스 연결 상태 확인 완료", response));
        } else {
            log.error("데이터베이스 헬스체크 API 응답 실패");
            return ResponseEntity.status(503).body(ApiResponse.error("데이터베이스 연결 실패"));
        }
    }

    /**
     * 전체 시스템 헬스체크
     * GET /api/health/system
     */
    @GetMapping("/system")
    public ResponseEntity<ApiResponse<HealthCheckResponseDto>> checkOverallHealth() {
        log.info("전체 시스템 헬스체크 API 호출");
        
        HealthCheckResponseDto response = healthCheckService.checkOverallHealth();
        
        if ("UP".equals(response.getStatus())) {
            log.info("전체 시스템 헬스체크 API 응답 성공");
            return ResponseEntity.ok(ApiResponse.success("전체 시스템 상태 확인 완료", response));
        } else {
            log.warn("전체 시스템 헬스체크 API 응답 부분 실패");
            return ResponseEntity.status(503).body(ApiResponse.error("시스템 일부 구성요소에 문제 발생"));
        }
    }

    /**
     * 간단한 상태 확인 (Ping)
     * GET /api/health/ping
     */
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<HealthCheckResponseDto>> ping() {
        log.info("Ping API 호출");
        
        HealthCheckResponseDto response = HealthCheckResponseDto.simple("UP", "pong");
        
        log.info("Ping API 응답 성공");
        return ResponseEntity.ok(ApiResponse.success("Ping 테스트 성공", response));
    }

    /**
     * 기본 헬스체크 (전체 시스템 상태)
     * GET /api/health
     */
    @GetMapping
    public ResponseEntity<ApiResponse<HealthCheckResponseDto>> checkHealth() {
        log.info("기본 헬스체크 API 호출");
        return checkOverallHealth();
    }
}