package com.hana_ti.home_planner.domain.calculation.service;

import com.hana_ti.home_planner.domain.calculation.dto.*;
import com.hana_ti.home_planner.domain.calculation.util.PlanCalculationUtil;
import com.hana_ti.home_planner.domain.my_data.dto.AnnualIncomeResponseDto;
import com.hana_ti.home_planner.domain.my_data.service.ExternalMyDataService;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import com.hana_ti.home_planner.global.exception.ResourceNotFoundException;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PlanGenerationService {

    private final PlanCalculationUtil planCalculationUtil;
    private final LtvCalculationService ltvCalculationService;
    private final ExternalMyDataService externalMyDataService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 플랜 생성
     */
    public PlanGenerationResponseDto generatePlansWithJwt(String jwtToken, PlanGenerationRequestDto request) {
        log.info("JWT 토큰 기반 플랜 생성 시작 - 주택가격: {}, 지역: {}", 
                request.getHousePrice(), request.getRegion());

        // 1. JWT 토큰에서 사용자 ID 추출
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        if (userId == null) {
            throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
        }
        
        // 2. USERS 테이블에서 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자", "userId", userId));
        
        // 3. CI 값으로 외부 서버에서 사용자 정보 조회하여 userId 추출
        String ci = user.getResNum();
        var externalUser = externalMyDataService.getUserByResNum(ci);
        Long mdUserId = externalUser.getUserId();

        // 4. 연소득 정보 조회
        AnnualIncomeResponseDto annualIncome =
                ltvCalculationService.getAnnualIncomeByCi(mdUserId);
        
        // 5. 기존 대출 월상환액 조회
        BigDecimal existingLoanMonthlyPayment = ltvCalculationService.getExistingLoanMonthlyPaymentByCi(mdUserId);

        // 6. DSR 40% 한도 내에서 플랜 생성 (기존 대출 고려)
        // 기존 대출이 있더라도 DSR 40% 한도 내에서 새로운 대출 가능 금액 계산
        PlanGenerationRequestDto updatedRequest = PlanGenerationRequestDto.builder()
                .housePrice(request.getHousePrice())
                .region(request.getRegion())
                .annualIncome(annualIncome.getAnnualIncome())
                .existingLoanMonthlyPayment(existingLoanMonthlyPayment) // 기존 대출 고려
                .ltvLimit(request.getLtvLimit())
                .maxAllowedLoanAmount(request.getMaxAllowedLoanAmount())
                .dsrLimit(request.getDsrLimit())
                .rateAssumed(request.getRateAssumed())
                .stressRate(request.getStressRate())
                .termYears(request.getTermYears())
                .repaymentType(request.getRepaymentType())
                .availableMonthlyPayment(request.getAvailableMonthlyPayment())
                .build();

        // 7. 플랜 생성 수행
        return generatePlans(updatedRequest, Long.valueOf(extractNumericUserId(userId)));
    }

    /**
     * 직접 플랜 생성 (MyData 조회 없이)
     * 테스트용으로 사용
     */
    public PlanGenerationResponseDto generatePlansDirect(PlanGenerationRequestDto request) {
        log.info("직접 플랜 생성 시작 - 주택가격: {}, 지역: {}",
                request.getHousePrice(), request.getRegion());

        return generatePlans(request, 0L); // userId는 0으로 설정
    }

    /**
     * 플랜 생성 메인 로직
     */
    public PlanGenerationResponseDto generatePlans(PlanGenerationRequestDto request, Long userId) {
        log.info("플랜 생성 시작 - 주택가격: {}, 연소득: {}, DSR한도: {}", 
                request.getHousePrice(), request.getAnnualIncome(), request.getDsrLimit());

        List<PlanDto> plans = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        String calculationStatus = "SUCCESS";

        try {
            // 기본 파라미터 설정
            BigDecimal rateMonthly = request.getRateAssumed().divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
            BigDecimal stressRateMonthly = request.getStressRate().divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
            int months = request.getTermYears() * 12;
            BigDecimal ltvLimit = BigDecimal.valueOf(request.getLtvLimit());

            // 기존 대출 DSR 확인
            BigDecimal existingDSR = planCalculationUtil.calculateDSR(BigDecimal.ZERO, request.getExistingLoanMonthlyPayment(), request.getAnnualIncome());
            log.info("기존 대출 DSR: {}%, DSR 한도: {}%", existingDSR, request.getDsrLimit());
            
            if (existingDSR.compareTo(BigDecimal.valueOf(request.getDsrLimit())) >= 0) {
                warnings.add("기존 대출로 인해 DSR 한도를 초과합니다. 아래 플랜은 기존 대출 정리 후 적용 가능합니다.");
                warnings.add("현재 기존 대출 DSR: " + existingDSR + "%, 허용 DSR: " + request.getDsrLimit() + "%");
            }

        // 1. 균형형 플랜 생성 (DSR ≈ 40% × 0.80 = 32%)
        PlanDto balancedPlan = generateBalancedPlan(request, rateMonthly, stressRateMonthly, months, ltvLimit);
        if (balancedPlan != null) {
            plans.add(balancedPlan);
        } else {
            warnings.add("균형형 플랜 생성 실패 - 조건을 만족하는 대출금액을 찾을 수 없습니다.");
        }

        // 2. 여유형 플랜 생성 (DSR ≈ 40% × 0.70 = 28%)
        PlanDto easyPlan = generateEasyPlan(request, rateMonthly, stressRateMonthly, months, ltvLimit);
        if (easyPlan != null) {
            plans.add(easyPlan);
        } else {
            warnings.add("여유형 플랜 생성 실패 - 조건을 만족하는 대출금액을 찾을 수 없습니다.");
        }

        // 3. 절약형 플랜 생성 (DSR ≈ 40% × 0.60 = 24%)
        PlanDto frugalPlan = generateFrugalPlan(request, rateMonthly, stressRateMonthly, months, ltvLimit);
        if (frugalPlan != null) {
            plans.add(frugalPlan);
        } else {
            warnings.add("절약형 플랜 생성 실패 - 조건을 만족하는 대출금액을 찾을 수 없습니다.");
        }

            if (plans.isEmpty()) {
                calculationStatus = "FAILED";
                errors.add("모든 플랜 생성에 실패했습니다. 입력 조건을 확인해주세요.");
            } else if (warnings.size() > 0) {
                calculationStatus = "PARTIAL_SUCCESS";
            }

        } catch (Exception e) {
            log.error("플랜 생성 중 오류 발생", e);
            calculationStatus = "FAILED";
            errors.add("플랜 생성 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace(); // 스택 트레이스 출력
        }

        return PlanGenerationResponseDto.builder()
                .userId(userId)
                .housePrice(request.getHousePrice())
                .region(request.getRegion())
                .annualIncome(request.getAnnualIncome())
                .existingLoanMonthlyPayment(request.getExistingLoanMonthlyPayment())
                .ltvLimit(request.getLtvLimit())
                .maxAllowedLoanAmount(request.getMaxAllowedLoanAmount())
                .dsrLimit(request.getDsrLimit())
                .rateAssumed(request.getRateAssumed())
                .stressRate(request.getStressRate())
                .termYears(request.getTermYears())
                .repaymentType(request.getRepaymentType())
                .availableMonthlyPayment(request.getAvailableMonthlyPayment())
                .plans(plans)
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .calculationStatus(calculationStatus)
                .warnings(warnings)
                .errors(errors)
                .build();
    }

    /**
     * 균형형 플랜 생성 (추천 기본안)
     * 타깃: DSR ≈ dsrLimit × 0.98
     */
    private PlanDto generateBalancedPlan(PlanGenerationRequestDto request, BigDecimal rateMonthly, 
                                       BigDecimal stressRateMonthly, int months, BigDecimal ltvLimit) {
        log.info("균형형 플랜 생성 시작");

        // 목표 DSR: 40% × 0.80 = 32% (스트레스 테스트 고려하여 조정)
        BigDecimal targetDSRRatio = BigDecimal.valueOf(0.80);
        BigDecimal targetLoanAmount = planCalculationUtil.findLoanAmountByTargetDSR(
                targetDSRRatio, rateMonthly, months, request.getExistingLoanMonthlyPayment(),
                request.getAnnualIncome(), request.getMaxAllowedLoanAmount(),
                request.getHousePrice(), ltvLimit);

        if (targetLoanAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        // 안전 가드 검증 (기존 대출이 DSR 한도를 초과하는 경우 0으로 설정)
        BigDecimal existingLoanForValidation = request.getExistingLoanMonthlyPayment();
        BigDecimal existingDSR = planCalculationUtil.calculateDSR(BigDecimal.ZERO, existingLoanForValidation, request.getAnnualIncome());
        if (existingDSR.compareTo(BigDecimal.valueOf(request.getDsrLimit())) >= 0) {
            existingLoanForValidation = BigDecimal.ZERO; // 기존 대출을 0으로 설정
        }
        
        PlanCalculationUtil.GuardResult guardResult = planCalculationUtil.validateGuards(
                targetLoanAmount, request.getHousePrice(), ltvLimit,
                request.getMaxAllowedLoanAmount(), rateMonthly, months,
                existingLoanForValidation, request.getAnnualIncome(),
                BigDecimal.valueOf(request.getDsrLimit()), stressRateMonthly);

        if (!guardResult.isValid()) {
            log.warn("균형형 플랜 안전 가드 검증 실패: {}", guardResult.getReason());
            return null;
        }
        
        // 최종 DSR 검증 (40% 절대 초과 방지)
        if (guardResult.getDsr().compareTo(BigDecimal.valueOf(40)) > 0) {
            log.warn("균형형 플랜 DSR 40% 초과: {}%", guardResult.getDsr());
            return null;
        }

        // 가용 월상환액 검증
        if (request.getAvailableMonthlyPayment() != null && 
            guardResult.getMonthlyPayment().compareTo(request.getAvailableMonthlyPayment()) > 0) {
            log.warn("균형형 플랜 가용 월상환액 초과");
            return null;
        }

        return PlanDto.builder()
                .type("BALANCED")
                .loanAmount(targetLoanAmount)
                .monthly(guardResult.getMonthlyPayment())
                .ltv(guardResult.getLtv())
                .dsr(guardResult.getDsr())
                .stressMonthly(guardResult.getStressMonthlyPayment())
                .stressDsr(guardResult.getStressDsr())
                .termYears(request.getTermYears())
                .rateAssumed(request.getRateAssumed())
                .repaymentType(request.getRepaymentType())
                .description("균형형 플랜 - DSR 한도에 근접한 안정적인 대출 플랜")
                .recommendation("가장 추천하는 기본 플랜입니다. 안정적인 상환 부담으로 주택 구매가 가능합니다.")
                .isRecommended(true)
                .build();
    }

    /**
     * 여유형 플랜 생성 (보수적)
     * 타깃: DSR ≈ dsrLimit × 0.85
     */
    private PlanDto generateEasyPlan(PlanGenerationRequestDto request, BigDecimal rateMonthly, 
                                   BigDecimal stressRateMonthly, int months, BigDecimal ltvLimit) {
        log.info("여유형 플랜 생성 시작");

        // 목표 DSR: 40% × 0.70 = 28%
        BigDecimal targetDSRRatio = BigDecimal.valueOf(0.70);
        BigDecimal targetLoanAmount = planCalculationUtil.findLoanAmountByTargetDSR(
                targetDSRRatio, rateMonthly, months, request.getExistingLoanMonthlyPayment(),
                request.getAnnualIncome(), request.getMaxAllowedLoanAmount(),
                request.getHousePrice(), ltvLimit);

        if (targetLoanAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        // 안전 가드 검증 (기존 대출이 DSR 한도를 초과하는 경우 0으로 설정)
        BigDecimal existingLoanForValidation = request.getExistingLoanMonthlyPayment();
        BigDecimal existingDSR = planCalculationUtil.calculateDSR(BigDecimal.ZERO, existingLoanForValidation, request.getAnnualIncome());
        if (existingDSR.compareTo(BigDecimal.valueOf(request.getDsrLimit())) >= 0) {
            existingLoanForValidation = BigDecimal.ZERO; // 기존 대출을 0으로 설정
        }
        
        PlanCalculationUtil.GuardResult guardResult = planCalculationUtil.validateGuards(
                targetLoanAmount, request.getHousePrice(), ltvLimit,
                request.getMaxAllowedLoanAmount(), rateMonthly, months,
                existingLoanForValidation, request.getAnnualIncome(),
                BigDecimal.valueOf(request.getDsrLimit()), stressRateMonthly);

        if (!guardResult.isValid()) {
            log.warn("여유형 플랜 안전 가드 검증 실패: {}", guardResult.getReason());
            return null;
        }
        
        // 최종 DSR 검증 (40% 절대 초과 방지)
        if (guardResult.getDsr().compareTo(BigDecimal.valueOf(40)) > 0) {
            log.warn("여유형 플랜 DSR 40% 초과: {}%", guardResult.getDsr());
            return null;
        }

        return PlanDto.builder()
                .type("EASY")
                .loanAmount(targetLoanAmount)
                .monthly(guardResult.getMonthlyPayment())
                .ltv(guardResult.getLtv())
                .dsr(guardResult.getDsr())
                .stressMonthly(guardResult.getStressMonthlyPayment())
                .stressDsr(guardResult.getStressDsr())
                .termYears(request.getTermYears())
                .rateAssumed(request.getRateAssumed())
                .repaymentType(request.getRepaymentType())
                .description("여유형 플랜 - 월상환 여유를 확보한 보수적 대출 플랜")
                .recommendation("월상환 부담이 적어 현금흐름이 안정적입니다. 여유 자금으로 다른 투자나 생활비에 활용할 수 있습니다.")
                .isRecommended(false)
                .build();
    }

    /**
     * 절약형 플랜 생성 (안전 최우선)
     * 타깃: DSR ≈ dsrLimit × 0.70
     */
    private PlanDto generateFrugalPlan(PlanGenerationRequestDto request, BigDecimal rateMonthly, 
                                     BigDecimal stressRateMonthly, int months, BigDecimal ltvLimit) {
        log.info("절약형 플랜 생성 시작");

        // 목표 DSR: 40% × 0.60 = 24%
        BigDecimal targetDSRRatio = BigDecimal.valueOf(0.60);
        BigDecimal targetLoanAmount = planCalculationUtil.findLoanAmountByTargetDSR(
                targetDSRRatio, rateMonthly, months, request.getExistingLoanMonthlyPayment(),
                request.getAnnualIncome(), request.getMaxAllowedLoanAmount(),
                request.getHousePrice(), ltvLimit);

        if (targetLoanAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        // 안전 가드 검증 (기존 대출이 DSR 한도를 초과하는 경우 0으로 설정)
        BigDecimal existingLoanForValidation = request.getExistingLoanMonthlyPayment();
        BigDecimal existingDSR = planCalculationUtil.calculateDSR(BigDecimal.ZERO, existingLoanForValidation, request.getAnnualIncome());
        if (existingDSR.compareTo(BigDecimal.valueOf(request.getDsrLimit())) >= 0) {
            existingLoanForValidation = BigDecimal.ZERO; // 기존 대출을 0으로 설정
        }
        
        PlanCalculationUtil.GuardResult guardResult = planCalculationUtil.validateGuards(
                targetLoanAmount, request.getHousePrice(), ltvLimit,
                request.getMaxAllowedLoanAmount(), rateMonthly, months,
                existingLoanForValidation, request.getAnnualIncome(),
                BigDecimal.valueOf(request.getDsrLimit()), stressRateMonthly);

        if (!guardResult.isValid()) {
            log.warn("절약형 플랜 안전 가드 검증 실패: {}", guardResult.getReason());
            return null;
        }
        
        // 최종 DSR 검증 (40% 절대 초과 방지)
        if (guardResult.getDsr().compareTo(BigDecimal.valueOf(40)) > 0) {
            log.warn("절약형 플랜 DSR 40% 초과: {}%", guardResult.getDsr());
            return null;
        }

        return PlanDto.builder()
                .type("FRUGAL")
                .loanAmount(targetLoanAmount)
                .monthly(guardResult.getMonthlyPayment())
                .ltv(guardResult.getLtv())
                .dsr(guardResult.getDsr())
                .stressMonthly(guardResult.getStressMonthlyPayment())
                .stressDsr(guardResult.getStressDsr())
                .termYears(request.getTermYears())
                .rateAssumed(request.getRateAssumed())
                .repaymentType(request.getRepaymentType())
                .description("절약형 플랜 - 안전 최우선의 보수적 대출 플랜")
                .recommendation("가장 안전한 플랜으로, 금리 상승이나 소득 감소 상황에서도 여유가 있습니다.")
                .isRecommended(false)
                .build();
    }

    /**
     * 사용자 ID에서 숫자 부분만 추출
     * "USER000003" -> 3L
     */
    private Long extractNumericUserId(String userId) {
        try {
            // "USER000003"에서 숫자 부분만 추출
            String numericPart = userId.replaceAll("[^0-9]", "");
            return Long.parseLong(numericPart);
        } catch (NumberFormatException e) {
            log.warn("사용자 ID에서 숫자 추출 실패: {}", userId);
            return 0L; // 기본값
        }
    }
}
