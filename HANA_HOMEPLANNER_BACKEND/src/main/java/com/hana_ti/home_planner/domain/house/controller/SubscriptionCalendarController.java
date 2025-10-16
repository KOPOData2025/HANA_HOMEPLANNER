package com.hana_ti.home_planner.domain.house.controller;

import com.hana_ti.home_planner.domain.house.dto.SubscriptionCalendarResponseDto;
import com.hana_ti.home_planner.domain.house.service.SubscriptionCalendarService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/house/subscription")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionCalendarController {

    private final SubscriptionCalendarService subscriptionCalendarService;

    /**
     * 청약 캘린더 조회 (전체)
     * GET /api/house/subscription/calendar
     */
    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<SubscriptionCalendarResponseDto>> getSubscriptionCalendar() {
        log.info("청약 캘린더 조회 API 호출 - 전체");
        
        SubscriptionCalendarResponseDto calendar = subscriptionCalendarService.getSubscriptionCalendar(null);
        
        log.info("청약 캘린더 조회 완료 - 필터링된 데이터: {}건", calendar.getFilteredCount());
        
        return ResponseEntity.ok(ApiResponse.success("청약 캘린더 조회 완료", calendar));
    }

    /**
     * 입력받은 날짜 범위 내 청약 정보 조회
     * GET /api/house/subscription/date-range?startDate=2025-01-01&endDate=2025-01-31
     * 
     * @param startDate 조회 시작일 (yyyy-MM-dd)
     * @param endDate 조회 종료일 (yyyy-MM-dd)
     */
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<SubscriptionCalendarResponseDto>> getSubscriptionByDateRange(
            @RequestParam(name = "startDate") String startDate,
            @RequestParam(name = "endDate") String endDate) {
        log.info("날짜 범위 청약 정보 조회 API 호출 - 시작일: {}, 종료일: {}", startDate, endDate);
        
        SubscriptionCalendarResponseDto calendar = subscriptionCalendarService.getSubscriptionByDateRange(startDate, endDate);
        
        log.info("날짜 범위 청약 정보 조회 완료 - 조회된 데이터: {}건", calendar.getTotalCount());
        
        return ResponseEntity.ok(ApiResponse.success("날짜 범위 청약 정보 조회 완료", calendar));
    }

    /**
     * API 키 유효성 검증
     * GET /api/house/subscription/validate-api
     */
    @GetMapping("/validate-api")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateApiKey() {
        log.info("API 키 유효성 검증 API 호출");
        
        boolean isValid = subscriptionCalendarService.validateApiKey();
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("message", isValid ? "API 키가 유효합니다." : "API 키가 유효하지 않습니다.");
        
        log.info("API 키 유효성 검증 완료 - 유효: {}", isValid);
        
        return ResponseEntity.ok(ApiResponse.success("API 키 유효성 검증 완료", response));
    }
}