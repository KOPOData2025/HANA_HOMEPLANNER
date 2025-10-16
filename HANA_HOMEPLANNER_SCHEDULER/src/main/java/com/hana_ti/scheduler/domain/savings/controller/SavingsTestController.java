package com.hana_ti.scheduler.domain.savings.controller;

import com.hana_ti.scheduler.domain.savings.scheduler.JointSavingsPaymentScheduler;
import com.hana_ti.scheduler.domain.savings.scheduler.SavingsPaymentScheduler;
import com.hana_ti.scheduler.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test/savings")
@RequiredArgsConstructor
@Slf4j
public class SavingsTestController {

    private final SavingsPaymentScheduler savingsPaymentScheduler;
    private final JointSavingsPaymentScheduler jointSavingsPaymentScheduler;

    /**
     * 일반 적금 스케줄러 수동 실행
     */
    @PostMapping("/run-savings-scheduler")
    public ResponseEntity<ApiResponse<String>> runSavingsScheduler() {
        try {
            log.info("일반 적금 스케줄러 수동 실행 시작");
            savingsPaymentScheduler.processMonthlyPayments();
            return ResponseEntity.ok(ApiResponse.success("일반 적금 스케줄러 실행 완료", null));
        } catch (Exception e) {
            log.error("일반 적금 스케줄러 실행 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("일반 적금 스케줄러 실행 실패: " + e.getMessage()));
        }
    }

    /**
     * 공동 적금 스케줄러 수동 실행
     */
    @PostMapping("/run-joint-savings-scheduler")
    public ResponseEntity<ApiResponse<String>> runJointSavingsScheduler() {
        try {
            log.info("공동 적금 스케줄러 수동 실행 시작");
            jointSavingsPaymentScheduler.processJointSavingsMonthlyPayments();
            return ResponseEntity.ok(ApiResponse.success("공동 적금 스케줄러 실행 완료", null));
        } catch (Exception e) {
            log.error("공동 적금 스케줄러 실행 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("공동 적금 스케줄러 실행 실패: " + e.getMessage()));
        }
    }
}
