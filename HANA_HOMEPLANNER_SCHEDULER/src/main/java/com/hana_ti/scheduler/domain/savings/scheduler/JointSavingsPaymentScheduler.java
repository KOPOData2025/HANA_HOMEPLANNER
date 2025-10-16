package com.hana_ti.scheduler.domain.savings.scheduler;

import com.hana_ti.scheduler.domain.savings.service.JointSavingsPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@Slf4j
public class JointSavingsPaymentScheduler {

    private final JointSavingsPaymentService jointSavingsPaymentService;

    /**
     * 매일 오전 9시 30분에 공동 적금 납입 처리 실행
     */
    @Scheduled(cron = "0 30 9 * * *")
    @Transactional
    public void processJointSavingsMonthlyPayments() {
        log.info("공동 적금 매월 납입 스케줄러 시작 - 실행시간: {}", LocalDateTime.now());

        try {
            // 공동 적금 납입 처리 실행
            JointSavingsPaymentService.JointSavingsPaymentResult result = jointSavingsPaymentService.processJointSavingsPayments();

            // 실행 결과 파일 저장 (데이터가 없어도 로그 생성)
            saveExecutionResult(result);

            log.info("공동 적금 매월 납입 스케줄러 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());

        } catch (Exception e) {
            log.error("공동 적금 매월 납입 스케줄러 실행 중 오류 발생", e);
            saveErrorResult(e);
        }
    }

    /**
     * 실행 결과를 파일로 저장
     */
    private void saveExecutionResult(JointSavingsPaymentService.JointSavingsPaymentResult result) {
        LocalDate today = LocalDate.now();
        String fileName = String.format("/app/logs/joint_savings_payment_result_%s.txt", today.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        
        try (FileWriter writer = new FileWriter(fileName, true)) {
            writer.write("=".repeat(80) + "\n");
            writer.write("공동 적금 매월 납입 처리 결과\n");
            writer.write("실행일시: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
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
                writer.write("- 처리할 공동 적금 납입 스케줄이 없습니다.\n");
                writer.write("- 공동 적금 계좌 또는 납입 스케줄 데이터를 확인해주세요.\n\n");
            }

            // 성공 목록
            if (!result.getSuccessDetails().isEmpty()) {
                writer.write("■ 성공 처리 목록\n");
                for (JointSavingsPaymentService.PaymentDetail detail : result.getSuccessDetails()) {
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

    /**
     * 오류 결과를 파일로 저장
     */
    private void saveErrorResult(Exception e) {
        LocalDate today = LocalDate.now();
        String fileName = String.format("/app/logs/joint_savings_payment_error_%s.txt", today.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        
        try (FileWriter writer = new FileWriter(fileName, true)) {
            writer.write("=".repeat(80) + "\n");
            writer.write("공동 적금 매월 납입 처리 오류\n");
            writer.write("실행일시: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
            writer.write("=".repeat(80) + "\n\n");

            writer.write("■ 오류 내용\n");
            writer.write(e.getMessage() + "\n\n");

            writer.write("■ 스택 트레이스\n");
            for (StackTraceElement element : e.getStackTrace()) {
                writer.write(element.toString() + "\n");
            }

            writer.write("=".repeat(80) + "\n\n");

        } catch (IOException ioException) {
            log.error("오류 결과 파일 저장 중 오류 발생", ioException);
        }
    }
}
