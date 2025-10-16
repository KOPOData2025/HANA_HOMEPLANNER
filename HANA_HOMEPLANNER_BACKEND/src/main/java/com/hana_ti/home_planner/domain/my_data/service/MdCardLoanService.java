package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.MdCardLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.external.ExternalCardLoanResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 카드 대출 계좌 서비스
 * 카드 대출 데이터 조회 비즈니스 로직을 담당합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MdCardLoanService {

    private final ExternalMyDataService externalMyDataService;

    /**
     * 카드 ID로 카드 대출 조회 (외부 서버 사용)
     */
    public List<MdCardLoanResponseDto> getCardLoansByCardId(Long cardId) {
        log.info("카드 ID로 카드 대출 조회 시작 - 카드 ID: {}", cardId);

        try {
            // 외부 서버에서 카드 대출 정보 조회
            List<ExternalCardLoanResponseDto> externalLoans = 
                externalMyDataService.getCardLoansByCardId(cardId);

            // 외부 데이터를 내부 DTO로 변환
            List<MdCardLoanResponseDto> dtos = externalLoans.stream()
                .map(this::convertToMdCardLoanResponseDto)
                .collect(Collectors.toList());

            log.info("카드 ID로 카드 대출 조회 완료 - 조회된 대출 수: {}개", dtos.size());

            return dtos;

        } catch (Exception e) {
            log.error("카드 ID로 카드 대출 조회 중 오류 발생 - cardId: {}", cardId, e);
            throw new RuntimeException("카드 대출 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 외부 서버 데이터를 내부 DTO로 변환
     */
    public MdCardLoanResponseDto convertToMdCardLoanResponseDto(ExternalCardLoanResponseDto external) {
        return MdCardLoanResponseDto.builder()
                .cardLoanId(external.getLoanId()) // ExternalCardLoanResponseDto의 loanId를 cardLoanId로 매핑
                .cardId(external.getCardId())
                .orgCode(external.getOrgCode()) // 외부 서버에서 제공하지 않는 필드
                .loanType(external.getLoanType())
                .principalAmt(null) // 외부 서버에서 제공하지 않는 필드
                .balanceAmt(external.getBalanceAmt())
                .intRate(external.getIntRate())
                .maturityDate(null) // 외부 서버에서 제공하지 않는 필드
                .nextPayDate(null) // 외부 서버에서 제공하지 않는 필드
                .createdAt(formatDateTime(parseLocalDateTime(external.getCreatedAt())))
                .build();
    }

    /**
     * String을 LocalDateTime으로 변환
     */
    private LocalDateTime parseLocalDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            return null;
        }
        try {
            // ISO 형식 또는 "yyyy-MM-dd HH:mm:ss" 형식 처리
            if (dateTimeStr.contains("T")) {
                return LocalDateTime.parse(dateTimeStr.replace("Z", ""));
            } else {
                return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            }
        } catch (Exception e) {
            log.warn("날짜시간 파싱 실패: {}", dateTimeStr, e);
            return null;
        }
    }

    /**
     * LocalDateTime을 문자열로 포맷하는 유틸리티 메서드
     */
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : null;
    }
}
