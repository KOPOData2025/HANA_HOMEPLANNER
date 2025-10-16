package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.MdBankAccountResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.MdCardResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.MdBankLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.MdCardLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.MdInstallmentLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.MdInsuranceLoanResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.TotalAssetResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdCiService {

    private final ExternalMyDataService externalMyDataService;
    private final MdBankAccountService mdBankAccountService;
    private final MdCardService mdCardService;
    private final MdBankLoanService mdBankLoanService;
    private final MdCardLoanService mdCardLoanService;
    private final MdInstallmentLoanService mdInstallmentLoanService;
    private final MdInsuranceLoanService mdInsuranceLoanService;
    private final MdTotalAssetService mdTotalAssetService;

    /**
     * CI 값으로 사용자 정보 조회 (외부 서버에서 resNum으로 조회)
     * @param ci CI 값
     * @return 사용자 정보
     */
    public com.hana_ti.home_planner.domain.my_data.dto.external.ExternalUserResponseDto getUserByCi(String ci) {
        log.info("CI 값으로 사용자 조회 시작 - CI: {}", ci);
        
        var user = externalMyDataService.getUserByResNum(ci);
        
        log.info("CI 값으로 사용자 조회 완료 - 사용자ID: {}, 이름: {}", user.getUserId(), user.getName());
        return user;
    }

    /**
     * userId로 계좌 현황 조회
     * @param userId 사용자 ID
     * @return 계좌 목록
     */
    public List<MdBankAccountResponseDto> getBankAccountsByUserId(Long userId) {
        log.info("userId로 계좌 현황 조회 시작 - userId: {}", userId);
        
        // userId로 계좌 조회
        var externalAccounts = externalMyDataService.getBankAccountsByUserId(userId);
        List<MdBankAccountResponseDto> accounts = externalAccounts.stream()
                .map(mdBankAccountService::convertToMdBankAccountResponseDto)
                .toList();
        
        log.info("userId로 계좌 현황 조회 완료 - 계좌 수: {}개", accounts.size());
        return accounts;
    }

    /**
     * userId로 카드 현황 조회
     * @param userId 사용자 ID
     * @return 카드 목록
     */
    public List<MdCardResponseDto> getCardsByUserId(Long userId) {
        log.info("userId로 카드 현황 조회 시작 - userId: {}", userId);
        
        // userId로 카드 조회
        var externalCards = externalMyDataService.getCardsByUserId(userId);
        List<MdCardResponseDto> cards = externalCards.stream()
                .map(mdCardService::convertToMdCardResponseDto)
                .toList();
        
        log.info("userId로 카드 현황 조회 완료 - 카드 수: {}개", cards.size());
        return cards;
    }

    /**
     * userId로 은행 대출 현황 조회
     * @param userId 사용자 ID
     * @return 은행 대출 목록
     */
    public List<MdBankLoanResponseDto> getBankLoansByUserId(Long userId) {
        log.info("userId로 은행 대출 현황 조회 시작 - userId: {}", userId);
        
        // userId로 은행 대출 조회
        var externalLoans = externalMyDataService.getBankLoansByUserId(userId);
        List<MdBankLoanResponseDto> bankLoans = externalLoans.stream()
                .map(mdBankLoanService::convertToMdBankLoanResponseDto)
                .toList();
        
        log.info("userId로 은행 대출 현황 조회 완료 - 대출 수: {}개", bankLoans.size());
        return bankLoans;
    }

    /**
     * userId로 카드 대출 현황 조회
     * @param userId 사용자 ID
     * @return 카드 대출 목록
     */
    public List<MdCardLoanResponseDto> getCardLoansByUserId(Long userId) {
        log.info("userId로 카드 대출 현황 조회 시작 - userId: {}", userId);
        
        // userId로 카드 조회 후 각 카드별 대출 조회
        var externalCards = externalMyDataService.getCardsByUserId(userId);
        List<MdCardLoanResponseDto> allCardLoans = externalCards.stream()
                .flatMap(card -> {
                    var cardLoans = externalMyDataService.getCardLoansByCardId(card.getCardId());
                    return cardLoans.stream().map(mdCardLoanService::convertToMdCardLoanResponseDto);
                })
                .toList();
        
        log.info("userId로 카드 대출 현황 조회 완료 - 카드 대출 수: {}개", allCardLoans.size());
        return allCardLoans;
    }

    /**
     * userId로 할부 대출 현황 조회
     * @param userId 사용자 ID
     * @return 할부 대출 목록
     */
    public List<MdInstallmentLoanResponseDto> getInstallmentLoansByUserId(Long userId) {
        log.info("userId로 할부 대출 현황 조회 시작 - userId: {}", userId);
        
        // userId로 할부 대출 조회
        var externalLoans = externalMyDataService.getInstallmentLoansByUserId(userId);
        List<MdInstallmentLoanResponseDto> installmentLoans = externalLoans.stream()
                .map(mdInstallmentLoanService::convertToMdInstallmentLoanResponseDto)
                .toList();
        
        log.info("userId로 할부 대출 현황 조회 완료 - 할부 대출 수: {}개", installmentLoans.size());
        return installmentLoans;
    }

    /**
     * userId로 보험 대출 현황 조회
     * @param userId 사용자 ID
     * @return 보험 대출 목록
     */
    public List<MdInsuranceLoanResponseDto> getInsuranceLoansByUserId(Long userId) {
        log.info("userId로 보험 대출 현황 조회 시작 - userId: {}", userId);
        
        // userId로 보험 대출 조회
        var externalLoans = externalMyDataService.getInsuranceLoansByUserId(userId);
        List<MdInsuranceLoanResponseDto> insuranceLoans = externalLoans.stream()
                .map(mdInsuranceLoanService::convertToMdInsuranceLoanResponseDto)
                .toList();
        
        log.info("userId로 보험 대출 현황 조회 완료 - 보험 대출 수: {}개", insuranceLoans.size());
        return insuranceLoans;
    }

    /**
     * CI 값으로 총 자산 현황 조회
     * @param ci CI 값
     * @return 총 자산 정보
     */
    public TotalAssetResponseDto getTotalAssetsByCi(String ci) {
        log.info("CI 값으로 총 자산 현황 조회 시작 - CI: {}", ci);
        
        // CI 값으로 사용자 정보 조회
        var user = externalMyDataService.getUserByCi(ci);
        
        // 총 자산 조회 (ci로 조회)
        TotalAssetResponseDto totalAssets = mdTotalAssetService.getTotalAssetsByResNum(user.getCi());
        
        log.info("CI 값으로 총 자산 현황 조회 완료 - 총자산: {}, 총부채: {}, 순자산: {}", 
                totalAssets.getSummary().getTotalAssets(),
                totalAssets.getSummary().getTotalLiabilities(),
                totalAssets.getSummary().getNetWorth());
        return totalAssets;
    }
}
