package com.hana_ti.home_planner.domain.bank.controller;

import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.BankResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.InvitationAccountInfoResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.JointSavingsInviteCreateRequestDto;
import com.hana_ti.home_planner.domain.bank.dto.JointSavingsInviteCreateResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.SavingsMaturityInfoResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.SavingsMaturityPayoutRequestDto;
import com.hana_ti.home_planner.domain.bank.dto.SavingsMaturityPayoutResponseDto;
import com.hana_ti.home_planner.domain.bank.entity.BankStatus;
import com.hana_ti.home_planner.domain.bank.service.BankService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
@Slf4j
public class BankController {

    private final BankService bankService;
    private final JwtUtil jwtUtil;

    /**
     * 모든 은행 조회
     * GET /api/banks
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BankResponseDto>>> getAllBanks() {
        log.info("모든 은행 조회 API 호출");
        
        List<BankResponseDto> banks = bankService.getAllBanks();
        
        log.info("모든 은행 조회 완료 - 조회된 은행 수: {}개", banks.size());
        
        return ResponseEntity.ok(ApiResponse.success("은행 목록 조회 완료", banks));
    }

    /**
     * 활성 상태 은행만 조회
     * GET /api/banks/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BankResponseDto>>> getActiveBanks() {
        log.info("활성 상태 은행 조회 API 호출");
        
        List<BankResponseDto> banks = bankService.getActiveBanks();
        
        log.info("활성 상태 은행 조회 완료 - 조회된 은행 수: {}개", banks.size());
        
        return ResponseEntity.ok(ApiResponse.success("활성 은행 목록 조회 완료", banks));
    }

    /**
     * 은행 ID로 상세 조회
     * GET /api/banks/{bankId}
     */
    @GetMapping("/{bankId}")
    public ResponseEntity<ApiResponse<BankResponseDto>> getBankById(@PathVariable String bankId) {
        log.info("은행 상세 조회 API 호출 - ID: {}", bankId);
        
        BankResponseDto bank = bankService.getBankById(bankId);
        
        log.info("은행 상세 조회 완료 - 은행명: {}", bank.getBankName());
        
        return ResponseEntity.ok(ApiResponse.success("은행 상세 정보 조회 완료", bank));
    }

    /**
     * 은행 코드로 조회
     * GET /api/banks/code/{bankCode}
     */
    @GetMapping("/code/{bankCode}")
    public ResponseEntity<ApiResponse<BankResponseDto>> getBankByCode(@PathVariable Integer bankCode) {
        log.info("은행 코드 조회 API 호출 - 코드: {}", bankCode);
        
        BankResponseDto bank = bankService.getBankByCode(bankCode);
        
        log.info("은행 코드 조회 완료 - 은행명: {}", bank.getBankName());
        
        return ResponseEntity.ok(ApiResponse.success("은행 정보 조회 완료", bank));
    }

