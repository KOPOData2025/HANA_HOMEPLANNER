package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdBankLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdBankLoan;
import com.hana_ti.my_data.domain.my_data.repository.MdBankLoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdBankLoanService {

    private final MdBankLoanRepository mdBankLoanRepository;

    /**
     * 사용자 ID로 대출 정보 조회
     * @param userId 사용자 ID
     * @return 대출 정보 목록
     */
    public List<MdBankLoanResponseDto> getLoansByUserId(Long userId) {
        log.info("사용자 ID로 대출 정보 조회 요청: {}", userId);
        
        List<MdBankLoan> loans = mdBankLoanRepository.findByUserId(userId);
        List<MdBankLoanResponseDto> loanDtos = loans.stream()
                .map(MdBankLoanResponseDto::from)
                .toList();
        
        log.info("대출 정보 조회 완료: {}건", loanDtos.size());
        return loanDtos;
    }
}
