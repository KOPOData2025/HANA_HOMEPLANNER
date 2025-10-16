package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.MdBankAccountResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.external.ExternalBankAccountResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdBankAccountService {

    private final ExternalMyDataService externalMyDataService;

    /**
     * resNum으로 계좌 목록 조회 (외부 서버 사용)
     * @param resNum 사용자 resNum
     * @return 계좌 목록
     */
    public List<MdBankAccountResponseDto> findAccountsByResNum(String resNum) {
        log.info("resNum으로 계좌 목록 조회 요청: resNum={}", resNum);
        
        try {
            // 1. 외부 서버에서 사용자 정보 조회
            var externalUser = externalMyDataService.getUserByResNum(resNum);
            Long userId = externalUser.getUserId();
            
            // 2. 외부 서버에서 계좌 정보 조회
            List<ExternalBankAccountResponseDto> externalAccounts = 
                externalMyDataService.getBankAccountsByUserId(userId);
            
            // 3. 외부 데이터를 내부 DTO로 변환
            List<MdBankAccountResponseDto> accounts = externalAccounts.stream()
                .map(this::convertToMdBankAccountResponseDto)
                .collect(Collectors.toList());
            
            log.info("resNum으로 계좌 목록 조회 완료: resNum={}, userId={}, count={}", 
                    resNum, userId, accounts.size());
            
            return accounts;
            
        } catch (Exception e) {
            log.error("resNum으로 계좌 목록 조회 중 오류 발생 - resNum: {}", resNum, e);
            throw new RuntimeException("계좌 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 외부 서버 데이터를 내부 DTO로 변환
     */
    public MdBankAccountResponseDto convertToMdBankAccountResponseDto(ExternalBankAccountResponseDto external) {
        return MdBankAccountResponseDto.builder()
                .accountId(external.getAccountId())
                .userId(external.getUserId())
                .orgCode(external.getOrgCode())
                .accountNum(external.getAccountNum())
                .accountType(external.getAccountType())
                .accountName(external.getAccountName())
                .balanceAmt(external.getBalanceAmt())
                .status(external.getStatus())
                .openedDate(parseLocalDate(external.getOpenedDate()))
                .consentYn(external.getConsentYn())
                .createdAt(parseLocalDateTime(external.getCreatedAt()))
                .build();
    }

    /**
     * String을 LocalDate로 변환
     */
    private LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e) {
            log.warn("날짜 파싱 실패: {}", dateStr, e);
            return null;
        }
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
