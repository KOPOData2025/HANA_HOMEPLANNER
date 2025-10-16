package com.hana_ti.home_planner.domain.calculation.service;

import com.hana_ti.home_planner.domain.calculation.constants.CalculationConstants;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDtiCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDtiCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.DtiCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.DtiCalculationResponseDto;
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
public class DtiCalculationService {
    private final MdBankTransactionService mdBankTransactionService;
    private final MdInstallmentLoanService mdInstallmentLoanService;
    private final MdBankLoanService mdBankLoanService;
    private final MdCardService mdCardService;
    private final MdCardLoanService mdCardLoanService;
    private final ExternalMyDataService externalMyDataService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 부부 합계 DTI 계산 수행 (정방향 로직)
     */
    public CoupleDtiCalculationResponseDto calculateCoupleDtiWithJwt(String jwtToken, CoupleDtiCalculationRequestDto request) {
        log.info("JWT 토큰 기반 부부 합계 DTI 계산 시작 (정방향) - 지역: {}, 희망금리: {}%, 희망기간: {}년, 희망대출금액: {}, 배우자ID: {}",
                request.getRegion(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getDesiredLoanAmount(), request.getSpouseUserId());

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

        // 5. DTI 한도 설정 (기본값 40%)
        BigDecimal dtiLimit = request.getDtiLimit() != null ? request.getDtiLimit() : CalculationConstants.DEFAULT_DTI_LIMIT;
        BigDecimal maxAllowedAnnualPayment = CalculationUtil.calculatePercentage(coupleTotalAnnualIncome, dtiLimit);
        log.info("DTI 한도 계산 완료 - DTI한도: {}%, 최대허용연상환액: {}", dtiLimit, maxAllowedAnnualPayment);

        // 6. 부부 합계 기존 대출 정보 조회 및 연간 상환액 계산
        DtiLoanInfo userExistingLoanInfo = calculateExistingLoanInfoForDti(mdUserId);
        DtiLoanInfo spouseExistingLoanInfo = calculateExistingLoanInfoForDti(spouseMdUserId);

        BigDecimal coupleExistingMortgageAnnualPayment = userExistingLoanInfo.getMortgageAnnualPayment().add(spouseExistingLoanInfo.getMortgageAnnualPayment());
        BigDecimal coupleExistingOtherLoanAnnualInterest = userExistingLoanInfo.getOtherLoanAnnualInterest().add(spouseExistingLoanInfo.getOtherLoanAnnualInterest());
        BigDecimal coupleTotalExistingAnnualPayment = coupleExistingMortgageAnnualPayment.add(coupleExistingOtherLoanAnnualInterest);
        Integer coupleExistingLoanCount = userExistingLoanInfo.getLoanCount() + spouseExistingLoanInfo.getLoanCount();

        log.info("부부 합계 기존 대출 정보 계산 완료 - 주담대연상환액: {}, 기타대출연이자: {}, 총연상환액: {}, 대출건수: {}",
                coupleExistingMortgageAnnualPayment, coupleExistingOtherLoanAnnualInterest, coupleTotalExistingAnnualPayment, coupleExistingLoanCount);

        // 7. 희망 대출의 월상환액 및 연상환액 계산
        BigDecimal desiredLoanMonthlyPayment = calculateMonthlyPayment(request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod());
        BigDecimal desiredLoanAnnualPayment = CalculationUtil.convertMonthlyToAnnual(desiredLoanMonthlyPayment);
        log.info("희망 대출 상환액 계산 완료 - 대출금액: {}, 금리: {}%, 기간: {}년, 월상환액: {}, 연상환액: {}",
                request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(),
                desiredLoanMonthlyPayment, desiredLoanAnnualPayment);

        // 8. 총 연간 상환액 계산 (부부합계 기존 + 희망대출)
        BigDecimal totalAnnualPayment = coupleTotalExistingAnnualPayment.add(desiredLoanAnnualPayment);
        log.info("총 연간 상환액 계산 완료 - 부부합계기존상환액: {}, 희망상환액: {}, 총연상환액: {}",
                coupleTotalExistingAnnualPayment, desiredLoanAnnualPayment, totalAnnualPayment);

        // 9. DTI 비율 계산
        BigDecimal dtiRatio = CalculationUtil.calculateRatio(totalAnnualPayment, coupleTotalAnnualIncome);
        log.info("DTI 비율 계산 완료 - 총연상환액: {}, 부부합계연소득: {}, DTI비율: {}%",
                totalAnnualPayment, coupleTotalAnnualIncome, dtiRatio);

        // 10. DTI 상태 판단
        String dtiStatus;
        BigDecimal availableAnnualPayment;
        if (dtiRatio.compareTo(dtiLimit) <= 0) {
            dtiStatus = "PASS";
            availableAnnualPayment = maxAllowedAnnualPayment.subtract(totalAnnualPayment);
            log.info("DTI 상태 판단 완료 - 상태: {}, 추가가능연상환액: {}", dtiStatus, availableAnnualPayment);
        } else {
            dtiStatus = "FAIL";
            availableAnnualPayment = BigDecimal.ZERO;
            log.warn("DTI 상태 판단 완료 - 상태: {}, DTI비율: {}%, DTI한도: {}%, 초과금액: {}",
                    dtiStatus, dtiRatio, dtiLimit, totalAnnualPayment.subtract(maxAllowedAnnualPayment));
        }

        // 11. DTI 한도 기준 최대 대출금액 역계산
        BigDecimal maxLoanAmountForDtiLimit = calculateMaxLoanAmountForDtiLimit(
                coupleTotalAnnualIncome, coupleTotalExistingAnnualPayment, request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), dtiLimit);

        // 12. DTI 한도 기준 상환액 계산
        BigDecimal maxMonthlyPaymentForDtiLimit = calculateMonthlyPayment(maxLoanAmountForDtiLimit, request.getDesiredInterestRate(), request.getDesiredLoanPeriod());
        BigDecimal maxAnnualPaymentForDtiLimit = CalculationUtil.convertMonthlyToAnnual(maxMonthlyPaymentForDtiLimit);

        log.info("부부 합계 DTI 한도 기준 최대 대출금액 - 대출금액: {}원, 월상환액: {}원, 연상환액: {}원",
                maxLoanAmountForDtiLimit, maxMonthlyPaymentForDtiLimit, maxAnnualPaymentForDtiLimit);

        return CoupleDtiCalculationResponseDto.builder()
                // 1. 사용자 정보
                .region(request.getRegion())
                .coupleTotalAnnualIncome(coupleTotalAnnualIncome)
                .spouseAnnualIncome(spouseAnnualIncome.getAnnualIncome())
                .dtiLimit(dtiLimit)
                .maxAllowedAnnualPayment(maxAllowedAnnualPayment)

                // 2. 부부 합계 기존 대출 정보
                .coupleExistingMortgageAnnualPayment(coupleExistingMortgageAnnualPayment)
                .coupleExistingOtherLoanAnnualInterest(coupleExistingOtherLoanAnnualInterest)
                .coupleTotalExistingAnnualPayment(coupleTotalExistingAnnualPayment)
                .coupleExistingLoanCount(coupleExistingLoanCount)

                // 3. 신규 대출 정보
                .desiredInterestRate(request.getDesiredInterestRate())
                .desiredLoanPeriod(BigDecimal.valueOf(request.getDesiredLoanPeriod()))
                .desiredLoanAmount(request.getDesiredLoanAmount())
                .desiredLoanAnnualPayment(desiredLoanAnnualPayment)
                .desiredLoanMonthlyPayment(desiredLoanMonthlyPayment)

                // 4. DTI 계산 결과
                .totalAnnualPayment(totalAnnualPayment)
                .dtiRatio(dtiRatio)
                .dtiStatus(dtiStatus)
                .availableAnnualPayment(availableAnnualPayment)

                // 5. DTI 한도 기준 대출금액 정보
                .maxLoanAmountForDtiLimit(maxLoanAmountForDtiLimit)
                .maxMonthlyPaymentForDtiLimit(maxMonthlyPaymentForDtiLimit)
                .maxAnnualPaymentForDtiLimit(maxAnnualPaymentForDtiLimit)

                // 6. 계산 정보
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .message("부부 합계 DTI 계산이 완료되었습니다.")
                .build();
    }

