package com.hana_ti.scheduler.domain.loan.service;

import com.hana_ti.scheduler.domain.bank.entity.Account;
import com.hana_ti.scheduler.domain.bank.repository.AccountRepository;
import com.hana_ti.scheduler.domain.loan.entity.LoanContract;
import com.hana_ti.scheduler.domain.loan.entity.LoanRepaymentSchedule;
import com.hana_ti.scheduler.domain.loan.repository.LoanContractRepository;
import com.hana_ti.scheduler.domain.loan.repository.LoanRepaymentScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanPaymentService {

    private final AccountRepository accountRepository;
    private final LoanContractRepository loanContractRepository;
    private final LoanRepaymentScheduleRepository loanRepaymentScheduleRepository;

    /**
     * 대출 자동이체 처리
     */
    @Transactional
    public LoanPaymentResult processLoanPayments(LocalDate targetDate) {
        log.info("대출 자동이체 처리 시작 - 대상일: {}", targetDate);

        LoanPaymentResult result = new LoanPaymentResult();
        result.setExecutionDate(LocalDateTime.now());
        result.setTargetDate(targetDate);

        try {
            // 1. 대출 계좌 조회 (loan, joint_loan 타입)
            List<Account> loanAccounts = new ArrayList<>();
            loanAccounts.addAll(accountRepository.findByAccountType(Account.AccountType.LOAN));
            loanAccounts.addAll(accountRepository.findByAccountType(Account.AccountType.JOINT_LOAN));
            log.info("대출 계좌 조회 완료 - 계좌 수: {}", loanAccounts.size());

            for (Account loanAccount : loanAccounts) {
                try {
                    processLoanAccount(loanAccount, targetDate, result);
                } catch (Exception e) {
                    log.error("계좌별 대출 이체 처리 중 오류 - 계좌ID: {}, 오류: {}", 
                            loanAccount.getAccountId(), e.getMessage());
                    result.addError(loanAccount.getAccountId(), e.getMessage());
                }
            }

            log.info("대출 자동이체 처리 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());

        } catch (Exception e) {
            log.error("대출 자동이체 처리 중 전체 오류 발생", e);
            result.addError("SYSTEM", "전체 처리 중 오류: " + e.getMessage());
        }

        return result;
    }

    /**
     * 개별 대출 계좌 처리
     */
    private void processLoanAccount(Account loanAccount, LocalDate targetDate, LoanPaymentResult result) {
        log.info("대출 계좌 처리 시작 - 계좌ID: {}, 계좌번호: {}", 
                loanAccount.getAccountId(), loanAccount.getAccountNum());

        // 2. 대출 계약 조회 (disburse_account_id로 조회)
        List<LoanContract> contracts = loanContractRepository.findByDisburseAccountId(loanAccount.getAccountId());
        
        if (contracts.isEmpty()) {
            log.info("해당 계좌의 대출 계약이 없음 - 계좌ID: {}", loanAccount.getAccountId());
            return;
        }

        for (LoanContract contract : contracts) {
            try {
                processLoanContract(contract, loanAccount, targetDate, result);
            } catch (Exception e) {
                log.error("대출 계약별 이체 처리 중 오류 - 계약ID: {}, 오류: {}", 
                        contract.getLoanId(), e.getMessage());
                result.addError(contract.getLoanId(), e.getMessage());
            }
        }
    }

    /**
     * 개별 대출 계약 처리
     */
    private void processLoanContract(LoanContract contract, Account loanAccount, LocalDate targetDate, LoanPaymentResult result) {
        log.info("대출 계약 처리 시작 - 계약ID: {}, 대출금액: {}", 
                contract.getLoanId(), contract.getLoanAmount());

        // 3. 상환 스케줄 조회 (오늘 이전이면서 PENDING 또는 OVERDUE 상태)
        List<LoanRepaymentSchedule> schedules = loanRepaymentScheduleRepository
                .findByLoanIdAndStatusInAndDueDateLessThanEqual(
                        contract.getLoanId(), 
                        List.of(LoanRepaymentSchedule.RepaymentStatus.PENDING, LoanRepaymentSchedule.RepaymentStatus.OVERDUE),
                        targetDate
                );

        if (schedules.isEmpty()) {
            log.info("상환 예정 스케줄이 없음 - 계약ID: {}", contract.getLoanId());
            return;
        }

        for (LoanRepaymentSchedule schedule : schedules) {
            try {
                processRepaymentSchedule(schedule, contract, loanAccount, result);
            } catch (Exception e) {
                log.error("상환 스케줄 처리 중 오류 - 스케줄ID: {}, 오류: {}", 
                        schedule.getRepayId(), e.getMessage());
                result.addError(schedule.getRepayId(), e.getMessage());
            }
        }
    }

    /**
     * 개별 상환 스케줄 처리
     */
    @Transactional
    private void processRepaymentSchedule(LoanRepaymentSchedule schedule, LoanContract contract, 
                                        Account loanAccount, LoanPaymentResult result) {
        log.info("상환 스케줄 처리 시작 - 스케줄ID: {}, 상환금액: {}, 만료일: {}", 
                schedule.getRepayId(), schedule.getTotalDue(), schedule.getDueDate());

        // 4. 출금 계좌 조회 (disburse_account_id)
        Account disburseAccount = accountRepository.findById(contract.getDisburseAccountId())
                .orElseThrow(() -> new IllegalArgumentException("출금 계좌를 찾을 수 없습니다: " + contract.getDisburseAccountId()));

        // 5. 자동이체 실행 (출금 → 입금)
        executeAutoTransfer(disburseAccount, loanAccount, schedule.getTotalDue(), schedule, result);
    }

    /**
     * 자동이체 실행
     */
    @Transactional
    private void executeAutoTransfer(Account fromAccount, Account toAccount, BigDecimal amount, 
                                   LoanRepaymentSchedule schedule, LoanPaymentResult result) {
        log.info("자동이체 실행 - 출금계좌: {}, 입금계좌: {}, 금액: {}", 
                fromAccount.getAccountNum(), toAccount.getAccountNum(), amount);

        // 출금 계좌 잔액 확인
        if (fromAccount.getBalance().compareTo(amount) < 0) {
            String errorMsg = String.format("잔액 부족 - 출금계좌: %s, 잔액: %s, 요청금액: %s", 
                    fromAccount.getAccountNum(), fromAccount.getBalance(), amount);
            log.warn(errorMsg);
            result.addFailure(schedule.getRepayId(), errorMsg);
            return;
        }

        try {
            // 거래 ID 생성
            String transactionId = UUID.randomUUID().toString();
            
            // 출금
            fromAccount.withdraw(amount);
            accountRepository.save(fromAccount);

            // 입금
            toAccount.deposit(amount);
            accountRepository.save(toAccount);

            // 상환 스케줄 상태 업데이트
            schedule.markAsPaid();
            loanRepaymentScheduleRepository.save(schedule);

            // 성공 결과 추가
            PaymentDetail detail = new PaymentDetail();
            detail.setScheduleId(schedule.getRepayId());
            detail.setLoanId(schedule.getLoanId());
            detail.setFromAccountId(fromAccount.getAccountId());
            detail.setToAccountId(toAccount.getAccountId());
            detail.setFromAccountNum(fromAccount.getAccountNum());
            detail.setToAccountNum(toAccount.getAccountNum());
            detail.setUserId(fromAccount.getUserId());
            detail.setTransactionId(transactionId);
            detail.setAmount(amount);
            detail.setFromAccountBalance(fromAccount.getBalance());
            detail.setToAccountBalance(toAccount.getBalance());
            detail.setStatus("SUCCESS");
            detail.setProcessedAt(LocalDateTime.now());

            result.addSuccess(detail);
            log.info("자동이체 성공 - 스케줄ID: {}, 거래ID: {}, 금액: {}", schedule.getRepayId(), transactionId, amount);

        } catch (Exception e) {
            String errorMsg = "자동이체 실행 중 오류: " + e.getMessage();
            log.error(errorMsg, e);
            result.addFailure(schedule.getRepayId(), errorMsg);
        }
    }

    /**
     * 실행 결과를 파일로 저장
     */
    public void saveExecutionResult(LoanPaymentResult result) {
        String fileName = String.format("/app/logs/loan_payment_result_%s.txt",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));

        try (FileWriter writer = new FileWriter(fileName)) {
            writer.write("=== 대출 자동이체 처리 결과 ===\n");
            writer.write("실행일시: " + result.getExecutionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
            writer.write("대상일: " + result.getTargetDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "\n");
            writer.write("성공 건수: " + result.getSuccessCount() + "\n");
            writer.write("실패 건수: " + result.getFailureCount() + "\n");
            writer.write("오류 건수: " + result.getErrorCount() + "\n\n");

            // 성공 내역
            if (!result.getSuccessDetails().isEmpty()) {
                writer.write("=== 성공 내역 ===\n");
                for (PaymentDetail detail : result.getSuccessDetails()) {
                    writer.write(String.format("스케줄ID: %s, 대출ID: %s, 거래ID: %s, 사용자ID: %s\n", 
                            detail.getScheduleId(), detail.getLoanId(), detail.getTransactionId(), detail.getUserId()));
                    writer.write(String.format("  출금계좌ID: %s, 출금계좌번호: %s, 출금계좌잔액: %s\n", 
                            detail.getFromAccountId(), detail.getFromAccountNum(), detail.getFromAccountBalance()));
                    writer.write(String.format("  입금계좌ID: %s, 입금계좌번호: %s, 입금계좌잔액: %s\n", 
                            detail.getToAccountId(), detail.getToAccountNum(), detail.getToAccountBalance()));
                    writer.write(String.format("  거래금액: %s, 처리시간: %s\n", 
                            detail.getAmount(), detail.getProcessedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
                    writer.write("\n");
                }
            }

            // 실패 내역
            if (!result.getFailureDetails().isEmpty()) {
                writer.write("=== 실패 내역 ===\n");
                for (PaymentDetail detail : result.getFailureDetails()) {
                    writer.write(String.format("스케줄ID: %s, 오류: %s\n", detail.getScheduleId(), detail.getErrorMessage()));
                }
                writer.write("\n");
            }

            // 오류 내역
            if (!result.getErrorDetails().isEmpty()) {
                writer.write("=== 오류 내역 ===\n");
                for (PaymentDetail detail : result.getErrorDetails()) {
                    writer.write(String.format("ID: %s, 오류: %s\n", detail.getScheduleId(), detail.getErrorMessage()));
                }
            }

            log.info("대출 자동이체 결과 파일 저장 완료 - 파일명: {}", fileName);

        } catch (IOException e) {
            log.error("대출 자동이체 결과 파일 저장 실패", e);
        }
    }

    /**
     * 대출 자동이체 결과 클래스
     */
    public static class LoanPaymentResult {
        private LocalDateTime executionDate;
        private LocalDate targetDate;
        private List<PaymentDetail> successDetails = new ArrayList<>();
        private List<PaymentDetail> failureDetails = new ArrayList<>();
        private List<PaymentDetail> errorDetails = new ArrayList<>();

        public void addSuccess(PaymentDetail detail) {
            successDetails.add(detail);
        }

        public void addFailure(String scheduleId, String errorMessage) {
            PaymentDetail detail = new PaymentDetail();
            detail.setScheduleId(scheduleId);
            detail.setErrorMessage(errorMessage);
            detail.setStatus("FAILURE");
            detail.setProcessedAt(LocalDateTime.now());
            failureDetails.add(detail);
        }

        public void addError(String id, String errorMessage) {
            PaymentDetail detail = new PaymentDetail();
            detail.setScheduleId(id);
            detail.setErrorMessage(errorMessage);
            detail.setStatus("ERROR");
            detail.setProcessedAt(LocalDateTime.now());
            errorDetails.add(detail);
        }

        public int getSuccessCount() { return successDetails.size(); }
        public int getFailureCount() { return failureDetails.size(); }
        public int getErrorCount() { return errorDetails.size(); }

        // Getters and Setters
        public LocalDateTime getExecutionDate() { return executionDate; }
        public void setExecutionDate(LocalDateTime executionDate) { this.executionDate = executionDate; }
        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
        public List<PaymentDetail> getSuccessDetails() { return successDetails; }
        public List<PaymentDetail> getFailureDetails() { return failureDetails; }
        public List<PaymentDetail> getErrorDetails() { return errorDetails; }
    }

    /**
     * 결제 상세 정보 클래스
     */
    public static class PaymentDetail {
        private String scheduleId;
        private String loanId;
        private String fromAccountId;
        private String toAccountId;
        private String fromAccountNum;
        private String toAccountNum;
        private String userId;
        private String transactionId;
        private BigDecimal amount;
        private BigDecimal fromAccountBalance;
        private BigDecimal toAccountBalance;
        private String status;
        private String errorMessage;
        private LocalDateTime processedAt;

        // Getters and Setters
        public String getScheduleId() { return scheduleId; }
        public void setScheduleId(String scheduleId) { this.scheduleId = scheduleId; }
        public String getLoanId() { return loanId; }
        public void setLoanId(String loanId) { this.loanId = loanId; }
        public String getFromAccountId() { return fromAccountId; }
        public void setFromAccountId(String fromAccountId) { this.fromAccountId = fromAccountId; }
        public String getToAccountId() { return toAccountId; }
        public void setToAccountId(String toAccountId) { this.toAccountId = toAccountId; }
        public String getFromAccountNum() { return fromAccountNum; }
        public void setFromAccountNum(String fromAccountNum) { this.fromAccountNum = fromAccountNum; }
        public String getToAccountNum() { return toAccountNum; }
        public void setToAccountNum(String toAccountNum) { this.toAccountNum = toAccountNum; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public BigDecimal getFromAccountBalance() { return fromAccountBalance; }
        public void setFromAccountBalance(BigDecimal fromAccountBalance) { this.fromAccountBalance = fromAccountBalance; }
        public BigDecimal getToAccountBalance() { return toAccountBalance; }
        public void setToAccountBalance(BigDecimal toAccountBalance) { this.toAccountBalance = toAccountBalance; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    }
}
