package com.hana_ti.home_planner.domain.loan.service;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import com.hana_ti.home_planner.domain.bank.repository.TransactionHistoryRepository;
import com.hana_ti.home_planner.domain.loan.dto.LoanDisbursementRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanDisbursementResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanContract;
import com.hana_ti.home_planner.domain.loan.repository.LoanContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanDisbursementService {

    private final LoanContractRepository loanContractRepository;
    private final AccountRepository accountRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    /**
     * 대출 실행 처리
     */
    @Transactional
    public LoanDisbursementResponseDto disburseLoan(LoanDisbursementRequestDto request) {
        log.info("대출 실행 처리 시작 - 계약ID: {}, 실행금액: {}", request.getLoanId(), request.getAmount());

        // 1. LOAN_CONTRACT 조회 및 상태 확인
        LoanContract contract = loanContractRepository.findById(request.getLoanId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 계약입니다: " + request.getLoanId()));

        if (contract.getStatus() != LoanContract.ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("실행 가능한 상태가 아닙니다. 현재 상태: " + contract.getStatus());
        }

        // 2. 계좌 조회
        // 대출 계좌 조회 (LOAN 타입, 대출금을 출금할 계좌)
        Account loanAccount = accountRepository.findById(contract.getLoanAccountId())
                .orElseThrow(() -> new IllegalArgumentException("대출 계좌를 찾을 수 없습니다: " + contract.getLoanAccountId()));

        // 지급 계좌 조회 (DEMAND 타입, 고객이 돈을 받을 계좌)
        Account disburseAccount =
                accountRepository.findById(contract.getDisburseAccountId())
                .orElseThrow(() -> new IllegalArgumentException("지급 계좌를 찾을 수 없습니다: " + contract.getDisburseAccountId()));

        // 3. 자금 이동 처리
        String baseTransactionId = UUID.randomUUID().toString();
        String loanTransactionId = baseTransactionId.substring(0, 29) + "_LOAN"; // 36자 제한
        String disburseTransactionId = baseTransactionId.substring(0, 29) + "_DIS"; // 36자 제한
        LocalDateTime disbursedAt = LocalDateTime.now();

        log.info("자금 이동 처리 시작 - 대출계좌: {}, 지급계좌: {}, 금액: {}", 
                loanAccount.getAccountNum(), disburseAccount.getAccountNum(), request.getAmount());

        // 대출 계좌에서 대출금액 출금 (실제 돈이 나가는 계좌)
        BigDecimal newLoanBalance = loanAccount.getBalance().subtract(request.getAmount());
        log.info("대출 계좌 잔액 변경 - 기존: {}, 변경후: {}", loanAccount.getBalance(), newLoanBalance);
        loanAccount.updateBalance(newLoanBalance);
        accountRepository.save(loanAccount);

        // 지급 계좌에 대출금액 입금 (고객이 돈을 받는 계좌)
        BigDecimal newDisburseBalance = disburseAccount.getBalance().add(request.getAmount());
        log.info("지급 계좌 잔액 변경 - 기존: {}, 변경후: {}", disburseAccount.getBalance(), newDisburseBalance);
        disburseAccount.updateBalance(newDisburseBalance);
        accountRepository.save(disburseAccount);

        // 4. 거래내역 기록
        log.info("거래내역 기록 시작");
        
        // 대출 계좌 거래내역 (출금)
        TransactionHistory loanTransaction = TransactionHistory.create(
                loanTransactionId,
                loanAccount.getAccountId(),
                TransactionHistory.TransactionType.WITHDRAWAL,
                request.getAmount().negate(), // 음수로 기록 (출금)
                newLoanBalance,
                "대출 실행 출금 - 계약ID: " + contract.getLoanId() + ", 지급계좌: " + disburseAccount.getAccountNum()
        );
        TransactionHistory savedLoanTransaction = transactionHistoryRepository.save(loanTransaction);
        log.info("대출 계좌 거래내역 저장 완료 - 거래ID: {}", savedLoanTransaction.getTxnId());

        // 지급 계좌 거래내역 (입금)
        TransactionHistory disburseTransaction = TransactionHistory.create(
                disburseTransactionId,
                disburseAccount.getAccountId(),
                TransactionHistory.TransactionType.DEPOSIT,
                request.getAmount(), // 양수로 기록 (입금)
                newDisburseBalance,
                "대출 실행 입금 - 계약ID: " + contract.getLoanId() + ", 대출계좌: " + loanAccount.getAccountNum()
        );
        TransactionHistory savedDisburseTransaction = transactionHistoryRepository.save(disburseTransaction);
        log.info("지급 계좌 거래내역 저장 완료 - 거래ID: {}", savedDisburseTransaction.getTxnId());

        // 5. 계약 상태 업데이트
        contract.updateStatus(LoanContract.ContractStatus.DISBURSED);

        log.info("대출 실행 완료 - 계약ID: {}, 대출계좌잔액: {}, 지급계좌잔액: {}", 
                contract.getLoanId(), newLoanBalance, newDisburseBalance);

        // 응답 DTO 생성
        return LoanDisbursementResponseDto.create(
                contract.getLoanId(),
                loanAccount.getAccountId(),
                loanAccount.getAccountNum(),
                newLoanBalance,
                disburseAccount.getAccountId(),
                disburseAccount.getAccountNum(),
                newDisburseBalance,
                request.getAmount(),
                LoanContract.ContractStatus.DISBURSED.name(),
                disbursedAt,
                baseTransactionId
        );
    }
}
