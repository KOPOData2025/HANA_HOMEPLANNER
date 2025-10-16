package com.hana_ti.home_planner.domain.loan.controller;

import com.hana_ti.home_planner.domain.loan.dto.LoanApprovalRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanApprovalResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.JointLoanApprovalRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.JointLoanApprovalResponseDto;
import com.hana_ti.home_planner.domain.loan.service.LoanApprovalService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Slf4j
public class LoanApprovalController {

    private final LoanApprovalService loanApprovalService;

    /**
     * 대출 승인
     */
    @PostMapping("/approve")
    public ResponseEntity<ApiResponse<LoanApprovalResponseDto>> approveLoan(
            @Valid @RequestBody LoanApprovalRequestDto request) {
        log.info("대출 승인 API 호출 - 신청ID: {}, 심사자: {}, 대출금액: {}, 금리: {}%", 
                request.getLoanApplicationId(), request.getReviewerId(), 
                request.getLoanAmount(), request.getFinalRate());

        try {
            // 대출 승인 처리
            LoanApprovalResponseDto response = loanApprovalService.approveLoan(request);
            
            return ResponseEntity.ok(ApiResponse.success("대출 승인이 완료되었습니다.", response));
        } catch (IllegalArgumentException e) {
            log.error("대출 승인 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 승인 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("대출 승인 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }

    /**
     * 공동 대출 승인
     */
    @PostMapping("/joint-loan/approve")
    public ResponseEntity<ApiResponse<JointLoanApprovalResponseDto>> approveJointLoan(
            @Valid @RequestBody JointLoanApprovalRequestDto request) {
        log.info("공동 대출 승인 API 호출 - 신청ID: {}, 심사자: {}, 공동참여자: {}, 대출금액: {}, 금리: {}%", 
                request.getLoanApplicationId(), request.getReviewerId(), request.getJointParticipantId(),
                request.getLoanAmount(), request.getFinalRate());

        try {
            // 공동 대출 승인 처리
            JointLoanApprovalResponseDto response = loanApprovalService.approveJointLoan(request);
            
            return ResponseEntity.ok(ApiResponse.success("공동 대출 승인이 완료되었습니다.", response));
        } catch (IllegalArgumentException e) {
            log.error("공동 대출 승인 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("공동 대출 승인 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("공동 대출 승인 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }
}
