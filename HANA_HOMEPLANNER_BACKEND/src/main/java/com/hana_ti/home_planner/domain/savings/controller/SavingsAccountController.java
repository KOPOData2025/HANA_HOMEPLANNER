package com.hana_ti.home_planner.domain.savings.controller;

import com.hana_ti.home_planner.domain.savings.dto.SavingsAccountCreateRequestDto;
import com.hana_ti.home_planner.domain.savings.dto.SavingsAccountCreateResponseDto;
import com.hana_ti.home_planner.domain.savings.service.SavingsAccountService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
@Slf4j
public class SavingsAccountController {

    private final SavingsAccountService savingsAccountService;
    private final JwtUtil jwtUtil;

    /**
     * 통합 적금가입
     * POST /api/savings/accounts
     */
    @PostMapping("/accounts")
    public ResponseEntity<ApiResponse<SavingsAccountCreateResponseDto>> createSavingsAccount(
            @Valid @RequestBody SavingsAccountCreateRequestDto request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("통합 적금가입 API 호출 - 사용자ID: {}, 상품ID: {}, 월납입액: {}", 
                userId, request.getProductId(), request.getMonthlyAmount());
        
        try {
            SavingsAccountCreateResponseDto response = savingsAccountService.createSavingsAccount(userId, request);
            
            log.info("통합 적금가입 완료 - 계좌ID: {}, 적금가입ID: {}, 납입스케줄수: {}", 
                    response.getAccountId(), response.getUserSavingsId(), response.getPaymentScheduleCount());
            
            return ResponseEntity.ok(ApiResponse.success("적금가입이 완료되었습니다", response));
        } catch (Exception e) {
            log.error("통합 적금가입 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("적금가입에 실패했습니다: " + e.getMessage()));
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
