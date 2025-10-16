package com.hana_ti.home_planner.domain.user.controller;

import com.hana_ti.home_planner.domain.portfolio.dto.CapitalPlanSelectionRequestDto;
import com.hana_ti.home_planner.domain.portfolio.dto.CapitalPlanSelectionResponseDto;
import com.hana_ti.home_planner.domain.portfolio.service.CapitalPlanSelectionService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/capital-plan-selection")
@RequiredArgsConstructor
@Slf4j
public class CapitalPlanSelectionController {

    private final CapitalPlanSelectionService capitalPlanSelectionService;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    private String getUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        throw new IllegalArgumentException("유효하지 않은 인증 토큰입니다.");
    }

    /**
     * 포트폴리오 선택 저장
     * POST /api/user/capital-plan-selection
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CapitalPlanSelectionResponseDto>> saveSelection(
            @Valid @RequestBody CapitalPlanSelectionRequestDto request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("포트폴리오 선택 저장 API 호출 - 사용자: {}, 플랜타입: {}", 
                userId, request.getPlanType());

        try {
            CapitalPlanSelectionResponseDto response = capitalPlanSelectionService.saveSelection(request, userId);
            log.info("포트폴리오 선택 저장 성공 - ID: {}", response.getSelectionId());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("포트폴리오 선택 저장 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 저장에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자별 포트폴리오 선택 목록 조회
     * GET /api/user/capital-plan-selection/my-selections
     */
    @GetMapping("/my-selections")
    public ResponseEntity<ApiResponse<List<CapitalPlanSelectionResponseDto>>> getMySelections(
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("사용자별 포트폴리오 선택 목록 조회 API 호출 - 사용자: {}", userId);

        try {
            List<CapitalPlanSelectionResponseDto> selections = capitalPlanSelectionService.getSelectionsByUserId(userId);
            log.info("포트폴리오 선택 목록 조회 성공 - 개수: {}", selections.size());
            return ResponseEntity.ok(ApiResponse.success(selections));
        } catch (Exception e) {
            log.error("포트폴리오 선택 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자의 최신 포트폴리오 선택 조회
     * GET /api/user/capital-plan-selection/my-latest
     */
    @GetMapping("/my-latest")
    public ResponseEntity<ApiResponse<CapitalPlanSelectionResponseDto>> getMyLatestSelection(
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("사용자 최신 포트폴리오 선택 조회 API 호출 - 사용자: {}", userId);

        try {
            Optional<CapitalPlanSelectionResponseDto> latestSelection = 
                    capitalPlanSelectionService.getLatestSelectionByUserId(userId);
            
            if (latestSelection.isPresent()) {
                log.info("최신 포트폴리오 선택 조회 성공 - ID: {}", latestSelection.get().getSelectionId());
                return ResponseEntity.ok(ApiResponse.success(latestSelection.get()));
            } else {
                log.info("최신 포트폴리오 선택 없음 - 사용자: {}", userId);
                return ResponseEntity.ok(ApiResponse.success(null));
            }
        } catch (Exception e) {
            log.error("최신 포트폴리오 선택 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("최신 포트폴리오 선택 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 포트폴리오 선택 상세 조회
     * GET /api/user/capital-plan-selection/{selectionId}
     */
    @GetMapping("/{selectionId}")
    public ResponseEntity<ApiResponse<CapitalPlanSelectionResponseDto>> getSelectionById(
            @PathVariable Long selectionId) {
        log.info("포트폴리오 선택 상세 조회 API 호출 - ID: {}", selectionId);

        try {
            Optional<CapitalPlanSelectionResponseDto> selection = 
                    capitalPlanSelectionService.getSelectionById(selectionId);
            
            if (selection.isPresent()) {
                log.info("포트폴리오 선택 상세 조회 성공 - ID: {}", selectionId);
                return ResponseEntity.ok(ApiResponse.success(selection.get()));
            } else {
                log.info("포트폴리오 선택 없음 - ID: {}", selectionId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("포트폴리오 선택 상세 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 포트폴리오 선택 수정
     * PUT /api/user/capital-plan-selection/{selectionId}
     */
    @PutMapping("/{selectionId}")
    public ResponseEntity<ApiResponse<CapitalPlanSelectionResponseDto>> updateSelection(
            @PathVariable Long selectionId,
            @Valid @RequestBody CapitalPlanSelectionRequestDto request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("포트폴리오 선택 수정 API 호출 - 사용자: {}, ID: {}, 플랜타입: {}", userId, selectionId, request.getPlanType());

        try {
            Optional<CapitalPlanSelectionResponseDto> updatedSelection = 
                    capitalPlanSelectionService.updateSelection(selectionId, request, userId);
            
            if (updatedSelection.isPresent()) {
                log.info("포트폴리오 선택 수정 성공 - ID: {}", selectionId);
                return ResponseEntity.ok(ApiResponse.success(updatedSelection.get()));
            } else {
                log.info("포트폴리오 선택 없음 또는 권한 없음 - ID: {}, 사용자: {}", selectionId, userId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("포트폴리오 선택 수정 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 수정에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 포트폴리오 선택 삭제
     * DELETE /api/user/capital-plan-selection/{selectionId}
     */
    @DeleteMapping("/{selectionId}")
    public ResponseEntity<ApiResponse<Void>> deleteSelection(
            @PathVariable Long selectionId,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("포트폴리오 선택 삭제 API 호출 - 사용자: {}, ID: {}", userId, selectionId);

        try {
            boolean deleted = capitalPlanSelectionService.deleteSelection(selectionId, userId);
            
            if (deleted) {
                log.info("포트폴리오 선택 삭제 성공 - ID: {}", selectionId);
                return ResponseEntity.ok(ApiResponse.success(null));
            } else {
                log.info("포트폴리오 선택 없음 또는 권한 없음 - ID: {}, 사용자: {}", selectionId, userId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("포트폴리오 선택 삭제 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 삭제에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자별 포트폴리오 선택 통계 조회
     * GET /api/user/capital-plan-selection/my-stats
     */
    @GetMapping("/my-stats")
    public ResponseEntity<ApiResponse<CapitalPlanSelectionService.PortfolioSelectionStatsDto>> getMySelectionStats(
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("사용자별 포트폴리오 선택 통계 조회 API 호출 - 사용자: {}", userId);

        try {
            CapitalPlanSelectionService.PortfolioSelectionStatsDto stats = 
                    capitalPlanSelectionService.getSelectionStatsByUserId(userId);
            log.info("포트폴리오 선택 통계 조회 성공 - 총 선택: {}", stats.getTotalSelections());
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("포트폴리오 선택 통계 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 통계 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 주택관리번호별 포트폴리오 선택 목록 조회
     * GET /api/user/capital-plan-selection/house/{houseMngNo}
     */
    @GetMapping("/house/{houseMngNo}")
    public ResponseEntity<ApiResponse<List<CapitalPlanSelectionResponseDto>>> getSelectionsByHouseMngNo(
            @PathVariable Long houseMngNo) {
        log.info("주택관리번호별 포트폴리오 선택 목록 조회 API 호출 - 주택관리번호: {}", houseMngNo);

        try {
            List<CapitalPlanSelectionResponseDto> selections = 
                    capitalPlanSelectionService.getSelectionsByHouseMngNo(houseMngNo);
            log.info("포트폴리오 선택 목록 조회 성공 - 개수: {}", selections.size());
            return ResponseEntity.ok(ApiResponse.success(selections));
        } catch (Exception e) {
            log.error("포트폴리오 선택 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자와 주택관리번호로 포트폴리오 선택 목록 조회
     * GET /api/user/capital-plan-selection/user/{userId}/house/{houseMngNo}
     */
    @GetMapping("/user/{userId}/house/{houseMngNo}")
    public ResponseEntity<ApiResponse<List<CapitalPlanSelectionResponseDto>>> getSelectionsByUserIdAndHouseMngNo(
            @PathVariable String userId, @PathVariable Long houseMngNo) {
        log.info("사용자와 주택관리번호별 포트폴리오 선택 목록 조회 API 호출 - 사용자: {}, 주택관리번호: {}", userId, houseMngNo);

        try {
            List<CapitalPlanSelectionResponseDto> selections = 
                    capitalPlanSelectionService.getSelectionsByUserIdAndHouseMngNo(userId, houseMngNo);
            log.info("포트폴리오 선택 목록 조회 성공 - 개수: {}", selections.size());
            return ResponseEntity.ok(ApiResponse.success(selections));
        } catch (Exception e) {
            log.error("포트폴리오 선택 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 주택관리번호별 포트폴리오 선택 통계 조회
     * GET /api/user/capital-plan-selection/house/{houseMngNo}/stats
     */
    @GetMapping("/house/{houseMngNo}/stats")
    public ResponseEntity<ApiResponse<CapitalPlanSelectionService.PortfolioSelectionStatsDto>> getSelectionStatsByHouseMngNo(
            @PathVariable Long houseMngNo) {
        log.info("주택관리번호별 포트폴리오 선택 통계 조회 API 호출 - 주택관리번호: {}", houseMngNo);

        try {
            CapitalPlanSelectionService.PortfolioSelectionStatsDto stats = 
                    capitalPlanSelectionService.getSelectionStatsByHouseMngNo(houseMngNo);
            log.info("포트폴리오 선택 통계 조회 성공 - 총 선택: {}", stats.getTotalSelections());
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("포트폴리오 선택 통계 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("포트폴리오 선택 통계 조회에 실패했습니다: " + e.getMessage()));
        }
    }
}
