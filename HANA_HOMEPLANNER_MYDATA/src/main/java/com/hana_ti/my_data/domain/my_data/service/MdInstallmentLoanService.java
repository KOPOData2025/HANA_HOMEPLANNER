package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdInstallmentLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdInstallmentLoan;
import com.hana_ti.my_data.domain.my_data.repository.MdInstallmentLoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdInstallmentLoanService {

    private final MdInstallmentLoanRepository mdInstallmentLoanRepository;

    /**
     * 사용자 ID로 할부 대출 조회
     * @param userId 사용자 ID
     * @return 할부 대출 정보 목록
     */
    public List<MdInstallmentLoanResponseDto> getInstallmentLoansByUserId(Long userId) {
        log.info("사용자 ID로 할부 대출 조회 요청: {}", userId);
        
        List<MdInstallmentLoan> installmentLoans = mdInstallmentLoanRepository.findByUserId(userId);
        List<MdInstallmentLoanResponseDto> installmentLoanDtos = installmentLoans.stream()
                .map(MdInstallmentLoanResponseDto::from)
                .toList();
        
        log.info("할부 대출 조회 완료: {}건", installmentLoanDtos.size());
        return installmentLoanDtos;
    }
}
