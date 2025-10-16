package com.hana_ti.home_planner.domain.calculation.controller;

import com.hana_ti.home_planner.domain.calculation.dto.SimpleAnnualIncomeResponseDto;
import com.hana_ti.home_planner.domain.calculation.service.DtiCalculationService;
import com.hana_ti.home_planner.domain.calculation.service.LtvCalculationService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculation")
@RequiredArgsConstructor
@Slf4j
public class AnnualIncomeController {

    private final LtvCalculationService ltvCalculationService;

    /**
     * JWT 토큰 기반 연소득 조회 API
     * GET /api/calculation/annual-income
     */
    @GetMapping("/annual-income")
    public ResponseEntity<ApiResponse<SimpleAnnualIncomeResponseDto>> getAnnualIncome(
            @RequestHeader("Authorization") String authorization) {
        
        log.info("JWT 토큰 기반 연소득 조회 API 호출");

        // JWT 토큰 추출
        String jwtToken = authorization.replace("Bearer ", "");
        
        SimpleAnnualIncomeResponseDto result = ltvCalculationService.getSimpleAnnualIncomeByJwt(jwtToken);

        return ResponseEntity.ok(ApiResponse.success("연소득 조회 완료", result));
    }
}
