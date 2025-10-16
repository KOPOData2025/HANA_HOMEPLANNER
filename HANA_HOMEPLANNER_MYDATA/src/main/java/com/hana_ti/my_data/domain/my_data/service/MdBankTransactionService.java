package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdBankTransactionResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdBankTransaction;
import com.hana_ti.my_data.domain.my_data.repository.MdBankTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdBankTransactionService {

    private final MdBankTransactionRepository mdBankTransactionRepository;

    /**
     * 사용자 ID로 거래내역 조회
     * @param userId 사용자 ID
     * @return 거래내역 목록
     */
    public List<MdBankTransactionResponseDto> getTransactionsByUserId(Long userId) {
        log.info("사용자 ID로 거래내역 조회 요청: {}", userId);
        
        List<MdBankTransaction> transactions = mdBankTransactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        List<MdBankTransactionResponseDto> transactionDtos = transactions.stream()
                .map(MdBankTransactionResponseDto::from)
                .toList();
        
        log.info("거래내역 조회 완료: {}건", transactionDtos.size());
        return transactionDtos;
    }
}