    /**
     * 은행명으로 검색
     * GET /api/banks/search?name={bankName}
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BankResponseDto>>> searchBanksByName(
            @RequestParam(name = "name") String bankName) {
        log.info("은행명 검색 API 호출 - 검색어: {}", bankName);
        
        List<BankResponseDto> banks = bankService.searchBanksByName(bankName);
        
        log.info("은행명 검색 완료 - 검색된 은행 수: {}개", banks.size());
        
        return ResponseEntity.ok(ApiResponse.success("은행 검색 완료", banks));
    }

    /**
     * 상태별 은행 조회
     * GET /api/banks/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BankResponseDto>>> getBanksByStatus(@PathVariable BankStatus status) {
        log.info("상태별 은행 조회 API 호출 - 상태: {}", status);
        
        List<BankResponseDto> banks = bankService.getBanksByStatus(status);
        
        log.info("상태별 은행 조회 완료 - 조회된 은행 수: {}개", banks.size());
        
        return ResponseEntity.ok(ApiResponse.success(status.getDescription() + " 은행 목록 조회 완료", banks));
    }

    /**
     * inviteId로 ACCOUNT_INVITATION 조회 API
     * GET /api/banks/invitations/{inviteId}
     */
    @GetMapping("/invitations/{inviteId}")
    public ResponseEntity<ApiResponse<AccountInvitationResponseDto>> getAccountInvitationByInviteId(
            @PathVariable String inviteId) {
        log.info("초대 조회 API 호출 - 초대ID: {}", inviteId);
        
        try {
            AccountInvitationResponseDto invitation = bankService.getAccountInvitationByInviteId(inviteId);
            
            log.info("초대 조회 완료 - 초대ID: {}, 상태: {}", invitation.getInviteId(), invitation.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("초대 정보 조회가 완료되었습니다", invitation));
        } catch (Exception e) {
            log.error("초대 조회 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 초대 기반 공동적금 가입 API
     * POST /api/banks/joint-savings/invite
     */
    @PostMapping("/joint-savings/invite")
    public ResponseEntity<ApiResponse<JointSavingsInviteCreateResponseDto>> createJointSavingsAccountByInvite(
            @Valid @RequestBody JointSavingsInviteCreateRequestDto request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        log.info("초대 기반 공동적금 가입 API 호출 - 사용자ID: {}, 초대ID: {}, 시작일: {}, 만기일: {}, 월납입액: {}, 초기입금: {}, 출금계좌: {}", 
                userId, request.getInviteId(), request.getStartDate(), request.getEndDate(), 
                request.getMonthlyAmount(), request.getInitialDeposit(), request.getSourceAccountNumber());
        
        try {
            JointSavingsInviteCreateResponseDto response = bankService.createJointSavingsAccountByInvite(userId, request);
            
            log.info("초대 기반 공동적금 가입 완료 - 계좌ID: {}, 적금가입ID: {}, 납입스케줄수: {}", 
                    response.getAccountId(), response.getUserSavingsId(), response.getPaymentScheduleCount());
            
            return ResponseEntity.ok(ApiResponse.success("초대 기반 공동적금 가입이 완료되었습니다", response));
        } catch (Exception e) {
            log.error("초대 기반 공동적금 가입 중 오류 발생 - 사용자ID: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("초대 기반 공동적금 가입에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * INVITE_ID를 통한 계좌 정보와 적금 상품 정보 조회 API
     * GET /api/banks/invitations/{inviteId}/account-info
     */
    @GetMapping("/invitations/{inviteId}/account-info")
    public ResponseEntity<ApiResponse<InvitationAccountInfoResponseDto>> getAccountInfoByInviteId(
            @PathVariable String inviteId) {
        log.info("초대 ID를 통한 계좌 정보 조회 API 호출 - 초대ID: {}", inviteId);
        
        try {
            InvitationAccountInfoResponseDto accountInfo = bankService.getAccountInfoByInviteId(inviteId);
            
            log.info("초대 ID를 통한 계좌 정보 조회 완료 - 초대ID: {}, 계좌ID: {}, 상품ID: {}, 총기간: {}개월, 적금수: {}개", 
                    inviteId, accountInfo.getAccountId(), 
                    accountInfo.getUserSavingsList().get(0).getProductId(), 
                    accountInfo.getPeriodInfo().getTotalMonths(),
                    accountInfo.getUserSavingsList().size());
            
            return ResponseEntity.ok(ApiResponse.success("초대 기반 계좌 정보 조회가 완료되었습니다", accountInfo));
        } catch (Exception e) {
            log.error("초대 ID를 통한 계좌 정보 조회 중 오류 발생 - 초대ID: {}", inviteId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("초대 기반 계좌 정보 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * ACCOUNT_ID를 통한 적금 계좌 만기일 정보 조회 API
     * GET /api/banks/savings/{accountId}/maturity-info
     */
    @GetMapping("/savings/{accountId}/maturity-info")
    public ResponseEntity<ApiResponse<SavingsMaturityInfoResponseDto>> getSavingsMaturityInfo(
            @PathVariable String accountId) {
        log.info("ACCOUNT_ID를 통한 적금 계좌 만기일 정보 조회 API 호출 - 계좌ID: {}", accountId);
        
        try {
            SavingsMaturityInfoResponseDto maturityInfo = bankService.getSavingsMaturityInfoByAccountId(accountId);
            
            log.info("적금 계좌 만기일 정보 조회 완료 - 계좌ID: {}, 시작일: {}, 만기일: {}, 총기간: {}개월", 
                    accountId, maturityInfo.getStartDate(), maturityInfo.getEndDate(), maturityInfo.getTotalMonths());
            
            return ResponseEntity.ok(ApiResponse.success("적금 계좌 만기일 정보 조회가 완료되었습니다", maturityInfo));
        } catch (Exception e) {
            log.error("적금 계좌 만기일 정보 조회 중 오류 발생 - 계좌ID: {}", accountId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("적금 계좌 만기일 정보 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 적금 만기 상납금 지급 API
     * POST /api/banks/savings/{accountId}/maturity-payout
     */
    @PostMapping("/savings/{accountId}/maturity-payout")
    public ResponseEntity<ApiResponse<SavingsMaturityPayoutResponseDto>> processSavingsMaturityPayout(
            @PathVariable String accountId,
            @Valid @RequestBody SavingsMaturityPayoutRequestDto request,
            HttpServletRequest httpRequest) {
        
        log.info("적금 만기 상납금 지급 API 호출 - 계좌ID: {}, 지급계좌: {}", accountId, request.getTargetAccountNumber());
        
        try {
            String userId = getUserIdFromToken(httpRequest);
            SavingsMaturityPayoutResponseDto response = bankService.processSavingsMaturityPayout(userId, accountId, request);
            
            log.info("적금 만기 상납금 지급 완료 - 계좌ID: {}, 원금: {}, 이자: {}, 총지급액: {}, 거래ID: {}", 
                    accountId, response.getPrincipalAmount(), response.getInterestAmount(), 
                    response.getTotalPayoutAmount(), response.getTransactionId());
            
            return ResponseEntity.ok(ApiResponse.success("적금 만기 상납금 지급이 완료되었습니다", response));
            
        } catch (Exception e) {
            log.error("적금 만기 상납금 지급 실패 - 계좌ID: {}", accountId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("적금 만기 상납금 지급에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    private String getUserIdFromToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("인증 토큰이 필요합니다");
        }
        
        String token = authorization.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
}
