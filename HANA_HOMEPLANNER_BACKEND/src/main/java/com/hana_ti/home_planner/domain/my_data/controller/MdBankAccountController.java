package com.hana_ti.home_planner.domain.my_data.controller;

import com.hana_ti.home_planner.domain.my_data.dto.MdBankAccountResponseDto;
import com.hana_ti.home_planner.domain.my_data.service.MdBankAccountService;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/my-data/bank-accounts")
@RequiredArgsConstructor
public class MdBankAccountController {

    private final MdBankAccountService mdBankAccountService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 사용자 계좌 통합 조회 API (외부 서버 사용)
     */
    @GetMapping("/my-accounts")
    public ResponseEntity<ApiResponse<List<MdBankAccountResponseDto>>> getMyAccounts(
            @RequestHeader("Authorization") String authorization) {
        log.info("JWT 토큰 기반 사용자 계좌 통합 조회 API 호출 (외부 서버 사용)");
        
        try {
            // JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }

            // User 조회 및 resNum 추출
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

            // resNum으로 외부 서버를 통해 계좌 조회
            List<MdBankAccountResponseDto> accounts = mdBankAccountService.findAccountsByResNum(user.getResNum());

            return ResponseEntity.ok(ApiResponse.success("계좌 조회 성공", accounts));
        } catch (Exception e) {
            log.error("계좌 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰 기반 사용자 계좌 타입별 조회 API (외부 서버 사용)
     */
    @GetMapping("/my-accounts/type/{accountType}")
    public ResponseEntity<ApiResponse<List<MdBankAccountResponseDto>>> getMyAccountsByType(
            @PathVariable String accountType,
            @RequestHeader("Authorization") String authorization) {
        log.info("JWT 토큰 기반 사용자 계좌 타입별 조회 API 호출 (외부 서버 사용) - 계좌타입: {}", accountType);
        
        try {
            // JWT 토큰에서 사용자 ID 추출
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }

            // User 조회 및 resNum 추출
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

            // resNum으로 외부 서버를 통해 계좌 조회
            List<MdBankAccountResponseDto> allAccounts = mdBankAccountService.findAccountsByResNum(user.getResNum());
            
            // 계좌 타입으로 필터링
            List<MdBankAccountResponseDto> filteredAccounts = allAccounts.stream()
                    .filter(account -> accountType.equals(account.getAccountType()))
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(accountType + " 계좌 조회 성공", filteredAccounts));
        } catch (Exception e) {
            log.error("계좌 타입별 조회 실패 - 계좌타입: {}, 에러: {}", accountType, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 타입별 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 외부 서버 호출 테스트 API
     * GET /api/my-data/bank-accounts/test-external/{userId}
     */
    @GetMapping("/test-external/{userId}")
    public ResponseEntity<ApiResponse<String>> testExternalServer(@PathVariable String userId) {
        log.info("외부 서버 계좌 조회 테스트 API 호출: {}", userId);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
            String resNum = user.getResNum();
            log.info("사용자 {}의 resNum: {}", userId, resNum);

            List<MdBankAccountResponseDto> accounts = mdBankAccountService.findAccountsByResNum(resNum);

            return ResponseEntity.ok(ApiResponse.success("외부 서버 계좌 조회 성공",
                "계좌 수: " + accounts.size() + ", 첫 번째 계좌: " + 
                (accounts.isEmpty() ? "없음" : accounts.get(0).getAccountName())));
        } catch (Exception e) {
            log.error("외부 서버 계좌 조회 실패", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("외부 서버 계좌 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    private String extractUserIdFromToken(String authorization) {
        try {
            String jwtToken = authorization.replace("Bearer ", "");
            String userIdStr = jwtUtil.getUserIdFromToken(jwtToken);
            
            if (userIdStr == null) {
                return null;
            }
            
            return userIdStr;
        } catch (Exception e) {
            log.error("JWT 토큰에서 사용자 ID 추출 실패", e);
            return null;
        }
    }
}
