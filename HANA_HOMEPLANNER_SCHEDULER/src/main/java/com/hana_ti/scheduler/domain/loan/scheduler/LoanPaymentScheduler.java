package com.hana_ti.scheduler.domain.loan.scheduler;

import com.hana_ti.scheduler.domain.loan.service.LoanPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoanPaymentScheduler {

    private final LoanPaymentService loanPaymentService;

    /**
     * 매일 오전 8시에 대출 자동이체 처리 실행
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void processLoanPayments() {
        log.info("대출 자동이체 스케줄러 시작 - 실행시간: {}", LocalDateTime.now());

        try {
            // 오늘 날짜로 대출 자동이체 처리
            LoanPaymentService.LoanPaymentResult result = loanPaymentService.processLoanPayments(LocalDate.now());

            // 실행 결과 파일 저장
            loanPaymentService.saveExecutionResult(result);

            log.info("대출 자동이체 스케줄러 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());

        } catch (Exception e) {
            log.error("대출 자동이체 스케줄러 실행 중 오류 발생", e);
        }
    }
}
