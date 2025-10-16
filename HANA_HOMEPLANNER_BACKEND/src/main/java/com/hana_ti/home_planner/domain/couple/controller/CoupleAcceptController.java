package com.hana_ti.home_planner.domain.couple.controller;

import com.hana_ti.home_planner.domain.couple.dto.CoupleAcceptRequestDto;
import com.hana_ti.home_planner.domain.couple.dto.CoupleAcceptResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.CoupleStatusResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.PartnerInfoResponseDto;
import com.hana_ti.home_planner.domain.couple.service.CoupleAcceptService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/couple")
@RequiredArgsConstructor
@Slf4j
public class CoupleAcceptController {

    private final CoupleAcceptService coupleAcceptService;
    private final JwtUtil jwtUtil;

    /**
     * 커플 초대 수락
     * POST /api/couple/accept
     * 
     * @param request 초대 수락 요청 데이터
     * @return 커플 관계 정보
     */
    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<CoupleAcceptResponseDto>> acceptInvite(
            @Valid @RequestBody CoupleAcceptRequestDto request) {
        log.info("커플 초대 수락 API 호출 - 초대 토큰: {}, 수락자 ID: {}", 
                request.getInviteToken(), request.getAcceptorId());

        try {
            // 초대 수락 처리
            CoupleAcceptResponseDto response = coupleAcceptService.acceptInvite(
                    request.getInviteToken(), request.getAcceptorId());
            
            log.info("커플 초대 수락 완료 - 커플 ID: {}, 사용자1: {}, 사용자2: {}", 
                    response.getCoupleId(), response.getUserId1(), response.getUserId2());
            
            return ResponseEntity.ok(ApiResponse.success("커플 초대가 수락되었습니다.", response));
        } catch (IllegalArgumentException e) {
            log.warn("커플 초대 수락 실패 - 초대 토큰: {}, 수락자 ID: {}, 오류: {}", 
                    request.getInviteToken(), request.getAcceptorId(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("커플 초대 수락 중 오류 발생 - 초대 토큰: {}, 수락자 ID: {}", 
                    request.getInviteToken(), request.getAcceptorId(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("커플 초대 수락 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자의 커플 관계 조회
     * GET /api/couple/my-couples
     * 
     * @param authorization JWT 토큰
     * @return 커플 관계 목록
     */
    @GetMapping("/my-couples")
    public ResponseEntity<ApiResponse<List<CoupleAcceptResponseDto>>> getMyCouples(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자 커플 관계 조회 API 호출");

        try {
            // 1. JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
            }

            // 2. 커플 관계 조회
            List<CoupleAcceptResponseDto> couples = coupleAcceptService.getCouplesByUserId(userId);
            
            log.info("사용자 커플 관계 조회 완료 - 사용자 ID: {}, 커플 수: {}", userId, couples.size());
            
            return ResponseEntity.ok(ApiResponse.success("커플 관계 조회가 완료되었습니다.", couples));
        } catch (Exception e) {
            log.error("커플 관계 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("커플 관계 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자의 커플 연동 상태 확인
     * GET /api/couple/status
     * 
     * @param authorization JWT 토큰
     * @return 커플 연동 상태 정보
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<CoupleStatusResponseDto>> checkCoupleStatus(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자 커플 연동 상태 확인 API 호출");

        try {
            // 1. JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
            }

            // 2. 커플 연동 상태 확인
            CoupleStatusResponseDto status = coupleAcceptService.checkCoupleStatus(userId);
            
            log.info("사용자 커플 연동 상태 확인 완료 - 사용자 ID: {}, 연동 여부: {}", 
                    userId, status.isHasCouple());
            
            return ResponseEntity.ok(ApiResponse.success("커플 연동 상태 조회가 완료되었습니다.", status));
        } catch (Exception e) {
            log.error("커플 연동 상태 확인 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("커플 연동 상태 확인 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 파트너 정보 조회
     * GET /api/couple/partner/{partnerUserId}
     * 
     * @param partnerUserId 파트너 사용자 ID
     * @param authorization JWT 토큰
     * @return 파트너 정보
     */
    @GetMapping("/partner/{partnerUserId}")
    public ResponseEntity<ApiResponse<PartnerInfoResponseDto>> getPartnerInfo(
            @PathVariable String partnerUserId,
            @RequestHeader("Authorization") String authorization) {
        log.info("파트너 정보 조회 API 호출 - 파트너 ID: {}", partnerUserId);

        try {
            // 1. JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
            }

            // 2. 파트너 정보 조회
            PartnerInfoResponseDto partnerInfo = coupleAcceptService.getPartnerInfo(userId, partnerUserId);
            
            log.info("파트너 정보 조회 완료 - 사용자 ID: {}, 파트너 ID: {}, 파트너 이름: {}", 
                    userId, partnerUserId, partnerInfo.getPartnerName());
            
            return ResponseEntity.ok(ApiResponse.success("파트너 정보 조회가 완료되었습니다.", partnerInfo));
        } catch (Exception e) {
            log.error("파트너 정보 조회 중 오류 발생 - 파트너 ID: {}", partnerUserId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("파트너 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
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
