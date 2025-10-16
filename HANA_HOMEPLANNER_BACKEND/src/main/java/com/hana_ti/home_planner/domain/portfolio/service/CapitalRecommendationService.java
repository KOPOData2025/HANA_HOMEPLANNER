package com.hana_ti.home_planner.domain.portfolio.service;

import com.hana_ti.home_planner.domain.portfolio.dto.CapitalRecommendationRequestDto;
import com.hana_ti.home_planner.domain.portfolio.dto.CapitalRecommendationResponseDto;
import com.hana_ti.home_planner.domain.portfolio.dto.FinancialHealthAnalysis;
import com.hana_ti.home_planner.domain.portfolio.dto.InterestRateInfo;
import com.hana_ti.home_planner.domain.portfolio.dto.ExistingDebtInfo;
import com.hana_ti.home_planner.domain.financial.dto.LoanRecommendationRequestDto;
import com.hana_ti.home_planner.domain.financial.dto.LoanRecommendationResponseDto;
import com.hana_ti.home_planner.domain.financial.dto.SavingsRecommendationRequestDto;
import com.hana_ti.home_planner.domain.financial.dto.SavingsRecommendationResponseDto;
import com.hana_ti.home_planner.domain.financial.dto.RecommendedProductDto;
import com.hana_ti.home_planner.domain.financial.service.LoanRecommendationService;
import com.hana_ti.home_planner.domain.financial.service.SavingsRecommendationService;
import com.hana_ti.home_planner.domain.calculation.service.LtvCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CapitalRecommendationService {

    private static final BigDecimal MONTHLY_INTEREST_RATE = new BigDecimal("0.0025"); // 연 3% 기준 월 이자율
    
    // 의존성 주입
    private final LoanRecommendationService loanRecommendationService;
    private final SavingsRecommendationService savingsRecommendationService;
    private final LtvCalculationService ltvCalculationService;

    /**
     * 자본 포트폴리오 추천 메인 로직
     * 부족한 금액을 적금으로 매꿀 수 있는 3가지 플랜 생성
     */
    public CapitalRecommendationResponseDto recommendCapital(CapitalRecommendationRequestDto request) {
        log.info("=== 자본 포트폴리오 추천 시작 ===");
        log.info("입력값 - 주택가격: {}원, 연소득: {}원, 현재자산: {}원, 희망 월적금액: {}원, 잔금일: {}, 대출가능액: {}원", 
                formatCurrency(request.getHousePrice()), formatCurrency(request.getAnnualIncome()), 
                formatCurrency(request.getCurrentCash()), formatCurrency(request.getDesiredMonthlySaving()), 
                request.getMoveInDate(), formatCurrency(request.getLoanAvailable()));

        // 1. 남은 개월 수 계산
        long monthsUntilMoveIn = calculateMonthsUntilMoveIn(request.getMoveInDate());
        log.info("📅 잔금일까지 남은 개월 수: {}개월 (약 {}년)", monthsUntilMoveIn, monthsUntilMoveIn / 12.0);

        // 2. 총 부족액 계산 (주택가격 - 현재자산 - 대출가능액)
        BigDecimal totalShortfall = calculateTotalShortfall(request);
        log.info("💰 자금 분석:");
        log.info("   - 주택 가격: {}원", formatCurrency(request.getHousePrice()));
        log.info("   - 현재 보유 자산: {}원", formatCurrency(request.getCurrentCash()));
        log.info("   - 대출 가능 금액: {}원", formatCurrency(request.getLoanAvailable()));
        log.info("   - 총 부족액: {}원", formatCurrency(totalShortfall));

        // 3. 실현 가능성 분석
        String feasibilityStatus = analyzeFeasibility(totalShortfall, monthsUntilMoveIn, request.getAnnualIncome());
        log.info("🎯 실현 가능성: {}", feasibilityStatus);

        // 4. 새로운 분석 로직 추가
        log.info("🔍 새로운 분석 로직 시작:");
        FinancialHealthAnalysis healthAnalysis = analyzeFinancialHealth(request);
        InterestRateInfo interestRateInfo = extractInterestRates(request);
        ExistingDebtInfo existingDebtInfo = getExistingDebtInfo("USER000001"); // 기본값 사용
        
        log.info("📋 분석 결과 요약:");
        log.info("   - 재무 건강도: {}", healthAnalysis.isBudgetHealthy() ? "건전" : "주의 필요");
        log.info("   - 대출 금리: {}%", interestRateInfo.getLoanInterestRate());
        log.info("   - 적금 금리: {}%", interestRateInfo.getSavingsInterestRate());
        log.info("   - 금리 차이: {}%", interestRateInfo.getRateDifference());
        log.info("   - 기존 부채 월상환액: {}원", formatCurrency(existingDebtInfo.getExistingMonthlyPayment()));

        // 5. 개선된 자본 플랜 생성
        List<CapitalRecommendationResponseDto.CapitalPlanDto> capitalPlans = generateEnhancedCapitalPlans(
                request, monthsUntilMoveIn, totalShortfall, healthAnalysis, interestRateInfo, existingDebtInfo);

        // 6. 분석 정보 생성
        CapitalRecommendationResponseDto.AnalysisDto analysis = generateAnalysis(
                request, totalShortfall, monthsUntilMoveIn, feasibilityStatus);

        // 7. 희망 적금액 분석 생성
        CapitalRecommendationResponseDto.DesiredSavingAnalysisDto desiredSavingAnalysis = 
                generateDesiredSavingAnalysis(request, monthsUntilMoveIn, totalShortfall);

        log.info("✅ 자본 포트폴리오 추천 완료 - {}개 플랜 생성", capitalPlans.size());
        log.info("=== 추천 결과 요약 ===");
        for (int i = 0; i < capitalPlans.size(); i++) {
            var plan = capitalPlans.get(i);
            log.info("플랜 {}: {} - 대출 {}원, 월적금 {}원, 적금총액 {}원", 
                    i + 1, plan.getPlanType(), formatCurrency(plan.getLoanAmount()),
                    formatCurrency(plan.getRequiredMonthlySaving()), formatCurrency(plan.getTotalSavingAtMoveIn()));
        }

        return CapitalRecommendationResponseDto.builder()
                .capitalPlans(capitalPlans)
                .analysis(analysis)
                .desiredSavingAnalysis(desiredSavingAnalysis)
                .build();
    }

    /**
     * 남은 개월 수 계산
     */
    private long calculateMonthsUntilMoveIn(LocalDate moveInDate) {
        LocalDate today = LocalDate.now();
        long daysBetween = ChronoUnit.DAYS.between(today, moveInDate);
        return Math.max(1, daysBetween / 30); // 최소 1개월
    }

    /**
     * 총 부족액 계산 (주택가격 - 현재자산 - 대출가능액)
     */
    private BigDecimal calculateTotalShortfall(CapitalRecommendationRequestDto request) {
        BigDecimal shortfall = request.getHousePrice()
                .subtract(request.getCurrentCash())
                .subtract(request.getLoanAvailable());
        
        return shortfall.max(BigDecimal.ZERO); // 음수가 되지 않도록
    }

    /**
     * 실현 가능성 분석
     */
    private String analyzeFeasibility(BigDecimal totalShortfall, long monthsUntilMoveIn, BigDecimal annualIncome) {
        if (totalShortfall.compareTo(BigDecimal.ZERO) <= 0) {
            return "ALREADY_SUFFICIENT"; // 이미 충분한 자금 보유
        }

        // 필요한 월 적금액 계산 (단순 계산)
        BigDecimal requiredMonthlySaving = calculateRequiredMonthlySaving(totalShortfall, monthsUntilMoveIn);
        
        // 월 소득의 30%를 기준으로 실현 가능성 판단
        BigDecimal monthlyIncome = annualIncome.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        BigDecimal maxAffordableSaving = monthlyIncome.multiply(new BigDecimal("0.3")); // 월소득의 30%

        if (requiredMonthlySaving.compareTo(maxAffordableSaving.multiply(new BigDecimal("0.7"))) <= 0) {
            return "FEASIBLE"; // 실현 가능
        } else if (requiredMonthlySaving.compareTo(maxAffordableSaving) <= 0) {
            return "CHALLENGING"; // 도전적이지만 가능
        } else {
            return "IMPOSSIBLE"; // 현실적으로 불가능
        }
    }

    /**
     * 필요한 월 적금액 계산 (복리 고려)
     * 공식: 목표금액 = 월적금액 × ((1 + r/12)^months - 1) / (r/12)
     * 역산: 월적금액 = 목표금액 × (r/12) / ((1 + r/12)^months - 1)
     */
    private BigDecimal calculateRequiredMonthlySaving(BigDecimal targetAmount, long months) {
        if (months <= 0) {
            return targetAmount; // 기간이 없으면 전액 필요
        }

        // 월복리 계산
        BigDecimal onePlusMonthlyRate = BigDecimal.ONE.add(MONTHLY_INTEREST_RATE);
        BigDecimal compoundFactor = onePlusMonthlyRate.pow((int) months);
        BigDecimal numerator = MONTHLY_INTEREST_RATE;
        BigDecimal denominator = compoundFactor.subtract(BigDecimal.ONE);
        
        if (denominator.compareTo(BigDecimal.ZERO) == 0) {
            // 이자율이 0인 경우
            return targetAmount.divide(new BigDecimal(months), 0, RoundingMode.HALF_UP);
        }

        BigDecimal requiredMonthlySaving = targetAmount.multiply(numerator)
                .divide(denominator, 0, RoundingMode.HALF_UP);
        
        return requiredMonthlySaving;
    }

    /**
     * 적금 만기 금액 계산 (복리 고려)
     */
    private BigDecimal calculateSavingMaturityAmount(BigDecimal monthlySaving, long months) {
        if (months <= 0) {
            return BigDecimal.ZERO;
        }

        // 월복리 계산
        BigDecimal onePlusMonthlyRate = BigDecimal.ONE.add(MONTHLY_INTEREST_RATE);
        BigDecimal compoundFactor = onePlusMonthlyRate.pow((int) months);
        BigDecimal numerator = compoundFactor.subtract(BigDecimal.ONE);
        BigDecimal denominator = MONTHLY_INTEREST_RATE;
        
        BigDecimal futureValueFactor = numerator.divide(denominator, 6, RoundingMode.HALF_UP);
        return monthlySaving.multiply(futureValueFactor);
    }


    /**
     * 충분한 자금 보유 시 플랜
     */
    private CapitalRecommendationResponseDto.CapitalPlanDto createSufficientFundsPlan(
            CapitalRecommendationRequestDto request) {
        
        BigDecimal currentFunds = request.getCurrentCash().add(request.getLoanAvailable());
        BigDecimal surplus = currentFunds.subtract(request.getHousePrice());
        
        return CapitalRecommendationResponseDto.CapitalPlanDto.builder()
                .planType("충분한 자금")
                .loanAmount(request.getLoanAvailable())
                .requiredMonthlySaving(BigDecimal.ZERO)
                .totalSavingAtMoveIn(BigDecimal.ZERO)
                .shortfallCovered(BigDecimal.ZERO)
                .comment("현재 보유 자산과 대출 가능 금액만으로도 주택 구매가 가능합니다.")
                .recommendation(String.format("여유 자금 %s원을 다른 투자나 비상자금으로 활용하세요.", 
                        formatCurrency(surplus)))
                .build();
    }


    /**
     * 분석 정보 생성
     */
    private CapitalRecommendationResponseDto.AnalysisDto generateAnalysis(
            CapitalRecommendationRequestDto request, BigDecimal totalShortfall, 
            long monthsUntilMoveIn, String feasibilityStatus) {
        
        log.info("📈 종합 분석 생성:");
        log.info("   - 총 부족액: {}원", formatCurrency(totalShortfall));
        log.info("   - 잔금일까지: {}개월", monthsUntilMoveIn);
        log.info("   - 실현 가능성: {}", feasibilityStatus);
        
        String feasibilityComment = generateFeasibilityComment(feasibilityStatus, totalShortfall, monthsUntilMoveIn);
        
        return CapitalRecommendationResponseDto.AnalysisDto.builder()
                .housePrice(request.getHousePrice())
                .currentCash(request.getCurrentCash())
                .totalLoanAvailable(request.getLoanAvailable())
                .totalShortfall(totalShortfall)
                .monthsUntilMoveIn(monthsUntilMoveIn)
                .feasibilityStatus(feasibilityStatus)
                .feasibilityComment(feasibilityComment)
                .build();
    }

    /**
     * 실현 가능성 코멘트 생성
     */
    private String generateFeasibilityComment(String feasibilityStatus, BigDecimal totalShortfall, long monthsUntilMoveIn) {
        switch (feasibilityStatus) {
            case "ALREADY_SUFFICIENT":
                return "현재 보유 자산과 대출만으로도 주택 구매가 가능합니다.";
            case "FEASIBLE":
                return String.format("월 적금으로 부족액을 충당하기에 무리가 없는 수준입니다. (%d개월간 적금 필요)", monthsUntilMoveIn);
            case "CHALLENGING":
                return String.format("다소 부담스럽지만 노력하면 달성 가능한 수준입니다. 가계 지출 관리가 필요할 수 있습니다.");
            case "IMPOSSIBLE":
                return String.format("현재 소득 수준으로는 목표 달성이 어려워 보입니다. 주택 가격 조정이나 대출 한도 증액을 고려해보세요.");
            default:
                return "종합적인 검토가 필요합니다.";
        }
    }

    /**
     * 희망 적금액 분석 생성
     */
    private CapitalRecommendationResponseDto.DesiredSavingAnalysisDto generateDesiredSavingAnalysis(
            CapitalRecommendationRequestDto request, long monthsUntilMoveIn, BigDecimal totalShortfall) {
        
        log.info("💡 희망 적금액 분석 시작:");
        log.info("   - 희망 월 적금액: {}원", formatCurrency(request.getDesiredMonthlySaving()));
        log.info("   - 적금 기간: {}개월", monthsUntilMoveIn);
        
        // 희망 적금액으로 만기시 받을 수 있는 금액 계산
        BigDecimal desiredSavingMaturityAmount = calculateSavingMaturityAmount(
                request.getDesiredMonthlySaving(), monthsUntilMoveIn);
        log.info("   - 희망 적금액 만기 금액: {}원", formatCurrency(desiredSavingMaturityAmount));
        
        // 희망 적금액 적용 후 남은 부족액
        BigDecimal shortfallAfterDesiredSaving = totalShortfall.subtract(desiredSavingMaturityAmount);
        log.info("   - 희망 적금액 적용 후 남은 부족액: {}원", formatCurrency(shortfallAfterDesiredSaving));
        
        // 비교 결과 분석
        String comparisonStatus = analyzeComparisonStatus(shortfallAfterDesiredSaving, totalShortfall);
        log.info("   - 비교 결과: {}", comparisonStatus);
        
        // 비교 분석 코멘트 생성
        String comparisonComment = generateComparisonComment(
                comparisonStatus, shortfallAfterDesiredSaving, desiredSavingMaturityAmount, totalShortfall);
        
        // 추천 사항 생성
        String recommendation = generateDesiredSavingRecommendation(
                comparisonStatus, request.getDesiredMonthlySaving(), shortfallAfterDesiredSaving, monthsUntilMoveIn);
        
        return CapitalRecommendationResponseDto.DesiredSavingAnalysisDto.builder()
                .desiredMonthlySaving(request.getDesiredMonthlySaving())
                .desiredSavingMaturityAmount(desiredSavingMaturityAmount)
                .shortfallAfterDesiredSaving(shortfallAfterDesiredSaving.max(BigDecimal.ZERO))
                .comparisonStatus(comparisonStatus)
                .comparisonComment(comparisonComment)
                .recommendation(recommendation)
                .build();
    }

    /**
     * 비교 결과 상태 분석
     */
    private String analyzeComparisonStatus(BigDecimal shortfallAfterDesiredSaving, BigDecimal totalShortfall) {
        if (totalShortfall.compareTo(BigDecimal.ZERO) <= 0) {
            return "ALREADY_SUFFICIENT"; // 이미 충분한 자금
        } else if (shortfallAfterDesiredSaving.compareTo(BigDecimal.ZERO) <= 0) {
            return "SUFFICIENT"; // 희망 적금액으로 충분
        } else if (shortfallAfterDesiredSaving.compareTo(totalShortfall.multiply(new BigDecimal("0.3"))) <= 0) {
            return "MOSTLY_SUFFICIENT"; // 대부분 충당 가능 (70% 이상 충당)
        } else {
            return "INSUFFICIENT"; // 부족
        }
    }

    /**
     * 비교 분석 코멘트 생성
     */
    private String generateComparisonComment(String comparisonStatus, BigDecimal shortfallAfterDesiredSaving, 
                                           BigDecimal desiredSavingMaturityAmount, BigDecimal totalShortfall) {
        switch (comparisonStatus) {
            case "ALREADY_SUFFICIENT":
                return "이미 충분한 자금을 보유하고 있어 추가 적금이 필요하지 않습니다.";
            case "SUFFICIENT":
                BigDecimal surplus = shortfallAfterDesiredSaving.abs();
                return String.format("희망하시는 적금액으로 부족액을 모두 충당할 수 있습니다. 여유분: %s원", 
                        formatCurrency(surplus));
            case "MOSTLY_SUFFICIENT":
                BigDecimal coverageRate = desiredSavingMaturityAmount.divide(totalShortfall, 2, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                return String.format("희망하시는 적금액으로 부족액의 %.1f%%를 충당할 수 있습니다. 남은 부족액: %s원", 
                        coverageRate.doubleValue(), formatCurrency(shortfallAfterDesiredSaving));
            case "INSUFFICIENT":
                return String.format("희망하시는 적금액으로는 부족액을 모두 충당하기 어렵습니다. 추가 필요 금액: %s원", 
                        formatCurrency(shortfallAfterDesiredSaving));
            default:
                return "희망 적금액에 대한 분석이 필요합니다.";
        }
    }

    /**
     * 희망 적금액에 대한 추천 사항 생성
     */
    private String generateDesiredSavingRecommendation(String comparisonStatus, BigDecimal desiredMonthlySaving, 
                                                     BigDecimal shortfallAfterDesiredSaving, long monthsUntilMoveIn) {
        switch (comparisonStatus) {
            case "ALREADY_SUFFICIENT":
                return "여유 자금을 다른 투자나 비상자금으로 활용하는 것을 고려해보세요.";
            case "SUFFICIENT":
                return "현재 계획하신 적금액이 목표 달성에 충분합니다. 안정적인 계획으로 보입니다.";
            case "MOSTLY_SUFFICIENT":
                BigDecimal additionalNeeded = calculateRequiredMonthlySaving(shortfallAfterDesiredSaving, monthsUntilMoveIn);
                return String.format("월 적금액을 %s원 정도 더 늘리시면 목표를 달성할 수 있습니다.", 
                        formatCurrency(additionalNeeded));
            case "INSUFFICIENT":
                BigDecimal totalNeeded = calculateRequiredMonthlySaving(shortfallAfterDesiredSaving, monthsUntilMoveIn);
                BigDecimal recommendedAmount = desiredMonthlySaving.add(totalNeeded);
                return String.format("목표 달성을 위해서는 월 적금액을 %s원으로 늘리는 것을 권장합니다.", 
                        formatCurrency(recommendedAmount));
            default:
                return "개별 상담을 통해 더 구체적인 계획을 수립해보세요.";
        }
    }

    /**
     * 통화 포맷팅 헬퍼 메서드
     */
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "0";
        }
        return String.format("%,.0f", amount);
    }

    // ==================== 새로운 헬퍼 메서드들 ====================

    /**
     * 50/30/20 법칙 기반 재무 건강도 분석
     */
    private FinancialHealthAnalysis analyzeFinancialHealth(CapitalRecommendationRequestDto request) {
        BigDecimal monthlyIncome = request.getAnnualIncome().divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        
        log.info("📊 50/30/20 법칙 기반 재무 건강도 분석 시작:");
        log.info("   - 월소득: {}원", formatCurrency(monthlyIncome));
        
        // 50/30/20 법칙 기준 계산
        BigDecimal maxFixedExpenses = monthlyIncome.multiply(new BigDecimal("0.5"));    // 50%
        BigDecimal maxVariableExpenses = monthlyIncome.multiply(new BigDecimal("0.3")); // 30%
        BigDecimal maxSavingsAndDebt = monthlyIncome.multiply(new BigDecimal("0.2"));   // 20%
        
        log.info("   - 50/30/20 법칙 기준:");
        log.info("     * 필수 지출 한도 (50%): {}원", formatCurrency(maxFixedExpenses));
        log.info("     * 선택 지출 한도 (30%): {}원", formatCurrency(maxVariableExpenses));
        log.info("     * 저축/부채 한도 (20%): {}원", formatCurrency(maxSavingsAndDebt));
        
        // 현재 상황 분석 (기존 입력값으로 추정)
        BigDecimal estimatedFixedExpenses = monthlyIncome.multiply(new BigDecimal("0.4")); // 추정값
        BigDecimal estimatedVariableExpenses = monthlyIncome.multiply(new BigDecimal("0.2")); // 추정값
        
        log.info("   - 현재 상황 추정:");
        log.info("     * 추정 필수 지출 (40%): {}원", formatCurrency(estimatedFixedExpenses));
        log.info("     * 추정 선택 지출 (20%): {}원", formatCurrency(estimatedVariableExpenses));
        
        boolean isBudgetHealthy = estimatedFixedExpenses.compareTo(maxFixedExpenses) <= 0;
        boolean isFixedExcessive = estimatedFixedExpenses.compareTo(maxFixedExpenses) > 0;
        boolean isVariableExcessive = estimatedVariableExpenses.compareTo(maxVariableExpenses) > 0;
        
        log.info("   - 재무 건강도 판단:");
        log.info("     * 예산 건전성: {}", isBudgetHealthy ? "건전" : "주의 필요");
        log.info("     * 필수 지출 과도 여부: {}", isFixedExcessive ? "과도" : "적정");
        log.info("     * 선택 지출 과도 여부: {}", isVariableExcessive ? "과도" : "적정");
        
        return FinancialHealthAnalysis.builder()
                .maxAffordableSaving(maxSavingsAndDebt)
                .isBudgetHealthy(isBudgetHealthy)
                .savingsCapacity(maxSavingsAndDebt)
                .currentFixedRatio(estimatedFixedExpenses.divide(monthlyIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")))
                .currentVariableRatio(estimatedVariableExpenses.divide(monthlyIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")))
                .isFixedExpensesExcessive(isFixedExcessive)
                .isVariableExpensesExcessive(isVariableExcessive)
                .build();
    }

    /**
     * 금융상품에서 금리 정보 추출
     */
    private InterestRateInfo extractInterestRates(CapitalRecommendationRequestDto request) {
        log.info("💰 금리 정보 추출 시작:");
        
        try {
            log.info("   - 대출 상품 추천 요청 중...");
            // 대출 상품 추천 서비스 호출
            LoanRecommendationRequestDto loanRequest = LoanRecommendationRequestDto.builder()
                    .annualIncome(request.getAnnualIncome())
                    .housePrice(request.getHousePrice())
                    .exclusiveArea(new BigDecimal("84.5")) // 기본값
                    .netAssets(request.getCurrentCash())
                    .isFirstTimeBuyer(true)
                    .isNewlywed(false)
                    .numberOfChildren(0)
                    .hasNewbornInTwoYears(false)
                    .build();
            
            LoanRecommendationResponseDto loanRecommendation = loanRecommendationService.recommend(loanRequest);
            BigDecimal loanInterestRate = extractLoanInterestRate(loanRecommendation);
            log.info("   - 추천 대출 금리: {}%", loanInterestRate);
            
            log.info("   - 적금 상품 추천 요청 중...");
            // 적금 상품 추천 서비스 호출
            SavingsRecommendationRequestDto savingsRequest = SavingsRecommendationRequestDto.builder()
                    .targetAmount(request.getHousePrice().subtract(request.getCurrentCash()).subtract(request.getLoanAvailable()))
                    .remainingMonths((int) calculateMonthsUntilMoveIn(request.getMoveInDate()))
                    .monthlySaving(request.getDesiredMonthlySaving())
                    .build();
            
            SavingsRecommendationResponseDto savingsRecommendation = savingsRecommendationService.recommendSavings(savingsRequest);
            BigDecimal savingsInterestRate = extractSavingsInterestRate(savingsRecommendation);
            log.info("   - 추천 적금 금리: {}%", savingsInterestRate);
            
            BigDecimal rateDifference = loanInterestRate.subtract(savingsInterestRate);
            log.info("   - 금리 차이 (대출 - 적금): {}%", rateDifference);
            
            String recommendation;
            if (rateDifference.compareTo(new BigDecimal("1.0")) > 0) {
                recommendation = "대출 상환 우선";
                log.info("   - 금리 분석 결과: 대출 금리가 높아 대출 상환을 우선하는 것이 유리");
            } else if (rateDifference.compareTo(new BigDecimal("-1.0")) < 0) {
                recommendation = "적금 투자 우선";
                log.info("   - 금리 분석 결과: 적금 금리가 높아 적금 투자를 우선하는 것이 유리");
            } else {
                recommendation = "균형적 접근";
                log.info("   - 금리 분석 결과: 금리가 비슷하여 균형적 접근이 적합");
            }
            
            return InterestRateInfo.builder()
                    .loanInterestRate(loanInterestRate)
                    .savingsInterestRate(savingsInterestRate)
                    .rateDifference(rateDifference)
                    .recommendation(recommendation)
                    .build();
        } catch (Exception e) {
            log.warn("   - 금리 정보 추출 실패, 기본값 사용: {}", e.getMessage());
            log.info("   - 기본 대출 금리: 4.5%");
            log.info("   - 기본 적금 금리: 3.0%");
            log.info("   - 기본 금리 차이: 1.5%");
            return InterestRateInfo.builder()
                    .loanInterestRate(new BigDecimal("4.5"))
                    .savingsInterestRate(new BigDecimal("3.0"))
                    .rateDifference(new BigDecimal("1.5"))
                    .build();
        }
    }

    /**
     * 대출 금리 추출
     */
    private BigDecimal extractLoanInterestRate(LoanRecommendationResponseDto loanRecommendation) {
        if (loanRecommendation.getRecommendations() == null || loanRecommendation.getRecommendations().isEmpty()) {
            return new BigDecimal("4.5"); // 기본값
        }
        
        RecommendedProductDto recommendedProduct = loanRecommendation.getRecommendations().get(0);
        return recommendedProduct.getMinInterestRate(); // 최소 금리 사용
    }

    /**
     * 적금 금리 추출
     */
    private BigDecimal extractSavingsInterestRate(SavingsRecommendationResponseDto savingsRecommendation) {
        if (savingsRecommendation.getRecommendedProduct() == null) {
            return new BigDecimal("3.0"); // 기본값
        }
        
        BigDecimal interestRate = savingsRecommendation.getRecommendedProduct().getInterestRate();
        return interestRate; // 통합 금리 사용
    }

    /**
     * 기존 부채 정보 조회 (외부 서버 활용)
     */
    private ExistingDebtInfo getExistingDebtInfo(String userId) {
        log.info("🏦 기존 부채 정보 조회 시작 - userId: {}", userId);
        
        try {
            // DSR/DTI 계산 시 사용한 기존 부채 상환액 조회
            BigDecimal existingLoanAnnualPayment = ltvCalculationService.calculateExistingLoanAnnualPayment(Long.valueOf(userId));
            BigDecimal existingMonthlyPayment = existingLoanAnnualPayment.divide(new BigDecimal("12"), 0, RoundingMode.HALF_UP);
            
            log.info("   - 기존 부채 연간 상환액: {}원", formatCurrency(existingLoanAnnualPayment));
            log.info("   - 기존 부채 월간 상환액: {}원", formatCurrency(existingMonthlyPayment));
            
            return ExistingDebtInfo.builder()
                    .existingAnnualPayment(existingLoanAnnualPayment)
                    .existingMonthlyPayment(existingMonthlyPayment)
                    .build();
        } catch (Exception e) {
            log.warn("   - 기존 부채 정보 조회 실패, 기본값 사용: {}", e.getMessage());
            log.info("   - 기본 기존 부채 연간 상환액: 0원");
            log.info("   - 기본 기존 부채 월간 상환액: 0원");
            return ExistingDebtInfo.builder()
                    .existingAnnualPayment(BigDecimal.ZERO)
                    .existingMonthlyPayment(BigDecimal.ZERO)
                    .build();
        }
    }

    /**
     * 월상환액으로부터 대출금액 역계산
     */
    private BigDecimal calculateLoanAmountFromMonthlyPayment(BigDecimal monthlyPayment, BigDecimal interestRate, int years) {
        log.info("   - 월상환액으로부터 대출금액 역계산:");
        log.info("     * 월상환액: {}원", formatCurrency(monthlyPayment));
        log.info("     * 연금리: {}%", interestRate);
        log.info("     * 대출기간: {}년", years);
        
        if (monthlyPayment == null || monthlyPayment.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("     * 결과: 월상환액이 0원 이하이므로 대출금액 0원");
            return BigDecimal.ZERO;
        }
        
        int totalMonths = years * 12;
        BigDecimal monthlyRate = interestRate.divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP)
                .divide(new BigDecimal("12"), 6, RoundingMode.HALF_UP);
        
        log.info("     * 월금리: {}%", monthlyRate.multiply(new BigDecimal("100")));
        
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal result = monthlyPayment.multiply(new BigDecimal(totalMonths));
            log.info("     * 결과 (무이자): {}원", formatCurrency(result));
            return result;
        }
        
        BigDecimal onePlusRate = BigDecimal.ONE.add(monthlyRate);
        BigDecimal compoundFactor = onePlusRate.pow(totalMonths);
        BigDecimal numerator = compoundFactor.subtract(BigDecimal.ONE);
        BigDecimal denominator = monthlyRate.multiply(compoundFactor);
        
        BigDecimal result = monthlyPayment.multiply(numerator).divide(denominator, 0, RoundingMode.HALF_UP);
        log.info("     * 결과: {}원", formatCurrency(result));
        
        return result;
    }

    /**
     * 개선된 자본 플랜 생성
     */
    private List<CapitalRecommendationResponseDto.CapitalPlanDto> generateEnhancedCapitalPlans(
            CapitalRecommendationRequestDto request, 
            long monthsUntilMoveIn, 
            BigDecimal totalShortfall,
            FinancialHealthAnalysis healthAnalysis,
            InterestRateInfo interestRateInfo,
            ExistingDebtInfo existingDebtInfo) {
        
        log.info("🎯 개선된 자본 플랜 생성 시작 - 총 부족액: {}원", formatCurrency(totalShortfall));
        
        List<CapitalRecommendationResponseDto.CapitalPlanDto> plans = new ArrayList<>();

        if (totalShortfall.compareTo(BigDecimal.ZERO) <= 0) {
            // 이미 충분한 자금이 있는 경우
            log.info("💎 이미 충분한 자금 보유 - 추가 적금 불필요");
            plans.add(createSufficientFundsPlan(request));
            return plans;
        }

        // 보수형 플랜 (50/30/20 법칙 기본 비율 유지)
        log.info("📋 보수형 플랜 생성 중...");
        plans.add(createEnhancedConservativePlan(request, monthsUntilMoveIn, totalShortfall, 
                healthAnalysis, interestRateInfo, existingDebtInfo));
        
        // 균형형 플랜 (50/30/20 법칙 균형 조정)
        log.info("📋 균형형 플랜 생성 중...");
        plans.add(createEnhancedBalancedPlan(request, monthsUntilMoveIn, totalShortfall, 
                healthAnalysis, interestRateInfo, existingDebtInfo));
        
        // 공격형 플랜 (50/30/20 법칙 저축/부채 최대화)
        log.info("📋 공격형 플랜 생성 중...");
        plans.add(createEnhancedAggressivePlan(request, monthsUntilMoveIn, totalShortfall, 
                healthAnalysis, interestRateInfo, existingDebtInfo));

        log.info("✅ {}개 개선된 자본 플랜 생성 완료", plans.size());
        return plans;
    }

    /**
     * 개선된 보수형 플랜 생성 (50/30/20 법칙 기본 비율 유지)
     */
    private CapitalRecommendationResponseDto.CapitalPlanDto createEnhancedConservativePlan(
            CapitalRecommendationRequestDto request, 
            long monthsUntilMoveIn, 
            BigDecimal totalShortfall,
            FinancialHealthAnalysis healthAnalysis,
            InterestRateInfo interestRateInfo,
            ExistingDebtInfo existingDebtInfo) {
        
        log.info("🔒 보수형 플랜 생성 시작:");
        
        BigDecimal monthlyIncome = request.getAnnualIncome().divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        log.info("   - 월소득: {}원", formatCurrency(monthlyIncome));
        
        // 보수형: 35% + 15% = 50% 더 보수적으로 조정
        BigDecimal maxDebtPayment = monthlyIncome.multiply(new BigDecimal("0.15")); // 15%
        BigDecimal availableForNewDebt = maxDebtPayment.subtract(existingDebtInfo.getExistingMonthlyPayment());
        
        log.info("   - 50/30/20 법칙 보수적 적용:");
        log.info("     * 월소득의 15% (저축/부채 한도): {}원", formatCurrency(maxDebtPayment));
        log.info("     * 기존 부채 월상환액: {}원", formatCurrency(existingDebtInfo.getExistingMonthlyPayment()));
        log.info("     * 신규 대출 가능 월상환액: {}원", formatCurrency(availableForNewDebt));
        
        // 가능한 대출 금액 역계산 (15% 한도 내에서)
        BigDecimal conservativeLoanAmount = calculateLoanAmountFromMonthlyPayment(
                availableForNewDebt, interestRateInfo.getLoanInterestRate(), 30);
        
        // 대출가능액을 초과하지 않도록 제한
        BigDecimal originalLoanAmount = conservativeLoanAmount;
        conservativeLoanAmount = conservativeLoanAmount.min(request.getLoanAvailable());
        
        log.info("   - 대출금액 결정:");
        log.info("     * 계산된 대출금액: {}원", formatCurrency(originalLoanAmount));
        log.info("     * 대출가능액 제한: {}원", formatCurrency(request.getLoanAvailable()));
        log.info("     * 최종 대출금액: {}원", formatCurrency(conservativeLoanAmount));
        
        // 적금으로 메워야 할 부족액
        BigDecimal shortfallToCover = totalShortfall.add(request.getLoanAvailable().subtract(conservativeLoanAmount));
        BigDecimal requiredMonthlySaving = calculateRequiredMonthlySaving(shortfallToCover, monthsUntilMoveIn);
        BigDecimal totalSavingAtMoveIn = calculateSavingMaturityAmount(requiredMonthlySaving, monthsUntilMoveIn);
        
        log.info("   - 적금 계산:");
        log.info("     * 적금으로 메워야 할 부족액: {}원", formatCurrency(shortfallToCover));
        log.info("     * 필요한 월적금액: {}원", formatCurrency(requiredMonthlySaving));
        log.info("     * 적금 만기 금액: {}원", formatCurrency(totalSavingAtMoveIn));
        
        String comment = "50/30/20 법칙을 보수적으로 적용한 전략입니다. " +
                        "선택 지출 35% + 저축/부채 15%로 안정적인 가계 관리를 합니다.";
        
        String recommendation = "안정적인 가계 관리가 최우선인 분에게 적합합니다. " +
                               "저축/부채 비율을 낮춰 여유로운 가계 운영이 가능합니다.";
        
        log.info("   - 보수형 플랜 완성:");
        log.info("     * 대출금액: {}원", formatCurrency(conservativeLoanAmount));
        log.info("     * 월적금액: {}원", formatCurrency(requiredMonthlySaving));
        log.info("     * 적금총액: {}원", formatCurrency(totalSavingAtMoveIn));
        
        return CapitalRecommendationResponseDto.CapitalPlanDto.builder()
                .planType("보수형")
                .loanAmount(conservativeLoanAmount)
                .requiredMonthlySaving(requiredMonthlySaving)
                .totalSavingAtMoveIn(totalSavingAtMoveIn)
                .shortfallCovered(shortfallToCover)
                .comment(comment)
                .recommendation(recommendation)
                .build();
    }

    /**
     * 개선된 균형형 플랜 생성 (50/30/20 법칙 균형 조정)
     */
    private CapitalRecommendationResponseDto.CapitalPlanDto createEnhancedBalancedPlan(
            CapitalRecommendationRequestDto request, 
            long monthsUntilMoveIn, 
            BigDecimal totalShortfall,
            FinancialHealthAnalysis healthAnalysis,
            InterestRateInfo interestRateInfo,
            ExistingDebtInfo existingDebtInfo) {
        
        log.info("⚖️ 균형형 플랜 생성 시작:");
        
        BigDecimal monthlyIncome = request.getAnnualIncome().divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        log.info("   - 월소득: {}원", formatCurrency(monthlyIncome));
        
        // 균형형: 25% + 25% = 50% 균형 조정
        BigDecimal maxDebtPayment = monthlyIncome.multiply(new BigDecimal("0.25")); // 25%
        BigDecimal availableForNewDebt = maxDebtPayment.subtract(existingDebtInfo.getExistingMonthlyPayment());
        
        log.info("   - 50/30/20 법칙 균형 조정:");
        log.info("     * 월소득의 25% (저축/부채 한도): {}원", formatCurrency(maxDebtPayment));
        log.info("     * 기존 부채 월상환액: {}원", formatCurrency(existingDebtInfo.getExistingMonthlyPayment()));
        log.info("     * 신규 대출 가능 월상환액: {}원", formatCurrency(availableForNewDebt));
        
        // 금리 비교 기반 최적 대출 금액 계산 (25% 한도 내에서)
        BigDecimal balancedLoanAmount;
        log.info("   - 금리 비교 기반 최적화:");
        log.info("     * 금리 차이: {}%", interestRateInfo.getRateDifference());
        
        if (interestRateInfo.getRateDifference().compareTo(new BigDecimal("1.0")) > 0) {
            // 대출 금리가 높으면 대출 최소화 (25%의 70% 사용)
            log.info("     * 대출 금리가 높아 대출 최소화 (70% 사용)");
            balancedLoanAmount = calculateLoanAmountFromMonthlyPayment(
                    availableForNewDebt.multiply(new BigDecimal("0.7")), 
                    interestRateInfo.getLoanInterestRate(), 30);
        } else if (interestRateInfo.getRateDifference().compareTo(new BigDecimal("-1.0")) < 0) {
            // 적금 금리가 높으면 대출 최대화 (25%의 100% 사용)
            log.info("     * 적금 금리가 높아 대출 최대화 (100% 사용)");
            balancedLoanAmount = calculateLoanAmountFromMonthlyPayment(
                    availableForNewDebt, 
                    interestRateInfo.getLoanInterestRate(), 30);
        } else {
            // 금리가 비슷하면 균형 (25%의 85% 사용)
            log.info("     * 금리가 비슷하여 균형적 접근 (85% 사용)");
            balancedLoanAmount = calculateLoanAmountFromMonthlyPayment(
                    availableForNewDebt.multiply(new BigDecimal("0.85")), 
                    interestRateInfo.getLoanInterestRate(), 30);
        }
        
        // 대출가능액을 초과하지 않도록 제한
        BigDecimal originalLoanAmount = balancedLoanAmount;
        balancedLoanAmount = balancedLoanAmount.min(request.getLoanAvailable());
        
        log.info("   - 대출금액 결정:");
        log.info("     * 계산된 대출금액: {}원", formatCurrency(originalLoanAmount));
        log.info("     * 대출가능액 제한: {}원", formatCurrency(request.getLoanAvailable()));
        log.info("     * 최종 대출금액: {}원", formatCurrency(balancedLoanAmount));
        
        // 적금으로 메워야 할 부족액
        BigDecimal shortfallToCover = totalShortfall.add(request.getLoanAvailable().subtract(balancedLoanAmount));
        BigDecimal requiredMonthlySaving = calculateRequiredMonthlySaving(shortfallToCover, monthsUntilMoveIn);
        BigDecimal totalSavingAtMoveIn = calculateSavingMaturityAmount(requiredMonthlySaving, monthsUntilMoveIn);
        
        log.info("   - 적금 계산:");
        log.info("     * 적금으로 메워야 할 부족액: {}원", formatCurrency(shortfallToCover));
        log.info("     * 필요한 월적금액: {}원", formatCurrency(requiredMonthlySaving));
        log.info("     * 적금 만기 금액: {}원", formatCurrency(totalSavingAtMoveIn));
        
        String comment = "50/30/20 법칙을 균형있게 조정한 전략입니다. " +
                        "선택 지출 25% + 저축/부채 25%로 안정성과 효율성을 균형있게 추구합니다.";
        
        String recommendation = "안정성과 효율성을 모두 고려하는 분에게 적합합니다. " +
                               "선택 지출을 5% 줄여 저축/부채 여력을 확보합니다.";
        
        log.info("   - 균형형 플랜 완성:");
        log.info("     * 대출금액: {}원", formatCurrency(balancedLoanAmount));
        log.info("     * 월적금액: {}원", formatCurrency(requiredMonthlySaving));
        log.info("     * 적금총액: {}원", formatCurrency(totalSavingAtMoveIn));
        
        return CapitalRecommendationResponseDto.CapitalPlanDto.builder()
                .planType("균형형")
                .loanAmount(balancedLoanAmount)
                .requiredMonthlySaving(requiredMonthlySaving)
                .totalSavingAtMoveIn(totalSavingAtMoveIn)
                .shortfallCovered(shortfallToCover)
                .comment(comment)
                .recommendation(recommendation)
                .build();
    }

    /**
     * 개선된 공격형 플랜 생성 (50/30/20 법칙 저축/부채 최대화)
     */
    private CapitalRecommendationResponseDto.CapitalPlanDto createEnhancedAggressivePlan(
            CapitalRecommendationRequestDto request, 
            long monthsUntilMoveIn, 
            BigDecimal totalShortfall,
            FinancialHealthAnalysis healthAnalysis,
            InterestRateInfo interestRateInfo,
            ExistingDebtInfo existingDebtInfo) {
        
        log.info("🚀 공격형 플랜 생성 시작:");
        
        BigDecimal monthlyIncome = request.getAnnualIncome().divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
        log.info("   - 월소득: {}원", formatCurrency(monthlyIncome));
        
        // 공격형: 15% + 35% = 50% 저축/부채 최대화
        BigDecimal maxDebtPayment = monthlyIncome.multiply(new BigDecimal("0.35")); // 35%
        BigDecimal availableForNewDebt = maxDebtPayment.subtract(existingDebtInfo.getExistingMonthlyPayment());
        
        log.info("   - 50/30/20 법칙 공격적 적용:");
        log.info("     * 월소득의 35% (저축/부채 한도): {}원", formatCurrency(maxDebtPayment));
        log.info("     * 기존 부채 월상환액: {}원", formatCurrency(existingDebtInfo.getExistingMonthlyPayment()));
        log.info("     * 신규 대출 가능 월상환액: {}원", formatCurrency(availableForNewDebt));
        
        // 성장성을 위해 35% 한도를 최대한 활용
        BigDecimal aggressiveLoanAmount = calculateLoanAmountFromMonthlyPayment(
                availableForNewDebt, 
                interestRateInfo.getLoanInterestRate(), 30);
        
        // 대출가능액을 초과하지 않도록 제한
        BigDecimal originalLoanAmount = aggressiveLoanAmount;
        aggressiveLoanAmount = aggressiveLoanAmount.min(request.getLoanAvailable());
        
        log.info("   - 대출금액 결정:");
        log.info("     * 계산된 대출금액: {}원", formatCurrency(originalLoanAmount));
        log.info("     * 대출가능액 제한: {}원", formatCurrency(request.getLoanAvailable()));
        log.info("     * 최종 대출금액: {}원", formatCurrency(aggressiveLoanAmount));
        
        // 적금으로 메워야 할 부족액
        BigDecimal shortfallToCover = totalShortfall.add(request.getLoanAvailable().subtract(aggressiveLoanAmount));
        BigDecimal requiredMonthlySaving = calculateRequiredMonthlySaving(shortfallToCover, monthsUntilMoveIn);
        BigDecimal totalSavingAtMoveIn = calculateSavingMaturityAmount(requiredMonthlySaving, monthsUntilMoveIn);
        
        log.info("   - 적금 계산:");
        log.info("     * 적금으로 메워야 할 부족액: {}원", formatCurrency(shortfallToCover));
        log.info("     * 필요한 월적금액: {}원", formatCurrency(requiredMonthlySaving));
        log.info("     * 적금 만기 금액: {}원", formatCurrency(totalSavingAtMoveIn));
        
        String comment = "50/30/20 법칙을 공격적으로 적용한 전략입니다. " +
                        "선택 지출 15% + 저축/부채 35%로 저축과 부채 상환에 집중합니다.";
        
        String recommendation = "성장성을 중시하고 다른 투자 기회가 있는 분에게 적합합니다. " +
                               "선택 지출을 15% 줄여 저축/부채 여력을 최대화합니다.";
        
        log.info("   - 공격형 플랜 완성:");
        log.info("     * 대출금액: {}원", formatCurrency(aggressiveLoanAmount));
        log.info("     * 월적금액: {}원", formatCurrency(requiredMonthlySaving));
        log.info("     * 적금총액: {}원", formatCurrency(totalSavingAtMoveIn));
        
        return CapitalRecommendationResponseDto.CapitalPlanDto.builder()
                .planType("공격형")
                .loanAmount(aggressiveLoanAmount)
                .requiredMonthlySaving(requiredMonthlySaving)
                .totalSavingAtMoveIn(totalSavingAtMoveIn)
                .shortfallCovered(shortfallToCover)
                .comment(comment)
                .recommendation(recommendation)
                .build();
    }
}