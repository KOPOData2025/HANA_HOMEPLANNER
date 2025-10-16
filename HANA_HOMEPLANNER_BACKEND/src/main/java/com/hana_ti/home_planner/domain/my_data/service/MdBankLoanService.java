package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.MdBankLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.external.ExternalBankLoanResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdBankLoanService {

    private final ExternalMyDataService externalMyDataService;

    /**
     * 사용자 ID로 은행 대출 조회 (외부 서버 사용)
     */
    public List<MdBankLoanResponseDto> getBankLoansByUserId(Long userId) {
        log.info("사용자 ID로 은행 대출 조회 시작 - 사용자 ID: {}", userId);

        try {
            // 외부 서버에서 은행 대출 정보 조회
            List<ExternalBankLoanResponseDto> externalLoans = 
                externalMyDataService.getBankLoansByUserId(userId);

            // 외부 데이터를 내부 DTO로 변환
            List<MdBankLoanResponseDto> dtos = externalLoans.stream()
                .map(this::convertToMdBankLoanResponseDto)
                .collect(Collectors.toList());

            log.info("사용자 ID로 은행 대출 조회 완료 - 조회된 대출 수: {}개", dtos.size());

            return dtos;

        } catch (Exception e) {
            log.error("사용자 ID로 은행 대출 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("은행 대출 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }


    /**
     * 외부 서버 데이터를 내부 DTO로 변환
     */
    public MdBankLoanResponseDto convertToMdBankLoanResponseDto(ExternalBankLoanResponseDto external) {
        return MdBankLoanResponseDto.builder()
                .loanId(external.getLoanId())
                .accountId(external.getAccountId())
                .userId(external.getUserId())
                .orgCode(external.getOrgCode())
                .loanType(external.getLoanType())
                .principalAmt(external.getPrincipalAmt())
                .balanceAmt(external.getBalanceAmt())
                .intRate(external.getIntRate())
                .repayMethod(null) // 외부 서버에서 제공하지 않는 필드
                .maturityDate(null) // 외부 서버에서 제공하지 않는 필드
                .nextPayDate(null) // 외부 서버에서 제공하지 않는 필드
                .createdAt(parseLocalDateTime(external.getCreatedAt()))
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
}
