package com.hana_ti.home_planner.domain.portfolio.controller;

import com.hana_ti.home_planner.domain.portfolio.dto.CapitalRecommendationRequestDto;
import com.hana_ti.home_planner.domain.portfolio.dto.CapitalRecommendationResponseDto;
import com.hana_ti.home_planner.domain.portfolio.service.CapitalRecommendationService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Slf4j
public class PortfolioController {

    private final CapitalRecommendationService capitalRecommendationService;

    /**
     * 자본 포트폴리오 추천 API
     * POST /api/portfolio/recommend-capital
     */
    @PostMapping("/recommend-capital")
    public ResponseEntity<ApiResponse<CapitalRecommendationResponseDto>> recommendCapital(
            @Valid @RequestBody CapitalRecommendationRequestDto request) {
        log.info("자본 포트폴리오 추천 API 호출 - 주택가격: {}, 연소득: {}, 현재자산: {}, 희망 월적금액: {}, 잔금일: {}, 대출가능액: {}", 
                request.getHousePrice(), request.getAnnualIncome(), request.getCurrentCash(), 
                request.getDesiredMonthlySaving(), request.getMoveInDate(), request.getLoanAvailable());

        try {
            CapitalRecommendationResponseDto response = capitalRecommendationService.recommendCapital(request);
            log.info("자본 포트폴리오 추천 성공 - {}개 플랜 생성", response.getCapitalPlans().size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("자본 포트폴리오 추천 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("자본 포트폴리오 추천에 실패했습니다: " + e.getMessage()));
        }
    }
}
