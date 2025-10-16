package com.hana_ti.home_planner.domain.user.controller;

import com.hana_ti.home_planner.domain.user.dto.HouseLikeRequestDto;
import com.hana_ti.home_planner.domain.user.dto.HouseLikeResponseDto;
import com.hana_ti.home_planner.domain.user.service.UserHouseLikeService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/house-like")
@RequiredArgsConstructor
@Slf4j
public class UserHouseLikeController {
    
    private final UserHouseLikeService userHouseLikeService;
    private final JwtUtil jwtUtil;
    
    /**
     * 주택 찜하기 API
     * POST /api/user/house-like
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HouseLikeResponseDto>> addHouseLike(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody HouseLikeRequestDto request) {
        
        log.info("주택 찜하기 API 호출 - 주택관리번호: {}", request.getHouseManageNo());
        
        // JWT 토큰에서 사용자 ID 추출
        String jwtToken = authorization.replace("Bearer ", "");
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        
        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
        }
        
        try {
            HouseLikeResponseDto response = userHouseLikeService.addHouseLike(userId, request);
            return ResponseEntity.ok(ApiResponse.success("주택 찜하기 완료", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("주택 찜하기 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("주택 찜하기 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 주택 찜해제 API
     * DELETE /api/user/house-like/{houseManageNo}
     */
    @DeleteMapping("/{houseManageNo}")
    public ResponseEntity<ApiResponse<Void>> removeHouseLike(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String houseManageNo) {
        
        log.info("주택 찜해제 API 호출 - 주택관리번호: {}", houseManageNo);
        
        // JWT 토큰에서 사용자 ID 추출
        String jwtToken = authorization.replace("Bearer ", "");
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        
        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
        }
        
        try {
            userHouseLikeService.removeHouseLike(userId, houseManageNo);
            return ResponseEntity.ok(ApiResponse.success("주택 찜해제 완료", null));
        } catch (Exception e) {
            log.error("주택 찜해제 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("주택 찜해제 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 사용자 찜한 주택 목록 조회 API
     * GET /api/user/house-like
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HouseLikeResponseDto>>> getUserHouseLikes(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        
        log.info("사용자 찜한 주택 목록 조회 API 호출");
        
        // JWT 토큰에서 사용자 ID 추출
        String jwtToken = authorization.replace("Bearer ", "");
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        
        if (userId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
        }
        
        try {
            List<HouseLikeResponseDto> response = userHouseLikeService.getUserHouseLikes(userId);
            return ResponseEntity.ok(ApiResponse.success("찜한 주택 목록 조회 완료", response));
        } catch (Exception e) {
            log.error("찜한 주택 목록 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("찜한 주택 목록 조회 중 오류가 발생했습니다."));
        }
    }


}
