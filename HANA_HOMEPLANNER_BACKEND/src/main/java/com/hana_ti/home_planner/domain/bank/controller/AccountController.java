package com.hana_ti.home_planner.domain.bank.controller;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.service.AccountService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final AccountService accountService;
    private final JwtUtil jwtUtil;

    /**
     * 사용자별 모든 계좌 조회 (통합 조회)
     */
    @GetMapping("/my-accounts")
    public ResponseEntity<ApiResponse<List<Account>>> getAllAccountsByUserId(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자별 모든 계좌 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<Account> accounts = accountService.getAllAccountsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("계좌 조회 성공", accounts));
        } catch (Exception e) {
            log.error("계좌 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 사용자별 계좌 타입별 조회
     */
    @GetMapping("/my-accounts/type/{accountType}")
    public ResponseEntity<ApiResponse<List<Account>>> getAccountsByUserIdAndType(
            @PathVariable Account.AccountType accountType,
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자별 계좌 타입별 조회 API 호출 - 계좌타입: {}", accountType);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<Account> accounts = accountService.getAccountsByUserIdAndType(userId, accountType);
            return ResponseEntity.ok(ApiResponse.success(
                    accountType.getDescription() + " 계좌 조회 성공", accounts));
        } catch (Exception e) {
            log.error("계좌 타입별 조회 실패 - 계좌타입: {}, 에러: {}", 
                    accountType, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 타입별 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 계좌번호로 계좌 조회
     */
    @GetMapping("/account-number/{accountNumber}")
    public ResponseEntity<ApiResponse<Account>> getAccountByAccountNumber(@PathVariable String accountNumber) {
        log.info("계좌번호로 계좌 조회 API 호출 - 계좌번호: {}", accountNumber);
        
        try {
            Account account = accountService.getAccountByAccountNumber(accountNumber);
            return ResponseEntity.ok(ApiResponse.success("계좌 조회 성공", account));
        } catch (IllegalArgumentException e) {
            log.error("계좌 조회 실패 - 계좌번호: {}, 에러: {}", accountNumber, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 조회 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("계좌 조회 실패 - 계좌번호: {}, 에러: {}", accountNumber, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 사용자별 활성 계좌 조회
     */
    @GetMapping("/my-accounts/active")
    public ResponseEntity<ApiResponse<List<Account>>> getActiveAccountsByUserId(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자별 활성 계좌 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<Account> accounts = accountService.getActiveAccountsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("활성 계좌 조회 성공", accounts));
        } catch (Exception e) {
            log.error("활성 계좌 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("활성 계좌 조회 실패: " + e.getMessage()));
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
