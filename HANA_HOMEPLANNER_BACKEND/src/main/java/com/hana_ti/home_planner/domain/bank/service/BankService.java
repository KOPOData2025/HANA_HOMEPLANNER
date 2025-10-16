package com.hana_ti.home_planner.domain.bank.service;

import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.BankResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.InvitationAccountInfoResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.JointSavingsInviteCreateRequestDto;
import com.hana_ti.home_planner.domain.bank.dto.JointSavingsInviteCreateResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.SavingsMaturityInfoResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.SavingsMaturityPayoutRequestDto;
import com.hana_ti.home_planner.domain.bank.dto.SavingsMaturityPayoutResponseDto;
import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.AccountInvitation;
import com.hana_ti.home_planner.domain.bank.entity.Bank;
import com.hana_ti.home_planner.domain.bank.entity.BankStatus;
import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import com.hana_ti.home_planner.domain.bank.repository.AccountInvitationRepository;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import com.hana_ti.home_planner.domain.bank.repository.BankRepository;
import com.hana_ti.home_planner.domain.bank.repository.TransactionHistoryRepository;
import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import com.hana_ti.home_planner.domain.savings.entity.PaymentSchedule;
import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import com.hana_ti.home_planner.domain.savings.entity.UserSavings;
import com.hana_ti.home_planner.domain.savings.repository.PaymentScheduleRepository;
import com.hana_ti.home_planner.domain.savings.repository.SavingsProductRepository;
import com.hana_ti.home_planner.domain.savings.repository.UserSavingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankService {

    private final BankRepository bankRepository;
    private final AccountInvitationRepository accountInvitationRepository;
    private final AccountRepository accountRepository;
    private final UserSavingsRepository userSavingsRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final FinancialProductRepository financialProductRepository;
    private final SavingsProductRepository savingsProductRepository;

    /**
     * 모든 은행 조회
     */
    @Transactional(readOnly = true)
    public List<BankResponseDto> getAllBanks() {
        log.info("모든 은행 조회 시작");
        
        List<Bank> banks = bankRepository.findAll();
        
        log.info("조회된 은행 수: {}개", banks.size());
        
        return banks.stream()
                .map(BankResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 활성 상태 은행만 조회
     */
    @Transactional(readOnly = true)
    public List<BankResponseDto> getActiveBanks() {
        log.info("활성 상태 은행 조회 시작");
        
        List<Bank> banks = bankRepository.findByStatusOrderByBankNameAsc(BankStatus.ACTIVE);
        
        log.info("조회된 활성 은행 수: {}개", banks.size());
        
        return banks.stream()
                .map(BankResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 은행 ID로 조회
     */
    public BankResponseDto getBankById(String bankId) {
        log.info("은행 ID로 조회 시작 - ID: {}", bankId);
        
        Bank bank = bankRepository.findById(bankId)
                .orElseThrow(() -> new IllegalArgumentException("해당 은행을 찾을 수 없습니다: " + bankId));
        
        log.info("은행 조회 완료 - 은행명: {}", bank.getBankName());
        
        return BankResponseDto.from(bank);
    }

    /**
     * 은행 코드로 조회
     */
    public BankResponseDto getBankByCode(Integer bankCode) {
        log.info("은행 코드로 조회 시작 - 코드: {}", bankCode);
        
        Bank bank = bankRepository.findByBankCode(bankCode)
                .orElseThrow(() -> new IllegalArgumentException("해당 은행 코드를 찾을 수 없습니다: " + bankCode));
        
        log.info("은행 조회 완료 - 은행명: {}", bank.getBankName());
        
        return BankResponseDto.from(bank);
    }

    /**
     * 은행명으로 검색
     */
    public List<BankResponseDto> searchBanksByName(String bankName) {
        log.info("은행명 검색 시작 - 검색어: {}", bankName);
        
        List<Bank> banks = bankRepository.findByBankNameContaining(bankName);
        
        log.info("검색된 은행 수: {}개", banks.size());
        
        return banks.stream()
                .map(BankResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 상태별 은행 조회
     */
    public List<BankResponseDto> getBanksByStatus(BankStatus status) {
        log.info("상태별 은행 조회 시작 - 상태: {}", status);
        
        List<Bank> banks = bankRepository.findByStatus(status);
        
        log.info("조회된 은행 수: {}개", banks.size());
        
        return banks.stream()
                .map(BankResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * inviteId로 ACCOUNT_INVITATION 조회
     */
    public AccountInvitationResponseDto getAccountInvitationByInviteId(String inviteId) {
        log.info("초대 조회 시작 - 초대ID: {}", inviteId);
        
        AccountInvitation invitation = accountInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + inviteId));
        
        log.info("초대 조회 완료 - 초대ID: {}, 상태: {}", invitation.getInviteId(), invitation.getStatus());
        
        return AccountInvitationResponseDto.builder()
                .inviteId(invitation.getInviteId())
                .accountId(invitation.getAccountId())
                .inviterId(invitation.getInviterId())
                .role(invitation.getRole())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .respondedAt(invitation.getRespondedAt())
                .build();
    }

    /**
     * 초대 기반 공동적금 가입 처리
     * 1. JWT 토큰에서 USER_ID 추출 및 inviteId로 ACCOUNT_INVITATION에서 account_id 조회후, account_id로 PROD ID 조회
     * 2. USER_SAVINGS 스냅샷 생성
     * 3. PAYMENT_SCHEDULE 생성 (시작일부터 만기일까지 월별로)
     * 4. 초기 입금 처리 (입출금 계좌에서 적금계좌로 자금 이동)
     */
    @Transactional
    public JointSavingsInviteCreateResponseDto createJointSavingsAccountByInvite(String userId, JointSavingsInviteCreateRequestDto request) {
        log.info("초대 기반 공동적금 가입 시작 - 사용자ID: {}, 초대ID: {}, 시작일: {}, 만기일: {}, 월납입액: {}, 초기입금: {}, 출금계좌: {}", 
                userId, request.getInviteId(), request.getStartDate(), request.getEndDate(), 
                request.getMonthlyAmount(), request.getInitialDeposit(), request.getSourceAccountNumber());

        // 1. JWT 토큰에서 USER_ID 추출 및 inviteId로 ACCOUNT_INVITATION에서 account_id 조회후, account_id로 PROD ID 조회
        AccountInvitation invitation = accountInvitationRepository.findById(request.getInviteId())
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + request.getInviteId()));

        // 초대 상태 확인 - ACCEPTED 상태만 허용 (이미 초대를 수락한 상태에서 공동적금 가입 정보 입력)
        if (invitation.getStatus() != AccountInvitation.InvitationStatus.ACCEPTED) {
            throw new IllegalArgumentException("초대를 먼저 수락해야 합니다. 현재 상태: " + invitation.getStatus());
        }

        String accountId = invitation.getAccountId();
        log.info("계좌 ID 추출 완료 - 계좌ID: {}", accountId);

        // 계좌에서 상품 ID 조회 (실제로는 Account 엔티티에서 productId 필드가 있어야 함)
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 계좌번호를" +
                        " 찾을 수 없습니다. : " + accountId));

        String productId = account.getProductId();
        log.info("상품 ID 조회 완료 - 상품ID: {}", productId);

        // 2. USER_SAVINGS 스냅샷 생성 (계좌 생성 없이 기존 계좌에 참여)
        String userSavingsId = UUID.randomUUID().toString();
        UserSavings userSavings = UserSavings.create(
                userSavingsId,
                userId,
                productId,
                accountId,  // 기존 계좌 ID 사용
                request.getStartDate(),
                request.getEndDate(),
                request.getMonthlyAmount(),
                UserSavings.SavingsStatus.ACTIVE,
                request.getSourceAccountNumber()
        );
        UserSavings savedUserSavings = userSavingsRepository.save(userSavings);
        log.info("USER_SAVINGS 스냅샷 생성 완료 - 적금가입ID: {}", savedUserSavings.getUserSavingsId());

        // 3. PAYMENT_SCHEDULE 생성 (시작일부터 만기일까지 월별로)
        List<PaymentSchedule> paymentSchedules = createPaymentSchedules(
                userId, accountId, request.getStartDate(), request.getEndDate(), request.getMonthlyAmount()
        );
        List<PaymentSchedule> savedPaymentSchedules = paymentScheduleRepository.saveAll(paymentSchedules);
        log.info("PAYMENT_SCHEDULE 생성 완료 - 총 {}개 스케줄", savedPaymentSchedules.size());

        // 4. 초기 입금 처리 (입출금 계좌에서 적금계좌로 자금 이동)
        if (request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            log.info("초기 입금 처리 시작 - 금액: {}", request.getInitialDeposit());
            processInitialDeposit(account, request.getInitialDeposit(), request.getSourceAccountNumber());
            log.info("초기 입금 처리 완료");
        } else {
            log.info("초기 입금액이 0이거나 null이므로 초기 입금 처리 건너뜀");
        }

        // 응답 DTO 생성
        List<JointSavingsInviteCreateResponseDto.PaymentScheduleInfo> scheduleInfos = savedPaymentSchedules.stream()
                .map(schedule -> JointSavingsInviteCreateResponseDto.PaymentScheduleInfo.builder()
                        .paymentId(schedule.getPaymentId())
                        .dueDate(schedule.getDueDate())
                        .amount(schedule.getAmount())
                        .status(schedule.getStatus().name())
                        .build())
                .toList();

        JointSavingsInviteCreateResponseDto response = JointSavingsInviteCreateResponseDto.builder()
                .accountId(account.getAccountId())
                .accountNumber(account.getAccountNum())
                .userSavingsId(savedUserSavings.getUserSavingsId())
                .productId(productId)
                .inviteId(request.getInviteId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .monthlyAmount(request.getMonthlyAmount())
                .initialDeposit(request.getInitialDeposit())
                .sourceAccountNumber(request.getSourceAccountNumber())
                .createdAt(savedUserSavings.getCreatedAt())
                .paymentScheduleCount(savedPaymentSchedules.size())
                .paymentSchedules(scheduleInfos)
                .build();

        log.info("초대 기반 공동적금 가입 완료 - 계좌ID: {}, 적금가입ID: {}, 납입스케줄수: {}", 
                response.getAccountId(), response.getUserSavingsId(), response.getPaymentScheduleCount());

        return response;
    }

    /**
     * 납입 스케줄 생성 (시작일부터 만기일까지 월별로)
     */
    private List<PaymentSchedule> createPaymentSchedules(String userId, String accountId, 
                                                        LocalDate startDate, LocalDate endDate, 
                                                        BigDecimal monthlyAmount) {
        List<PaymentSchedule> schedules = new ArrayList<>();
        
        if (endDate == null) {
            // 만기일이 없는 경우 기본 12개월
            endDate = startDate.plusMonths(12);
        }
        
        LocalDate currentDate = startDate;
        int scheduleCount = 0;
        
        while (!currentDate.isAfter(endDate)) {
            String paymentId = UUID.randomUUID().toString();
            PaymentSchedule schedule = PaymentSchedule.create(
                    paymentId,
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
        
        log.info("납입 스케줄 생성 완료 - 총 {}개 스케줄", scheduleCount);
        return schedules;
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
            TransactionHistory transaction = TransactionHistory.create(
                    UUID.randomUUID().toString(),
                    savingsAccount.getAccountId(),
                    TransactionHistory.TransactionType.DEPOSIT,
                    amount,
                    savingsAccount.getBalance(),
                    "적금가입 초기 입금"
            );
            transactionHistoryRepository.save(transaction);
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

    /**
     * INVITE_ID를 통해 계좌 정보와 적금 상품 정보 조회
     * 1. INVITE_ID로 ACCOUNT_INVITATION에서 ACCOUNT_ID 조회
     * 2. ACCOUNT_ID로 USER_SAVINGS에서 적금 정보 조회
     * 3. START_DATE와 END_DATE 차이 계산 (개월수)
     * 4. PROD_ID로 적금 상품 정보 조회
     */
    public InvitationAccountInfoResponseDto getAccountInfoByInviteId(String inviteId) {
        log.info("초대 ID를 통한 계좌 정보 조회 시작 - 초대ID: {}", inviteId);

        // 1. INVITE_ID로 ACCOUNT_INVITATION에서 ACCOUNT_ID 조회
        AccountInvitation invitation = accountInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + inviteId));
        
        String accountId = invitation.getAccountId();
        log.info("계좌 ID 조회 완료 - 계좌ID: {}", accountId);

        // 2. ACCOUNT_ID로 USER_SAVINGS에서 적금 정보 조회 (여러 개 가능)
        List<UserSavings> userSavingsList = userSavingsRepository.findAllByAccountId(accountId);
        
        if (userSavingsList.isEmpty()) {
            throw new IllegalArgumentException("해당 계좌의 적금 정보를 찾을 수 없습니다: " + accountId);
        }
        
        log.info("적금 정보 조회 완료 - 총 {}개의 적금 정보 발견", userSavingsList.size());
        
        // 첫 번째 적금 정보를 기준으로 상품 정보 조회 (모든 적금이 같은 상품을 사용한다고 가정)
        UserSavings firstUserSavings = userSavingsList.get(0);
        log.info("기준 적금 정보 - 적금ID: {}, 상품ID: {}", firstUserSavings.getUserSavingsId(), firstUserSavings.getProductId());

        // 3. START_DATE와 END_DATE 차이 계산 (개월수) - 첫 번째 적금 기준
        LocalDate startDate = firstUserSavings.getStartDate();
        LocalDate endDate = firstUserSavings.getEndDate();
        
        Integer totalMonths = null;
        String periodDescription = null;
        
        if (startDate != null && endDate != null) {
            Period period = Period.between(startDate, endDate);
            totalMonths = period.getYears() * 12 + period.getMonths();
            periodDescription = String.format("%d년 %d개월", period.getYears(), period.getMonths());
            log.info("기간 계산 완료 - 총 {}개월 ({})", totalMonths, periodDescription);
        } else {
            log.warn("시작일 또는 종료일이 없습니다 - 시작일: {}, 종료일: {}", startDate, endDate);
        }

        // 4. PROD_ID로 적금 상품 정보 조회 (첫 번째 적금 기준)
        String productId = firstUserSavings.getProductId();
        
        // 금융상품 기본 정보 조회
        FinancialProduct financialProduct = financialProductRepository.findByIdWithBank(productId)
                .orElseThrow(() -> new IllegalArgumentException("금융상품을 찾을 수 없습니다: " + productId));
        
        // 적금상품 상세 정보 조회
        SavingsProduct savingsProduct = savingsProductRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("적금상품을 찾을 수 없습니다: " + productId));
        
        log.info("상품 정보 조회 완료 - 상품명: {}, 은행명: {}", 
                financialProduct.getProductName(), financialProduct.getBank().getBankName());

        // 응답 DTO 생성 - 여러 개의 적금 정보를 모두 포함
        List<InvitationAccountInfoResponseDto.UserSavingsInfo> userSavingsInfoList = 
                userSavingsList.stream()
                        .map(userSavings -> InvitationAccountInfoResponseDto.UserSavingsInfo.builder()
                                .userSavingsId(userSavings.getUserSavingsId())
                                .userId(userSavings.getUserId())
                                .productId(userSavings.getProductId())
                                .accountId(userSavings.getAccountId())
                                .startDate(userSavings.getStartDate())
                                .endDate(userSavings.getEndDate())
                                .monthlyAmount(userSavings.getMonthlyAmount())
                                .status(userSavings.getStatus().name())
                                .createdAt(userSavings.getCreatedAt())
                                .autoDebitAccountId(userSavings.getAutoDebitAccountId())
                                .build())
                        .collect(Collectors.toList());
        
        log.info("적금 정보 DTO 변환 완료 - 총 {}개", userSavingsInfoList.size());

        InvitationAccountInfoResponseDto.SavingsProductInfo savingsProductInfo = 
                InvitationAccountInfoResponseDto.SavingsProductInfo.builder()
                        .productId(financialProduct.getProductId())
                        .productName(financialProduct.getProductName())
                        .productType(financialProduct.getProductType().name())
                        .bankName(financialProduct.getBank().getBankName())
                        .paymentMethod(savingsProduct.getPaymentMethod())
                        .isCompoundInterestApplied(savingsProduct.getIsCompoundInterestApplied())
                        .isTaxPreferenceApplied(savingsProduct.getIsTaxPreferenceApplied())
                        .paymentDelayPeriodMonths(savingsProduct.getPaymentDelayPeriodMonths())
                        .earlyWithdrawPenaltyRate(savingsProduct.getEarlyWithdrawPenaltyRate())
                        .preferentialInterestRate(savingsProduct.getPreferentialInterestRate())
                        .termMonths(savingsProduct.getTermMonths())
                        .minDepositAmount(savingsProduct.getMinDepositAmount())
                        .maxDepositAmount(savingsProduct.getMaxDepositAmount())
                        .baseInterestRate(savingsProduct.getBaseInterestRate())
                        .productDescription(savingsProduct.getProductDescription())
                        .targetDescription(savingsProduct.getTargetDescription())
                        .interestPaymentMethod(savingsProduct.getInterestPaymentMethod())
                        .status(savingsProduct.getStatus())
                        .build();

        InvitationAccountInfoResponseDto.PeriodInfo periodInfo = 
                InvitationAccountInfoResponseDto.PeriodInfo.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .totalMonths(totalMonths)
                        .periodDescription(periodDescription)
                        .build();

        InvitationAccountInfoResponseDto response = InvitationAccountInfoResponseDto.builder()
                .inviteId(invitation.getInviteId())
                .accountId(invitation.getAccountId())
                .inviterId(invitation.getInviterId())
                .userSavingsList(userSavingsInfoList)
                .savingsProduct(savingsProductInfo)
                .periodInfo(periodInfo)
                .build();

        log.info("초대 ID를 통한 계좌 정보 조회 완료 - 초대ID: {}, 계좌ID: {}, 상품ID: {}, 총기간: {}개월, 적금수: {}개", 
                inviteId, accountId, productId, totalMonths, userSavingsInfoList.size());

        return response;
    }

    /**
     * ACCOUNT_ID를 통한 적금 계좌 만기일 정보 조회
     * 1. ACCOUNT_ID로 계좌 정보 조회
     * 2. ACCOUNT_ID로 USER_SAVINGS에서 적금 정보 조회
     * 3. 시작일과 만기일 정보 반환
     */
    @Transactional(readOnly = true)
    public SavingsMaturityInfoResponseDto getSavingsMaturityInfoByAccountId(String accountId) {
        log.info("ACCOUNT_ID를 통한 적금 계좌 만기일 정보 조회 시작 - 계좌ID: {}", accountId);

        // 1. 계좌 정보 조회
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다: " + accountId));
        
        log.info("계좌 정보 조회 완료 - 계좌번호: {}, 계좌타입: {}", account.getAccountNum(), account.getAccountType());

        // 2. 적금 계좌인지 확인
        if (account.getAccountType() != Account.AccountType.SAVING && 
            account.getAccountType() != Account.AccountType.JOINT_SAVING) {
            throw new IllegalArgumentException("해당 계좌는 적금 계좌가 아닙니다. 계좌타입: " + account.getAccountType());
        }

        // 3. USER_SAVINGS에서 적금 정보 조회 (여러 개 가능)
        List<UserSavings> userSavingsList = userSavingsRepository.findAllByAccountId(accountId);
        
        if (userSavingsList.isEmpty()) {
            throw new IllegalArgumentException("해당 계좌의 적금 정보를 찾을 수 없습니다: " + accountId);
        }
        
        log.info("적금 정보 조회 완료 - 총 {}개의 적금 정보 발견", userSavingsList.size());
        
        // 첫 번째 적금 정보를 기준으로 만기일 정보 반환 (모든 적금이 같은 기간을 사용한다고 가정)
        UserSavings firstUserSavings = userSavingsList.get(0);
        log.info("기준 적금 정보 - 적금ID: {}, 상품ID: {}, 시작일: {}, 만기일: {}", 
                firstUserSavings.getUserSavingsId(), firstUserSavings.getProductId(),
                firstUserSavings.getStartDate(), firstUserSavings.getEndDate());

        // 4. 응답 DTO 생성
        SavingsMaturityInfoResponseDto response = SavingsMaturityInfoResponseDto.from(
                account.getAccountId(),
                account.getAccountNum(),
                firstUserSavings.getProductId(),
                firstUserSavings.getStartDate(),
                firstUserSavings.getEndDate()
        );

        log.info("적금 계좌 만기일 정보 조회 완료 - 계좌ID: {}, 시작일: {}, 만기일: {}, 총기간: {}개월", 
                accountId, response.getStartDate(), response.getEndDate(), response.getTotalMonths());

        return response;
    }

    /**
     * 적금 만기 상납금 지급 처리
     * 1. 적금 계좌 정보 조회 및 검증
     * 2. USER_SAVINGS 정보 조회 및 만기일 검증
     * 3. 적금 상품 정보 조회 (금리 정보)
     * 4. 실제 납입 내역 조회 및 원금 계산
     * 5. 이자 계산 (단리/복리)
     * 6. 자금 이동 처리
     * 7. 적금 관련 데이터 삭제
     * 8. 적금 계좌 상태 변경
     */
    @Transactional
    public SavingsMaturityPayoutResponseDto processSavingsMaturityPayout(
            String userId, 
            String accountId, 
            SavingsMaturityPayoutRequestDto request) {
        
        log.info("적금 만기 상납금 지급 처리 시작 - 사용자ID: {}, 계좌ID: {}, 지급계좌: {}", 
                userId, accountId, request.getTargetAccountNumber());
        
        // 1. 적금 계좌 정보 조회 및 검증
        Account savingsAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("적금 계좌를 찾을 수 없습니다: " + accountId));
        
        // 적금 계좌 타입 확인
        if (savingsAccount.getAccountType() != Account.AccountType.SAVING && 
            savingsAccount.getAccountType() != Account.AccountType.JOINT_SAVING) {
            throw new IllegalArgumentException("해당 계좌는 적금 계좌가 아닙니다: " + accountId);
        }
        
        // 2. USER_SAVINGS 정보 조회
        List<UserSavings> userSavingsList = userSavingsRepository.findAllByAccountId(accountId);
        if (userSavingsList.isEmpty()) {
            throw new IllegalArgumentException("해당 계좌의 적금 정보를 찾을 수 없습니다: " + accountId);
        }
        
        UserSavings userSavings = userSavingsList.get(0);
        
        // 만기일 검증 - 내부적으로 오늘 날짜와 비교
        LocalDate today = LocalDate.now();
        if (today.isBefore(userSavings.getEndDate())) {
            throw new IllegalArgumentException("아직 만기일이 되지 않았습니다. 만기일: " + userSavings.getEndDate() + ", 오늘: " + today);
        }
        
        log.info("만기일 검증 완료 - 만기일: {}, 오늘: {}", userSavings.getEndDate(), today);
        
        // 3. 적금 상품 정보 조회 (금리 정보)
        SavingsProduct savingsProduct = savingsProductRepository.findById(userSavings.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("적금 상품을 찾을 수 없습니다: " + userSavings.getProductId()));
        
        // 4. 실제 납입 내역 조회 (PAYMENT_SCHEDULE)
        List<PaymentSchedule> paymentSchedules = paymentScheduleRepository.findByAccountIdOrderByDueDateAsc(accountId);
        List<PaymentSchedule> paidSchedules = paymentSchedules.stream()
                .filter(schedule -> schedule.getStatus() == PaymentSchedule.PaymentStatus.PAID)
                .collect(Collectors.toList());
        
        // 5. 원금 계산 (실제 납입된 금액)
        BigDecimal principalAmount = paidSchedules.stream()
                .map(PaymentSchedule::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 6. 이자 계산
        BigDecimal interestAmount = calculateInterestAmount(
                principalAmount, 
                savingsProduct.getBaseInterestRate(), 
                savingsProduct.getPreferentialInterestRate(),
                userSavings.getStartDate(), 
                userSavings.getEndDate(),
                savingsProduct.getIsCompoundInterestApplied()
        );
        
        BigDecimal totalPayoutAmount = principalAmount.add(interestAmount);
        
        // 7. 지급받을 계좌 조회
        Account targetAccount = accountRepository.findByAccountNum(request.getTargetAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("지급받을 계좌를 찾을 수 없습니다: " + request.getTargetAccountNumber()));
        
        // 8. 자금 이동 처리
        String transactionId = processFundTransfer(savingsAccount, targetAccount, totalPayoutAmount);
        
        // 9. 적금 관련 데이터 삭제
        deleteSavingsRelatedData(accountId);
        
        // 10. 적금 계좌 상태 변경
        savingsAccount.updateStatus(Account.AccountStatus.CLOSED);
        accountRepository.save(savingsAccount);
        
        // 11. 응답 DTO 생성
        SavingsMaturityPayoutResponseDto response = SavingsMaturityPayoutResponseDto.builder()
                .accountId(accountId)
                .accountNumber(savingsAccount.getAccountNum())
                .productId(userSavings.getProductId())
                .productName(savingsProduct.getProductDescription())
                .principalAmount(principalAmount)
                .interestAmount(interestAmount)
                .totalPayoutAmount(totalPayoutAmount)
                .targetAccountNumber(request.getTargetAccountNumber())
                .processedAt(LocalDate.now())
                .transactionId(transactionId)
                .status("COMPLETED")
                .build();
        
        log.info("적금 만기 상납금 지급 처리 완료 - 계좌ID: {}, 원금: {}, 이자: {}, 총지급액: {}, 거래ID: {}", 
                accountId, principalAmount, interestAmount, totalPayoutAmount, transactionId);
        
        return response;
    }

    /**
     * 이자 계산 메서드
     */
    private BigDecimal calculateInterestAmount(BigDecimal principalAmount, 
                                             BigDecimal baseRate, 
                                             BigDecimal preferentialRate,
                                             LocalDate startDate, 
                                             LocalDate endDate,
                                             String isCompoundInterestApplied) {
        
        // 총 금리 계산
        BigDecimal totalRate = baseRate != null ? baseRate : BigDecimal.ZERO;
        if (preferentialRate != null) {
            totalRate = totalRate.add(preferentialRate);
        }
        
        // 기간 계산 (개월)
        long months = ChronoUnit.MONTHS.between(startDate, endDate);
        
        if ("Y".equals(isCompoundInterestApplied)) {
            // 복리 계산
            BigDecimal monthlyRate = totalRate.divide(new BigDecimal("1200"), 6, RoundingMode.HALF_UP);
            BigDecimal compoundFactor = BigDecimal.ONE.add(monthlyRate).pow((int) months);
            BigDecimal futureValue = principalAmount.multiply(compoundFactor);
            return futureValue.subtract(principalAmount);
        } else {
            // 단리 계산
            BigDecimal annualRate = totalRate.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
            BigDecimal years = BigDecimal.valueOf(months).divide(new BigDecimal("12"), 6, RoundingMode.HALF_UP);
            return principalAmount.multiply(annualRate).multiply(years);
        }
    }

    /**
     * 자금 이동 처리 메서드
     */
    private String processFundTransfer(Account fromAccount, Account toAccount, BigDecimal amount) {
        
        String baseTransactionId = UUID.randomUUID().toString();
        String fromTransactionId = baseTransactionId.substring(0, 29) + "_FROM";
        String toTransactionId = baseTransactionId.substring(0, 29) + "_TO";
        
        // 적금 계좌에서 출금
        BigDecimal newFromBalance = fromAccount.getBalance().subtract(amount);
        fromAccount.updateBalance(newFromBalance);
        accountRepository.save(fromAccount);
        
        // 지급 계좌에 입금
        BigDecimal newToBalance = toAccount.getBalance().add(amount);
        toAccount.updateBalance(newToBalance);
        accountRepository.save(toAccount);
        
        // 거래내역 기록
        TransactionHistory fromTransaction = TransactionHistory.create(
                fromTransactionId,
                fromAccount.getAccountId(),
                TransactionHistory.TransactionType.WITHDRAWAL,
                amount.negate(),
                newFromBalance,
                "적금 만기 상납금 지급 출금 - 지급계좌: " + toAccount.getAccountNum()
        );
        transactionHistoryRepository.save(fromTransaction);
        
        TransactionHistory toTransaction = TransactionHistory.create(
                toTransactionId,
                toAccount.getAccountId(),
                TransactionHistory.TransactionType.DEPOSIT,
                amount,
                newToBalance,
                "적금 만기 상납금 지급 입금 - 적금계좌: " + fromAccount.getAccountNum()
        );
        transactionHistoryRepository.save(toTransaction);
        
        return baseTransactionId;
    }

    /**
     * 적금 관련 데이터 삭제 메서드
     */
    private void deleteSavingsRelatedData(String accountId) {
        
        // 1. PAYMENT_SCHEDULE 삭제
        List<PaymentSchedule> paymentSchedules = paymentScheduleRepository.findByAccountIdOrderByDueDateAsc(accountId);
        paymentScheduleRepository.deleteAll(paymentSchedules);
        log.info("PAYMENT_SCHEDULE 삭제 완료 - {}개", paymentSchedules.size());
        
        // 2. USER_SAVINGS 삭제
        List<UserSavings> userSavingsList = userSavingsRepository.findAllByAccountId(accountId);
        userSavingsRepository.deleteAll(userSavingsList);
        log.info("USER_SAVINGS 삭제 완료 - {}개", userSavingsList.size());

    }

}
