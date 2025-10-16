package com.hana_ti.home_planner.domain.my_data.controller;

import com.hana_ti.home_planner.domain.my_data.dto.TotalAssetResponseDto;
import com.hana_ti.home_planner.domain.my_data.service.MdTotalAssetService;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/my-data/assets")
@RequiredArgsConstructor
public class MdAssetInfoController {

    private final MdTotalAssetService mdTotalAssetService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * JWT 토큰으로 자산 정보 조회 API
     * GET /api/my-data/assets/my-assets
     */
    @GetMapping("/my-assets")
    public ResponseEntity<ApiResponse<TotalAssetResponseDto>> getMyAssetInfo(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        log.info("JWT 토큰으로 자산 정보 조회 API 호출 (외부 서버 사용)");

        try {
            // JWT 토큰 추출
            String jwtToken = authorization.replace("Bearer ", "");
            
            // JWT 토큰에서 사용자 ID 추출
            String userId = jwtUtil.getUserIdFromToken(jwtToken);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 JWT 토큰입니다."));
            }

            // User 테이블에서 사용자 조회
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

            // resNum으로 외부 서버를 통해 자산 정보 조회
            TotalAssetResponseDto assetInfo = mdTotalAssetService.getTotalAssetsByResNum(user.getResNum());
            
            return ResponseEntity.ok(ApiResponse.success("자산 정보 조회가 완료되었습니다.", assetInfo));
            
        } catch (Exception e) {
            log.error("JWT 토큰으로 자산 정보 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("자산 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * USERID로 자산 정보 조회
     * GET /api/my-data/assets/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<TotalAssetResponseDto>> getMyAssetInfoByUserId(
            @PathVariable String userId) {
        log.info("USER ID로 자산 정보 조회 : {}",userId);

        try {
            // User 테이블에서 사용자 조회
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

            // resNum으로 외부 서버를 통해 자산 정보 조회
            TotalAssetResponseDto assetInfo = mdTotalAssetService.getTotalAssetsByResNum(user.getResNum());

            return ResponseEntity.ok(ApiResponse.success("자산 정보 조회가 완료되었습니다.", assetInfo));

        } catch (Exception e) {
            log.error("JWT 토큰으로 자산 정보 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("자산 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 외부 서버 호출 테스트 API
     * GET /api/my-data/assets/test-external/{userId}
     */
    @GetMapping("/test-external/{userId}")
    public ResponseEntity<ApiResponse<String>> testExternalServer(@PathVariable String userId) {
        log.info("외부 서버 자산 조회 테스트 API 호출: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
            String resNum = user.getResNum();
            log.info("사용자 {}의 resNum: {}", userId, resNum);

            TotalAssetResponseDto assetInfo = mdTotalAssetService.getTotalAssetsByResNum(resNum);

            return ResponseEntity.ok(ApiResponse.success("외부 서버 자산 조회 성공",
                "총자산: " + assetInfo.getSummary().getTotalAssets() + 
                ", 총부채: " + assetInfo.getSummary().getTotalLiabilities() + 
                ", 순자산: " + assetInfo.getSummary().getNetWorth()));
        } catch (Exception e) {
            log.error("외부 서버 자산 조회 실패", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("외부 서버 자산 조회 실패: " + e.getMessage()));
        }
    }
}