package com.hana_ti.home_planner.domain.bank.controller;

import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationRequestDto;
import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationAcceptRequestDto;
import com.hana_ti.home_planner.domain.bank.service.AccountInvitationService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank/invitations")
@RequiredArgsConstructor
@Slf4j
public class AccountInvitationController {

    private final AccountInvitationService accountInvitationService;
    private final JwtUtil jwtUtil;

    /**
     * 공동 적금 초대 생성
     * POST /api/bank/invitations
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AccountInvitationResponseDto>> createInvitation(
            @Valid @RequestBody AccountInvitationRequestDto request,
            HttpServletRequest httpRequest) {
        
        String inviterId = getUserIdFromToken(httpRequest);
        log.info("공동 적금 초대 생성 API 호출 - 초대자ID: {}, 계좌번호: {}", 
                inviterId, request.getAccountNumber());
        
        try {
            AccountInvitationResponseDto response = accountInvitationService.createInvitation(inviterId, request);
            
            log.info("공동 적금 초대 생성 완료 - 초대ID: {}, 상태: {}", 
                    response.getInviteId(), response.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("초대가 생성되었습니다", response));
        } catch (Exception e) {
            log.error("공동 적금 초대 생성 중 오류 발생 - 초대자ID: {}", inviterId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 생성에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 수락 (기존 방식)
     * PUT /api/bank/invitations/{inviteId}/accept
     */
    @PutMapping("/{inviteId}/accept")
    public ResponseEntity<ApiResponse<AccountInvitationResponseDto>> acceptInvitation(
            @PathVariable String inviteId,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("초대 수락 API 호출 - 사용자ID: {}, 초대ID: {}", userId, inviteId);
        
        try {
            AccountInvitationResponseDto response = accountInvitationService.acceptInvitation(inviteId, userId);
            
            log.info("초대 수락 완료 - 초대ID: {}, 상태: {}", 
                    response.getInviteId(), response.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("초대가 수락되었습니다", response));
        } catch (Exception e) {
            log.error("초대 수락 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 수락에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 수락 (요청 DTO 사용)
     * POST /api/bank/invitations/accept
     */
    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<AccountInvitationResponseDto>> acceptInvitationWithRequest(
            @Valid @RequestBody AccountInvitationAcceptRequestDto request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("초대 수락 API 호출 - 사용자ID: {}, 초대ID: {}", userId, request.getInviteId());
        
        try {
            AccountInvitationResponseDto response = accountInvitationService.acceptInvitationWithRequest(userId, request);
            
            log.info("초대 수락 완료 - 초대ID: {}, 상태: {}", 
                    response.getInviteId(), response.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("초대가 수락되었습니다", response));
        } catch (Exception e) {
            log.error("초대 수락 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 수락에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 대기중인 초대 목록 조회
     * GET /api/bank/invitations/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<AccountInvitationResponseDto>>> getPendingInvitations(
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("대기중인 초대 목록 조회 API 호출 - 사용자ID: {}", userId);
        
        try {
            List<AccountInvitationResponseDto> invitations = accountInvitationService.getPendingInvitations();
            
            log.info("대기중인 초대 목록 조회 완료 - 초대 수: {}", invitations.size());
            
            return ResponseEntity.ok(ApiResponse.success("대기중인 초대 목록 조회가 완료되었습니다", invitations));
        } catch (Exception e) {
            log.error("대기중인 초대 목록 조회 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대기중인 초대 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 계좌의 초대 목록 조회
     * GET /api/bank/invitations/account/{accountId}
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<List<AccountInvitationResponseDto>>> getInvitationsByAccount(
            @PathVariable String accountId,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("계좌 초대 목록 조회 API 호출 - 사용자ID: {}, 계좌ID: {}", userId, accountId);
        
        try {
            List<AccountInvitationResponseDto> invitations = accountInvitationService.getInvitationsByAccount(accountId);
            
            log.info("계좌 초대 목록 조회 완료 - 계좌ID: {}, 초대 수: {}", accountId, invitations.size());
            
            return ResponseEntity.ok(ApiResponse.success("계좌 초대 목록 조회가 완료되었습니다", invitations));
        } catch (Exception e) {
            log.error("계좌 초대 목록 조회 중 오류 발생 - 사용자ID: {}, 계좌ID: {}", userId, accountId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("계좌 초대 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 만료 처리
     * PUT /api/bank/invitations/{inviteId}/expire
     */
    @PutMapping("/{inviteId}/expire")
    public ResponseEntity<ApiResponse<String>> expireInvitation(
            @PathVariable String inviteId,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("초대 만료 처리 API 호출 - 사용자ID: {}, 초대ID: {}", userId, inviteId);
        
        try {
            accountInvitationService.expireInvitation(inviteId);
            
            log.info("초대 만료 처리 완료 - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("초대가 만료되었습니다", inviteId));
        } catch (Exception e) {
            log.error("초대 만료 처리 중 오류 발생 - 사용자ID: {}, 초대ID: {}", userId, inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 만료 처리에 실패했습니다: " + e.getMessage()));
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
