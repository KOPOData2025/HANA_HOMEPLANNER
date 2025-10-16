package com.hana_ti.home_planner.domain.calculation.controller;

import com.hana_ti.home_planner.domain.calculation.dto.*;
import com.hana_ti.home_planner.domain.calculation.service.*;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.dto.ErrorResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculation")
@RequiredArgsConstructor
@Slf4j
public class LtvCalculationController {

    private final LtvCalculationService ltvCalculationService;
    private final LoanCalculationService loanCalculationService;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 부부 합계 LTV 계산 API
     * POST /api/calculation/couple/ltv
     */
    @PostMapping("/couple/ltv")
    public ResponseEntity<ApiResponse<CoupleLtvCalculationResponseDto>> calculateCoupleLtv(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CoupleLtvCalculationRequestDto request) {
        log.info("JWT 토큰 기반 부부 합계 LTV 계산 API 호출 (역산) - 지역: {}, 주택가격: {}, 배우자ID: {}", 
                request.getRegion(), request.getHousePrice(), request.getSpouseUserId());

        // JWT 토큰 추출
        String jwtToken = authorization.replace("Bearer ", "");
        
        // JWT 토큰 만료 체크
        if (jwtUtil.isTokenExpiredWithException(jwtToken)) {
            log.warn("만료된 JWT 토큰으로 부부 합계 LTV 계산 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("TOKEN_EXPIRED")
                    .message("JWT 토큰이 만료되었습니다.")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        try {
            CoupleLtvCalculationResponseDto result = ltvCalculationService.calculateCoupleLtvWithJwt(jwtToken, request);
            log.info("부부 합계 LTV 계산 성공 - 최대대출금액: {}, 배우자연소득: {}", 
                    result.getMaxLoanAmount(), result.getSpouseAnnualIncome());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("부부 합계 LTV 계산 실패", e);
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("COUPLE_LTV_CALCULATION_FAILED")
                    .message("부부 합계 LTV 계산에 실패했습니다: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }


    /**
     * JWT 토큰 기반 LTV 계산 API
     * POST /api/calculation/ltv
     */
    @PostMapping("/ltv")
    public ResponseEntity<ApiResponse<SimpleLtvCalculationResponseDto>> calculateLtv(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody SimpleLtvCalculationRequestDto request) {
        log.info("JWT 토큰 기반 LTV 계산 API 호출 - 주택가격: {}, 지역: {}", 
                request.getHousePrice(), request.getRegion());

        // JWT 토큰 추출
        String jwtToken = authorization.replace("Bearer ", "");
        
        // JWT 토큰 만료 체크
        if (jwtUtil.isTokenExpiredWithException(jwtToken)) {
            log.warn("만료된 JWT 토큰으로 LTV 계산 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("TOKEN_EXPIRED")
                    .message("JWT 토큰이 만료되었습니다. 다시 로그인해주세요")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }
        
        // JWT 토큰 유효성 검증
        if (!jwtUtil.validateToken(jwtToken)) {
            log.warn("유효하지 않은 JWT 토큰으로 LTV 계산 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("INVALID_TOKEN")
                    .message("유효하지 않은 JWT 토큰입니다")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        SimpleLtvCalculationResponseDto result = ltvCalculationService.calculateLtvWithJwt(jwtToken, request);

        return ResponseEntity.ok(ApiResponse.success("LTV 계산 완료", result));
    }


    /**
     * 대출 가능금액 계산 API (직관적 입력/출력)
     * POST /api/calculation/loan-amount
     */
    @PostMapping("/loan-amount")
    public ResponseEntity<ApiResponse<LoanCalculationResponseDto>> calculateLoanAmount(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody LoanCalculationRequestDto request) {
        log.info("대출 가능금액 계산 API 호출 - 매매가: {}, 지역: {}, 연소득: {}", 
                request.getHousePrice(), request.getRegion(), request.getAnnualIncome());

        // JWT 토큰이 있는 경우 MyData 사용 여부 확인
        if (authorization != null && request.getUseMyData()) {
            String jwtToken = authorization.replace("Bearer ", "");
            
            // JWT 토큰 만료 체크
            if (jwtUtil.isTokenExpiredWithException(jwtToken)) {
                log.warn("만료된 JWT 토큰으로 대출 가능금액 계산 시도");
                ErrorResponse errorResponse = ErrorResponse.builder()
                        .code("TOKEN_EXPIRED")
                        .message("JWT 토큰이 만료되었습니다. 다시 로그인해주세요")
                        .build();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(errorResponse));
            }
            
            // JWT 토큰 유효성 검증
            if (!jwtUtil.validateToken(jwtToken)) {
                log.warn("유효하지 않은 JWT 토큰으로 대출 가능금액 계산 시도");
                ErrorResponse errorResponse = ErrorResponse.builder()
                        .code("INVALID_TOKEN")
                        .message("유효하지 않은 JWT 토큰입니다")
                        .build();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(errorResponse));
            }
        }

        try {
            LoanCalculationResponseDto result = loanCalculationService.calculateLoanAmount(request);
            return ResponseEntity.ok(ApiResponse.success("대출 가능금액 계산 완료", result));
        } catch (Exception e) {
            log.error("대출 가능금액 계산 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대출 가능금액 계산 중 오류가 발생했습니다."));
        }
    }
}