    /**
     * JWT 토큰 기반 DTI 계산 수행 (정방향 로직)
     */
    public DtiCalculationResponseDto calculateDtiWithJwt(String jwtToken, DtiCalculationRequestDto request) {
        log.info("JWT 토큰 기반 DTI 계산 시작 (정방향) - 지역: {}, 희망금리: {}%, 희망기간: {}년, 희망대출금액: {}",
                request.getRegion(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getDesiredLoanAmount());

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

        // 4. DTI 한도 설정 (기본값 40%)
        BigDecimal dtiLimit = request.getDtiLimit() != null ? request.getDtiLimit() : CalculationConstants.DEFAULT_DTI_LIMIT;
        BigDecimal maxAllowedAnnualPayment = CalculationUtil.calculatePercentage(totalAnnualIncome, dtiLimit);
        log.info("DTI 한도 계산 완료 - DTI한도: {}%, 최대허용연상환액: {}", dtiLimit, maxAllowedAnnualPayment);

        // 5. 기존 대출 정보 조회 및 연간 상환액 계산
        DtiLoanInfo existingLoanInfo =
                calculateExistingLoanInfoForDti(mdUserId);
        log.info("기존 대출 정보 계산 완료 - 주담대연상환액: {}, 기타대출연이자: {}, 총연상환액: {}, 대출건수: {}",
                existingLoanInfo.getMortgageAnnualPayment(), existingLoanInfo.getOtherLoanAnnualInterest(),
                existingLoanInfo.getTotalAnnualPayment(), existingLoanInfo.getLoanCount());

        // 6. 희망 대출의 월상환액 및 연상환액 계산
        BigDecimal desiredLoanMonthlyPayment = calculateMonthlyPaymentByRepayMethod(request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getRepayMethod());
        BigDecimal desiredLoanAnnualPayment = CalculationUtil.convertMonthlyToAnnual(desiredLoanMonthlyPayment);
        log.info("희망 대출 상환액 계산 완료 - 대출금액: {}, 금리: {}%, 기간: {}년, 상환방식: {}, 월상환액: {}, 연상환액: {}",
                request.getDesiredLoanAmount(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), request.getRepayMethod(),
                desiredLoanMonthlyPayment, desiredLoanAnnualPayment);

        // 7. 총 연간 상환액 계산 (기존 + 희망대출)
        BigDecimal totalAnnualPayment = existingLoanInfo.getTotalAnnualPayment().add(desiredLoanAnnualPayment);
        log.info("총 연간 상환액 계산 완료 - 기존상환액: {}, 희망상환액: {}, 총연상환액: {}",
                existingLoanInfo.getTotalAnnualPayment(), desiredLoanAnnualPayment, totalAnnualPayment);

        // 8. DTI 비율 계산
        BigDecimal dtiRatio = CalculationUtil.calculateRatio(totalAnnualPayment, totalAnnualIncome);
        log.info("DTI 비율 계산 완료 - 총연상환액: {}, 연소득: {}, DTI비율: {}%",
                totalAnnualPayment, totalAnnualIncome, dtiRatio);

        // 9. DTI 상태 판단
        String dtiStatus;
        BigDecimal availableAnnualPayment;
        if (dtiRatio.compareTo(dtiLimit) <= 0) {
            dtiStatus = "PASS";
            availableAnnualPayment = maxAllowedAnnualPayment.subtract(totalAnnualPayment);
            log.info("DTI 상태 판단 완료 - 상태: {}, 추가가능연상환액: {}", dtiStatus, availableAnnualPayment);
        } else {
            dtiStatus = "FAIL";
            availableAnnualPayment = BigDecimal.ZERO;
            log.warn("DTI 상태 판단 완료 - 상태: {}, DTI비율: {}%, DTI한도: {}%, 초과금액: {}",
                    dtiStatus, dtiRatio, dtiLimit, totalAnnualPayment.subtract(maxAllowedAnnualPayment));
        }

        // 10. DTI 한도 기준 최대 대출금액 역계산
        BigDecimal maxLoanAmountForDtiLimit = calculateMaxLoanAmountForDtiLimit(
                totalAnnualIncome, existingLoanInfo.getTotalAnnualPayment(), request.getDesiredInterestRate(), request.getDesiredLoanPeriod(), dtiLimit);

        // 11. DTI 한도 기준 상환액 계산
        BigDecimal maxMonthlyPaymentForDtiLimit = calculateMonthlyPayment(maxLoanAmountForDtiLimit, request.getDesiredInterestRate(), request.getDesiredLoanPeriod());
        BigDecimal maxAnnualPaymentForDtiLimit = CalculationUtil.convertMonthlyToAnnual(maxMonthlyPaymentForDtiLimit);

        log.info("DTI 한도 기준 최대 대출금액 - 대출금액: {}원, 월상환액: {}원, 연상환액: {}원",
                maxLoanAmountForDtiLimit, maxMonthlyPaymentForDtiLimit, maxAnnualPaymentForDtiLimit);

        return DtiCalculationResponseDto.builder()
                // 1. 사용자 정보
                .region(request.getRegion())
                .annualIncome(totalAnnualIncome)
                .dtiLimit(dtiLimit)
                .maxAllowedAnnualPayment(maxAllowedAnnualPayment)

                // 2. 기존 대출 정보
                .existingMortgageAnnualPayment(existingLoanInfo.getMortgageAnnualPayment())
                .existingOtherLoanAnnualInterest(existingLoanInfo.getOtherLoanAnnualInterest())
                .totalExistingAnnualPayment(existingLoanInfo.getTotalAnnualPayment())
                .existingLoanCount(existingLoanInfo.getLoanCount())

                // 3. 신규 대출 정보
                .desiredInterestRate(request.getDesiredInterestRate())
                .desiredLoanPeriod(BigDecimal.valueOf(request.getDesiredLoanPeriod()))
                .desiredLoanAmount(request.getDesiredLoanAmount())
                .desiredLoanAnnualPayment(desiredLoanAnnualPayment)
                .desiredLoanMonthlyPayment(desiredLoanMonthlyPayment)

                // 4. DTI 계산 결과
                .totalAnnualPayment(totalAnnualPayment)
                .dtiRatio(dtiRatio)
                .dtiStatus(dtiStatus)
                .availableAnnualPayment(availableAnnualPayment)

                // 5. DTI 한도 기준 대출금액 정보
                .maxLoanAmountForDtiLimit(maxLoanAmountForDtiLimit)
                .maxMonthlyPaymentForDtiLimit(maxMonthlyPaymentForDtiLimit)
                .maxAnnualPaymentForDtiLimit(maxAnnualPaymentForDtiLimit)

                // 6. 계산 정보
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .message("DTI 계산이 완료되었습니다.")
                .build();
    }

    /**
     * DTI 한도 기준 최대 대출금액 역계산
     * DTI = (기존 대출 연상환액 + 신규 대출 연상환액) / 연소득 × 100
     * 신규 대출 연상환액 = (DTI 한도 × 연소득 / 100) - 기존 대출 연상환액
     * 신규 대출금액 = 신규 대출 연상환액을 역으로 계산
     */
    private BigDecimal calculateMaxLoanAmountForDtiLimit(BigDecimal annualIncome, BigDecimal existingLoanAnnualPayment,
                                                         BigDecimal interestRate, Integer loanPeriod, BigDecimal dtiLimit) {
        log.info("DTI 한도 기준 최대 대출금액 역계산 시작 - 연소득: {}, 기존연상환액: {}, 금리: {}%, 기간: {}년, DTI한도: {}%",
                annualIncome, existingLoanAnnualPayment, interestRate, loanPeriod, dtiLimit);

        // 1. DTI 한도 기준 최대 총 연상환액 계산
        BigDecimal maxTotalAnnualPayment = CalculationUtil.calculatePercentage(annualIncome, dtiLimit);
        log.info("DTI 한도 기준 최대 총 연상환액: {}원", maxTotalAnnualPayment);

        // 2. 신규 대출 가능 연상환액 계산
        BigDecimal maxNewLoanAnnualPayment = maxTotalAnnualPayment.subtract(existingLoanAnnualPayment);
        log.info("신규 대출 가능 연상환액: {}원", maxNewLoanAnnualPayment);

        // 3. 음수인 경우 0으로 설정 (기존 대출이 이미 DTI 한도를 초과)
        if (maxNewLoanAnnualPayment.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("기존 대출이 이미 DTI 한도를 초과하여 신규 대출 불가능");
            return BigDecimal.ZERO;
        }

        // 4. 신규 대출 연상환액을 대출금액으로 역계산
        BigDecimal maxLoanAmount = calculateLoanAmountFromAnnualPayment(maxNewLoanAnnualPayment, interestRate, loanPeriod);
        log.info("DTI 한도 기준 최대 대출금액: {}원", maxLoanAmount);

        return maxLoanAmount;
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
     * 월 상환액 계산 (원리금균등상환)
     */
    private BigDecimal calculateMonthlyPayment(BigDecimal loanAmount, BigDecimal interestRate, Integer loanPeriod) {
        return calculateEqualPayment(loanAmount, interestRate, loanPeriod);
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
     * DTI 계산용 기존 대출 정보 계산
     * 주택담보대출: 원리금 상환액, 기타대출: 이자만
     */
    private DtiLoanInfo calculateExistingLoanInfoForDti(Long userId) {
        log.info("DTI 계산용 기존 대출 정보 계산 시작 - userId: {}", userId);

        BigDecimal mortgageAnnualPayment = BigDecimal.ZERO; // 주택담보대출 연간 원리금
        BigDecimal otherLoanAnnualInterest = BigDecimal.ZERO; // 기타대출 연간 이자
        int loanCount = 0;

        try {
            // 1. 은행 대출 조회 및 분류
            DtiLoanInfo bankLoanInfo = calculateBankLoanInfoForDti(userId);
            mortgageAnnualPayment = mortgageAnnualPayment.add(bankLoanInfo.getMortgageAnnualPayment());
            otherLoanAnnualInterest = otherLoanAnnualInterest.add(bankLoanInfo.getOtherLoanAnnualInterest());
            loanCount += bankLoanInfo.getLoanCount();

            log.info("은행 대출 DTI 계산 완료 - 주담대연상환액: {}, 기타대출연이자: {}, 대출건수: {}",
                    bankLoanInfo.getMortgageAnnualPayment(), bankLoanInfo.getOtherLoanAnnualInterest(), bankLoanInfo.getLoanCount());

            // 2. 할부 대출 조회 (기타대출로 분류)
            BigDecimal installmentLoanInterest = calculateInstallmentLoanInterestForDti(userId);
            otherLoanAnnualInterest = otherLoanAnnualInterest.add(installmentLoanInterest);
            loanCount += installmentLoanInterest.intValue() > 0 ? 1 : 0;

            log.info("할부 대출 DTI 계산 완료 - 연이자: {}", installmentLoanInterest);

            // 3. 카드 대출 조회 (기타대출로 분류)
            BigDecimal cardLoanInterest = calculateCardLoanInterestForDti(userId);
            otherLoanAnnualInterest = otherLoanAnnualInterest.add(cardLoanInterest);
            loanCount += cardLoanInterest.intValue() > 0 ? 1 : 0;

            log.info("카드 대출 DTI 계산 완료 - 연이자: {}", cardLoanInterest);

            BigDecimal totalAnnualPayment = mortgageAnnualPayment.add(otherLoanAnnualInterest);

            log.info("DTI 계산용 기존 대출 정보 계산 완료 - 주담대연상환액: {}, 기타대출연이자: {}, 총연상환액: {}, 대출건수: {}",
                    mortgageAnnualPayment, otherLoanAnnualInterest, totalAnnualPayment, loanCount);

            return new DtiLoanInfo(mortgageAnnualPayment, otherLoanAnnualInterest, totalAnnualPayment, loanCount);

        } catch (Exception e) {
            log.warn("DTI 계산용 기존 대출 정보 계산 실패: {}", e.getMessage());
            return new DtiLoanInfo(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0);
        }
    }

    /**
     * 은행 대출 DTI 계산 (주택담보대출 vs 기타대출 구분)
     */
    private DtiLoanInfo calculateBankLoanInfoForDti(Long userId) {
        log.info("은행 대출 DTI 계산 시작 - userId: {}", userId);

        BigDecimal mortgageAnnualPayment = BigDecimal.ZERO;
        BigDecimal otherLoanAnnualInterest = BigDecimal.ZERO;
        int loanCount = 0;

        try {
            List<MdBankLoanResponseDto> bankLoans = mdBankLoanService.getBankLoansByUserId(userId);
            log.info("은행 대출 조회 완료 - userId: {}, 대출건수: {}", userId, bankLoans.size());

            for (MdBankLoanResponseDto loan : bankLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null) {
                    BigDecimal balanceAmt = loan.getBalanceAmt();
                    BigDecimal interestRate = loan.getIntRate();
                    String loanType = loan.getLoanType();
                    String repayMethod = loan.getRepayMethod();
                    LocalDate maturityDate = loan.getMaturityDate();

                    log.info("은행 대출 상세 정보 - loanId: {}, loanType: {}, repayMethod: {}, balanceAmt: {}, interestRate: {}%, maturityDate: {}",
                            loan.getLoanId(), loanType, repayMethod, balanceAmt, interestRate, maturityDate);

                    // 주택담보대출 여부 판단
                    boolean isMortgageLoan = isMortgageLoan(loanType);

                    if (isMortgageLoan) {
                        // 주택담보대출: 원리금 상환액 계산
                        BigDecimal annualPayment = calculateMortgageAnnualPayment(balanceAmt, interestRate, repayMethod, maturityDate);
                        mortgageAnnualPayment = mortgageAnnualPayment.add(annualPayment);
                        log.info("주택담보대출 원리금 계산 - loanId: {}, annualPayment: {}", loan.getLoanId(), annualPayment);
                    } else {
                        // 기타대출: 이자만 계산
                        BigDecimal annualInterest = calculateOtherLoanAnnualInterest(balanceAmt, interestRate);
                        otherLoanAnnualInterest = otherLoanAnnualInterest.add(annualInterest);
                        log.info("기타대출 이자 계산 - loanId: {}, annualInterest: {}", loan.getLoanId(), annualInterest);
                    }

                    loanCount += 1;
                }
            }

        } catch (Exception e) {
            log.warn("은행 대출 DTI 계산 중 오류 발생: {}", e.getMessage());
        }

        return new DtiLoanInfo(mortgageAnnualPayment, otherLoanAnnualInterest,
                mortgageAnnualPayment.add(otherLoanAnnualInterest), loanCount);
    }

    /**
     * 할부 대출 이자 계산 (기타대출로 분류)
     */
    private BigDecimal calculateInstallmentLoanInterestForDti(Long userId) {
        log.info("할부 대출 이자 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualInterest = BigDecimal.ZERO;

        try {
            List<MdInstallmentLoanResponseDto> installmentLoans = mdInstallmentLoanService.getInstallmentLoansByUserId(userId);
            log.info("할부 대출 조회 완료 - userId: {}, 대출건수: {}", userId, installmentLoans.size());

            for (MdInstallmentLoanResponseDto loan : installmentLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null) {
                    BigDecimal balanceAmt = loan.getBalanceAmt();
                    BigDecimal interestRate = loan.getIntRate();

                    log.info("할부 대출 상세 정보 - instLoanId: {}, balanceAmt: {}, interestRate: {}%",
                            loan.getInstLoanId(), balanceAmt, interestRate);

                    // 기타대출: 이자만 계산
                    BigDecimal annualInterest = calculateOtherLoanAnnualInterest(balanceAmt, interestRate);
                    totalAnnualInterest = totalAnnualInterest.add(annualInterest);

                    log.info("할부 대출 이자 계산 - instLoanId: {}, annualInterest: {}", loan.getInstLoanId(), annualInterest);
                }
            }

        } catch (Exception e) {
            log.warn("할부 대출 이자 계산 중 오류 발생: {}", e.getMessage());
        }

        return totalAnnualInterest;
    }

    /**
     * 카드 대출 이자 계산 (기타대출로 분류)
     */
    private BigDecimal calculateCardLoanInterestForDti(Long userId) {
        log.info("카드 대출 이자 계산 시작 - userId: {}", userId);

        BigDecimal totalAnnualInterest = BigDecimal.ZERO;

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

                        log.info("카드 대출 상세 정보 - cardLoanId: {}, balanceAmt: {}, interestRate: {}%",
                                cardLoan.getCardLoanId(), balanceAmt, interestRate);

                        // 기타대출: 이자만 계산
                        BigDecimal annualInterest = calculateOtherLoanAnnualInterest(balanceAmt, interestRate);
                        totalAnnualInterest = totalAnnualInterest.add(annualInterest);

                        log.info("카드 대출 이자 계산 - cardLoanId: {}, annualInterest: {}", cardLoan.getCardLoanId(), annualInterest);
                    }
                }
            }

        } catch (Exception e) {
            log.warn("카드 대출 이자 계산 중 오류 발생: {}", e.getMessage());
        }

        return totalAnnualInterest;
    }

    /**
     * 주택담보대출 연간 원리금 상환액 계산
     */
    private BigDecimal calculateMortgageAnnualPayment(BigDecimal balanceAmt, BigDecimal interestRate, String repayMethod, LocalDate maturityDate) {
        if (balanceAmt == null || interestRate == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal annualPayment;

        if ("원리금균등".equals(repayMethod)) {
            // 원리금균등상환: 월 상환액 × 12
            int remainingMonths = calculateRemainingMonths(maturityDate);
            BigDecimal monthlyPayment = calculateEqualPayment(balanceAmt, interestRate, remainingMonths);
            annualPayment = CalculationUtil.convertMonthlyToAnnual(monthlyPayment);
            log.info("주택담보대출 원리금균등상환 계산 - balanceAmt: {}, interestRate: {}%, remainingMonths: {}, monthlyPayment: {}, annualPayment: {}",
                    balanceAmt, interestRate, remainingMonths, monthlyPayment, annualPayment);
        } else if ("원금균등".equals(repayMethod)) {
            // 원금균등상환: 연간 원리금 상환액
            int totalMonths = calculateRemainingMonths(maturityDate);
            annualPayment = calculateEqualPrincipalAnnual(balanceAmt, interestRate, totalMonths);
            log.info("주택담보대출 원금균등상환 계산 - balanceAmt: {}, interestRate: {}%, totalMonths: {}, annualPayment: {}",
                    balanceAmt, interestRate, totalMonths, annualPayment);
        } else {
            // 만기일시상환이나 기타: 연간 이자 (일반년도로 가정)
            annualPayment = calculateBulletAnnual(balanceAmt, interestRate, false);
            log.info("주택담보대출 만기일시상환 계산 - balanceAmt: {}, interestRate: {}%, annualPayment: {}",
                    balanceAmt, interestRate, annualPayment);
        }

        return annualPayment;
    }

    /**
     * 기타대출 연간 이자 계산 (원금 제외)
     */
    private BigDecimal calculateOtherLoanAnnualInterest(BigDecimal balanceAmt, BigDecimal interestRate) {
        if (balanceAmt == null || interestRate == null) {
            return BigDecimal.ZERO;
        }

        // 기타대출은 이자만 계산 (원금 × 금리)
        BigDecimal annualInterest = CalculationUtil.calculatePercentage(balanceAmt, interestRate);
        log.info("기타대출 이자 계산 - balanceAmt: {}, interestRate: {}%, annualInterest: {}",
                balanceAmt, interestRate, annualInterest);

        return annualInterest;
    }

    /**
     * DTI 계산용 기존 대출 정보 클래스
     */
    private static class DtiLoanInfo {
        private final BigDecimal mortgageAnnualPayment; // 주택담보대출 연간 원리금
        private final BigDecimal otherLoanAnnualInterest; // 기타대출 연간 이자
        private final BigDecimal totalAnnualPayment; // 총 연간 상환액
        private final Integer loanCount; // 대출 건수

        public DtiLoanInfo(BigDecimal mortgageAnnualPayment, BigDecimal otherLoanAnnualInterest,
                           BigDecimal totalAnnualPayment, Integer loanCount) {
            this.mortgageAnnualPayment = mortgageAnnualPayment;
            this.otherLoanAnnualInterest = otherLoanAnnualInterest;
            this.totalAnnualPayment = totalAnnualPayment;
            this.loanCount = loanCount;
        }

        public BigDecimal getMortgageAnnualPayment() { return mortgageAnnualPayment; }
        public BigDecimal getOtherLoanAnnualInterest() { return otherLoanAnnualInterest; }
        public BigDecimal getTotalAnnualPayment() { return totalAnnualPayment; }
        public Integer getLoanCount() { return loanCount; }
    }

    /**
     * 주택담보대출 여부 판단
     */
    private boolean isMortgageLoan(String loanType) {
        if (loanType == null) {
            return false;
        }

        String lowerLoanType = loanType.toLowerCase();
        return lowerLoanType.contains("주택담보") ||
                lowerLoanType.contains("주택대출") ||
                lowerLoanType.contains("주택") ||
                lowerLoanType.contains("mortgage");
    }
}
