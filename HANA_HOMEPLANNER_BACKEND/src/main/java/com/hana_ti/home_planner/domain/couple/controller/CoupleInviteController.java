package com.hana_ti.home_planner.domain.couple.controller;

import com.hana_ti.home_planner.domain.couple.dto.CoupleInviteDetailResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.CoupleInviteResponseDto;
import com.hana_ti.home_planner.domain.couple.service.CoupleInviteService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/couple")
@RequiredArgsConstructor
@Slf4j
public class CoupleInviteController {

    private final CoupleInviteService coupleInviteService;
    private final JwtUtil jwtUtil;

    /**
     * 커플 초대 링크 생성
     * POST /api/couple/invite
     * 
     * @param authorization JWT 토큰
     * @return 초대 토큰과 URL
     */
    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<CoupleInviteResponseDto>> createInvite(
            @RequestHeader("Authorization") String authorization) {
        log.info("커플 초대 링크 생성 API 호출");

        try {
            // 1. JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
            }

            // 2. 초대 링크 생성
            CoupleInviteResponseDto response = coupleInviteService.createInvite(userId);
            
            log.info("커플 초대 링크 생성 완료 - 사용자 ID: {}, 초대 토큰: {}", userId, response.getInviteToken());
            
            return ResponseEntity.ok(ApiResponse.success("초대 링크가 생성되었습니다.", response));
        } catch (Exception e) {
            log.error("커플 초대 링크 생성 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("초대 링크 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * inviteId로 커플 초대 조회 API
     * GET /api/couple/invitations/{inviteId}
     */
    @GetMapping("/invitations/{inviteId}")
    public ResponseEntity<ApiResponse<CoupleInviteDetailResponseDto>> getCoupleInviteById(
            @PathVariable String inviteId) {
        log.info("초대 ID로 커플 초대 조회 API 호출 - 초대ID: {}", inviteId);
        
        try {
            CoupleInviteDetailResponseDto invitation = coupleInviteService.getCoupleInviteById(inviteId);
            
            log.info("초대 ID로 커플 초대 조회 완료 - 초대ID: {}, 상태: {}", invitation.getInviteId(), invitation.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("커플 초대 정보 조회가 완료되었습니다", invitation));
        } catch (Exception e) {
            log.error("초대 ID로 커플 초대 조회 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("커플 초대 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    private String extractUserIdFromToken(String authorization) {
        try {
            String jwtToken = authorization.replace("Bearer ", "");
            String userIdStr = jwtUtil.getUserIdFromToken(jwtToken);
            
            if (userIdStr == null) {
                return null;
            }
            
            // 사용자 ID가 "USER000003" 형태인 경우 그대로 반환
            // User 테이블의 userId는 String 타입이므로 변환하지 않음
            return userIdStr;
        } catch (Exception e) {
            log.error("JWT 토큰에서 사용자 ID 추출 실패", e);
            return null;
        }
    }
}
