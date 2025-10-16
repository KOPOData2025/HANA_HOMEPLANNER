package com.hana_ti.home_planner.domain.loan.controller;

import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationAcceptRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationDetailResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationNotificationRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationNotificationResponseDto;
import com.hana_ti.home_planner.domain.loan.service.LoanInvitationService;
import com.hana_ti.home_planner.domain.loan.service.LoanInvitationNotificationService;
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
@RequestMapping("/api/loans/invitations")
@RequiredArgsConstructor
@Slf4j
public class LoanInvitationController {

    private final LoanInvitationService loanInvitationService;
    private final LoanInvitationNotificationService loanInvitationNotificationService;
    private final JwtUtil jwtUtil;

    /**
     * 대출 초대 생성
     * POST /api/loans/invitations
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> createLoanInvitation(
            @Valid @RequestBody LoanInvitationRequestDto request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("대출 초대 생성 API 호출 - 사용자ID: {}", userId);
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.createLoanInvitation(request);
            
            log.info("대출 초대 생성 완료 - 초대ID: {}", response.getInviteId());
            
            return ResponseEntity.ok(ApiResponse.success("대출 초대가 생성되었습니다", response));
        } catch (Exception e) {
            log.error("대출 초대 생성 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 초대 생성에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 수락 (기존 방식)
     * POST /api/loans/invitations/{inviteId}/accept
     */
    @PostMapping("/{inviteId}/accept")
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> acceptInvitation(
            @PathVariable String inviteId) {
        
        log.info("대출 초대 수락 API 호출 - 초대ID: {}", inviteId);
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.acceptInvitation(inviteId);
            
            log.info("대출 초대 수락 완료 - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("초대를 수락했습니다", response));
        } catch (Exception e) {
            log.error("대출 초대 수락 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 수락에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 수락 (joint_ci 포함)
     * POST /api/loans/invitations/{inviteId}/accept-with-ci
     */
    @PostMapping("/{inviteId}/accept-with-ci")
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> acceptInvitationWithJointCi(
            @PathVariable String inviteId,
            @Valid @RequestBody LoanInvitationAcceptRequestDto request) {
        
        log.info("대출 초대 수락 API 호출 (joint_ci 포함) - 초대ID: {}, joint_ci: {}", inviteId, request.getJointCi());
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.acceptInvitationWithJointCi(inviteId, request);
            
            log.info("대출 초대 수락 완료 (joint_ci 포함) - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("초대를 수락했습니다", response));
        } catch (Exception e) {
            log.error("대출 초대 수락 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 수락에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 수락 및 대출 신청 상태 변경
     * POST /api/loans/invitations/{inviteId}/accept-and-review
     */
    @PostMapping("/{inviteId}/accept-and-review")
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> acceptInvitationAndUpdateApplication(
            @PathVariable String inviteId) {
        
        log.info("초대 수락 및 대출 신청 상태 변경 API 호출 - 초대ID: {}", inviteId);
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.acceptInvitationAndUpdateApplication(inviteId);
            
            log.info("초대 수락 및 대출 신청 상태 변경 완료 - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("초대를 수락하고 대출 신청 상태를 심사중으로 변경했습니다", response));
        } catch (Exception e) {
            log.error("초대 수락 및 대출 신청 상태 변경 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 수락 및 상태 변경에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 거절
     * POST /api/loans/invitations/{inviteId}/reject
     */
    @PostMapping("/{inviteId}/reject")
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> rejectInvitation(
            @PathVariable String inviteId) {
        
        log.info("대출 초대 거절 API 호출 - 초대ID: {}", inviteId);
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.rejectInvitation(inviteId);
            
            log.info("대출 초대 거절 완료 - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("초대를 거절했습니다", response));
        } catch (Exception e) {
            log.error("대출 초대 거절 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 거절에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 대출 신청별 초대 목록 조회
     * GET /api/loans/invitations/app/{appId}
     */
    @GetMapping("/app/{appId}")
    public ResponseEntity<ApiResponse<List<LoanInvitationResponseDto>>> getInvitationsByAppId(
            @PathVariable String appId) {
        
        log.info("대출 신청별 초대 목록 조회 API 호출 - 신청ID: {}", appId);
        
        try {
            List<LoanInvitationResponseDto> response = loanInvitationService.getInvitationsByAppId(appId);
            
            log.info("대출 신청별 초대 목록 조회 완료 - 신청ID: {}, 초대수: {}", appId, response.size());
            
            return ResponseEntity.ok(ApiResponse.success("초대 목록 조회가 완료되었습니다", response));
        } catch (Exception e) {
            log.error("대출 신청별 초대 목록 조회 중 오류 발생 - 신청ID: {}", appId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대자별 초대 목록 조회
     * GET /api/loans/invitations/inviter/{inviterId}
     */
    @GetMapping("/inviter/{inviterId}")
    public ResponseEntity<ApiResponse<List<LoanInvitationResponseDto>>> getInvitationsByInviterId(
            @PathVariable String inviterId) {
        
        log.info("초대자별 초대 목록 조회 API 호출 - 초대자ID: {}", inviterId);
        
        try {
            List<LoanInvitationResponseDto> response = loanInvitationService.getInvitationsByInviterId(inviterId);
            
            log.info("초대자별 초대 목록 조회 완료 - 초대자ID: {}, 초대수: {}", inviterId, response.size());
            
            return ResponseEntity.ok(ApiResponse.success("초대 목록 조회가 완료되었습니다", response));
        } catch (Exception e) {
            log.error("초대자별 초대 목록 조회 중 오류 발생 - 초대자ID: {}", inviterId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 상세 조회
     * GET /api/loans/invitations/{inviteId}
     */
    @GetMapping("/{inviteId}")
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> getInvitationById(
            @PathVariable String inviteId) {
        
        log.info("초대 상세 조회 API 호출 - 초대ID: {}", inviteId);
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.getInvitationById(inviteId);
            
            log.info("초대 상세 조회 완료 - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("초대 상세 조회가 완료되었습니다", response));
        } catch (Exception e) {
            log.error("초대 상세 조회 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 공동 대출자 정보 업데이트
     * PUT /api/loans/invitations/{inviteId}/joint-info
     */
    @PutMapping("/{inviteId}/joint-info")
    public ResponseEntity<ApiResponse<LoanInvitationResponseDto>> updateJointInfo(
            @PathVariable String inviteId,
            @RequestParam String jointName,
            @RequestParam String jointPhone,
            @RequestParam String jointCi) {
        
        log.info("공동 대출자 정보 업데이트 API 호출 - 초대ID: {}", inviteId);
        
        try {
            LoanInvitationResponseDto response = loanInvitationService.updateJointInfo(
                    inviteId, jointName, jointPhone, jointCi);
            
            log.info("공동 대출자 정보 업데이트 완료 - 초대ID: {}", inviteId);
            
            return ResponseEntity.ok(ApiResponse.success("공동 대출자 정보가 업데이트되었습니다", response));
        } catch (Exception e) {
            log.error("공동 대출자 정보 업데이트 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("공동 대출자 정보 업데이트에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 공동대출 초대 알림 발송
     * POST /api/loans/invitations/notification
     */
    @PostMapping("/notification")
    public ResponseEntity<ApiResponse<LoanInvitationNotificationResponseDto>> sendInvitationNotification(
            @Valid @RequestBody LoanInvitationNotificationRequestDto request) {
        
        log.info("공동대출 초대 알림 발송 API 호출 - 초대ID: {}, 수신자: {}", request.getInviteId(), request.getPhoneNumber());
        
        try {
            LoanInvitationNotificationResponseDto response = loanInvitationNotificationService.sendInvitationNotification(request);
            
            if (response.isSuccess()) {
                log.info("공동대출 초대 알림 발송 완료 - 초대ID: {}", request.getInviteId());
                return ResponseEntity.ok(ApiResponse.success("공동대출 초대 알림이 발송되었습니다", response));
            } else {
                log.error("공동대출 초대 알림 발송 실패 - 초대ID: {}, 상태: {}", request.getInviteId(), response.getStatus());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("공동대출 초대 알림 발송에 실패했습니다: " + response.getStatus()));
            }
        } catch (Exception e) {
            log.error("공동대출 초대 알림 발송 중 오류 발생 - 초대ID: {}", request.getInviteId(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("공동대출 초대 알림 발송 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 상세 정보 조회
     * GET /api/loans/invitations/{inviteId}/detail
     */
    @GetMapping("/{inviteId}/detail")
    public ResponseEntity<ApiResponse<LoanInvitationDetailResponseDto>> getInvitationDetail(@PathVariable String inviteId) {
        log.info("초대 상세 정보 조회 API 호출 - 초대ID: {}", inviteId);
        
        try {
            LoanInvitationDetailResponseDto response = loanInvitationService.getInvitationDetail(inviteId);
            
            log.info("초대 상세 정보 조회 완료 - 초대ID: {}", inviteId);
            return ResponseEntity.ok(ApiResponse.success("초대 상세 정보를 조회했습니다", response));
        } catch (IllegalArgumentException e) {
            log.error("초대 상세 정보 조회 실패 - 초대ID: {}, 오류: {}", inviteId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("초대 상세 정보 조회 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("초대 상세 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
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
