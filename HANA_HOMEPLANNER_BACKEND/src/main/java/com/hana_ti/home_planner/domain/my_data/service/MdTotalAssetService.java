package com.hana_ti.home_planner.domain.my_data.service;

import com.hana_ti.home_planner.domain.my_data.dto.TotalAssetResponseDto;
import com.hana_ti.home_planner.domain.my_data.dto.external.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdTotalAssetService {

    private final ExternalMyDataService externalMyDataService;

    /**
     * resNum으로 총 자산 조회 (외부 서버 사용)
     * @param resNum 사용자 resNum
     * @return 총 자산 정보
     */
    public TotalAssetResponseDto getTotalAssetsByResNum(String resNum) {
        log.info("resNum으로 총 자산 조회 요청: resNum={}", resNum);
        
        try {
            // 1. 외부 서버에서 사용자 정보 조회
            ExternalUserResponseDto externalUser = externalMyDataService.getUserByResNum(resNum);
            Long userId = externalUser.getUserId();
            
            // 2. 외부 서버에서 각종 데이터 조회
            List<ExternalBankAccountResponseDto> bankAccounts = externalMyDataService.getBankAccountsByUserId(userId);
            List<ExternalBankLoanResponseDto> bankLoans = externalMyDataService.getBankLoansByUserId(userId);
            List<ExternalCardResponseDto> cards = externalMyDataService.getCardsByUserId(userId);
            List<ExternalInstallmentLoanResponseDto> installmentLoans = externalMyDataService.getInstallmentLoansByUserId(userId);
            List<ExternalInsuranceLoanResponseDto> insuranceLoans = externalMyDataService.getInsuranceLoansByUserId(userId);
            
            // 3. 카드 대출 조회 (각 카드별로)
            List<ExternalCardLoanResponseDto> cardLoans = cards.stream()
                .flatMap(card -> externalMyDataService.getCardLoansByCardId(card.getCardId()).stream())
                .collect(Collectors.toList());
            
            // 4. 자산 계산
            TotalAssetResponseDto.Assets assets = calculateAssetsFromExternal(bankAccounts);
            
            // 5. 부채 계산
            TotalAssetResponseDto.Liabilities liabilities = calculateLiabilitiesFromExternal(
                bankLoans, cardLoans, installmentLoans, insuranceLoans);
            
            // 6. 요약 정보 계산
            TotalAssetResponseDto.Summary summary = TotalAssetResponseDto.Summary.builder()
                    .totalAssets(assets.getTotal())
                    .totalLiabilities(liabilities.getTotal())
                    .netWorth(assets.getTotal().subtract(liabilities.getTotal()))
                    .lastUpdated(LocalDateTime.now())
                    .build();
            
            // 7. 자산 분석
            TotalAssetResponseDto.Analysis analysis = analyzeAssets(assets.getTotal(), liabilities.getTotal());

            TotalAssetResponseDto response = TotalAssetResponseDto.builder()
                    .userId(userId)
                    .summary(summary)
                    .assets(assets)
                    .liabilities(liabilities)
                    .analysis(analysis)
                    .build();

            log.info("resNum으로 총 자산 조회 완료: resNum={}, 총자산={}, 총부채={}, 순자산={}", 
                    resNum, assets.getTotal(), liabilities.getTotal(), summary.getNetWorth());

            return response;
            
        } catch (Exception e) {
            log.error("resNum으로 총 자산 조회 중 오류 발생 - resNum: {}", resNum, e);
            throw new RuntimeException("총 자산 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 외부 서버 데이터로 자산 계산
     */
    private TotalAssetResponseDto.Assets calculateAssetsFromExternal(List<ExternalBankAccountResponseDto> bankAccounts) {
        // 자산 상세 리스트 생성
        List<TotalAssetResponseDto.AssetDetail> assetDetails = bankAccounts.stream()
                .filter(account -> "Y".equals(account.getConsentYn()))
                .map(account -> TotalAssetResponseDto.AssetDetail.builder()
                        .type(account.getAccountType())
                        .name(account.getAccountName())
                        .balance(account.getBalanceAmt() != null ? account.getBalanceAmt() : BigDecimal.ZERO)
                        .bankName(getBankNameByOrgCode(account.getOrgCode()))
                        .status(account.getStatus())
                        .build())
                .collect(Collectors.toList());

        // 총 자산 계산 (대출 계좌 제외)
        BigDecimal totalBankAccounts = bankAccounts.stream()
                .filter(account -> "Y".equals(account.getConsentYn()))
                .filter(account -> !"LOAN".equals(account.getAccountType())) // 대출 계좌 제외
                .map(account -> account.getBalanceAmt() != null ? account.getBalanceAmt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 자산 종류별 요약
        TotalAssetResponseDto.AssetBreakdown breakdown = TotalAssetResponseDto.AssetBreakdown.builder()
                .bankAccounts(totalBankAccounts)
                .investments(BigDecimal.ZERO) // 투자 (추후 구현)
                .realEstate(BigDecimal.ZERO) // 부동산 (추후 구현)
                .otherAssets(BigDecimal.ZERO) // 기타 자산 (추후 구현)
                .build();

        return TotalAssetResponseDto.Assets.builder()
                .total(totalBankAccounts)
                .breakdown(breakdown)
                .details(assetDetails)
                .build();
    }

    /**
     * 외부 서버 데이터로 부채 계산
     */
    private TotalAssetResponseDto.Liabilities calculateLiabilitiesFromExternal(
            List<ExternalBankLoanResponseDto> bankLoans,
            List<ExternalCardLoanResponseDto> cardLoans,
            List<ExternalInstallmentLoanResponseDto> installmentLoans,
            List<ExternalInsuranceLoanResponseDto> insuranceLoans) {
        
        // 은행 대출
        BigDecimal bankLoanBalance = bankLoans.stream()
                .map(loan -> loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 카드 대출
        BigDecimal cardLoanBalance = cardLoans.stream()
                .map(loan -> loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 할부 대출
        BigDecimal installmentLoanBalance = installmentLoans.stream()
                .map(loan -> loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 보험 대출
        BigDecimal insuranceLoanBalance = insuranceLoans.stream()
                .map(loan -> loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 부채 상세 리스트 생성
        List<TotalAssetResponseDto.LiabilityDetail> liabilityDetails = createLiabilityDetailsFromExternal(
                bankLoans, cardLoans, installmentLoans, insuranceLoans);

        // 총 부채 계산
        BigDecimal totalLiabilities = bankLoanBalance
                .add(cardLoanBalance)
                .add(installmentLoanBalance)
                .add(insuranceLoanBalance);

        // 부채 종류별 요약
        TotalAssetResponseDto.LiabilityBreakdown breakdown = TotalAssetResponseDto.LiabilityBreakdown.builder()
                .bankLoans(bankLoanBalance)
                .cardLoans(cardLoanBalance)
                .installmentLoans(installmentLoanBalance)
                .insuranceLoans(insuranceLoanBalance)
                .otherLiabilities(BigDecimal.ZERO) // 기타 부채 (추후 구현)
                .build();

        return TotalAssetResponseDto.Liabilities.builder()
                .total(totalLiabilities)
                .breakdown(breakdown)
                .details(liabilityDetails)
                .build();
    }

    /**
     * 외부 서버 데이터로 부채 상세 리스트 생성
     */
    private List<TotalAssetResponseDto.LiabilityDetail> createLiabilityDetailsFromExternal(
            List<ExternalBankLoanResponseDto> bankLoans,
            List<ExternalCardLoanResponseDto> cardLoans,
            List<ExternalInstallmentLoanResponseDto> installmentLoans,
            List<ExternalInsuranceLoanResponseDto> insuranceLoans) {
        
        List<TotalAssetResponseDto.LiabilityDetail> details = bankLoans.stream()
                .map(loan -> TotalAssetResponseDto.LiabilityDetail.builder()
                        .type("은행대출")
                        .name(loan.getLoanType() != null ? loan.getLoanType() : "은행대출")
                        .balance(loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                        .interestRate(loan.getIntRate() != null ? loan.getIntRate() : BigDecimal.ZERO)
                        .bankName(getBankNameByOrgCode(loan.getOrgCode()))
                        .status("활성")
                        .build())
                .collect(Collectors.toList());

        details.addAll(cardLoans.stream()
                .map(loan -> TotalAssetResponseDto.LiabilityDetail.builder()
                        .type("카드대출")
                        .name(loan.getLoanType() != null ? loan.getLoanType() : "카드대출")
                        .balance(loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                        .interestRate(loan.getIntRate() != null ? loan.getIntRate() : BigDecimal.ZERO)
                        .bankName("카드사")
                        .status("활성")
                        .build())
                .collect(Collectors.toList()));

        details.addAll(installmentLoans.stream()
                .map(loan -> TotalAssetResponseDto.LiabilityDetail.builder()
                        .type("할부대출")
                        .name(loan.getProductName() != null ? loan.getProductName() : "할부대출")
                        .balance(loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                        .interestRate(loan.getIntRate() != null ? loan.getIntRate() : BigDecimal.ZERO)
                        .bankName(getBankNameByOrgCode(loan.getOrgCode()))
                        .status("활성")
                        .build())
                .collect(Collectors.toList()));

        details.addAll(insuranceLoans.stream()
                .map(loan -> TotalAssetResponseDto.LiabilityDetail.builder()
                        .type("보험대출")
                        .name(loan.getLoanType() != null ? loan.getLoanType() : "보험대출")
                        .balance(loan.getBalanceAmt() != null ? loan.getBalanceAmt() : BigDecimal.ZERO)
                        .interestRate(loan.getIntRate() != null ? loan.getIntRate() : BigDecimal.ZERO)
                        .bankName(getBankNameByOrgCode(loan.getOrgCode()))
                        .status("활성")
                        .build())
                .collect(Collectors.toList()));

        return details;
    }

    /**
     * 은행 코드로 은행명 조회
     */
    private String getBankNameByOrgCode(String orgCode) {
        if (orgCode == null) return "알 수 없음";
        
        return switch (orgCode) {
            case "001" -> "한국은행";
            case "002" -> "산업은행";
            case "003" -> "기업은행";
            case "004" -> "국민은행";
            case "020" -> "농협은행";
            case "081" -> "하나은행";
            case "088" -> "신한은행";
            case "089" -> "케이뱅크";
            case "090" -> "카카오뱅크";
            case "092" -> "토스뱅크";
            default -> "기타 금융기관";
        };
    }

    /**
     * 자산 분석
     */
    private TotalAssetResponseDto.Analysis analyzeAssets(BigDecimal totalAssets, BigDecimal totalLiabilities) {
        // 부채비율 계산
        BigDecimal debtToAssetRatio = totalAssets.compareTo(BigDecimal.ZERO) > 0 
            ? totalLiabilities.divide(totalAssets, 4, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // 위험도 평가
        String riskLevel;
        if (debtToAssetRatio.compareTo(new BigDecimal("0.5")) <= 0) {
            riskLevel = "낮음";
        } else if (debtToAssetRatio.compareTo(new BigDecimal("0.7")) <= 0) {
            riskLevel = "중간";
        } else {
            riskLevel = "높음";
        }

        // 권장사항 생성
        String recommendation;
        if (debtToAssetRatio.compareTo(new BigDecimal("0.3")) > 0) {
            recommendation = "부채 상환을 우선적으로 고려해보세요.";
        } else if (totalAssets.compareTo(new BigDecimal("10000000")) < 0) {
            recommendation = "비상금 마련을 위해 저축을 늘려보세요.";
        } else {
            recommendation = "현재 자산 상태가 양호합니다. 지속적인 관리가 필요합니다.";
        }

        return TotalAssetResponseDto.Analysis.builder()
                .debtToAssetRatio(debtToAssetRatio)
                .riskLevel(riskLevel)
                .recommendation(recommendation)
                .monthlyCashFlow(BigDecimal.ZERO) // 추후 구현
                .emergencyFund(BigDecimal.ZERO) // 추후 구현
                .emergencyFundRatio(BigDecimal.ZERO) // 추후 구현
                .build();
    }
}