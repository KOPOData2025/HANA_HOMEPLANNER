package com.hana_ti.home_planner.domain.calculation.service;

import com.hana_ti.home_planner.domain.calculation.dto.LoanCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.LoanCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.util.PlanCalculationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanCalculationService {

    private final PlanCalculationUtil planCalculationUtil;
    
    // DSR 한도 (40%)
    private static final BigDecimal DSR_LIMIT = new BigDecimal("40.0");
    
    // 지역별 LTV 한도
    private static final BigDecimal SEOUL_LTV = new BigDecimal("70.0");
    private static final BigDecimal GYEONGGI_LTV = new BigDecimal("80.0");
    private static final BigDecimal INCHEON_LTV = new BigDecimal("80.0");
    private static final BigDecimal OTHER_LTV = new BigDecimal("80.0");
    
    /**
     * 대출 가능금액 계산
     */
    public LoanCalculationResponseDto calculateLoanAmount(LoanCalculationRequestDto request) {
        log.info("대출 가능금액 계산 시작 - 매매가: {}, 지역: {}, 연소득: {}", 
                request.getHousePrice(), request.getRegion(), request.getAnnualIncome());
        
        // 1. 총 연소득 계산
        BigDecimal totalAnnualIncome = calculateTotalAnnualIncome(request);
        
        // 2. 기존 대출 연상환액 계산
        BigDecimal existingLoanAnnualPayment = request.getExistingLoanMonthlyPayment()
                .multiply(new BigDecimal("12"));
        
        // 3. 지역별 LTV 한도 결정
        BigDecimal ltvLimit = getLtvLimitByRegion(request.getRegion());
        
        // 4. LTV 기준 대출 한도 계산
        BigDecimal ltvBasedLoanAmount = request.getHousePrice()
                .multiply(ltvLimit)
                .divide(new BigDecimal("100"), 0, RoundingMode.DOWN);
        
        // 5. DSR 기준 대출 한도 계산 (이분탐색)
        BigDecimal dsrBasedLoanAmount = calculateDsrBasedLoanAmount(
                totalAnnualIncome, 
                existingLoanAnnualPayment, 
                request.getExpectedInterestRate(), 
                request.getLoanTermYears()
        );
        
        // 6. 최종 대출 가능금액 결정 (더 작은 값)
        BigDecimal maxLoanAmount = ltvBasedLoanAmount.min(dsrBasedLoanAmount);
        
        // 7. 월상환액 계산
        BigDecimal monthlyPayment = planCalculationUtil.calculatePMT(
                request.getExpectedInterestRate().divide(new BigDecimal("100")).divide(new BigDecimal("12"), 10, RoundingMode.HALF_UP),
                request.getLoanTermYears() * 12,
                maxLoanAmount
        );
        
        // 8. 필요 자기 자본 계산
        BigDecimal requiredOwnFunds = request.getHousePrice().subtract(maxLoanAmount);
        
        // 9. 상세 분석 정보 생성
        LoanCalculationResponseDto.LoanLimitAnalysis limitAnalysis = createLimitAnalysis(
                ltvBasedLoanAmount, dsrBasedLoanAmount, maxLoanAmount, 
                request.getHousePrice(), totalAnnualIncome, existingLoanAnnualPayment, 
                monthlyPayment, ltvLimit
        );
        
        // 10. 정책모기지 정보 생성
        LoanCalculationResponseDto.PolicyMortgageInfo policyMortgageInfo = createPolicyMortgageInfo(
                request, maxLoanAmount
        );
        
        // 11. 이자 분석 생성
        LoanCalculationResponseDto.InterestAnalysis interestAnalysis = createInterestAnalysis(
                maxLoanAmount, monthlyPayment, request.getExpectedInterestRate(), 
                request.getLoanTermYears()
        );
        
        // 12. 입력 정보 요약 생성
        LoanCalculationResponseDto.InputSummary inputSummary = createInputSummary(request, totalAnnualIncome);
        
        log.info("대출 가능금액 계산 완료 - 최대 대출금액: {}, 월상환액: {}", maxLoanAmount, monthlyPayment);
        
        return LoanCalculationResponseDto.builder()
                .maxLoanAmount(maxLoanAmount)
                .monthlyPayment(monthlyPayment)
                .requiredOwnFunds(requiredOwnFunds)
                .limitAnalysis(limitAnalysis)
                .policyMortgageInfo(policyMortgageInfo)
                .interestAnalysis(interestAnalysis)
                .inputSummary(inputSummary)
                .build();
    }
    
    /**
     * 총 연소득 계산 (본인 + 배우자)
     */
    private BigDecimal calculateTotalAnnualIncome(LoanCalculationRequestDto request) {
        BigDecimal totalIncome = request.getAnnualIncome();
        
        if (request.getIncludeSpouseIncome() && request.getSpouseAnnualIncome() != null) {
            totalIncome = totalIncome.add(request.getSpouseAnnualIncome());
        }
        
        return totalIncome;
    }
    
    /**
     * 지역별 LTV 한도 반환
     */
    private BigDecimal getLtvLimitByRegion(String region) {
        return switch (region) {
            case "서울" -> SEOUL_LTV;
            case "경기" -> GYEONGGI_LTV;
            case "인천" -> INCHEON_LTV;
            default -> OTHER_LTV;
        };
    }
    
    /**
     * DSR 기준 대출 한도 계산 (이분탐색)
     */
    private BigDecimal calculateDsrBasedLoanAmount(BigDecimal totalAnnualIncome, 
                                                 BigDecimal existingLoanAnnualPayment,
                                                 BigDecimal interestRate, 
                                                 Integer loanTermYears) {
        
        BigDecimal monthlyRate = interestRate.divide(new BigDecimal("100")).divide(new BigDecimal("12"), 10, RoundingMode.HALF_UP);
        int totalMonths = loanTermYears * 12;
        
        // 이분탐색으로 DSR 40% 이하가 되는 최대 대출금액 찾기
        BigDecimal low = BigDecimal.ZERO;
        BigDecimal high = totalAnnualIncome.multiply(new BigDecimal("10")); // 충분히 큰 값
        BigDecimal best = BigDecimal.ZERO;
        
        for (int i = 0; i < 50; i++) {
            BigDecimal mid = low.add(high).divide(new BigDecimal("2"), 0, RoundingMode.DOWN);
            
            if (mid.compareTo(low) <= 0) break;
            
            BigDecimal monthlyPayment = planCalculationUtil.calculatePMT(monthlyRate, totalMonths, mid);
            BigDecimal totalMonthlyPayment = monthlyPayment.add(existingLoanAnnualPayment.divide(new BigDecimal("12"), 0, RoundingMode.HALF_UP));
            BigDecimal dsr = totalMonthlyPayment.multiply(new BigDecimal("12"))
                    .divide(totalAnnualIncome, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            
            if (dsr.compareTo(DSR_LIMIT) <= 0) {
                best = mid;
                low = mid;
            } else {
                high = mid;
            }
        }
        
        return best;
    }
    
    /**
     * 대출 한도 분석 정보 생성
     */
    private LoanCalculationResponseDto.LoanLimitAnalysis createLimitAnalysis(
            BigDecimal ltvBasedLoanAmount, 
            BigDecimal dsrBasedLoanAmount, 
            BigDecimal maxLoanAmount,
            BigDecimal housePrice,
            BigDecimal totalAnnualIncome,
            BigDecimal existingLoanAnnualPayment,
            BigDecimal monthlyPayment,
            BigDecimal ltvLimit) {
        
        String limitingFactor = ltvBasedLoanAmount.compareTo(dsrBasedLoanAmount) <= 0 ? "LTV" : "DSR";
        String limitingFactorDescription = limitingFactor.equals("LTV") 
                ? "고객님의 주택가격(LTV) 기준으로 최대 한도가 결정되었습니다."
                : "고객님의 소득(DSR) 기준으로 최대 한도가 결정되었습니다.";
        
        BigDecimal ltvRatio = maxLoanAmount.divide(housePrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        BigDecimal totalMonthlyPayment = monthlyPayment.add(existingLoanAnnualPayment.divide(new BigDecimal("12"), 0, RoundingMode.HALF_UP));
        BigDecimal dsrRatio = totalMonthlyPayment.multiply(new BigDecimal("12"))
                .divide(totalAnnualIncome, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        return LoanCalculationResponseDto.LoanLimitAnalysis.builder()
                .ltvLimit(ltvBasedLoanAmount)
                .dsrLimit(dsrBasedLoanAmount)
                .limitingFactor(limitingFactor)
                .limitingFactorDescription(limitingFactorDescription)
                .ltvRatio(ltvRatio)
                .dsrRatio(dsrRatio)
                .build();
    }
    
    /**
     * 정책모기지 정보 생성
     */
    private LoanCalculationResponseDto.PolicyMortgageInfo createPolicyMortgageInfo(
            LoanCalculationRequestDto request, 
            BigDecimal maxLoanAmount) {
        
        // 디딤돌 대출 조건: 생애최초 구입 + 무주택 + 신혼부부
        boolean isDiddimdolEligible = request.getIsFirstTimeBuyer() 
                && "무주택".equals(request.getHouseOwnershipStatus())
                && request.getIsNewlywed();
        
        // 보금자리론 조건: 1주택(처분조건부) + 자녀 1명 이상
        boolean isBogeumjariEligible = "1주택(처분조건부)".equals(request.getHouseOwnershipStatus())
                && request.getChildrenCount() >= 1;
        
        String productType;
        String productDescription;
        BigDecimal recommendedInterestRate;
        String benefits;
        
        if (isDiddimdolEligible) {
            productType = "디딤돌";
            productDescription = "고객님은 디딤돌 대출 조건을 만족합니다! 연 2%대 저금리로 안정적인 대출을 받으실 수 있습니다.";
            recommendedInterestRate = new BigDecimal("2.5");
            benefits = "생애최초 구입 + 신혼부부 혜택으로 최저 금리 적용 가능";
        } else if (isBogeumjariEligible) {
            productType = "보금자리";
            productDescription = "보금자리론 대상입니다. 연 4%대 고정금리로 안정적인 대출을 알아보세요.";
            recommendedInterestRate = new BigDecimal("4.2");
            benefits = "1주택 보유자 + 자녀가 있는 가족을 위한 특별 금리";
        } else {
            productType = "일반";
            productDescription = "아쉽지만 정책모기지 대상이 아닙니다. 일반 은행 주택담보대출을 이용하셔야 합니다.";
            recommendedInterestRate = request.getExpectedInterestRate();
            benefits = "일반 주택담보대출 상품 이용";
        }
        
        return LoanCalculationResponseDto.PolicyMortgageInfo.builder()
                .isEligible(isDiddimdolEligible || isBogeumjariEligible)
                .productType(productType)
                .productDescription(productDescription)
                .recommendedInterestRate(recommendedInterestRate)
                .benefits(benefits)
                .build();
    }
    
    /**
     * 이자 분석 정보 생성
     */
    private LoanCalculationResponseDto.InterestAnalysis createInterestAnalysis(
            BigDecimal maxLoanAmount,
            BigDecimal monthlyPayment,
            BigDecimal interestRate,
            Integer loanTermYears) {
        
        BigDecimal totalPayment = monthlyPayment.multiply(new BigDecimal(loanTermYears * 12));
        BigDecimal totalInterest = totalPayment.subtract(maxLoanAmount);
        BigDecimal interestRatio = totalInterest.divide(totalPayment, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        
        // 첫 달 이자와 원금 계산
        BigDecimal monthlyRate = interestRate.divide(new BigDecimal("100")).divide(new BigDecimal("12"), 10, RoundingMode.HALF_UP);
        BigDecimal monthlyInterest = maxLoanAmount.multiply(monthlyRate);
        BigDecimal monthlyPrincipal = monthlyPayment.subtract(monthlyInterest);
        
        return LoanCalculationResponseDto.InterestAnalysis.builder()
                .totalInterest(totalInterest)
                .totalPayment(totalPayment)
                .interestRatio(interestRatio)
                .monthlyInterest(monthlyInterest)
                .monthlyPrincipal(monthlyPrincipal)
                .build();
    }
    
    /**
     * 입력 정보 요약 생성
     */
    private LoanCalculationResponseDto.InputSummary createInputSummary(
            LoanCalculationRequestDto request, 
            BigDecimal totalAnnualIncome) {
        
        return LoanCalculationResponseDto.InputSummary.builder()
                .housePrice(request.getHousePrice())
                .region(request.getRegion())
                .totalAnnualIncome(totalAnnualIncome)
                .existingLoanAnnualPayment(request.getExistingLoanMonthlyPayment().multiply(new BigDecimal("12")))
                .houseOwnershipStatus(request.getHouseOwnershipStatus())
                .loanTermYears(request.getLoanTermYears())
                .interestRate(request.getExpectedInterestRate())
                .isFirstTimeBuyer(request.getIsFirstTimeBuyer())
                .isNewlywed(request.getIsNewlywed())
                .childrenCount(request.getChildrenCount())
                .build();
    }
}
