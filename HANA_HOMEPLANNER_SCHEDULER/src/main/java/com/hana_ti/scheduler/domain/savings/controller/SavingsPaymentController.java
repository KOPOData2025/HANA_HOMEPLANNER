package com.hana_ti.scheduler.domain.savings.controller;

import com.hana_ti.scheduler.domain.savings.dto.SavingsPaymentRequestDto;
import com.hana_ti.scheduler.domain.savings.dto.SavingsPaymentResponseDto;
import com.hana_ti.scheduler.domain.savings.service.SavingsPaymentService;
import com.hana_ti.scheduler.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
@Slf4j
public class SavingsPaymentController {

    private final SavingsPaymentService savingsPaymentService;

    /**
     * 적금 매월 납입 처리 (지정 날짜 기준) - 테스트용
     */
    @PostMapping("/process-payments")
    public ResponseEntity<ApiResponse<SavingsPaymentResponseDto>> processMonthlyPayments(
            @Valid @RequestBody SavingsPaymentRequestDto request) {
        
        log.info("적금 납입 처리 API 호출 - 처리날짜: {}", request.getProcessDate());
        
        try {
            // 적금 납입 처리 실행
            SavingsPaymentService.SavingsPaymentResult result = 
                    savingsPaymentService.processMonthlyPayments(request.getProcessDate());
            
            // 응답 DTO 생성
            SavingsPaymentResponseDto response = SavingsPaymentResponseDto.create(
                    request.getProcessDate(), result);
            
            // 실행 결과 파일 저장 (API 호출시에도 로그 생성)
            saveExecutionResult(result, request.getProcessDate());
            
            log.info("적금 납입 처리 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());
            
            return ResponseEntity.ok(ApiResponse.success("적금 납입 처리가 완료되었습니다.", response));
            
        } catch (Exception e) {
            log.error("적금 납입 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("적금 납입 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 적금 매월 납입 처리 (오늘 날짜 기준)
     */
    @PostMapping("/process-payments/today")
    public ResponseEntity<ApiResponse<SavingsPaymentResponseDto>> processTodayPayments() {
        
        log.info("적금 납입 처리 API 호출 - 오늘 날짜 기준");
        
        try {
            // 적금 납입 처리 실행 (오늘 날짜 기준)
            SavingsPaymentService.SavingsPaymentResult result = 
                    savingsPaymentService.processMonthlyPayments();
            
            // 응답 DTO 생성
            SavingsPaymentResponseDto response = SavingsPaymentResponseDto.create(
                    LocalDate.now(), result);
            
            // 실행 결과 파일 저장 (API 호출시에도 로그 생성)
            saveExecutionResult(result, LocalDate.now());
            
            log.info("적금 납입 처리 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());
            
            return ResponseEntity.ok(ApiResponse.success("적금 납입 처리가 완료되었습니다.", response));
            
        } catch (Exception e) {
            log.error("적금 납입 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("적금 납입 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 실행 결과를 파일로 저장
     */
    private void saveExecutionResult(SavingsPaymentService.SavingsPaymentResult result, LocalDate processDate) {
        String fileName = String.format("/app/logs/savings_payment_result_%s.txt",
                processDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        
        try (FileWriter writer = new FileWriter(fileName, true)) {
            writer.write("=".repeat(80) + "\n");
            writer.write("적금 매월 납입 처리 결과 (API 호출)\n");
            writer.write("실행일시: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
            writer.write("처리날짜: " + processDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "\n");
            writer.write("=".repeat(80) + "\n\n");

            // 전체 통계
            writer.write("■ 전체 처리 결과\n");
            writer.write(String.format("성공: %d건\n", result.getSuccessCount()));
            writer.write(String.format("실패: %d건\n", result.getFailureCount()));
            writer.write(String.format("오류: %d건\n", result.getErrorCount()));
            writer.write(String.format("총 납입금액: %,d원\n\n", result.getTotalAmount().longValue()));
            
            // 처리할 데이터가 없는 경우 메시지 추가
            if (result.getSuccessCount() == 0 && result.getFailureCount() == 0 && result.getErrorCount() == 0) {
                writer.write("■ 처리 결과\n");
                writer.write("- 처리할 적금 납입 스케줄이 없습니다.\n");
                writer.write("- 적금 계좌 또는 납입 스케줄 데이터를 확인해주세요.\n\n");
            }

            // 성공 목록
            if (!result.getSuccessDetails().isEmpty()) {
                writer.write("■ 성공 처리 목록\n");
                for (SavingsPaymentService.PaymentDetail detail : result.getSuccessDetails()) {
                    writer.write(String.format("스케줄ID: %s, 사용자ID: %s\n", 
                            detail.getPaymentId(), detail.getUserId()));
                    writer.write(String.format("  출금계좌ID: %s, 출금계좌번호: %s, 출금계좌잔액: %s\n", 
                            detail.getFromAccountId(), detail.getFromAccountNum(), detail.getFromAccountBalance()));
                    writer.write(String.format("  입금계좌ID: %s, 입금계좌번호: %s, 입금계좌잔액: %s\n", 
                            detail.getToAccountId(), detail.getToAccountNum(), detail.getToAccountBalance()));
                    writer.write(String.format("  출금거래ID: %s, 입금거래ID: %s\n", 
                            detail.getDebitTransactionId(), detail.getCreditTransactionId()));
                    writer.write(String.format("  거래금액: %s, 처리시간: %s\n", 
                            detail.getAmount(), detail.getProcessedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
                    writer.write("\n");
                }
            }

            // 실패 목록
            if (!result.getFailureList().isEmpty()) {
                writer.write("■ 실패 처리 목록\n");
                for (String failure : result.getFailureList()) {
                    writer.write(String.format("- %s\n", failure));
                }
                writer.write("\n");
            }

            // 오류 목록
            if (!result.getErrorList().isEmpty()) {
                writer.write("■ 오류 발생 목록\n");
                for (String error : result.getErrorList()) {
                    writer.write(String.format("- %s\n", error));
                }
                writer.write("\n");
            }

            // 전체 오류
            if (!result.getGlobalErrors().isEmpty()) {
                writer.write("■ 전체 오류\n");
                for (String globalError : result.getGlobalErrors()) {
                    writer.write(String.format("- %s\n", globalError));
                }
                writer.write("\n");
            }

            writer.write("=".repeat(80) + "\n\n");

        } catch (IOException e) {
            log.error("실행 결과 파일 저장 중 오류 발생", e);
        }
    }
}
