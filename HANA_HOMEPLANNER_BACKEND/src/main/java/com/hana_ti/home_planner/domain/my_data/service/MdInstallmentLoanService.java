package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.MdInstallmentLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.external.ExternalInstallmentLoanResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MdInstallmentLoanService {

    private final ExternalMyDataService externalMyDataService;

    /**
     * 사용자 ID로 할부 대출 조회 (외부 서버 사용)
     */
    public List<MdInstallmentLoanResponseDto> getInstallmentLoansByUserId(Long userId) {
        log.info("사용자 ID로 할부 대출 조회 시작 - 사용자 ID: {}", userId);

        try {
            // 외부 서버에서 할부 대출 정보 조회
            List<ExternalInstallmentLoanResponseDto> externalLoans = 
                externalMyDataService.getInstallmentLoansByUserId(userId);

            // 외부 데이터를 내부 DTO로 변환
            List<MdInstallmentLoanResponseDto> dtos = externalLoans.stream()
                .map(this::convertToMdInstallmentLoanResponseDto)
                .collect(Collectors.toList());

            log.info("사용자 ID로 할부 대출 조회 완료 - 조회된 대출 수: {}개", dtos.size());

            return dtos;

        } catch (Exception e) {
            log.error("사용자 ID로 할부 대출 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("할부 대출 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * resNum으로 할부 대출 조회 (외부 서버 사용)
     */
    public List<MdInstallmentLoanResponseDto> getInstallmentLoansByResNum(String resNum) {
        log.info("resNum으로 할부 대출 조회 요청: resNum={}", resNum);
        
        try {
            // 1. 외부 서버에서 사용자 정보 조회
            var externalUser = externalMyDataService.getUserByResNum(resNum);
            Long userId = externalUser.getUserId();
            
            // 2. 외부 서버에서 할부 대출 정보 조회
            List<ExternalInstallmentLoanResponseDto> externalLoans = 
                externalMyDataService.getInstallmentLoansByUserId(userId);
            
            // 3. 외부 데이터를 내부 DTO로 변환
            List<MdInstallmentLoanResponseDto> dtos = externalLoans.stream()
                .map(this::convertToMdInstallmentLoanResponseDto)
                .collect(Collectors.toList());
            
            log.info("resNum으로 할부 대출 조회 완료: resNum={}, userId={}, 대출 수: {}", 
                    resNum, userId, dtos.size());
            
            return dtos;
            
        } catch (Exception e) {
            log.error("resNum으로 할부 대출 조회 중 오류 발생 - resNum: {}", resNum, e);
            throw new RuntimeException("할부 대출 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 외부 서버 데이터를 내부 DTO로 변환
     */
    public MdInstallmentLoanResponseDto convertToMdInstallmentLoanResponseDto(ExternalInstallmentLoanResponseDto external) {
        return MdInstallmentLoanResponseDto.builder()
                .instLoanId(external.getLoanId()) // ExternalInstallmentLoanResponseDto의 loanId를 instLoanId로 매핑
                .userId(external.getUserId())
                .orgCode(external.getOrgCode())
                .productName(external.getProductName())
                .principalAmt(external.getPrincipalAmt()) // 외부 서버에서 제공하는 필드
                .balanceAmt(external.getBalanceAmt())
                .intRate(external.getIntRate())
                .repayMethod(external.getRepayMethod()) // 외부 서버에서 제공하는 필드
                .maturityDate(external.getMaturityDate()) // 외부 서버에서 제공하는 필드
                .nextPayDate(external.getNextPayDate()) // 외부 서버에서 제공하는 필드
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
