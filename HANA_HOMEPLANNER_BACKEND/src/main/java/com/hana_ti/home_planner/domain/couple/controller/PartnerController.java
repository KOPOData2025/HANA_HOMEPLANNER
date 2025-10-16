package com.hana_ti.home_planner.domain.couple.controller;

import com.hana_ti.home_planner.domain.couple.dto.PartnerDetailResponseDto;
import com.hana_ti.home_planner.domain.couple.service.CoupleAcceptService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/couple")
@RequiredArgsConstructor
@Slf4j
public class PartnerController {

    private final CoupleAcceptService coupleAcceptService;
    private final JwtUtil jwtUtil;

    /**
     * 파트너 상세 정보 조회 (성명, 휴대폰번호, 이메일)
     * GET /api/couple/partner/detail
     */
    @GetMapping("/partner/detail")
    public ResponseEntity<ApiResponse<PartnerDetailResponseDto>> getPartnerDetail(
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("파트너 상세 정보 조회 API 호출 - 사용자ID: {}", userId);
        
        try {
            PartnerDetailResponseDto response = coupleAcceptService.getPartnerDetail(userId);
            
            log.info("파트너 상세 정보 조회 완료 - 파트너ID: {}, 이름: {}", 
                    response.getPartnerUserId(), response.getName());
            
            return ResponseEntity.ok(ApiResponse.success("파트너 상세 정보 조회가 완료되었습니다", response));
        } catch (Exception e) {
            log.error("파트너 상세 정보 조회 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파트너 상세 정보 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */ 
    private String getUserIdFromToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("인증 토큰이 필요합니다");
        }
        
        String token = authorization.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
}
