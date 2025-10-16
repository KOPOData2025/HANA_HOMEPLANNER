package com.hana_ti.scheduler.domain.savings.service;

import com.hana_ti.scheduler.domain.bank.entity.Account;
import com.hana_ti.scheduler.domain.bank.entity.AccountParticipant;
import com.hana_ti.scheduler.domain.bank.entity.TransactionHistory;
import com.hana_ti.scheduler.domain.bank.repository.AccountParticipantRepository;
import com.hana_ti.scheduler.domain.bank.repository.AccountRepository;
import com.hana_ti.scheduler.domain.bank.repository.TransactionHistoryRepository;
import com.hana_ti.scheduler.domain.savings.entity.PaymentSchedule;
import com.hana_ti.scheduler.domain.savings.entity.UserSavings;
import com.hana_ti.scheduler.domain.savings.repository.PaymentScheduleRepository;
import com.hana_ti.scheduler.domain.savings.repository.UserSavingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Recover;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class JointSavingsPaymentService {

    private final AccountRepository accountRepository;
    private final AccountParticipantRepository accountParticipantRepository;
    private final UserSavingsRepository userSavingsRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    // 계좌별 잠금을 위한 ConcurrentHashMap
    private final ConcurrentHashMap<String, ReentrantLock> accountLocks = new ConcurrentHashMap<>();

    /**
     * 공동 적금 매월 납입 처리 (오늘 날짜 기준)
     */
    @Transactional
    public JointSavingsPaymentResult processJointSavingsPayments() {
        return processJointSavingsPayments(LocalDate.now());
    }

    /**
     * 공동 적금 매월 납입 처리 (지정 날짜 기준)
     */
    @Transactional
    public JointSavingsPaymentResult processJointSavingsPayments(LocalDate processDate) {
        log.info("공동 적금 매월 납입 처리 시작 - 처리일: {}", processDate);

        JointSavingsPaymentResult result = new JointSavingsPaymentResult();
        LocalDate today = processDate;

        try {
            // 1. ACCOUNT에서 ACCOUNT_TYPE이 JOINT_SAVING인 계좌들을 조회
            List<Account> jointSavingsAccounts = accountRepository.findByAccountType(Account.AccountType.JOINT_SAVING);
            log.info("공동 적금 계좌 조회 완료 - 총 {}개 계좌", jointSavingsAccounts.size());

            for (Account jointSavingsAccount : jointSavingsAccounts) {
                try {
                    processJointSavingsAccountPayments(jointSavingsAccount, today, result);
                } catch (Exception e) {
                    log.error("공동 적금 계좌 처리 중 오류 발생 - 계좌ID: {}, 오류: {}", 
                            jointSavingsAccount.getAccountId(), e.getMessage());
                    result.addError(jointSavingsAccount.getAccountId(), e.getMessage());
                }
            }

            log.info("공동 적금 매월 납입 처리 완료 - 성공: {}, 실패: {}, 오류: {}", 
                    result.getSuccessCount(), result.getFailureCount(), result.getErrorCount());

        } catch (Exception e) {
            log.error("공동 적금 매월 납입 처리 중 전체 오류 발생", e);
            result.addGlobalError(e.getMessage());
        }

        return result;
    }

    /**
     * 개별 공동 적금 계좌의 납입 처리 (동시성 제어 포함)
     */
    private void processJointSavingsAccountPayments(Account jointSavingsAccount, LocalDate today, JointSavingsPaymentResult result) {
        log.info("공동 적금 계좌 납입 처리 시작 - 계좌ID: {}", jointSavingsAccount.getAccountId());

        // 계좌별 잠금 획득
        ReentrantLock lock = accountLocks.computeIfAbsent(jointSavingsAccount.getAccountId(), k -> new ReentrantLock());
        
        try {
            lock.lock();
            log.debug("공동 적금 계좌 잠금 획득 - 계좌ID: {}", jointSavingsAccount.getAccountId());
            
            processJointSavingsAccountPaymentsInternal(jointSavingsAccount, today, result);
            
        } finally {
            lock.unlock();
            log.debug("공동 적금 계좌 잠금 해제 - 계좌ID: {}", jointSavingsAccount.getAccountId());
        }
    }

    /**
     * 개별 공동 적금 계좌의 납입 처리 내부 로직
     */
    private void processJointSavingsAccountPaymentsInternal(Account jointSavingsAccount, LocalDate today, JointSavingsPaymentResult result) {

        // 2. ACCOUNT_ID로 ACCOUNT_PARTICIPANT에서 참여중인 USER_ID 조회
        List<AccountParticipant> participants = accountParticipantRepository.findByAccountIdOrderByCreatedAtAsc(jointSavingsAccount.getAccountId());
        log.info("공동 적금 참여자 조회 완료 - 계좌ID: {}, 참여자수: {}", 
                jointSavingsAccount.getAccountId(), participants.size());

        for (AccountParticipant participant : participants) {
            try {
                processParticipantPayments(participant, jointSavingsAccount, today, result);
            } catch (Exception e) {
                log.error("참여자 납입 처리 중 오류 발생 - 참여자ID: {}, 오류: {}", 
                        participant.getParticipantId(), e.getMessage());
                result.addError(participant.getParticipantId(), e.getMessage());
            }
        }
    }

    /**
     * 개별 참여자의 납입 처리
     */
    private void processParticipantPayments(AccountParticipant participant, Account jointSavingsAccount, 
                                         LocalDate today, JointSavingsPaymentResult result) {
        log.info("참여자 납입 처리 시작 - 참여자ID: {}, 사용자ID: {}", 
                participant.getParticipantId(), participant.getUserId());

        // 3. USER_SAVINGS에서 ACCOUNT_ID와 USER_ID로 조회 후 AUTO_DEBIT_ACCOUNT_ID와 MONTHLY_AMOUNT 값 수집
        UserSavings userSavings = userSavingsRepository.findByAccountIdAndUserId(
                jointSavingsAccount.getAccountId(), participant.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "사용자 적금 정보를 찾을 수 없습니다 - 계좌ID: " + jointSavingsAccount.getAccountId() + 
                        ", 사용자ID: " + participant.getUserId()));

        String autoDebitAccountId = userSavings.getAutoDebitAccountId();
        if (autoDebitAccountId == null || autoDebitAccountId.trim().isEmpty()) {
            log.info("자동이체 계좌가 설정되지 않음 - 사용자ID: {}", participant.getUserId());
            return;
        }

        // 4. PAYMENT_SCHEDULE에서 USER_ID와 ACCOUNT_ID로 조회 후, 오늘날짜 기준 오늘 또는 이전에 날짜에 대해서 STATUS 값이 PENDING인 경우 자동이체 시작
        List<PaymentSchedule> dueSchedules = paymentScheduleRepository
                .findByUserIdAndAccountIdAndDueDateLessThanEqualAndStatus(
                        participant.getUserId(), 
                        jointSavingsAccount.getAccountId(), 
                        today, 
                        PaymentSchedule.PaymentStatus.PENDING);

        // 연체된 스케줄도 조회
        List<PaymentSchedule> overdueSchedules = paymentScheduleRepository
                .findByUserIdAndAccountIdAndDueDateBeforeAndStatus(
                        participant.getUserId(), 
                        jointSavingsAccount.getAccountId(), 
                        today, 
                        PaymentSchedule.PaymentStatus.OVERDUE);

        List<PaymentSchedule> allSchedules = new ArrayList<>();
        allSchedules.addAll(dueSchedules);
        allSchedules.addAll(overdueSchedules);

        log.info("납입 대상 스케줄 조회 완료 - 사용자ID: {}, 오늘납입: {}개, 연체납입: {}개", 
                participant.getUserId(), dueSchedules.size(), overdueSchedules.size());

        for (PaymentSchedule schedule : allSchedules) {
            try {
                processParticipantPaymentSchedule(schedule, autoDebitAccountId, jointSavingsAccount, participant, result);
            } catch (Exception e) {
                log.error("참여자 납입 스케줄 처리 중 오류 발생 - 스케줄ID: {}, 오류: {}", 
                        schedule.getPaymentId(), e.getMessage());
                result.addError(schedule.getPaymentId(), e.getMessage());
            }
        }
    }

    /**
     * 개별 참여자 납입 스케줄 처리 (재시도 메커니즘 포함)
     */
    @Retryable(
        value = {Exception.class}, 
        maxAttempts = 3, 
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    private void processParticipantPaymentSchedule(PaymentSchedule schedule, String autoDebitAccountId, 
                                                 Account jointSavingsAccount, AccountParticipant participant, 
                                                 JointSavingsPaymentResult result) {
        log.info("참여자 납입 스케줄 처리 시작 - 스케줄ID: {}, 금액: {}", 
                schedule.getPaymentId(), schedule.getAmount());

        // 5. AUTO_DEBIT_ACCOUNT_ID로 account에서 계좌번호로 조회한 후, 출금, 출금 성공시 ACCOUNT_ID로 조회한 계좌에서 입금 처리
        Account autoDebitAccount = accountRepository.findByAccountNum(autoDebitAccountId)
                .orElseThrow(() -> new IllegalArgumentException("자동이체 계좌를 찾을 수 없습니다: " + autoDebitAccountId));

        // 잔액 확인
        if (autoDebitAccount.getBalance().compareTo(schedule.getAmount()) < 0) {
            log.warn("자동이체 계좌 잔액 부족 - 계좌: {}, 잔액: {}, 필요금액: {}", 
                    autoDebitAccountId, autoDebitAccount.getBalance(), schedule.getAmount());
            
            // 실패 시 OVERDUE로 변경
            schedule.updateStatus(PaymentSchedule.PaymentStatus.OVERDUE);
            paymentScheduleRepository.save(schedule);
            result.addFailure(schedule.getPaymentId(), "잔액 부족");
            return;
        }

        // 자금 이동 처리
        String baseTransactionId = UUID.randomUUID().toString();
        String debitTransactionId = baseTransactionId.substring(0, 29) + "_DEB"; // 36자 제한
        String creditTransactionId = baseTransactionId.substring(0, 29) + "_CRE"; // 36자 제한

        // 자동이체 계좌에서 출금
        BigDecimal newDebitBalance = autoDebitAccount.getBalance().subtract(schedule.getAmount());
        autoDebitAccount.updateBalance(newDebitBalance);
        accountRepository.save(autoDebitAccount);

        // 공동 적금 계좌에 입금
        BigDecimal newCreditBalance = jointSavingsAccount.getBalance().add(schedule.getAmount());
        jointSavingsAccount.updateBalance(newCreditBalance);
        accountRepository.save(jointSavingsAccount);

        // 7. 입금 출금 각각 TRANSACTION_HISTORY 생성
        // 자동이체 계좌 거래내역 (출금)
        TransactionHistory debitTransaction = TransactionHistory.create(
                debitTransactionId,
                autoDebitAccount.getAccountId(),
                TransactionHistory.TransactionType.WITHDRAWAL,
                schedule.getAmount().negate(), // 음수로 기록 (출금)
                newDebitBalance,
                "공동적금 자동이체 출금 - 공동적금계좌: " + jointSavingsAccount.getAccountNum()
        );
        transactionHistoryRepository.save(debitTransaction);

        // 공동 적금 계좌 거래내역 (입금)
        TransactionHistory creditTransaction = TransactionHistory.create(
                creditTransactionId,
                jointSavingsAccount.getAccountId(),
                TransactionHistory.TransactionType.DEPOSIT,
                schedule.getAmount(), // 양수로 기록 (입금)
                newCreditBalance,
                "공동적금 자동이체 입금 - 출금계좌: " + autoDebitAccount.getAccountNum()
        );
        transactionHistoryRepository.save(creditTransaction);

        // 6. PAYMENT_SCHEDULE 상태값 PAID로 변경
        schedule.markAsPaid(LocalDate.now());
        paymentScheduleRepository.save(schedule);

        result.addSuccess(schedule.getPaymentId(), participant.getUserId(), 
                         autoDebitAccount.getAccountId(), jointSavingsAccount.getAccountId(),
                         autoDebitAccount.getAccountNum(), jointSavingsAccount.getAccountNum(),
                         debitTransactionId, creditTransactionId, schedule.getAmount(),
                         newDebitBalance, newCreditBalance);

        log.info("참여자 납입 스케줄 처리 완료 - 스케줄ID: {}, 금액: {}",
                schedule.getPaymentId(), schedule.getAmount());
    }

    /**
     * 재시도 실패 시 복구 메서드
     */
    @Recover
    private void recoverParticipantPaymentSchedule(Exception ex, PaymentSchedule schedule, String autoDebitAccountId,
                                                 Account jointSavingsAccount, AccountParticipant participant, 
                                                 JointSavingsPaymentResult result) {
        log.error("참여자 납입 스케줄 처리 최종 실패 - 스케줄ID: {}, 오류: {}", 
                schedule.getPaymentId(), ex.getMessage());
        
        // 실패한 스케줄을 OVERDUE로 변경
        schedule.updateStatus(PaymentSchedule.PaymentStatus.OVERDUE);
        paymentScheduleRepository.save(schedule);
        
        result.addFailure(schedule.getPaymentId(), "재시도 후 최종 실패: " + ex.getMessage());
    }

    /**
     * 공동 적금 납입 처리 결과 클래스
     */
    public static class JointSavingsPaymentResult {
        private final List<PaymentDetail> successDetails = new ArrayList<>();
        private final List<String> failureList = new ArrayList<>();
        private final List<String> errorList = new ArrayList<>();
        private final List<String> globalErrors = new ArrayList<>();
        private BigDecimal totalAmount = BigDecimal.ZERO;

        public void addSuccess(String paymentId, String userId, String fromAccountId, String toAccountId, 
                             String fromAccountNum, String toAccountNum, String debitTransactionId, 
                             String creditTransactionId, BigDecimal amount, BigDecimal fromBalance, 
                             BigDecimal toBalance) {
            PaymentDetail detail = new PaymentDetail();
            detail.setPaymentId(paymentId);
            detail.setUserId(userId);
            detail.setFromAccountId(fromAccountId);
            detail.setToAccountId(toAccountId);
            detail.setFromAccountNum(fromAccountNum);
            detail.setToAccountNum(toAccountNum);
            detail.setDebitTransactionId(debitTransactionId);
            detail.setCreditTransactionId(creditTransactionId);
            detail.setAmount(amount);
            detail.setFromAccountBalance(fromBalance);
            detail.setToAccountBalance(toBalance);
            detail.setProcessedAt(LocalDateTime.now());
            
            successDetails.add(detail);
            totalAmount = totalAmount.add(amount);
        }

        public void addFailure(String paymentId, String reason) {
            failureList.add(paymentId + " (" + reason + ")");
        }

        public void addError(String paymentId, String error) {
            errorList.add(paymentId + " (" + error + ")");
        }

        public void addGlobalError(String error) {
            globalErrors.add(error);
        }

        public int getSuccessCount() {
            return successDetails.size();
        }

        public int getFailureCount() {
            return failureList.size();
        }

        public int getErrorCount() {
            return errorList.size();
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public List<PaymentDetail> getSuccessDetails() {
            return new ArrayList<>(successDetails);
        }
        
        public List<String> getSuccessList() {
            return successDetails.stream()
                    .map(PaymentDetail::getPaymentId)
                    .collect(Collectors.toList());
        }

        public List<String> getFailureList() {
            return new ArrayList<>(failureList);
        }

        public List<String> getErrorList() {
            return new ArrayList<>(errorList);
        }

        public List<String> getGlobalErrors() {
            return new ArrayList<>(globalErrors);
        }
    }

    /**
     * 공동 적금 납입 상세 정보 클래스
     */
    public static class PaymentDetail {
        private String paymentId;
        private String userId;
        private String fromAccountId;
        private String toAccountId;
        private String fromAccountNum;
        private String toAccountNum;
        private String debitTransactionId;
        private String creditTransactionId;
        private BigDecimal amount;
        private BigDecimal fromAccountBalance;
        private BigDecimal toAccountBalance;
        private LocalDateTime processedAt;

        // Getters and Setters
        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getFromAccountId() { return fromAccountId; }
        public void setFromAccountId(String fromAccountId) { this.fromAccountId = fromAccountId; }
        public String getToAccountId() { return toAccountId; }
        public void setToAccountId(String toAccountId) { this.toAccountId = toAccountId; }
        public String getFromAccountNum() { return fromAccountNum; }
        public void setFromAccountNum(String fromAccountNum) { this.fromAccountNum = fromAccountNum; }
        public String getToAccountNum() { return toAccountNum; }
        public void setToAccountNum(String toAccountNum) { this.toAccountNum = toAccountNum; }
        public String getDebitTransactionId() { return debitTransactionId; }
        public void setDebitTransactionId(String debitTransactionId) { this.debitTransactionId = debitTransactionId; }
        public String getCreditTransactionId() { return creditTransactionId; }
        public void setCreditTransactionId(String creditTransactionId) { this.creditTransactionId = creditTransactionId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public BigDecimal getFromAccountBalance() { return fromAccountBalance; }
        public void setFromAccountBalance(BigDecimal fromAccountBalance) { this.fromAccountBalance = fromAccountBalance; }
        public BigDecimal getToAccountBalance() { return toAccountBalance; }
        public void setToAccountBalance(BigDecimal toAccountBalance) { this.toAccountBalance = toAccountBalance; }
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    }
}
