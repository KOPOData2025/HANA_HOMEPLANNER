package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.AnnualIncomeResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.external.ExternalBankTransactionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MdBankTransactionService {

    private final ExternalMyDataService externalMyDataService;
    /**
     * resNum으로 연소득 정보 조회 (외부 서버 사용)
     */
    public AnnualIncomeResponseDto getAnnualIncomeByResNum(String resNum) {
        log.info("resNum으로 연소득 추정 시작 - resNum: {}", resNum);
        
        try {
            // 1. 외부 서버에서 사용자 정보 조회
            var externalUser = externalMyDataService.getUserByResNum(resNum);
            Long userId = externalUser.getUserId();
            
            // 2. 외부 서버에서 거래내역 조회
            List<ExternalBankTransactionResponseDto> externalTransactions = 
                externalMyDataService.getBankTransactionsByUserId(userId);
            
            // 3. 급여 관련 거래만 필터링
            List<ExternalBankTransactionResponseDto> salaryTransactions = externalTransactions.stream()
                .filter(t -> "DEPOSIT".equals(t.getTransactionType()) && 
                           (t.getDescription() != null && t.getDescription().contains("급여")))
                .collect(Collectors.toList());
            
            if (salaryTransactions.isEmpty()) {
                log.info("resNum으로 연소득 추정 완료 - 급여 정보 없음");
                return AnnualIncomeResponseDto.builder()
                        .userId(userId)
                        .annualIncome(BigDecimal.ZERO)
                        .period("최근 12개월")
                        .transactionCount(0)
                        .averageMonthlyIncome(BigDecimal.ZERO)
                        .build();
            }
            
            // 4. 실제 급여 총액 계산
            BigDecimal actualIncome = salaryTransactions.stream()
                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Integer transactionCount = salaryTransactions.size();
            
            // 5. 연소득 추정 계산
            BigDecimal estimatedAnnualIncome = calculateEstimatedAnnualIncome(actualIncome, transactionCount);
            BigDecimal averageMonthlyIncome = transactionCount > 0 ? 
                    actualIncome.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

            AnnualIncomeResponseDto response = AnnualIncomeResponseDto.builder()
                    .userId(userId)
                    .annualIncome(estimatedAnnualIncome)
                    .period("최근 12개월 (추정)")
                    .transactionCount(transactionCount)
                    .averageMonthlyIncome(averageMonthlyIncome)
                    .build();

            log.info("resNum으로 연소득 추정 완료 - 실제소득: {}, 추정연소득: {}, 거래건수: {}", 
                    actualIncome, estimatedAnnualIncome, transactionCount);

            return response;
            
        } catch (Exception e) {
            log.error("resNum으로 연소득 추정 중 오류 발생 - resNum: {}", resNum, e);
            throw new RuntimeException("연소득 추정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 사용자 ID로 모든 계좌의 급여 정보 조회 (연소득 추정) - 외부 서버 사용
     */
    public AnnualIncomeResponseDto getAnnualIncomeByUserId(Long userId) {
        log.info("사용자 ID로 연소득 추정 시작 - 사용자 ID: {}", userId);

        try {
            // 외부 서버에서 거래내역 조회
            List<ExternalBankTransactionResponseDto> externalTransactions = 
                externalMyDataService.getBankTransactionsByUserId(userId);
            
            // 급여 관련 거래만 필터링
            List<ExternalBankTransactionResponseDto> salaryTransactions = externalTransactions.stream()
                .filter(t -> "DEPOSIT".equals(t.getTransactionType()) && 
                           (t.getDescription() != null && t.getDescription().contains("급여")))
                .collect(Collectors.toList());

            if (salaryTransactions.isEmpty()) {
                log.info("사용자 ID로 연소득 추정 완료 - 급여 정보 없음");
                return AnnualIncomeResponseDto.builder()
                        .userId(userId)
                        .annualIncome(BigDecimal.ZERO)
                        .period("최근 12개월")
                        .transactionCount(0)
                        .averageMonthlyIncome(BigDecimal.ZERO)
                        .build();
            }

            // 실제 급여 총액 계산
            BigDecimal actualIncome = salaryTransactions.stream()
                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Integer transactionCount = salaryTransactions.size();
            
            // 실제 데이터 기반 연소득 추정
            BigDecimal estimatedAnnualIncome = calculateEstimatedAnnualIncome(actualIncome, transactionCount);
            BigDecimal averageMonthlyIncome = transactionCount > 0 ? 
                    actualIncome.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

            AnnualIncomeResponseDto response = AnnualIncomeResponseDto.builder()
                    .userId(userId)
                    .annualIncome(estimatedAnnualIncome)
                    .period("최근 12개월 (추정)")
                    .transactionCount(transactionCount)
                    .averageMonthlyIncome(averageMonthlyIncome)
                    .build();

            log.info("사용자 ID로 연소득 추정 완료 - 실제소득: {}, 추정연소득: {}, 거래건수: {}", 
                    actualIncome, estimatedAnnualIncome, transactionCount);

            return response;

        } catch (Exception e) {
            log.error("사용자 ID로 연소득 추정 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("연소득 추정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 실제 데이터 기반 연소득 추정 계산
     * 12개월이 안 될 때는 실제 데이터의 평균으로 나머지 개월을 채워서 연소득 산정
     */
    private BigDecimal calculateEstimatedAnnualIncome(BigDecimal actualIncome, Integer transactionCount) {
        if (transactionCount == 0) {
            return BigDecimal.ZERO;
        }
        
        // 실제 데이터의 월평균 소득 계산
        BigDecimal averageMonthlyIncome = actualIncome.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP);
        
        // 12개월 기준으로 연소득 추정
        BigDecimal estimatedAnnualIncome = averageMonthlyIncome.multiply(BigDecimal.valueOf(12));
        
        log.debug("연소득 추정 계산 - 실제소득: {}, 거래건수: {}, 월평균: {}, 추정연소득: {}", 
                actualIncome, transactionCount, averageMonthlyIncome, estimatedAnnualIncome);
        
        return estimatedAnnualIncome;
    }
}
