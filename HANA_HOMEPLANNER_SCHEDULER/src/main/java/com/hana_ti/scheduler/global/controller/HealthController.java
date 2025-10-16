package com.hana_ti.scheduler.global.controller;

import com.hana_ti.scheduler.global.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/health")
@Slf4j
public class HealthController {

    /**
     * 헬스체크 ping API
     * Docker 헬스체크 및 서비스 상태 확인용
     */
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> ping() {
        log.debug("헬스체크 ping 요청 수신");
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String message = "Scheduler Service is running - " + timestamp;
        
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    /**
     * 상세 헬스체크 API
     * 서비스 상태 및 의존성 확인용
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<HealthStatus>> status() {
        log.debug("헬스체크 status 요청 수신");
        
        HealthStatus healthStatus = new HealthStatus();
        healthStatus.setStatus("UP");
        healthStatus.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        healthStatus.setService("home-planner-scheduler");
        healthStatus.setVersion("0.0.1-SNAPSHOT");
        
        return ResponseEntity.ok(ApiResponse.success("서비스 상태 확인 완료", healthStatus));
    }

    /**
     * 헬스체크 상태 정보 클래스
     */
    public static class HealthStatus {
        private String status;
        private String timestamp;
        private String service;
        private String version;

        // Getters and Setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getService() { return service; }
        public void setService(String service) { this.service = service; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
    }
}
