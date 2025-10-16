package com.hana_ti.home_planner.domain.bank.service;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;

    /**
     * 계좌 생성
     */
    @Transactional
    public Account createAccount(String userId, String productId, Account.AccountType accountType, BigDecimal initialBalance) {
        log.info("계좌 생성 시작 - 사용자ID: {}, 상품ID: {}, 계좌타입: {}", userId, productId, accountType);

        // 계좌 ID 생성
        String accountId = UUID.randomUUID().toString();
        
        // 계좌번호 생성 (중복되지 않는 값)
        String accountNumber = generateUniqueAccountNumber();
        
        // 계좌 생성
        Account account = Account.create(
                accountId,
                userId,
                productId,
                accountNumber,
                accountType,
                initialBalance,
                Account.AccountStatus.ACTIVE
        );

        // 저장
        Account savedAccount = accountRepository.save(account);
        
        log.info("계좌 생성 완료 - 계좌ID: {}, 계좌번호: {}", savedAccount.getAccountId(), savedAccount.getAccountNum());
        
        return savedAccount;
    }

    /**
     * 중복되지 않는 계좌번호 생성
     */
    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            // 형식: 은행코드(3자리) + 계좌타입(1자리) + 랜덤숫자(10자리)
            accountNumber = String.format("001%010d", System.currentTimeMillis() % 10000000000L);
        } while (accountRepository.existsByAccountNum(accountNumber));
        
        return accountNumber;
    }

    /**
     * 사용자별 모든 계좌 조회
     */
    public List<Account> getAllAccountsByUserId(String userId) {
        log.info("사용자별 모든 계좌 조회 - 사용자ID: {}", userId);
        return accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 사용자별 계좌 타입별 조회
     */
    public List<Account> getAccountsByUserIdAndType(String userId, Account.AccountType accountType) {
        log.info("사용자별 계좌 타입별 조회 - 사용자ID: {}, 계좌타입: {}", userId, accountType);
        return accountRepository.findByUserIdAndAccountTypeOrderByCreatedAtDesc(userId, accountType);
    }

    /**
     * 계좌번호로 계좌 조회
     */
    public Account getAccountByAccountNumber(String accountNumber) {
        log.info("계좌번호로 계좌 조회 - 계좌번호: {}", accountNumber);
        return accountRepository.findByAccountNum(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다: " + accountNumber));
    }

    /**
     * 사용자별 활성 계좌 조회
     */
    public List<Account> getActiveAccountsByUserId(String userId) {
        log.info("사용자별 활성 계좌 조회 - 사용자ID: {}", userId);
        return accountRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, Account.AccountStatus.ACTIVE);
    }
}
