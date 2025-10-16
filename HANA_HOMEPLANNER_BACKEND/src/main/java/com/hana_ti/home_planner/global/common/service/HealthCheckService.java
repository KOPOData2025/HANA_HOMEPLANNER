package com.hana_ti.home_planner.global.common.service;

import com.hana_ti.home_planner.global.common.dto.HealthCheckResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthCheckService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.application.name}")
    private String applicationName;

    /**
     * 서버 헬스체크
     */
    public HealthCheckResponseDto checkServerHealth() {
        log.info("서버 헬스체크 요청");

        try {
            Map<String, Object> details = new HashMap<>();
            details.put("application", applicationName);
            details.put("server_time", LocalDateTime.now());
            details.put("java_version", System.getProperty("java.version"));
            details.put("os_name", System.getProperty("os.name"));
            details.put("available_processors", Runtime.getRuntime().availableProcessors());
            
            // 메모리 정보
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            Map<String, Object> memoryInfo = new HashMap<>();
            memoryInfo.put("total_mb", totalMemory / (1024 * 1024));
            memoryInfo.put("used_mb", usedMemory / (1024 * 1024));
            memoryInfo.put("free_mb", freeMemory / (1024 * 1024));
            memoryInfo.put("usage_percent", Math.round((double) usedMemory / totalMemory * 100));
            
            details.put("memory", memoryInfo);

            log.info("서버 헬스체크 성공");
            return HealthCheckResponseDto.success("서버가 정상적으로 동작 중입니다.", details);

        } catch (Exception e) {
            log.error("서버 헬스체크 실패", e);
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("error", e.getMessage());
            return HealthCheckResponseDto.failure("서버 헬스체크 실패", errorDetails);
        }
    }

    /**
     * 데이터베이스 헬스체크
     */
    public HealthCheckResponseDto checkDatabaseHealth() {
        log.info("데이터베이스 헬스체크 요청");

        try {
            // Oracle DB 연결 테스트
            String result = jdbcTemplate.queryForObject("SELECT 'DB_CONNECTION_OK' FROM DUAL", String.class);
            
            // DB 버전 정보 조회
            String dbVersion = jdbcTemplate.queryForObject("SELECT BANNER FROM V$VERSION WHERE ROWNUM = 1", String.class);
            
            // 현재 세션 정보
            String currentUser = jdbcTemplate.queryForObject("SELECT USER FROM DUAL", String.class);
            String currentTime = jdbcTemplate.queryForObject("SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL", String.class);

            Map<String, Object> details = new HashMap<>();
            details.put("connection_test", result);
            details.put("database_version", dbVersion);
            details.put("current_user", currentUser);
            details.put("database_time", currentTime);
            details.put("database_type", "Oracle");

            // 테이블 존재 확인 (avg_home_price 테이블)
            try {
                Integer tableCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM USER_TABLES WHERE TABLE_NAME = 'AVG_HOME_PRICE'", 
                    Integer.class
                );
                details.put("avg_home_price_table_exists", tableCount > 0);
                
                if (tableCount > 0) {
                    Integer recordCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM AVG_HOME_PRICE WHERE ROWNUM <= 10", 
                        Integer.class
                    );
                    details.put("sample_record_count", recordCount);
                }
            } catch (Exception tableCheckError) {
                details.put("table_check_error", tableCheckError.getMessage());
            }

            log.info("데이터베이스 헬스체크 성공");
            return HealthCheckResponseDto.success("데이터베이스가 정상적으로 연결되었습니다.", details);

        } catch (Exception e) {
            log.error("데이터베이스 헬스체크 실패", e);
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("error", e.getMessage());
            errorDetails.put("error_type", e.getClass().getSimpleName());
            return HealthCheckResponseDto.failure("데이터베이스 연결 실패", errorDetails);
        }
    }

    /**
     * 전체 시스템 헬스체크
     */
    public HealthCheckResponseDto checkOverallHealth() {
        log.info("전체 시스템 헬스체크 요청");

        try {
            HealthCheckResponseDto serverHealth = checkServerHealth();
            HealthCheckResponseDto dbHealth = checkDatabaseHealth();

            Map<String, Object> details = new HashMap<>();
            details.put("server", serverHealth);
            details.put("database", dbHealth);

            boolean isHealthy = "UP".equals(serverHealth.getStatus()) && "UP".equals(dbHealth.getStatus());
            
            if (isHealthy) {
                log.info("전체 시스템 헬스체크 성공");
                return HealthCheckResponseDto.success("전체 시스템이 정상적으로 동작 중입니다.", details);
            } else {
                log.warn("전체 시스템 헬스체크 부분 실패");
                return HealthCheckResponseDto.failure("일부 시스템에 문제가 있습니다.", details);
            }

        } catch (Exception e) {
            log.error("전체 시스템 헬스체크 실패", e);
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("error", e.getMessage());
            return HealthCheckResponseDto.failure("시스템 헬스체크 실패", errorDetails);
        }
    }
}