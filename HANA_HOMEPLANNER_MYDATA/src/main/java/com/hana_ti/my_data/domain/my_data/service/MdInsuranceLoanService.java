package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdInsuranceLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdInsuranceLoan;
import com.hana_ti.my_data.domain.my_data.repository.MdInsuranceLoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdInsuranceLoanService {

    private final MdInsuranceLoanRepository mdInsuranceLoanRepository;

    /**
     * 사용자 ID로 보험 대출 조회
     * @param userId 사용자 ID
     * @return 보험 대출 정보 목록
     */
    public List<MdInsuranceLoanResponseDto> getInsuranceLoansByUserId(Long userId) {
        log.info("사용자 ID로 보험 대출 조회 요청: {}", userId);
        
        List<MdInsuranceLoan> insuranceLoans = mdInsuranceLoanRepository.findByUserId(userId);
        List<MdInsuranceLoanResponseDto> insuranceLoanDtos = insuranceLoans.stream()
                .map(MdInsuranceLoanResponseDto::from)
                .toList();
        
        log.info("보험 대출 조회 완료: {}건", insuranceLoanDtos.size());
        return insuranceLoanDtos;
    }

    /**
     * 상환 방법으로 보험 대출 조회
     * @param repayMethod 상환 방법
     * @return 보험 대출 정보 목록
     */
    public List<MdInsuranceLoanResponseDto> getInsuranceLoansByRepayMethod(String repayMethod) {
        log.info("상환 방법으로 보험 대출 조회 요청: {}", repayMethod);
        
        List<MdInsuranceLoan> insuranceLoans = mdInsuranceLoanRepository.findByRepayMethod(repayMethod);
        List<MdInsuranceLoanResponseDto> insuranceLoanDtos = insuranceLoans.stream()
                .map(MdInsuranceLoanResponseDto::from)
                .toList();
        
        log.info("보험 대출 조회 완료: {}건", insuranceLoanDtos.size());
        return insuranceLoanDtos;
    }
}
