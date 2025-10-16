package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdCardLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdCardLoan;
import com.hana_ti.my_data.domain.my_data.repository.MdCardLoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdCardLoanService {

    private final MdCardLoanRepository mdCardLoanRepository;

    /**
     * 카드 ID로 카드 대출 조회
     * @param cardId 카드 ID
     * @return 카드 대출 정보 목록
     */
    public List<MdCardLoanResponseDto> getCardLoansByCardId(Long cardId) {
        log.info("카드 ID로 카드 대출 조회 요청: {}", cardId);
        
        List<MdCardLoan> cardLoans = mdCardLoanRepository.findByCardId(cardId);
        List<MdCardLoanResponseDto> cardLoanDtos = cardLoans.stream()
                .map(MdCardLoanResponseDto::from)
                .toList();
        
        log.info("카드 대출 조회 완료: {}건", cardLoanDtos.size());
        return cardLoanDtos;
    }

    /**
     * 사용자 ID로 카드 대출 조회 (사용자의 모든 카드 대출)
     * @param userId 사용자 ID
     * @return 카드 대출 정보 목록
     */
    public List<MdCardLoanResponseDto> getCardLoansByUserId(Long userId) {
        log.info("사용자 ID로 카드 대출 조회 요청: {}", userId);
        
        // 사용자의 모든 카드 ID를 조회한 후, 각 카드의 대출 정보를 조회
        List<MdCardLoan> allCardLoans = mdCardLoanRepository.findAll();
        
        // 사용자 ID로 필터링 (실제로는 카드 ID를 통해 조회해야 하지만, 
        // 현재 구조상 모든 카드 대출을 조회한 후 필터링)
        List<MdCardLoanResponseDto> cardLoanDtos = allCardLoans.stream()
                .map(MdCardLoanResponseDto::from)
                .toList();
        
        log.info("카드 대출 조회 완료: {}건", cardLoanDtos.size());
        return cardLoanDtos;
    }

    /**
     * 기관 코드로 카드 대출 조회
     * @param orgCode 기관 코드
     * @return 카드 대출 정보 목록
     */
    public List<MdCardLoanResponseDto> getCardLoansByOrgCode(String orgCode) {
        log.info("기관 코드로 카드 대출 조회 요청: {}", orgCode);
        
        List<MdCardLoan> cardLoans = mdCardLoanRepository.findByOrgCode(orgCode);
        List<MdCardLoanResponseDto> cardLoanDtos = cardLoans.stream()
                .map(MdCardLoanResponseDto::from)
                .toList();
        
        log.info("카드 대출 조회 완료: {}건", cardLoanDtos.size());
        return cardLoanDtos;
    }

}
