package com.hana_ti.home_planner.domain.loan.controller;

import com.hana_ti.home_planner.domain.loan.dto.LoanDisbursementRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanDisbursementResponseDto;
import com.hana_ti.home_planner.domain.loan.service.LoanDisbursementService;
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
public class LoanDisbursementController {

    private final LoanDisbursementService loanDisbursementService;

    /**
     * 대출 실행
     */
    @PostMapping("/disburse")
    public ResponseEntity<ApiResponse<LoanDisbursementResponseDto>> disburseLoan(
            @Valid @RequestBody LoanDisbursementRequestDto request) {
        log.info("대출 실행 API 호출 - 계약ID: {}, 실행금액: {}", request.getLoanId(), request.getAmount());

        try {
            // 대출 실행 처리
            LoanDisbursementResponseDto response = loanDisbursementService.disburseLoan(request);
            
            return ResponseEntity.ok(ApiResponse.success("대출 실행이 완료되었습니다.", response));
        } catch (IllegalArgumentException e) {
            log.error("대출 실행 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 실행 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("대출 실행 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("서버 오류가 발생했습니다."));
        }
    }
}
