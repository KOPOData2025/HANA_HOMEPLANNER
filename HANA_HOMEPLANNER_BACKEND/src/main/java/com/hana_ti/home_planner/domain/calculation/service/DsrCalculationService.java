package com.hana_ti.home_planner.domain.calculation.service;

import com.hana_ti.home_planner.domain.calculation.constants.CalculationConstants;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDsrCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDsrCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.DsrCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.DsrCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.util.CalculationUtil;
import com.hana_ti.home_planner.domain.my_data.dto.*;
import com.hana_ti.home_planner.domain.my_data.service.*;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static com.hana_ti.home_planner.domain.calculation.util.CalculationUtil.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DsrCalculationService {
    private final MdBankTransactionService mdBankTransactionService;
    private final MdInstallmentLoanService mdInstallmentLoanService;
    private final MdInsuranceLoanService mdInsuranceLoanService;
    private final MdBankLoanService mdBankLoanService;
    private final MdCardService mdCardService;
    private final MdCardLoanService mdCardLoanService;
    private final ExternalMyDataService externalMyDataService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 부부 합계 DSR 계산 수행 (정방향 로직)
     */
    public CoupleDsrCalculationResponseDto calculateCoupleDsrWithJwt(String jwtToken, CoupleDsrCalculationRequestDto request) {
        log.info("JWT 토큰 기반 부부 합계 DSR 계산 시작 (정방향) - 지역: {}, 희망대출금액: {}, 희망금리: {}%, 희망기간: {}년, 배우자ID: {}",
                request.getRegion(), request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getSpouseUserId());

        // 1. JWT 토큰에서 사용자 ID 추출
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        if (userId == null) {
            throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
        }

        // 2. 사용자 정보 조회 및 CI 값으로 외부 서버에서 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        String ci = user.getResNum();
        // 외부 서버에서 사용자 정보 조회하여 userId 추출
        var externalUser = externalMyDataService.getUserByResNum(ci);
        Long mdUserId = externalUser.getUserId();

        // 3. 배우자 정보 조회
        User spouseUser = userRepository.findById(request.getSpouseUserId())
                .orElseThrow(() -> new IllegalArgumentException("배우자 사용자를 찾을 수 없습니다: " + request.getSpouseUserId()));

        String spouseCi = spouseUser.getResNum();
        // 외부 서버에서 배우자 정보 조회하여 userId 추출
        var externalSpouseUser = externalMyDataService.getUserByResNum(spouseCi);
        Long spouseMdUserId = externalSpouseUser.getUserId();

        // 4. 부부 합계 연소득 조회
        AnnualIncomeResponseDto userAnnualIncome = getAnnualIncomeByCiInternal(mdUserId);
        AnnualIncomeResponseDto spouseAnnualIncome = getAnnualIncomeByCiInternal(spouseMdUserId);

        BigDecimal coupleTotalAnnualIncome = userAnnualIncome.getAnnualIncome().add(spouseAnnualIncome.getAnnualIncome());
        log.info("부부 합계 연소득 조회 완료 - 본인연소득: {}, 배우자연소득: {}, 합계연소득: {}",
                userAnnualIncome.getAnnualIncome(), spouseAnnualIncome.getAnnualIncome(), coupleTotalAnnualIncome);

        // 5. DSR 한도 설정 (기본값 40%)
        BigDecimal dsrLimit = request.getDsrLimit() != null ? request.getDsrLimit() : CalculationConstants.DEFAULT_DSR_LIMIT;
        log.info("DSR 한도 설정 완료 - DSR한도: {}%", dsrLimit);

        // 6. 부부 합계 기존 대출 정보 조회 및 연간 상환액 계산
        BigDecimal userExistingLoanAnnualPayment = calculateExistingLoanAnnualPayment(mdUserId);
        BigDecimal spouseExistingLoanAnnualPayment = calculateExistingLoanAnnualPayment(spouseMdUserId);
        BigDecimal coupleExistingLoanAnnualPayment = userExistingLoanAnnualPayment.add(spouseExistingLoanAnnualPayment);

        Integer userExistingLoanCount = getExistingLoanCount(mdUserId);
        Integer spouseExistingLoanCount = getExistingLoanCount(spouseMdUserId);
        Integer coupleExistingLoanCount = userExistingLoanCount + spouseExistingLoanCount;

        log.info("부부 합계 기존 대출 정보 계산 완료 - 본인기존상환액: {}, 배우자기존상환액: {}, 합계기존상환액: {}, 대출건수: {}",
                userExistingLoanAnnualPayment, spouseExistingLoanAnnualPayment, coupleExistingLoanAnnualPayment, coupleExistingLoanCount);

        // 7. 희망 대출의 월상환액 및 연상환액 계산 (기본 금리)
        BigDecimal baseMonthlyPayment = calculateMonthlyPaymentByRepayMethod(request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal baseAnnualPayment = CalculationUtil.convertMonthlyToAnnual(baseMonthlyPayment);
        BigDecimal baseTotalPayment = baseMonthlyPayment.multiply(BigDecimal.valueOf(request.getDesiredLoanPeriod() * 12));

        log.info("희망 대출 상환액 계산 완료 (기본금리) - 대출금액: {}, 금리: {}%, 기간: {}년, 상환방식: {}, 월상환액: {}, 연상환액: {}, 총상환액: {}",
                request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getRepayMethod(),
                baseMonthlyPayment, baseAnnualPayment, baseTotalPayment);

        // 8. 스트레스 금리 계산 및 적용
        BigDecimal stressRate = calculateStressRate(request.getRegion(), request.getDesiredInterestRate());
        BigDecimal stressMonthlyPayment = calculateMonthlyPaymentByRepayMethod(request.getDesiredLoanAmount(), stressRate, request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal stressAnnualPayment = CalculationUtil.convertMonthlyToAnnual(stressMonthlyPayment);
        BigDecimal stressTotalPayment = stressMonthlyPayment.multiply(BigDecimal.valueOf(request.getDesiredLoanPeriod() * 12));

        log.info("희망 대출 상환액 계산 완료 (스트레스금리) - 스트레스금리: {}%, 월상환액: {}, 연상환액: {}, 총상환액: {}",
                stressRate, stressMonthlyPayment, stressAnnualPayment, stressTotalPayment);

        // 9. DSR 계산 (기본 금리)
        BigDecimal baseTotalAnnualPayment = coupleExistingLoanAnnualPayment.add(baseAnnualPayment);
        BigDecimal baseDsr = CalculationUtil.calculateRatio(baseTotalAnnualPayment, coupleTotalAnnualIncome);
        log.info("기본 금리 DSR 계산 완료 - 기존상환액: {}, 신규상환액: {}, 총상환액: {}, 연소득: {}, DSR: {}%",
                coupleExistingLoanAnnualPayment, baseAnnualPayment, baseTotalAnnualPayment, coupleTotalAnnualIncome, baseDsr);

        // 10. DSR 계산 (스트레스 금리)
        BigDecimal stressTotalAnnualPayment = coupleExistingLoanAnnualPayment.add(stressAnnualPayment);
        BigDecimal stressDsr = CalculationUtil.calculateRatio(stressTotalAnnualPayment, coupleTotalAnnualIncome);
        log.info("스트레스 금리 DSR 계산 완료 - 기존상환액: {}, 신규상환액: {}, 총상환액: {}, 연소득: {}, DSR: {}%",
                coupleExistingLoanAnnualPayment, stressAnnualPayment, stressTotalAnnualPayment, coupleTotalAnnualIncome, stressDsr);

        // 11. DSR 상태 판단
        String baseDsrStatus = determineDsrStatus(baseDsr, dsrLimit.intValue());
        String stressDsrStatus = determineDsrStatus(stressDsr, dsrLimit.intValue());
        log.info("DSR 상태 판단 완료 - 기본DSR상태: {}, 스트레스DSR상태: {}", baseDsrStatus, stressDsrStatus);

        // 12. DSR 한도 기준 최대 대출금액 역계산
        BigDecimal maxLoanAmountForBaseRate = calculateMaxLoanAmountForDsrLimit(
                coupleTotalAnnualIncome, coupleExistingLoanAnnualPayment, request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), dsrLimit);
        BigDecimal maxLoanAmountForStressRate = calculateMaxLoanAmountForDsrLimit(
                coupleTotalAnnualIncome, coupleExistingLoanAnnualPayment, stressRate, request.getDesiredLoanPeriod(), dsrLimit);

        // 13. DSR 한도 기준 상환액 계산
        BigDecimal maxMonthlyPaymentForBaseRate = calculateMonthlyPaymentByRepayMethod(maxLoanAmountForBaseRate, request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal maxMonthlyPaymentForStressRate = calculateMonthlyPaymentByRepayMethod(maxLoanAmountForStressRate, stressRate, request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal maxAnnualPaymentForBaseRate = CalculationUtil.convertMonthlyToAnnual(maxMonthlyPaymentForBaseRate);
        BigDecimal maxAnnualPaymentForStressRate = CalculationUtil.convertMonthlyToAnnual(maxMonthlyPaymentForStressRate);

        log.info("부부 합계 DSR 한도 기준 최대 대출금액 - 기본금리: {}원, 스트레스금리: {}원",
                maxLoanAmountForBaseRate, maxLoanAmountForStressRate);

        return CoupleDsrCalculationResponseDto.builder()
                // 1. 사용자 정보
                .region(request.getRegion())
                .coupleTotalAnnualIncome(coupleTotalAnnualIncome)
                .spouseAnnualIncome(spouseAnnualIncome.getAnnualIncome())
                .dsrLimit(dsrLimit)

                // 2. 부부 합계 기존 대출 정보
                .coupleExistingLoanAnnualPayment(coupleExistingLoanAnnualPayment)
                .coupleExistingLoanCount(coupleExistingLoanCount)

                // 3. 신규 대출 정보
                .desiredLoanAmount(request.getDesiredLoanAmount())
                .desiredInterestRate(request.getDesiredInterestRate())
                .desiredLoanPeriod(request.getDesiredLoanPeriod())

                // 4. 기본 금리 적용 결과
                .baseMonthlyPayment(baseMonthlyPayment)
                .baseAnnualPayment(baseAnnualPayment)
                .baseTotalPayment(baseTotalPayment)
                .baseDsr(baseDsr)

                // 5. 스트레스 금리 적용 결과
                .stressRate(stressRate)
                .stressMonthlyPayment(stressMonthlyPayment)
                .stressAnnualPayment(stressAnnualPayment)
                .stressTotalPayment(stressTotalPayment)
                .stressDsr(stressDsr)

                // 6. DSR 상태
                .baseDsrStatus(baseDsrStatus)
                .stressDsrStatus(stressDsrStatus)

                // 7. DSR 한도 기준 대출금액 정보
                .maxLoanAmountForBaseRate(maxLoanAmountForBaseRate)
                .maxLoanAmountForStressRate(maxLoanAmountForStressRate)
                .maxMonthlyPaymentForBaseRate(maxMonthlyPaymentForBaseRate)
                .maxMonthlyPaymentForStressRate(maxMonthlyPaymentForStressRate)
                .maxAnnualPaymentForBaseRate(maxAnnualPaymentForBaseRate)
                .maxAnnualPaymentForStressRate(maxAnnualPaymentForStressRate)

                // 8. 계산 정보
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .message("부부 합계 DSR 계산이 완료되었습니다.")
                .build();
    }

    /**
     * JWT 토큰 기반 DSR 계산 수행
     */
    public DsrCalculationResponseDto calculateDsrWithJwt(String jwtToken, DsrCalculationRequestDto request) {
        log.info("JWT 토큰 기반 DSR 계산 시작 - 지역: {}, 희망대출금액: {}, 희망금리: {}%, 희망기간: {}년",
                request.getRegion(), request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod());

        // 1. JWT 토큰에서 사용자 ID 추출
        String userId = jwtUtil.getUserIdFromToken(jwtToken);
        if (userId == null) {
            throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
        }

        // 2. 사용자 정보 조회 및 CI 값으로 외부 서버에서 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        String ci = user.getResNum();
        // 외부 서버에서 사용자 정보 조회하여 userId 추출
        var externalUser = externalMyDataService.getUserByResNum(ci);
        Long mdUserId = externalUser.getUserId();

        // 3. MyData에서 연소득 조회
        AnnualIncomeResponseDto annualIncome = getAnnualIncomeByCiInternal(mdUserId);
        BigDecimal totalAnnualIncome = annualIncome.getAnnualIncome();
        log.info("연소득 조회 완료 - 연소득: {}", totalAnnualIncome);

        // 4. DSR 한도 설정 (기본값 40%)
        BigDecimal dsrLimit = request.getDsrLimit() != null ? request.getDsrLimit() : CalculationConstants.DEFAULT_DSR_LIMIT;
        log.info("DSR 한도 설정 완료 - DSR한도: {}%", dsrLimit);

        // 5. MyData에서 기존 대출 정보 조회 및 연간 원리금 계산
        BigDecimal existingLoanAnnualPayment = calculateExistingLoanAnnualPayment(mdUserId);
        log.info("기존 대출 연간 원리금 계산 완료 - 기존연상환액: {}", existingLoanAnnualPayment);

        // 6. 희망 대출금액 기준으로 상환액 계산
        BigDecimal baseRate = request.getDesiredInterestRate();
        BigDecimal baseMonthlyPayment = calculateMonthlyPaymentByRepayMethod(request.getDesiredLoanAmount(), baseRate, request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal baseAnnualPayment = CalculationUtil.convertMonthlyToAnnual(baseMonthlyPayment);
        BigDecimal baseTotalPayment = baseMonthlyPayment.multiply(BigDecimal.valueOf(request.getDesiredLoanPeriod() * 12));

        // 7. 스트레스 금리 적용 상환액 계산
        BigDecimal stressRate = calculateStressRate(request.getRegion(), request.getDesiredInterestRate());
        BigDecimal stressMonthlyPayment = calculateMonthlyPaymentByRepayMethod(request.getDesiredLoanAmount(), stressRate, request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal stressAnnualPayment = CalculationUtil.convertMonthlyToAnnual(stressMonthlyPayment);
        BigDecimal stressTotalPayment = stressMonthlyPayment.multiply(BigDecimal.valueOf(request.getDesiredLoanPeriod() * 12));

        // 8. DSR 계산 (기존 대출 + 신규 대출) / 연소득
        BigDecimal totalBaseAnnualPayment = existingLoanAnnualPayment.add(baseAnnualPayment);
        BigDecimal totalStressAnnualPayment = existingLoanAnnualPayment.add(stressAnnualPayment);

        BigDecimal baseDsr = CalculationUtil.calculateRatio(totalBaseAnnualPayment, totalAnnualIncome);
        BigDecimal stressDsr = CalculationUtil.calculateRatio(totalStressAnnualPayment, totalAnnualIncome);

        // 9. DSR 상태 판단
        String baseDsrStatus = determineDsrStatus(baseDsr, dsrLimit.intValue());
        String stressDsrStatus = determineDsrStatus(stressDsr, dsrLimit.intValue());

        // 10. DSR 한도 기준 최대 대출금액 역계산
        BigDecimal maxLoanAmountForBaseRate = calculateMaxLoanAmountForDsrLimit(
                totalAnnualIncome, existingLoanAnnualPayment, baseRate, request.getDesiredLoanPeriod(), dsrLimit);
        BigDecimal maxLoanAmountForStressRate = calculateMaxLoanAmountForDsrLimit(
                totalAnnualIncome, existingLoanAnnualPayment, stressRate, request.getDesiredLoanPeriod(), dsrLimit);

        // 11. DSR 한도 기준 상환액 계산
        BigDecimal maxMonthlyPaymentForBaseRate = calculateMonthlyPaymentByRepayMethod(maxLoanAmountForBaseRate, baseRate, request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal maxMonthlyPaymentForStressRate = calculateMonthlyPaymentByRepayMethod(maxLoanAmountForStressRate, stressRate, request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal maxAnnualPaymentForBaseRate = CalculationUtil.convertMonthlyToAnnual(maxMonthlyPaymentForBaseRate);
        BigDecimal maxAnnualPaymentForStressRate = CalculationUtil.convertMonthlyToAnnual(maxMonthlyPaymentForStressRate);

        log.info("DSR 계산 완료 - 기본금리: {}%, 기본월상환액: {}, 기본연상환액: {}, 기본DSR: {}%",
                baseRate, baseMonthlyPayment, baseAnnualPayment, baseDsr);
        log.info("DSR 계산 완료 - 스트레스금리: {}%, 스트레스월상환액: {}, 스트레스연상환액: {}, 스트레스DSR: {}%",
                stressRate, stressMonthlyPayment, stressAnnualPayment, stressDsr);
        log.info("DSR 한도 기준 최대 대출금액 - 기본금리: {}원, 스트레스금리: {}원",
                maxLoanAmountForBaseRate, maxLoanAmountForStressRate);

        return DsrCalculationResponseDto.builder()
                // 1. 사용자 정보
                .region(request.getRegion())
                .annualIncome(totalAnnualIncome)
                .dsrLimit(dsrLimit)

                // 2. 기존 대출 정보
                .existingLoanAnnualPayment(existingLoanAnnualPayment)
                .existingLoanCount(getExistingLoanCount(mdUserId))

                // 3. 신규 대출 정보
                .desiredLoanAmount(request.getDesiredLoanAmount())
                .desiredInterestRate(request.getDesiredInterestRate())
                .desiredLoanPeriod(request.getDesiredLoanPeriod())

                // 4. 기본 금리 적용 결과
                .baseMonthlyPayment(baseMonthlyPayment)
                .baseAnnualPayment(baseAnnualPayment)
                .baseTotalPayment(baseTotalPayment)
                .baseDsr(baseDsr)

                // 5. 스트레스 금리 적용 결과
                .stressRate(stressRate)
                .stressMonthlyPayment(stressMonthlyPayment)
                .stressAnnualPayment(stressAnnualPayment)
                .stressTotalPayment(stressTotalPayment)
                .stressDsr(stressDsr)

                // 6. DSR 상태
                .baseDsrStatus(baseDsrStatus)
                .stressDsrStatus(stressDsrStatus)

                // 7. DSR 한도 기준 대출금액 정보
                .maxLoanAmountForBaseRate(maxLoanAmountForBaseRate)
                .maxLoanAmountForStressRate(maxLoanAmountForStressRate)
                .maxMonthlyPaymentForBaseRate(maxMonthlyPaymentForBaseRate)
                .maxMonthlyPaymentForStressRate(maxMonthlyPaymentForStressRate)
                .maxAnnualPaymentForBaseRate(maxAnnualPaymentForBaseRate)
                .maxAnnualPaymentForStressRate(maxAnnualPaymentForStressRate)

                // 8. 계산 정보
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .message("DSR 계산이 완료되었습니다.")
                .build();
    }

    /**
     * DSR 한도 기준 최대 대출금액 역계산
     * DSR = (기존 대출 연상환액 + 신규 대출 연상환액) / 연소득 * 100
     * 신규 대출 연상환액 = (DSR 한도 * 연소득 / 100) - 기존 대출 연상환액
     * 신규 대출금액 = 신규 대출 연상환액을 역으로 계산
     */
    private BigDecimal calculateMaxLoanAmountForDsrLimit(BigDecimal annualIncome, BigDecimal existingLoanAnnualPayment,
                                                         BigDecimal interestRate, Integer loanPeriod, BigDecimal dsrLimit) {
        log.info("DSR 한도 기준 최대 대출금액 역계산 시작 - 연소득: {}, 기존연상환액: {}, 금리: {}%, 기간: {}년, DSR한도: {}%",
                annualIncome, existingLoanAnnualPayment, interestRate, loanPeriod, dsrLimit);

        // 1. DSR 한도 기준 최대 연상환액 계산
        BigDecimal maxTotalAnnualPayment = CalculationUtil.calculatePercentage(annualIncome, dsrLimit);
        log.info("DSR 한도 기준 최대 총 연상환액: {}원", maxTotalAnnualPayment);

        // 2. 신규 대출 가능 연상환액 계산
        BigDecimal maxNewLoanAnnualPayment = maxTotalAnnualPayment.subtract(existingLoanAnnualPayment);
        log.info("신규 대출 가능 연상환액: {}원", maxNewLoanAnnualPayment);

        // 3. 음수인 경우 0으로 설정 (기존 대출이 이미 DSR 한도를 초과)
        if (maxNewLoanAnnualPayment.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("기존 대출이 이미 DSR 한도를 초과하여 신규 대출 불가능");
            return BigDecimal.ZERO;
        }

        // 4. 신규 대출 연상환액을 대출금액으로 역계산
        BigDecimal maxLoanAmount = calculateLoanAmountFromAnnualPayment(maxNewLoanAnnualPayment, interestRate, loanPeriod);
        log.info("DSR 한도 기준 최대 대출금액: {}원", maxLoanAmount);

        return maxLoanAmount;
    }

    /**
     * 기존 대출 연간 원리금 상환액 계산 (repay_method 기반)
     */
    public BigDecimal calculateExistingLoanAnnualPayment(Long userId) {
        log.info("기존 대출 연간 원리금 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualPayment = BigDecimal.ZERO;

        try {
            // 1. 은행 대출 연간 원리금 계산
            BigDecimal bankLoanAnnualPayment = calculateBankLoanAnnualPaymentByRepayMethod(userId);
            totalAnnualPayment = totalAnnualPayment.add(bankLoanAnnualPayment);
            log.info("은행 대출 연간 원리금 계산 완료 - userId: {}, bankLoanAnnualPayment: {}", userId, bankLoanAnnualPayment);

            // 2. 할부 대출 연간 원리금 계산
            BigDecimal installmentLoanAnnualPayment = calculateInstallmentLoanAnnualPaymentByRepayMethod(userId);
            totalAnnualPayment = totalAnnualPayment.add(installmentLoanAnnualPayment);
            log.info("할부 대출 연간 원리금 계산 완료 - userId: {}, installmentLoanAnnualPayment: {}", userId, installmentLoanAnnualPayment);

            // 3. 카드 대출 연간 원리금 계산
            BigDecimal cardLoanAnnualPayment = calculateCardLoanAnnualPaymentByRepayMethod(userId);
            totalAnnualPayment = totalAnnualPayment.add(cardLoanAnnualPayment);
            log.info("카드 대출 연간 원리금 계산 완료 - userId: {}, cardLoanAnnualPayment: {}", userId, cardLoanAnnualPayment);

            // 4. 보험 대출 연간 원리금 계산
            BigDecimal insuranceLoanAnnualPayment = calculateInsuranceLoanAnnualPaymentByRepayMethod(userId);
            totalAnnualPayment = totalAnnualPayment.add(insuranceLoanAnnualPayment);
            log.info("보험 대출 연간 원리금 계산 완료 - userId: {}, insuranceLoanAnnualPayment: {}", userId, insuranceLoanAnnualPayment);

            log.info("기존 대출 연간 원리금 계산 완료 - userId: {}, totalAnnualPayment: {}", userId, totalAnnualPayment);

        } catch (Exception e) {
            log.warn("기존 대출 연간 원리금 계산 실패: {}", e.getMessage());
        }

        return totalAnnualPayment;
    }

    /**
     * 할부 대출 연간 원리금 계산 (repay_method 기반)
     */
    private BigDecimal calculateInstallmentLoanAnnualPaymentByRepayMethod(Long userId) {
        log.info("할부 대출 연간 원리금 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualPayment = BigDecimal.ZERO;

        try {
            List<MdInstallmentLoanResponseDto> installmentLoans = mdInstallmentLoanService.getInstallmentLoansByUserId(userId);
            log.info("할부 대출 조회 완료 - userId: {}, 대출건수: {}", userId, installmentLoans.size());

            for (MdInstallmentLoanResponseDto loan : installmentLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null && loan.getRepayMethod() != null) {
                    BigDecimal balanceAmt = loan.getBalanceAmt();
                    BigDecimal interestRate = loan.getIntRate();
                    String repayMethod = loan.getRepayMethod();
                    LocalDate maturityDate = parseMaturityDate(loan.getMaturityDate());

                    log.info("할부 대출 상세 정보 - instLoanId: {}, repayMethod: {}, balanceAmt: {}, interestRate: {}%, maturityDate: {}",
                            loan.getInstLoanId(), repayMethod, balanceAmt, interestRate, maturityDate);

                    BigDecimal annualPayment = calculateLoanAnnualPaymentByRepayMethod(balanceAmt, interestRate, repayMethod, maturityDate);
                    totalAnnualPayment = totalAnnualPayment.add(annualPayment);

                    log.info("할부 대출 연간 원리금 계산 - instLoanId: {}, annualPayment: {}", loan.getInstLoanId(), annualPayment);
                }
            }

        } catch (Exception e) {
            log.warn("할부 대출 연간 원리금 계산 중 오류 발생: {}", e.getMessage());
        }

        return totalAnnualPayment;
    }

    /**
     * 보험 대출 연간 원리금 계산 (repay_method 기반)
     */
    private BigDecimal calculateInsuranceLoanAnnualPaymentByRepayMethod(Long userId) {
        log.info("보험 대출 연간 원리금 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualPayment = BigDecimal.ZERO;

        try {
            List<MdInsuranceLoanResponseDto> insuranceLoans = mdInsuranceLoanService.getInsuranceLoansByUserId(userId);
            log.info("보험 대출 조회 완료 - userId: {}, 대출건수: {}", userId, insuranceLoans.size());

            for (MdInsuranceLoanResponseDto loan : insuranceLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null) {
                    BigDecimal balanceAmt = loan.getBalanceAmt();
                    BigDecimal interestRate = loan.getIntRate();
                    LocalDate maturityDate = parseMaturityDate(loan.getMaturityDate());

                    log.info("보험 대출 상세 정보 - insLoanId: {}, balanceAmt: {}, interestRate: {}%, maturityDate: {}",
                            loan.getInsLoanId(), balanceAmt, interestRate, maturityDate);

                    String repayMethod = "원리금균등";
                    BigDecimal annualPayment = calculateLoanAnnualPaymentByRepayMethod(balanceAmt, interestRate, repayMethod, maturityDate);
                    totalAnnualPayment = totalAnnualPayment.add(annualPayment);

                    log.info("보험 대출 연간 원리금 계산 - insLoanId: {}, repayMethod: {}, annualPayment: {}",
                            loan.getInsLoanId(), repayMethod, annualPayment);
                }
            }

        } catch (Exception e) {
            log.warn("보험 대출 연간 원리금 계산 중 오류 발생: {}", e.getMessage());
        }

        return totalAnnualPayment;
    }

    /**
     * 연상환액으로부터 대출금액 역계산
     * 원리금균등상환 공식의 역계산
     */
    private BigDecimal calculateLoanAmountFromAnnualPayment(BigDecimal annualPayment, BigDecimal interestRate, Integer loanPeriod) {
        BigDecimal monthlyPayment = CalculationUtil.convertAnnualToMonthly(annualPayment);
        BigDecimal monthlyRate = interestRate.divide(CalculationConstants.PERCENTAGE_DIVISOR).divide(CalculationConstants.MONTHS_PER_YEAR, CalculationConstants.DEFAULT_SCALE, RoundingMode.HALF_UP);
        int totalMonths = loanPeriod * 12;

        log.info("역계산 파라미터 - 월상환액: {}, 월금리: {}%, 총개월수: {}", monthlyPayment, monthlyRate.multiply(BigDecimal.valueOf(100)), totalMonths);

        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            // 무이자인 경우
            BigDecimal loanAmount = monthlyPayment.multiply(BigDecimal.valueOf(totalMonths));
            log.info("무이자 대출금액: {}원", loanAmount);
            return loanAmount;
        }

        // 원리금균등상환 공식의 역계산
        // P = M * ((1+r)^n - 1) / (r * (1+r)^n)
        BigDecimal numerator = BigDecimal.ONE.add(monthlyRate).pow(totalMonths).subtract(BigDecimal.ONE);
        BigDecimal denominator = monthlyRate.multiply(BigDecimal.ONE.add(monthlyRate).pow(totalMonths));
        BigDecimal loanAmount = monthlyPayment.multiply(numerator).divide(denominator, 0, RoundingMode.HALF_UP);

        log.info("역계산 결과 - 대출금액: {}원", loanAmount);
        return loanAmount;
    }

    /**
     * 카드 대출 연간 원리금 계산 (repay_method 기반)
     */
    private BigDecimal calculateCardLoanAnnualPaymentByRepayMethod(Long userId) {
        log.info("카드 대출 연간 원리금 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualPayment = BigDecimal.ZERO;

        try {
            List<MdCardResponseDto> cardsByUserId = mdCardService.getCardsByUserId(userId);
            log.info("카드 조회 완료 - userId: {}, 카드수: {}", userId, cardsByUserId.size());

            for (MdCardResponseDto card : cardsByUserId) {
                List<MdCardLoanResponseDto> cardLoans = mdCardLoanService.getCardLoansByCardId(card.getCardId());
                log.info("카드 대출 조회 완료 - cardId: {}, 대출건수: {}", card.getCardId(), cardLoans.size());

                for (MdCardLoanResponseDto cardLoan : cardLoans) {
                    if (cardLoan.getBalanceAmt() != null && cardLoan.getIntRate() != null) {
                        BigDecimal balanceAmt = cardLoan.getBalanceAmt();
                        BigDecimal interestRate = cardLoan.getIntRate();
                        LocalDate maturityDate = parseMaturityDate(cardLoan.getMaturityDate());

                        // 카드 대출은 일반적으로 원금균등상환이나 만기일시상환
                        String repayMethod = "원금균등"; // 기본값, 실제로는 카드 대출 테이블에 repay_method 필드가 있어야 함

                        log.info("카드 대출 상세 정보 - cardLoanId: {}, repayMethod: {}, balanceAmt: {}, interestRate: {}%, maturityDate: {}",
                                cardLoan.getCardLoanId(), repayMethod, balanceAmt, interestRate, maturityDate);

                        BigDecimal annualPayment = calculateLoanAnnualPaymentByRepayMethod(balanceAmt, interestRate, repayMethod, maturityDate);
                        totalAnnualPayment = totalAnnualPayment.add(annualPayment);

                        log.info("카드 대출 연간 원리금 계산 - cardLoanId: {}, annualPayment: {}", cardLoan.getCardLoanId(), annualPayment);
                    }
                }
            }

        } catch (Exception e) {
            log.warn("카드 대출 연간 원리금 계산 중 오류 발생: {}", e.getMessage());
        }

        return totalAnnualPayment;
    }

    /**
     * 은행 대출 연간 원리금 계산 (repay_method 기반)
     */
    private BigDecimal calculateBankLoanAnnualPaymentByRepayMethod(Long userId) {
        log.info("은행 대출 연간 원리금 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualPayment = BigDecimal.ZERO;

        try {
            List<MdBankLoanResponseDto> bankLoans = mdBankLoanService.getBankLoansByUserId(userId);
            log.info("은행 대출 조회 완료 - userId: {}, 대출건수: {}", userId, bankLoans.size());

            for (MdBankLoanResponseDto loan : bankLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null && loan.getRepayMethod() != null) {
                    BigDecimal balanceAmt = loan.getBalanceAmt();
                    BigDecimal interestRate = loan.getIntRate();
                    String repayMethod = loan.getRepayMethod();
                    LocalDate maturityDate = loan.getMaturityDate();

                    log.info("은행 대출 상세 정보 - loanId: {}, repayMethod: {}, balanceAmt: {}, interestRate: {}%, maturityDate: {}",
                            loan.getLoanId(), repayMethod, balanceAmt, interestRate, maturityDate);

                    BigDecimal annualPayment = calculateLoanAnnualPaymentByRepayMethod(balanceAmt, interestRate, repayMethod, maturityDate);
                    totalAnnualPayment = totalAnnualPayment.add(annualPayment);

                    log.info("은행 대출 연간 원리금 계산 - loanId: {}, annualPayment: {}", loan.getLoanId(), annualPayment);
                }
            }

        } catch (Exception e) {
            log.warn("은행 대출 연간 원리금 계산 중 오류 발생: {}", e.getMessage());
        }

        return totalAnnualPayment;
    }

    /**
     * 상환방식(repay_method)에 따른 연간 원리금 계산
     */
    private BigDecimal calculateLoanAnnualPaymentByRepayMethod(BigDecimal balanceAmt, BigDecimal interestRate, String repayMethod, LocalDate maturityDate) {
        if (balanceAmt == null || interestRate == null || repayMethod == null) {
            log.warn("상환방식별 연간 원리금 계산 실패 - balanceAmt: {}, interestRate: {}, repayMethod: {}", balanceAmt, interestRate, repayMethod);
            return BigDecimal.ZERO;
        }

        BigDecimal annualPayment;

        // 상환방식에 따른 계산
        switch (repayMethod) {
            case "원리금균등":
                // 원리금균등상환: 월 상환액 × 12
                int remainingMonths = calculateRemainingMonths(maturityDate);
                BigDecimal monthlyPayment = calculateEqualPayment(balanceAmt, interestRate, remainingMonths);
                annualPayment = CalculationUtil.convertMonthlyToAnnual(monthlyPayment);
                log.info("원리금균등상환 계산 - balanceAmt: {}, interestRate: {}%, remainingMonths: {}, monthlyPayment: {}, annualPayment: {}",
                        balanceAmt, interestRate, remainingMonths, monthlyPayment, annualPayment);
                break;

            case "원금균등":
                // 원금균등상환: 연간 원리금 상환액
                int totalMonths = calculateRemainingMonths(maturityDate);
                annualPayment = calculateEqualPrincipalAnnual(balanceAmt, interestRate, totalMonths);
                log.info("원금균등상환 계산 - balanceAmt: {}, interestRate: {}%, totalMonths: {}, annualPayment: {}",
                        balanceAmt, interestRate, totalMonths, annualPayment);
                break;

            case "만기일시":
                // 만기일시상환: 연간 이자 (일반년도로 가정)
                annualPayment = calculateBulletAnnual(balanceAmt, interestRate, false);
                log.info("만기일시상환 계산 - balanceAmt: {}, interestRate: {}%, annualPayment: {}",
                        balanceAmt, interestRate, annualPayment);
                break;

            default:
                log.warn("알 수 없는 상환방식: {}, 기본값(원금균등)으로 계산", repayMethod);
                int defaultMonths = calculateRemainingMonths(maturityDate);
                annualPayment = calculateEqualPrincipalAnnual(balanceAmt, interestRate, defaultMonths);
                break;
        }

        return annualPayment;
    }


    /**
     * 상환방식별 월상환액 계산
     */
    public BigDecimal calculateMonthlyPaymentByRepayMethod(BigDecimal loanAmount, BigDecimal interestRate,
                                                           Integer loanPeriod, String repayMethod) {
        log.info("상환방식별 월상환액 계산 시작 - 대출금액: {}, 금리: {}%, 기간: {}년, 상환방식: {}",
                loanAmount, interestRate, loanPeriod, repayMethod);

        if (loanAmount == null || interestRate == null || loanPeriod == null) {
            log.warn("상환방식별 월상환액 계산 실패 - 필수 파라미터 누락");
            return BigDecimal.ZERO;
        }

        // repayMethod가 null이거나 빈 문자열인 경우 기본값 설정
        if (repayMethod == null || repayMethod.trim().isEmpty()) {
            repayMethod = CalculationConstants.REPAY_METHOD_EQUAL_PAYMENT;
            log.info("상환방식이 제공되지 않아 기본값(원리금균등)으로 설정");
        }

        int totalMonths = loanPeriod * 12;
        BigDecimal monthlyPayment;

        switch (repayMethod) {
            case CalculationConstants.REPAY_METHOD_EQUAL_PAYMENT:
                monthlyPayment = CalculationUtil.calculateEqualPayment(loanAmount, interestRate, loanPeriod);
                log.info("원리금균등상환 월상환액: {}원", monthlyPayment);
                break;

            case CalculationConstants.REPAY_METHOD_EQUAL_PRINCIPAL:
                // 원금균등의 경우 첫 해 월상환액을 계산 (점진적으로 감소하므로 평균값 사용)
                BigDecimal annualPayment = calculateEqualPrincipalAnnual(loanAmount, interestRate, totalMonths);
                monthlyPayment = CalculationUtil.convertAnnualToMonthly(annualPayment);
                log.info("원금균등상환 평균 월상환액: {}원", monthlyPayment);
                break;

            case CalculationConstants.REPAY_METHOD_BULLET:
                // 만기일시의 경우 월 이자만 계산
                BigDecimal monthlyInterest = CalculationUtil.calculatePercentage(loanAmount, interestRate)
                        .divide(CalculationConstants.MONTHS_PER_YEAR, CalculationConstants.AMOUNT_SCALE, RoundingMode.HALF_UP);
                monthlyPayment = monthlyInterest;
                log.info("만기일시상환 월이자: {}원", monthlyPayment);
                break;

            default:
                log.warn("알 수 없는 상환방식: {}, 기본값(원리금균등)으로 계산", repayMethod);
                monthlyPayment = CalculationUtil.calculateEqualPayment(loanAmount, interestRate, loanPeriod);
                break;
        }

        return monthlyPayment;
    }

    /**
     * 원금 균등분할상환 (Equal Principal Payment) 연간 상환액 계산
     * 매월 원금 상환액 = P / n, 매월 이자 = 잔액 × r
     * 반환값: 연간 원리금 상환액
     */
    private BigDecimal calculateEqualPrincipalAnnual(BigDecimal principalAmt, BigDecimal annualRate, int months) {
        if (principalAmt == null || annualRate == null || months <= 0) {
            log.warn("원금균등상환 계산 실패 - principalAmt: {}, annualRate: {}, months: {}", principalAmt, annualRate, months);
            return BigDecimal.ZERO;
        }

        double principalAmtDouble = principalAmt.doubleValue();
        double annualRateDouble = annualRate.doubleValue();

        double monthlyRate = annualRateDouble / 100.0 / 12.0;
        double monthlyPrincipal = principalAmtDouble / months;
        double total = 0;

        // 1년치(12개월)만 계산
        int monthsToCalculate = Math.min(12, months);

        for (int m = 0; m < monthsToCalculate; m++) {
            double remaining = principalAmtDouble - (monthlyPrincipal * m);
            double monthlyInterest = remaining * monthlyRate;
            double monthlyPayment = monthlyPrincipal + monthlyInterest;
            total += monthlyPayment;

            log.debug("원금균등상환 월별 계산 - 월: {}, 잔액: {}, 월원금: {}, 월이자: {}, 월상환액: {}",
                    m + 1, remaining, monthlyPrincipal, monthlyInterest, monthlyPayment);
        }

        BigDecimal result = BigDecimal.valueOf(total).setScale(0, RoundingMode.HALF_UP);
        log.info("원금균등상환 연간 계산 - 원금: {}, 연이율: {}%, 총개월수: {}, 연간상환액: {}",
                principalAmt, annualRate, months, result);

        return result;
    }

    /**
     * DSR 상태 판단
     */
    private String determineDsrStatus(BigDecimal calculatedDsr, Integer dsrLimit) {
        if (dsrLimit == null) {
            return "미설정";
        }
        return CalculationUtil.determineStatus(calculatedDsr, dsrLimit, CalculationConstants.DTI_DSR_WARNING_THRESHOLD.intValue());
    }

    /**
     * 문자열 형태의 만기일을 LocalDate로 변환
     */
    private LocalDate parseMaturityDate(String maturityDateStr) {
        if (maturityDateStr == null || maturityDateStr.trim().isEmpty()) {
            return null;
        }

        try {
            return LocalDate.parse(maturityDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e) {
            log.warn("만기일 파싱 실패: {}", maturityDateStr, e);
            return null;
        }
    }

    /**
     * 기존 대출 건수 조회
     */
    private Integer getExistingLoanCount(Long userId) {
        int count = 0;

        try {
            // 은행 대출 건수 (간단히 1건으로 가정, 실제로는 MyData에서 조회)
            count += 1;

            // 카드 대출 건수
            List<MdCardResponseDto> cardsByUserId = mdCardService.getCardsByUserId(userId);
            for (MdCardResponseDto card : cardsByUserId) {
                List<MdCardLoanResponseDto> cardLoans = mdCardLoanService.getCardLoansByCardId(card.getCardId());
                count += cardLoans.size();
            }
        } catch (Exception e) {
            log.warn("기존 대출 건수 조회 실패: {}", e.getMessage());
        }

        return count;
    }

    /**
     * MY_DATA 사용자 ID로 연소득 조회
     */
    private AnnualIncomeResponseDto getAnnualIncomeByCiInternal(Long userId) {
        log.info("MY_DATA 사용자 ID로 연소득 조회 시작 - userId: {}", userId);

        try {
            // MY_DATA 사용자 ID로 연소득 조회
            AnnualIncomeResponseDto myDataIncome = mdBankTransactionService.getAnnualIncomeByUserId(userId);

            // calculation 도메인의 AnnualIncomeResponseDto로 변환
            AnnualIncomeResponseDto annualIncome = AnnualIncomeResponseDto.builder()
                    .annualIncome(myDataIncome.getAnnualIncome())
                    .averageMonthlyIncome(myDataIncome.getAverageMonthlyIncome())
                    .transactionCount(myDataIncome.getTransactionCount())
                    .build();

            if (annualIncome != null && annualIncome.getAnnualIncome() != null) {
                log.info("연소득 조회 성공 - userId: {}, annualIncome: {}", userId, annualIncome.getAnnualIncome());
                return annualIncome;
            } else {
                log.warn("연소득 데이터가 없습니다 - userId: {}", userId);
                return AnnualIncomeResponseDto.builder()
                        .annualIncome(BigDecimal.ZERO)
                        .averageMonthlyIncome(BigDecimal.ZERO)
                        .transactionCount(0)
                        .build();
            }
        } catch (Exception e) {
            log.warn("MY_DATA 사용자 ID로 연소득 조회 실패: {}", e.getMessage());
            return AnnualIncomeResponseDto.builder()
                    .annualIncome(BigDecimal.ZERO)
                    .averageMonthlyIncome(BigDecimal.ZERO)
                    .transactionCount(0)
                    .build();
        }
    }
}
