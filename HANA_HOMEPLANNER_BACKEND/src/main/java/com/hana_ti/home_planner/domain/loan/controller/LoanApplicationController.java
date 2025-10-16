package com.hana_ti.home_planner.domain.loan.controller;

import com.hana_ti.home_planner.domain.loan.dto.LoanApplicationRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanApplicationResponseDto;
import com.hana_ti.home_planner.domain.loan.service.LoanApplicationService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans/applications")
@RequiredArgsConstructor
@Slf4j
public class LoanApplicationController {

    private final LoanApplicationService loanApplicationService;
    private final JwtUtil jwtUtil;

    /**
     * 대출 신청
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LoanApplicationResponseDto>> createLoanApplication(
            @Valid @RequestBody LoanApplicationRequestDto request,
            @RequestHeader("Authorization") String authorization) {
        log.info("대출 신청 API 호출 - 상품ID: {}, 희망금액: {}, 희망기간: {}개월", 
                request.getProductId(), request.getRequestAmount(), request.getRequestTerm());

        try {
            // JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }

            // 대출 신청 처리
            LoanApplicationResponseDto response = loanApplicationService.createLoanApplication(request, userId);
            
            return ResponseEntity.ok(ApiResponse.success("대출 신청이 완료되었습니다.", response));
        } catch (IllegalArgumentException e) {
            log.error("대출 신청 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 신청 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("대출 신청 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 사용자별 대출 신청 목록 조회
     */
    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<LoanApplicationResponseDto>>> getMyApplications(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자별 대출 신청 목록 조회 API 호출");

        try {
            // JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }

            // 대출 신청 목록 조회
            List<LoanApplicationResponseDto> applications = loanApplicationService.getApplicationsByUserId(userId);
            
            return ResponseEntity.ok(ApiResponse.success("대출 신청 목록 조회 성공", applications));
        } catch (Exception e) {
            log.error("대출 신청 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 신청 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 대출 신청 상세 조회
     */
    @GetMapping("/{appId}")
    public ResponseEntity<ApiResponse<LoanApplicationResponseDto>> getApplicationById(
            @PathVariable String appId,
            @RequestHeader("Authorization") String authorization) {
        log.info("대출 신청 상세 조회 API 호출 - 신청ID: {}", appId);

        try {
            // JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }

            // 대출 신청 상세 조회
            LoanApplicationResponseDto application = loanApplicationService.getApplicationById(appId, userId);
            
            return ResponseEntity.ok(ApiResponse.success("대출 신청 상세 조회 성공", application));
        } catch (IllegalArgumentException e) {
            log.error("대출 신청 상세 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 신청 상세 조회 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("대출 신청 상세 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 오류가 발생했습니다."));
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
            
            return userIdStr;
        } catch (Exception e) {
            log.error("JWT 토큰에서 사용자 ID 추출 실패", e);
            return null;
        }
    }
}
