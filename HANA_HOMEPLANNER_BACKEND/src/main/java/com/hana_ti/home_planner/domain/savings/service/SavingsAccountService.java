package com.hana_ti.home_planner.domain.savings.service;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.AccountParticipant;
import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import com.hana_ti.home_planner.domain.bank.repository.AccountParticipantRepository;
import com.hana_ti.home_planner.domain.bank.repository.TransactionHistoryRepository;
import com.hana_ti.home_planner.domain.bank.service.AccountService;
import com.hana_ti.home_planner.domain.bank.service.TransactionHistoryService;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import com.hana_ti.home_planner.domain.savings.dto.SavingsAccountCreateRequestDto;
import com.hana_ti.home_planner.domain.savings.dto.SavingsAccountCreateResponseDto;
import com.hana_ti.home_planner.domain.savings.entity.PaymentSchedule;
import com.hana_ti.home_planner.domain.savings.entity.UserSavings;
import com.hana_ti.home_planner.domain.savings.repository.PaymentScheduleRepository;
import com.hana_ti.home_planner.domain.savings.repository.UserSavingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SavingsAccountService {

    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final AccountParticipantRepository accountParticipantRepository;
    private final TransactionHistoryService transactionHistoryService;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final UserSavingsRepository userSavingsRepository;
    private final FinancialProductRepository financialProductRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;

    /**
     * 통합 적금가입 처리
     */
    @Transactional
    public SavingsAccountCreateResponseDto createSavingsAccount(String userId, SavingsAccountCreateRequestDto request) {
        log.info("통합 적금가입 시작 - 사용자ID: {}, 상품ID: {}, 월납입액: {}", 
                userId, request.getProductId(), request.getMonthlyAmount());

        // 자동이체 계좌 ID 처리 (없으면 NULL로 저장)
        log.info("원본 자동이체 계좌 ID: '{}'", request.getAutoDebitAccountId());
        String autoDebitAccountId = processAutoDebitAccountId(request.getAutoDebitAccountId());
        log.info("처리된 자동이체 계좌 ID: '{}'", autoDebitAccountId);

        // 상품 타입 확인하여 적절한 AccountType 결정
        Account.AccountType accountType = determineAccountType(request.getProductId());
        
        // 1. ACCOUNT 테이블 생성
        Account account = accountService.createAccount(
                userId, 
                request.getProductId(), 
                accountType, 
                BigDecimal.ZERO
        );

        // 1-2 공동 적금 계좌라면 공동 계좌 참여자 테이블 생성
        if(accountType.equals(Account.AccountType.JOINT_SAVING)){
            log.info("공동 적금 계좌 감지 - 참여자 테이블 생성 시작");
            
            // 주계좌 사용자를 PRIMARY 역할로 생성
            AccountParticipant primaryParticipant = AccountParticipant.create(
                    UUID.randomUUID().toString(), // participantId
                    account.getAccountId(),
                    userId,
                    AccountParticipant.Role.PRIMARY,
                    new BigDecimal("100.00") // 주계좌는 100% 기여율
            );
            
            AccountParticipant savedPrimaryParticipant = accountParticipantRepository.save(primaryParticipant);
            log.info("주계좌 참여자 생성 완료 - 참여자ID: {}, 사용자ID: {}, 역할: {}", 
                    savedPrimaryParticipant.getParticipantId(), 
                    savedPrimaryParticipant.getUserId(), 
                    savedPrimaryParticipant.getRole());
        }

        // 2. USER_SAVINGS 스냅샷 생성
        String userSavingsId = UUID.randomUUID().toString();
        UserSavings userSavings = UserSavings.create(
                userSavingsId,
                userId,
                request.getProductId(),
                account.getAccountId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getMonthlyAmount(),
                UserSavings.SavingsStatus.ACTIVE,
                autoDebitAccountId
        );
        UserSavings savedUserSavings = userSavingsRepository.save(userSavings);

        // 3. PAYMENT_SCHEDULE 생성 (시작일부터 만기일까지 월별로)
        List<PaymentSchedule> paymentSchedules = createPaymentSchedules(
                userId, account.getAccountId(), request.getStartDate(), request.getEndDate(), request.getMonthlyAmount(), request.getAutoDebitDate()
        );
        List<PaymentSchedule> savedPaymentSchedules = paymentScheduleRepository.saveAll(paymentSchedules);

        // 4. 초기 입금 처리 (입출금 계좌에서 적금계좌로 자금 이동)
        log.info("초기 입금 처리 확인 - 초기입금액: {}, 출금계좌번호: {}", 
                request.getInitialDeposit(), autoDebitAccountId);
        
        if (request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            log.info("초기 입금 처리 시작 - 금액: {}", request.getInitialDeposit());
            processInitialDeposit(account, request.getInitialDeposit(), autoDebitAccountId);
            log.info("초기 입금 처리 완료");
        } else {
            log.info("초기 입금액이 0이거나 null이므로 초기 입금 처리 건너뜀");
        }

        // 응답 DTO 생성
        List<SavingsAccountCreateResponseDto.PaymentScheduleInfo> scheduleInfos = savedPaymentSchedules.stream()
                .map(schedule -> SavingsAccountCreateResponseDto.PaymentScheduleInfo.builder()
                        .paymentId(schedule.getPaymentId())
                        .dueDate(schedule.getDueDate())
                        .amount(schedule.getAmount())
                        .status(schedule.getStatus().name())
                        .build())
                .toList();

        SavingsAccountCreateResponseDto response = SavingsAccountCreateResponseDto.builder()
                .accountId(account.getAccountId())
                .accountNumber(account.getAccountNum())
                .userSavingsId(savedUserSavings.getUserSavingsId())
                .productId(request.getProductId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .monthlyAmount(request.getMonthlyAmount())
                .initialDeposit(request.getInitialDeposit())
                .autoDebitAccountId(autoDebitAccountId)
                .createdAt(savedUserSavings.getCreatedAt())
                .paymentScheduleCount(savedPaymentSchedules.size())
                .paymentSchedules(scheduleInfos)
                .build();

        log.info("통합 적금가입 완료 - 계좌ID: {}, 적금가입ID: {}, 납입스케줄수: {}", 
                account.getAccountId(), savedUserSavings.getUserSavingsId(), savedPaymentSchedules.size());

        return response;
    }

    /**
     * 납입 스케줄 생성 (시작일부터 만기일까지 월별로)
     */
    private List<PaymentSchedule> createPaymentSchedules(String userId, String accountId, 
                                                        LocalDate startDate, LocalDate endDate, 
                                                        BigDecimal monthlyAmount, LocalDate autoDebitDate) {
        List<PaymentSchedule> schedules = new ArrayList<>();
        
        if (endDate == null) {
            // 만기일이 없는 경우 기본 12개월
            endDate = startDate.plusMonths(12);
        }
        
        // 첫 번째 납입일은 시작일로 설정
        LocalDate currentDate = startDate;
        int scheduleCount = 0;
        
        // 첫 번째 스케줄 생성 (시작일)
        String paymentId = UUID.randomUUID().toString();
        PaymentSchedule firstSchedule = PaymentSchedule.create(
                paymentId,
                userId,
                accountId,
                currentDate,
                monthlyAmount,
                PaymentSchedule.PaymentStatus.PENDING
        );
        schedules.add(firstSchedule);
        scheduleCount++;
        
        // 두 번째 납입일부터는 자동이체 희망일 기준으로 설정
        if (autoDebitDate != null) {
            // 자동이체 희망일이 있는 경우, 다음 달부터 해당 일자로 설정
            LocalDate nextPaymentDate = startDate.plusMonths(1)
                    .withDayOfMonth(autoDebitDate.getDayOfMonth());
            
            while (!nextPaymentDate.isAfter(endDate)) {
                String nextPaymentId = UUID.randomUUID().toString();
                PaymentSchedule schedule = PaymentSchedule.create(
                        nextPaymentId,
                        userId,
                        accountId,
                        nextPaymentDate,
                        monthlyAmount,
                        PaymentSchedule.PaymentStatus.PENDING
                );
                schedules.add(schedule);
                
                nextPaymentDate = nextPaymentDate.plusMonths(1);
                scheduleCount++;
                
                // 안전장치: 최대 120개월 (10년)
                if (scheduleCount >= 120) {
                    break;
                }
            }
        } else {
            // 자동이체 희망일이 없는 경우 기존 방식대로 매월 동일한 날짜
            currentDate = currentDate.plusMonths(1);
            
            while (!currentDate.isAfter(endDate)) {
                String nextPaymentId = UUID.randomUUID().toString();
                PaymentSchedule schedule = PaymentSchedule.create(
                        nextPaymentId,
                        userId,
                        accountId,
                        currentDate,
                        monthlyAmount,
                        PaymentSchedule.PaymentStatus.PENDING
                );
                schedules.add(schedule);
                
                currentDate = currentDate.plusMonths(1);
                scheduleCount++;
                
                // 안전장치: 최대 120개월 (10년)
                if (scheduleCount >= 120) {
                    break;
                }
            }
        }
        
        log.info("납입 스케줄 생성 완료 - 총 {}개 스케줄, 자동이체 희망일: {}", 
                scheduleCount, autoDebitDate != null ? autoDebitDate.getDayOfMonth() + "일" : "미설정");
        return schedules;
    }

    /**
     * 상품 타입에 따라 적절한 AccountType 결정
     */
    private Account.AccountType determineAccountType(String productId) {
        ProductType productType = financialProductRepository.getReferenceById(productId).getProductType();
        
        if (productType.equals(ProductType.JOINT_SAVING)) {
            log.info("공동 적금 상품 감지 - AccountType: JOINT_SAVING");
            return Account.AccountType.JOINT_SAVING;
        } else {
            log.info("일반 적금 상품 감지 - AccountType: SAVING");
            return Account.AccountType.SAVING;
        }
    }

    /**
     * 자동이체 계좌 ID 처리 (없으면 NULL로 저장)
     */
    private String processAutoDebitAccountId(String autoDebitAccountId) {
        log.info("processAutoDebitAccountId 호출됨 - 입력값: '{}'", autoDebitAccountId);
        
        if (autoDebitAccountId == null) {
            log.info("자동이체 계좌 ID가 null - NULL로 저장");
            return null;
        }
        
        String trimmed = autoDebitAccountId.trim();
        if (trimmed.isEmpty()) {
            log.info("자동이체 계좌 ID가 빈 문자열 - NULL로 저장");
            return null;
        }

        log.info("자동이체 계좌 ID 저장: '{}'", trimmed);
        return trimmed;
    }

    /**
     * 초기 입금 처리 (입출금 계좌에서 적금계좌로 자금 이동)
     */
    private void processInitialDeposit(Account savingsAccount, BigDecimal amount, String sourceAccountNumber) {
        log.info("초기 입금 처리 시작 - 적금계좌: {}, 금액: {}, 출금계좌: {}", 
                savingsAccount.getAccountNum(), amount, sourceAccountNumber);

        if (sourceAccountNumber == null || sourceAccountNumber.trim().isEmpty()) {
            // 출금 계좌가 없는 경우 적금계좌에만 입금 기록
            log.info("출금 계좌가 없음 - 적금계좌에만 입금 기록");
            transactionHistoryService.createTransaction(
                    savingsAccount.getAccountId(),
                    TransactionHistory.TransactionType.DEPOSIT,
                    amount,
                    savingsAccount.getBalance(),
                    "적금가입 초기 입금"
            );
            return;
        }

        // 출금 계좌 조회
        log.info("출금 계좌 조회 시작 - 계좌번호: {}", sourceAccountNumber);
        Account sourceAccount = accountRepository.findByAccountNum(sourceAccountNumber)
                .orElseThrow(() -> new IllegalArgumentException("출금 계좌를 찾을 수 없습니다: " + sourceAccountNumber));
        log.info("출금 계좌 조회 완료 - 계좌ID: {}, 현재잔액: {}", sourceAccount.getAccountId(), sourceAccount.getBalance());

        // 출금 계좌 잔액 확인
        log.info("출금 계좌 잔액 확인 - 현재잔액: {}, 출금요청액: {}", sourceAccount.getBalance(), amount);
        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("출금 계좌 잔액이 부족합니다. 현재 잔액: " + sourceAccount.getBalance());
        }
        log.info("출금 계좌 잔액 확인 완료 - 출금 가능");

        // 자금 이동 처리
        String baseTransactionId = UUID.randomUUID().toString();
        String sourceTransactionId = baseTransactionId.substring(0, 29) + "_SRC"; // 36자 제한
        String savingsTransactionId = baseTransactionId.substring(0, 29) + "_SAV"; // 36자 제한
        log.info("자금 이동 처리 시작 - 기본거래ID: {}", baseTransactionId);

        // 출금 계좌에서 차감
        BigDecimal newSourceBalance = sourceAccount.getBalance().subtract(amount);
        log.info("출금 계좌 잔액 변경 - 기존: {}, 변경후: {}", sourceAccount.getBalance(), newSourceBalance);
        sourceAccount.updateBalance(newSourceBalance);
        Account savedSourceAccount = accountRepository.save(sourceAccount); // 변경사항 저장
        log.info("출금 계좌 저장 완료 - 계좌ID: {}, 저장된잔액: {}", savedSourceAccount.getAccountId(), savedSourceAccount.getBalance());

        // 적금 계좌에 입금
        BigDecimal newSavingsBalance = savingsAccount.getBalance().add(amount);
        log.info("적금 계좌 잔액 변경 - 기존: {}, 변경후: {}", savingsAccount.getBalance(), newSavingsBalance);
        savingsAccount.updateBalance(newSavingsBalance);
        Account savedSavingsAccount = accountRepository.save(savingsAccount); // 변경사항 저장
        log.info("적금 계좌 저장 완료 - 계좌ID: {}, 저장된잔액: {}", savedSavingsAccount.getAccountId(), savedSavingsAccount.getBalance());

        // 거래내역 기록
        log.info("거래내역 기록 시작");
        
        // 출금 계좌 거래내역
        TransactionHistory sourceTransaction = TransactionHistory.create(
                sourceTransactionId,
                sourceAccount.getAccountId(),
                TransactionHistory.TransactionType.WITHDRAWAL,
                amount.negate(), // 음수로 기록 (출금)
                newSourceBalance,
                "적금가입 초기 입금 출금 - 적금계좌: " + savingsAccount.getAccountNum()
        );
        TransactionHistory savedSourceTransaction = transactionHistoryRepository.save(sourceTransaction);
        log.info("출금 계좌 거래내역 저장 완료 - 거래ID: {}", savedSourceTransaction.getTxnId());

        // 적금 계좌 거래내역
        TransactionHistory savingsTransaction = TransactionHistory.create(
                savingsTransactionId,
                savingsAccount.getAccountId(),
                TransactionHistory.TransactionType.DEPOSIT,
                amount, // 양수로 기록 (입금)
                newSavingsBalance,
                "적금가입 초기 입금 - 출금계좌: " + sourceAccount.getAccountNum()
        );
        TransactionHistory savedSavingsTransaction = transactionHistoryRepository.save(savingsTransaction);
        log.info("적금 계좌 거래내역 저장 완료 - 거래ID: {}", savedSavingsTransaction.getTxnId());

        log.info("초기 입금 처리 완료 - 출금계좌잔액: {}, 적금계좌잔액: {}", newSourceBalance, newSavingsBalance);
    }
}
