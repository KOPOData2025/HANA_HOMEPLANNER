package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdBankAccountResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdBankAccount;
import com.hana_ti.my_data.domain.my_data.repository.MdBankAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdBankAccountService {

    private final MdBankAccountRepository mdBankAccountRepository;

    /**
     * 사용자 ID로 계좌 정보 조회
     * @param userId 사용자 ID
     * @return 계좌 정보 목록
     */
    public List<MdBankAccountResponseDto> getAccountsByUserId(Long userId) {
        log.info("사용자 ID로 계좌 정보 조회 요청: {}", userId);
        
        List<MdBankAccount> accounts = mdBankAccountRepository.findByUserId(userId);
        List<MdBankAccountResponseDto> accountDtos = accounts.stream()
                .map(this::convertToResponseDto)
                .toList();
        
        log.info("계좌 정보 조회 완료: {}건", accountDtos.size());
        return accountDtos;
    }

    private MdBankAccountResponseDto convertToResponseDto(MdBankAccount account) {
        return MdBankAccountResponseDto.builder()
                .accountId(account.getAccountId())
                .userId(account.getUserId())
                .orgCode(account.getOrgCode())
                .accountNum(account.getAccountNum())
                .accountType(account.getAccountType())
                .accountName(account.getAccountName())
                .balanceAmt(account.getBalanceAmt())
                .status(account.getStatus())
                .openedDate(account.getOpenedDate())
                .consentYn(account.getConsentYn())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
