package com.hana_ti.home_planner.domain.calculation.controller;

import com.hana_ti.home_planner.domain.calculation.dto.CoupleDsrCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDsrCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.DsrCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.DsrCalculationResponseDto;
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
public class DsrCalculationController {

    private final DsrCalculationService dsrCalculationService;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 부부 합계 DSR 계산 API
     * POST /api/calculation/couple/dsr
     */
    @PostMapping("/couple/dsr")
    public ResponseEntity<ApiResponse<CoupleDsrCalculationResponseDto>> calculateCoupleDsr(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CoupleDsrCalculationRequestDto request) {
        log.info("JWT 토큰 기반 부부 합계 DSR 계산 API 호출 (정방향) - 지역: {}, 희망대출금액: {}, 희망금리: {}%, 희망기간: {}년, 배우자ID: {}",
                request.getRegion(), request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getSpouseUserId());

        // JWT 토큰 추출
        String jwtToken = authorization.replace("Bearer ", "");

        // JWT 토큰 만료 체크
        if (jwtUtil.isTokenExpiredWithException(jwtToken)) {
            log.warn("만료된 JWT 토큰으로 부부 합계 DSR 계산 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("TOKEN_EXPIRED")
                    .message("JWT 토큰이 만료되었습니다.")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        try {
            CoupleDsrCalculationResponseDto result = dsrCalculationService.calculateCoupleDsrWithJwt(jwtToken, request);
            log.info("부부 합계 DSR 계산 성공 - 기본DSR: {}%, 스트레스DSR: {}%, 배우자연소득: {}",
                    result.getBaseDsr(), result.getStressDsr(), result.getSpouseAnnualIncome());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("부부 합계 DSR 계산 실패", e);
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("COUPLE_DSR_CALCULATION_FAILED")
                    .message("부부 합계 DSR 계산에 실패했습니다: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(errorResponse));
        }
    }

    /**
     * JWT 토큰 기반 DSR 계산 API
     * POST /api/calculation/dsr
     */
    @PostMapping("/dsr")
    public ResponseEntity<ApiResponse<DsrCalculationResponseDto>> calculateDsr(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody DsrCalculationRequestDto request) {
        log.info("JWT 토큰 기반 DSR 계산 API 호출 - 지역: {}, 희망금리: {}%, 희망기간: {}년",
                request.getRegion(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod());

        // JWT 토큰 추출
        String jwtToken = authorization.replace("Bearer ", "");

        // JWT 토큰 만료 체크
        if (jwtUtil.isTokenExpiredWithException(jwtToken)) {
            log.warn("만료된 JWT 토큰으로 DSR 계산 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("TOKEN_EXPIRED")
                    .message("JWT 토큰이 만료되었습니다. 다시 로그인해주세요")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        // JWT 토큰 유효성 검증
        if (!jwtUtil.validateToken(jwtToken)) {
            log.warn("유효하지 않은 JWT 토큰으로 DSR 계산 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("INVALID_TOKEN")
                    .message("유효하지 않은 JWT 토큰입니다")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        try {
            DsrCalculationResponseDto result = dsrCalculationService.calculateDsrWithJwt(jwtToken
                    , request);
            return ResponseEntity.ok(ApiResponse.success("DSR 계산 완료", result));
        } catch (Exception e) {
            log.error("DSR 계산 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("DSR 계산 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
