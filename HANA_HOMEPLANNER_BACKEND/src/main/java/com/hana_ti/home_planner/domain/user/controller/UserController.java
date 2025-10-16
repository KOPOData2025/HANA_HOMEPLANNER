package com.hana_ti.home_planner.domain.user.controller;

import com.hana_ti.home_planner.domain.bank.dto.AccountResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanApplicationResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanContractResponseDto;
import com.hana_ti.home_planner.domain.user.dto.AccountDetailResponseDto;
import com.hana_ti.home_planner.domain.user.dto.LoanAccountDetailResponseDto;
import com.hana_ti.home_planner.domain.user.dto.UserResponseDto;
import com.hana_ti.home_planner.domain.user.dto.UserNameResponseDto;
import com.hana_ti.home_planner.domain.user.service.UserService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getAllUsers() {
        List<UserResponseDto> users = userService.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable String userId) {
        UserResponseDto user = userService.findById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserByEmail(@PathVariable String email) {
        UserResponseDto user = userService.findByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        userService.deleteById(userId);
        return ResponseEntity.ok(ApiResponse.success("사용자가 삭제되었습니다.", null));
    }

    /**
     * JWT 토큰을 통한 사용자 계좌 조회 API
     */
    @GetMapping("/my-accounts")
    public ResponseEntity<ApiResponse<List<AccountResponseDto>>> getUserAccounts(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자 계좌 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<AccountResponseDto> accounts = userService.getUserAccounts(userId);
            return ResponseEntity.ok(ApiResponse.success("계좌 조회 성공", accounts));
        } catch (Exception e) {
            log.error("계좌 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * ACCOUNT_ID를 통한 계좌 상세 정보 조회 API (USER_SAVINGS, PAYMENT_SCHEDULE, TRANSACTION_HISTORY 포함)
     */
    @GetMapping("/account-detail/{accountId}")
    public ResponseEntity<ApiResponse<AccountDetailResponseDto>> getAccountDetail(
            @PathVariable String accountId,
            @RequestHeader("Authorization") String authorization) {
        log.info("계좌 상세 정보 조회 API 호출 - 계좌ID: {}", accountId);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            AccountDetailResponseDto accountDetail = userService.getAccountDetailByAccountId(accountId);
            return ResponseEntity.ok(ApiResponse.success("계좌 상세 정보 조회 성공", accountDetail));
        } catch (Exception e) {
            log.error("계좌 상세 정보 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 상세 정보 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰을 통한 사용자 대출 신청 목록 조회 API
     */
    @GetMapping("/my-loan-applications")
    public ResponseEntity<ApiResponse<List<LoanApplicationResponseDto>>> getUserLoanApplications(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자 대출 신청 목록 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<LoanApplicationResponseDto> loanApplications = userService.getUserLoanApplications(userId);
            return ResponseEntity.ok(ApiResponse.success("대출 신청 목록 조회 성공", loanApplications));
        } catch (Exception e) {
            log.error("대출 신청 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 신청 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * APP_ID를 통한 대출 계약 조회 API
     */
    @GetMapping("/loan-contract/{appId}")
    public ResponseEntity<ApiResponse<LoanContractResponseDto>> getLoanContractByAppId(
            @PathVariable String appId,
            @RequestHeader("Authorization") String authorization) {
        log.info("대출 계약 조회 API 호출 - APP_ID: {}", appId);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            LoanContractResponseDto loanContract = userService.getLoanContractByAppId(appId);
            return ResponseEntity.ok(ApiResponse.success("대출 계약 조회 성공", loanContract));
        } catch (Exception e) {
            log.error("대출 계약 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 계약 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * ACCOUNT_ID를 통한 대출 계좌 상세 정보 조회 API
     * 로직 흐름:
     * 1. ACCOUNT_ID로 LOAN_CONTRACT 테이블을 조회한 후, LOAN_ID 추출
     * 2. LOAN_ID로 LOAN_REPAYMENT_SCHEDULE 테이블 조회
     * 3. ACCOUNT_ID로 TRANSACTION_HISTORY에서 거래내역 조회
     * 4. LOAN_REPAYMENT_SCHEDULE과 TRANSACTION_HISTORY 데이터를 응답으로 반환
     */
    @GetMapping("/loan-account-detail/{accountId}")
    public ResponseEntity<ApiResponse<LoanAccountDetailResponseDto>> getLoanAccountDetail(
            @PathVariable String accountId,
            @RequestHeader("Authorization") String authorization) {
        log.info("대출 계좌 상세 정보 조회 API 호출 - ACCOUNT_ID: {}", accountId);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            LoanAccountDetailResponseDto loanAccountDetail = userService.getLoanAccountDetailByAccountId(accountId);
            return ResponseEntity.ok(ApiResponse.success("대출 계좌 상세 정보 조회 성공", loanAccountDetail));
        } catch (Exception e) {
            log.error("대출 계좌 상세 정보 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 계좌 상세 정보 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰을 통한 사용자 이름 조회 API
     * GET /api/users/my-name
     */
    @GetMapping("/my-name")
    public ResponseEntity<ApiResponse<UserNameResponseDto>> getMyName(
            @RequestHeader("Authorization") String authorization) {
        log.info("JWT 토큰을 통한 사용자 이름 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            UserNameResponseDto userName = userService.getUserNameByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("사용자 이름 조회 성공", userName));
        } catch (Exception e) {
            log.error("사용자 이름 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("사용자 이름 조회 실패: " + e.getMessage()));
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