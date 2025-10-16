package com.hana_ti.home_planner.domain.bank.service;

import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import com.hana_ti.home_planner.domain.bank.repository.TransactionHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 거래내역 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TransactionHistoryService {

    private final TransactionHistoryRepository transactionHistoryRepository;

    /**
     * 거래내역 생성
     */
    @Transactional
    public TransactionHistory createTransaction(String accountId, TransactionHistory.TransactionType transactionType,
                                              BigDecimal amount, BigDecimal balanceAfter, String description) {
        log.info("거래내역 생성 시작 - 계좌ID: {}, 거래타입: {}, 금액: {}", accountId, transactionType, amount);

        // 거래 ID 생성
        String txnId = UUID.randomUUID().toString();
        
        // 거래내역 생성
        TransactionHistory transaction = TransactionHistory.create(
                txnId,
                accountId,
                transactionType,
                amount,
                balanceAfter,
                description
        );

        // 저장
        TransactionHistory savedTransaction = transactionHistoryRepository.save(transaction);
        
        log.info("거래내역 생성 완료 - 거래ID: {}, 계좌ID: {}", savedTransaction.getTxnId(), accountId);
        
        return savedTransaction;
    }
}
