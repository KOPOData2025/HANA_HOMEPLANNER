package com.hana_ti.home_planner.domain.user.controller;

import com.hana_ti.home_planner.domain.user.dto.HouseApplyRequestDto;
import com.hana_ti.home_planner.domain.user.dto.HouseApplyResponseDto;
import com.hana_ti.home_planner.domain.user.service.UserHouseApplyService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/house-apply")
@RequiredArgsConstructor
@Slf4j
public class UserHouseApplyController {
    
    private final UserHouseApplyService userHouseApplyService;
    private final JwtUtil jwtUtil;
    
    /**
     * 주택청약 신청 API
     * POST /api/user/house-apply
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HouseApplyResponseDto>> addHouseApply(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody HouseApplyRequestDto request) {
        
        log.info("주택청약 신청 API 호출 - 주택관리번호: {}", request.getHouseManageNo());
        
        // JWT 토큰에서 사용자 ID 추출
        String jwtToken = authorization.replace("Bearer ", "");
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        
        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
        }
        
        try {
            HouseApplyResponseDto response = userHouseApplyService.addHouseApply(userId, request);
            return ResponseEntity.ok(ApiResponse.success("주택청약 신청 완료", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("주택청약 신청 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("주택청약 신청 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 사용자 신청 목록 조회 API
     * GET /api/user/house-apply
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HouseApplyResponseDto>>> getUserHouseApplies(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        
        log.info("사용자 신청 목록 조회 API 호출");
        
        // JWT 토큰에서 사용자 ID 추출
        String jwtToken = authorization.replace("Bearer ", "");
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        
        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
        }
        
        try {
            List<HouseApplyResponseDto> response = userHouseApplyService.getUserHouseApplies(userId);
            return ResponseEntity.ok(ApiResponse.success("신청 목록 조회 완료", response));
        } catch (Exception e) {
            log.error("신청 목록 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("신청 목록 조회 중 오류가 발생했습니다."));
        }
    }
}
