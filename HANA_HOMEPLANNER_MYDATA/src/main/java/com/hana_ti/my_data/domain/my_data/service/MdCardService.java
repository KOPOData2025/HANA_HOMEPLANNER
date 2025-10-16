package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdCardResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdBankAccount;
import com.hana_ti.my_data.domain.my_data.repository.MdCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdCardService {

    private final MdCardRepository mdCardRepository;

    /**
     * 사용자 ID로 카드 정보 조회
     * @param userId 사용자 ID
     * @return 카드 정보 목록
     */
    public List<MdCardResponseDto> getCardsByUserId(Long userId) {
        log.info("사용자 ID로 카드 정보 조회 요청: {}", userId);
        
        List<MdBankAccount.MdCard> cards = mdCardRepository.findByUserId(userId);
        List<MdCardResponseDto> cardDtos = cards.stream()
                .map(MdCardResponseDto::from)
                .toList();
        
        log.info("카드 정보 조회 완료: {}건", cardDtos.size());
        return cardDtos;
    }
}
