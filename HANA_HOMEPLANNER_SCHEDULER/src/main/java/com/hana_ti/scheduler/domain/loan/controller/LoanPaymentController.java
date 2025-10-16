package com.hana_ti.scheduler.domain.loan.controller;

import com.hana_ti.scheduler.domain.loan.dto.LoanPaymentTestRequestDto;
import com.hana_ti.scheduler.domain.loan.dto.LoanPaymentTestResponseDto;
import com.hana_ti.scheduler.domain.loan.service.LoanPaymentService;
import com.hana_ti.scheduler.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/loans/payments")
@RequiredArgsConstructor
@Slf4j
public class LoanPaymentController {

    private final LoanPaymentService loanPaymentService;

    /**
     * 대출 자동이체 테스트 (날짜 지정)
     * POST /api/loans/payments/test
     */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<LoanPaymentTestResponseDto>> testLoanPayment(
            @Valid @RequestBody LoanPaymentTestRequestDto request) {
        
        log.info("대출 자동이체 테스트 API 호출 - 대상일: {}", request.getTargetDate());
        
        try {
            // 대출 자동이체 처리 실행
            LoanPaymentService.LoanPaymentResult result = loanPaymentService.processLoanPayments(request.getTargetDate());
            
            // 결과 파일 저장
            String fileName = String.format("loan_payment_test_result_%s.txt", 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
            loanPaymentService.saveExecutionResult(result);
            
            // 응답 DTO 생성
            LoanPaymentTestResponseDto response = LoanPaymentTestResponseDto.from(result, fileName);
            
            log.info("대출 자동이체 테스트 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());
            
            return ResponseEntity.ok(ApiResponse.success("대출 자동이체 테스트가 완료되었습니다", response));
            
        } catch (Exception e) {
            log.error("대출 자동이체 테스트 중 오류 발생 - 대상일: {}", request.getTargetDate(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대출 자동이체 테스트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 대출 자동이체 테스트 (오늘 날짜)
     * POST /api/loans/payments/test-today
     */
    @PostMapping("/test-today")
    public ResponseEntity<ApiResponse<LoanPaymentTestResponseDto>> testLoanPaymentToday() {
        
        log.info("대출 자동이체 테스트 API 호출 (오늘 날짜)");
        
        try {
            // 오늘 날짜로 대출 자동이체 처리
            LoanPaymentService.LoanPaymentResult result = loanPaymentService.processLoanPayments(java.time.LocalDate.now());
            
            // 결과 파일 저장
            String fileName = String.format("loan_payment_test_today_result_%s.txt", 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
            loanPaymentService.saveExecutionResult(result);
            
            // 응답 DTO 생성
            LoanPaymentTestResponseDto response = LoanPaymentTestResponseDto.from(result, fileName);
            
            log.info("대출 자동이체 테스트 완료 (오늘 날짜) - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());
            
            return ResponseEntity.ok(ApiResponse.success("대출 자동이체 테스트가 완료되었습니다", response));
            
        } catch (Exception e) {
            log.error("대출 자동이체 테스트 중 오류 발생 (오늘 날짜)", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대출 자동이체 테스트 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
