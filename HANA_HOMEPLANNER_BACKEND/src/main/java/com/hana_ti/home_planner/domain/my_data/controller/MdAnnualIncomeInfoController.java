package com.hana_ti.home_planner.domain.my_data.controller;

import com.hana_ti.home_planner.domain.my_data.dto.AnnualIncomeResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.TotalAssetResponseDto;
import com.hana_ti.home_planner.domain.my_data.service.MdBankTransactionService;
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
@RequestMapping("/api/my-data/income")
@RequiredArgsConstructor
public class MdAnnualIncomeInfoController {

    private final MdBankTransactionService mdBankTransactionService;
    private final MdTotalAssetService mdTotalAssetService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * JWT 토큰으로 연소득 정보 조회 API (외부 서버 사용)
     * GET /api/my-data/income/my-income
     */
    @GetMapping("/my-income")
    public ResponseEntity<ApiResponse<AnnualIncomeResponseDto>> getMyAnnualIncomeInfo(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        log.info("JWT 토큰으로 연소득 정보 조회 API 호출");

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

            // resNum으로 외부 서버에서 연소득 정보 조회
            AnnualIncomeResponseDto incomeInfo = mdBankTransactionService.getAnnualIncomeByResNum(user.getResNum());
            
            return ResponseEntity.ok(ApiResponse.success("연소득 정보 조회가 완료되었습니다.", incomeInfo));
            
        } catch (Exception e) {
            log.error("JWT 토큰으로 연소득 정보 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("연소득 정보 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }


}