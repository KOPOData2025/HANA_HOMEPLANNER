package com.hana_ti.home_planner.domain.user.service;

import com.hana_ti.home_planner.domain.bank.dto.AccountResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.TransactionHistoryResponseDto;
import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import com.hana_ti.home_planner.domain.bank.repository.TransactionHistoryRepository;
import com.hana_ti.home_planner.domain.savings.dto.PaymentScheduleResponseDto;
import com.hana_ti.home_planner.domain.savings.dto.UserSavingsResponseDto;
import com.hana_ti.home_planner.domain.savings.entity.PaymentSchedule;
import com.hana_ti.home_planner.domain.savings.entity.UserSavings;
import com.hana_ti.home_planner.domain.savings.repository.PaymentScheduleRepository;
import com.hana_ti.home_planner.domain.savings.repository.UserSavingsRepository;
import com.hana_ti.home_planner.domain.loan.dto.LoanApplicationResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanContractResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanRepaymentScheduleResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import com.hana_ti.home_planner.domain.loan.entity.LoanContract;
import com.hana_ti.home_planner.domain.loan.entity.LoanRepaymentSchedule;
import com.hana_ti.home_planner.domain.loan.repository.LoanApplicationRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanContractRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanRepaymentScheduleRepository;
import com.hana_ti.home_planner.domain.user.dto.AccountDetailResponseDto;
import com.hana_ti.home_planner.domain.user.dto.LoanAccountDetailResponseDto;
import com.hana_ti.home_planner.domain.user.dto.UserResponseDto;
import com.hana_ti.home_planner.domain.user.dto.UserNameResponseDto;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final UserSavingsRepository userSavingsRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanContractRepository loanContractRepository;
    private final LoanRepaymentScheduleRepository loanRepaymentScheduleRepository;

    @Transactional
    public User saveUser(User user) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + user.getEmail());
        }
        
        // 전화번호 중복 체크
        if (userRepository.existsByPhnNum(user.getPhnNum())) {
            throw new IllegalArgumentException("이미 존재하는 전화번호입니다: " + user.getPhnNum());
        }
        
        // CI값 중복 체크
        if (userRepository.existsByResNum(user.getResNum())) {
            throw new IllegalArgumentException("이미 가입된 사용자입니다.");
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(User user) {
        // 업데이트 시에는 중복 체크를 하지 않음
        return userRepository.save(user);
    }

    public UserResponseDto findById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));
        return UserResponseDto.from(user);
    }

    public UserResponseDto findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. Email: " + email));
        return UserResponseDto.from(user);
    }

    public User findUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. Email: " + email));
    }

    public User findUserEntityById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));
    }

    public User findUserEntityByRefreshToken(String refreshToken) {
        return userRepository.findByRefreshToken(refreshToken)
                .orElse(null); // null 반환하여 AuthService에서 처리
    }

    public List<UserResponseDto> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteById(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId);
        }
        userRepository.deleteById(userId);
    }

    /**
     * 사용자별 계좌 목록 조회
     */
    public List<AccountResponseDto> getUserAccounts(String userId) {
        // 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId);
        }
        
        // 사용자별 계좌 목록 조회
        List<Account> accounts = accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Account 엔티티를 AccountResponseDto로 변환
        return accounts.stream()
                .map(AccountResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * ACCOUNT_ID를 통한 계좌 상세 정보 조회 (USER_SAVINGS, PAYMENT_SCHEDULE, TRANSACTION_HISTORY 포함)
     * 계좌 타입에 따라 다른 스케줄 정보 반환:
     * - 적금/공동적금: PAYMENT_SCHEDULE 조회
     * - 대출/공동대출: LOAN_REPAYMENT_SCHEDULE 조회 (LOAN_CONTRACT를 통해)
     */
    public AccountDetailResponseDto getAccountDetailByAccountId(String accountId) {
        // 1. 계좌 정보 조회
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다. ID: " + accountId));
        
        AccountResponseDto accountDto = AccountResponseDto.from(account);
        
        // 2. USER_SAVINGS 조회
        Optional<UserSavings> userSavingsOpt = userSavingsRepository.findByAccountId(accountId);
        UserSavingsResponseDto userSavingsDto = userSavingsOpt
                .map(UserSavingsResponseDto::from)
                .orElse(null);
        
        // 3. 계좌 타입에 따른 스케줄 조회
        List<PaymentScheduleResponseDto> paymentScheduleDtos = getSchedulesByAccountType(account, accountId);
        
        // 4. TRANSACTION_HISTORY 조회
        List<TransactionHistory> transactionHistories = transactionHistoryRepository.findByAccountIdOrderByTxnDateDesc(accountId);
        List<TransactionHistoryResponseDto> transactionHistoryDtos = transactionHistories.stream()
                .map(TransactionHistoryResponseDto::from)
                .collect(Collectors.toList());
        
        // 5. 통합 응답 생성
        return AccountDetailResponseDto.create(
                accountDto,
                userSavingsDto,
                paymentScheduleDtos,
                transactionHistoryDtos
        );
    }

    /**
     * JWT 토큰에서 추출한 사용자 ID로 대출 신청 목록 조회
     */
    public List<LoanApplicationResponseDto> getUserLoanApplications(String userId) {
        // 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId);
        }
        
        // 사용자별 대출 신청 목록 조회 (최신순)
        List<LoanApplication> loanApplications = loanApplicationRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        
        // LoanApplication 엔티티를 LoanApplicationResponseDto로 변환
        return loanApplications.stream()
                .map(LoanApplicationResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * APP_ID를 통한 대출 계약 조회
     */
    public LoanContractResponseDto getLoanContractByAppId(String appId) {
        // 대출 계약 조회
        LoanContract loanContract = loanContractRepository.findByAppId(appId)
                .orElseThrow(() -> new IllegalArgumentException("대출 계약을 찾을 수 없습니다. APP_ID: " + appId));
        
        // LoanContract 엔티티를 LoanContractResponseDto로 변환
        return LoanContractResponseDto.from(loanContract);
    }

    /**
     * ACCOUNT_ID를 통한 대출 계좌 상세 정보 조회
     * 로직 흐름:
     * 1. ACCOUNT_ID로 LOAN_CONTRACT 테이블을 조회한 후, LOAN_ID 추출
     * 2. LOAN_ID로 LOAN_REPAYMENT_SCHEDULE 테이블 조회
     * 3. ACCOUNT_ID로 TRANSACTION_HISTORY에서 거래내역 조회
     * 4. LOAN_REPAYMENT_SCHEDULE과 TRANSACTION_HISTORY 데이터를 응답으로 반환
     */
    public LoanAccountDetailResponseDto getLoanAccountDetailByAccountId(String accountId) {
        // 1. ACCOUNT_ID로 LOAN_CONTRACT 테이블을 조회한 후, LOAN_ID 추출
        LoanContract loanContract = loanContractRepository.findByLoanAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("대출 계약을 찾을 수 없습니다. ACCOUNT_ID: " + accountId));
        
        String loanId = loanContract.getLoanId();
        
        // 2. LOAN_ID로 LOAN_REPAYMENT_SCHEDULE 테이블 조회
        List<LoanRepaymentSchedule> repaymentSchedules = loanRepaymentScheduleRepository.findByLoanIdOrderByDueDateAsc(loanId);
        List<LoanRepaymentScheduleResponseDto> repaymentScheduleDtos = repaymentSchedules.stream()
                .map(LoanRepaymentScheduleResponseDto::from)
                .collect(Collectors.toList());
        
        // 3. ACCOUNT_ID로 TRANSACTION_HISTORY에서 거래내역 조회
        List<TransactionHistory> transactionHistories = transactionHistoryRepository.findByAccountIdOrderByTxnDateDesc(accountId);
        List<TransactionHistoryResponseDto> transactionHistoryDtos = transactionHistories.stream()
                .map(TransactionHistoryResponseDto::from)
                .collect(Collectors.toList());
        
        // 4. LOAN_REPAYMENT_SCHEDULE과 TRANSACTION_HISTORY 데이터를 응답으로 반환
        return LoanAccountDetailResponseDto.create(
                repaymentScheduleDtos,
                transactionHistoryDtos
        );
    }

    /**
     * JWT 토큰에서 추출한 사용자 ID로 사용자 이름 조회
     */
    public UserNameResponseDto getUserNameByUserId(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));
        
        return UserNameResponseDto.from(user.getUserId(), user.getUserNm());
    }

    /**
     * 계좌 타입에 따른 스케줄 조회
     */
    private List<PaymentScheduleResponseDto> getSchedulesByAccountType(Account account, String accountId) {
        if (account.getAccountType() == Account.AccountType.SAVING || 
            account.getAccountType() == Account.AccountType.JOINT_SAVING) {
            // 적금/공동적금: PAYMENT_SCHEDULE 조회
            List<PaymentSchedule> paymentSchedules = paymentScheduleRepository.findByAccountIdOrderByDueDateAsc(accountId);
            return paymentSchedules.stream()
                    .map(PaymentScheduleResponseDto::from)
                    .collect(Collectors.toList());
        } else if (account.getAccountType() == Account.AccountType.LOAN || 
                   account.getAccountType() == Account.AccountType.JOINT_LOAN) {
            // 대출/공동대출: LOAN_REPAYMENT_SCHEDULE 조회
            Optional<LoanContract> loanContractOpt = loanContractRepository.findByAccountId(accountId);
            
            if (loanContractOpt.isPresent()) {
                String loanId = loanContractOpt.get().getLoanId();
                List<LoanRepaymentSchedule> repaymentSchedules = loanRepaymentScheduleRepository.findByLoanIdOrderByDueDateAsc(loanId);
                
                // LoanRepaymentSchedule을 PaymentScheduleResponseDto로 변환
                return repaymentSchedules.stream()
                        .map(this::convertToPaymentScheduleDto)
                        .collect(Collectors.toList());
            }
            // loanId가 없으면 빈 배열 반환
            return List.of();
        }
        
        // 기타 계좌 타입의 경우 빈 배열 반환
        return List.of();
    }

    /**
     * LoanRepaymentSchedule을 PaymentScheduleResponseDto로 변환하는 헬퍼 메서드
     */
    private PaymentScheduleResponseDto convertToPaymentScheduleDto(LoanRepaymentSchedule repaymentSchedule) {
        return PaymentScheduleResponseDto.builder()
                .paymentId(repaymentSchedule.getRepayId()) // repayId를 paymentId로 매핑
                .userId(null) // LoanRepaymentSchedule에는 userId가 없으므로 null
                .accountId(repaymentSchedule.getLoanId()) // loanId를 accountId로 매핑
                .dueDate(repaymentSchedule.getDueDate())
                .amount(repaymentSchedule.getTotalDue()) // 총 상환액
                .status(repaymentSchedule.getStatus() != null ? repaymentSchedule.getStatus().name() : null)
                .statusDescription(repaymentSchedule.getStatus() != null ? repaymentSchedule.getStatus().getDescription() : null)
                .paidAt(repaymentSchedule.getPaidAt() != null ? repaymentSchedule.getPaidAt().toLocalDate() : null)
                .build();
    }
}