package com.hana_ti.home_planner.domain.calculation.controller;

import com.hana_ti.home_planner.domain.calculation.dto.PlanGenerationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.PlanGenerationResponseDto;
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
public class PlanGenerationController {

    private final PlanGenerationService planGenerationService;
    private final JwtUtil jwtUtil;


    /**
     * JWT 토큰 기반 3종 플랜 생성 API
     * POST /api/calculation/plans
     */
    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<PlanGenerationResponseDto>> generatePlans(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody PlanGenerationRequestDto request) {
        log.info("JWT 토큰 기반 3종 플랜 생성 API 호출 - 주택가격: {}, 지역: {}",
                request.getHousePrice(), request.getRegion());

        // JWT 토큰 추출
        String jwtToken = authorization.replace("Bearer ", "");

        // JWT 토큰 만료 체크
        if (jwtUtil.isTokenExpiredWithException(jwtToken)) {
            log.warn("만료된 JWT 토큰으로 플랜 생성 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("TOKEN_EXPIRED")
                    .message("JWT 토큰이 만료되었습니다. 다시 로그인해주세요")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        // JWT 토큰 유효성 검증
        if (!jwtUtil.validateToken(jwtToken)) {
            log.warn("유효하지 않은 JWT 토큰으로 플랜 생성 시도");
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .code("INVALID_TOKEN")
                    .message("유효하지 않은 JWT 토큰입니다")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(errorResponse));
        }

        PlanGenerationResponseDto result = planGenerationService.generatePlansWithJwt(jwtToken, request);

        return ResponseEntity.ok(ApiResponse.success("3종 플랜 생성 완료", result));
    }
}
