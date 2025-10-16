package com.hana_ti.home_planner.domain.calculation.service;

import com.hana_ti.home_planner.domain.calculation.constants.CalculationConstants;
import com.hana_ti.home_planner.domain.calculation.dto.AnnualIncomeRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.SimpleAnnualIncomeResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.SimpleLtvCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.SimpleLtvCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.DsrCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.DsrCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.DtiCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.DtiCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleLtvCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleLtvCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDtiCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDtiCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDsrCalculationRequestDto;
import com.hana_ti.home_planner.domain.calculation.dto.CoupleDsrCalculationResponseDto;
import com.hana_ti.home_planner.domain.calculation.util.CalculationUtil;
import com.hana_ti.home_planner.domain.my_data.dto.*;
import com.hana_ti.home_planner.domain.my_data.service.*;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class LtvCalculationService {

    private final MdBankTransactionService mdBankTransactionService;
    private final MdInsuranceLoanService mdInsuranceLoanService;
    private final MdInstallmentLoanService mdInstallmentLoanService;
    private final MdBankLoanService mdBankLoanService;
    private final MdCardService mdCardService;
    private final MdCardLoanService mdCardLoanService;
    private final ExternalMyDataService externalMyDataService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    /**
     * JWT 토큰 기반 부부 합계 LTV 계산 수행 (역산 로직)
     */
    public CoupleLtvCalculationResponseDto calculateCoupleLtvWithJwt(String jwtToken, CoupleLtvCalculationRequestDto request) {
        log.info("JWT 토큰 기반 부부 합계 LTV 계산 시작 (역산) - 지역: {}, 주택가격: {}, 배우자ID: {}", 
                request.getRegion(), request.getHousePrice(), request.getSpouseUserId());

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

        // 5. LTV 계산 수행
        SimpleLtvCalculationRequestDto ltvRequest = SimpleLtvCalculationRequestDto.builder()
                .housePrice(request.getHousePrice())
                .region(request.getRegion())
                .housingStatus(request.getHousingStatus())
                .interestRate(request.getInterestRate())
                .loanPeriod(request.getLoanPeriod())
                .build();
        
        SimpleLtvCalculationResponseDto ltvResult = calculateLtvInternalEnhanced(ltvRequest);

        // 6. 부부 합계 정보를 포함한 응답 생성
        return CoupleLtvCalculationResponseDto.builder()
                // 1. 지역 규제 정보
                .region(ltvResult.getRegion())
                .regionType(ltvResult.getRegionType())
                .isRegulationArea(ltvResult.isRegulationArea())
                
                // 2. 사용자 신청 조건 및 LTV 한도
                .housingStatus(ltvResult.getHousingStatus())
                .ltvLimit(ltvResult.getLtvLimit())
                
                // 3. 대출 가능 금액 계산
                .housePrice(ltvResult.getHousePrice())
                .maxLoanAmount(ltvResult.getMaxLoanAmount())
                
                // 4. 대출 상환 계산
                .loanPeriod(ltvResult.getLoanPeriod())
                .totalRepaymentAmount(ltvResult.getTotalRepaymentAmount())
                .monthlyPayment(ltvResult.getMonthlyPayment())
                .interestRate(ltvResult.getInterestRate())
                
                // 5. 스트레스 DSR 계산
                .stressRate(ltvResult.getStressRate())
                .stressMonthlyPayment(ltvResult.getStressMonthlyPayment())
                .stressTotalRepaymentAmount(ltvResult.getStressTotalRepaymentAmount())
                
                // 6. 부부 합계 정보
                .coupleTotalAnnualIncome(coupleTotalAnnualIncome)
                .spouseAnnualIncome(spouseAnnualIncome.getAnnualIncome())
                
                // 계산 정보
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .message("부부 합계 LTV 계산이 완료되었습니다.")
                .build();
    }

    /**
     * JWT 토큰 기반 간단한 LTV 계산 수행
     */
    public SimpleLtvCalculationResponseDto calculateLtvWithJwt(String jwtToken, SimpleLtvCalculationRequestDto request) {
        log.info("JWT 토큰 기반 간단한 LTV 계산 시작 - 주택가격: {}, 지역: {}, 주택보유현황: {}", 
                request.getHousePrice(), request.getRegion(), request.getHousingStatus());

        // LTV 계산 수행 (연소득, 기존 대출 잔액 불필요)
        return calculateLtvInternalEnhanced(request);
    }

    /**
     * CI로 연소득 정보 조회 (플랜 생성용)
     */
    public AnnualIncomeResponseDto getAnnualIncomeByCi(Long userId) {
        return getAnnualIncomeByCiInternal(userId);
    }

    /**
     * CI로 기존 대출 월상환액 조회 (플랜 생성용)
     */
    public BigDecimal getExistingLoanMonthlyPaymentByCi(Long userId) {
        return calculateExistingLoanMonthlyPayment(userId);
    }

    /**
     * 최대 대출 가능 금액 계산
     */
    private BigDecimal calculateMaxAllowedLoanAmount(BigDecimal housePrice, Integer ltvLimit) {
        return CalculationUtil.calculateMaxAllowedLoanAmount(housePrice, ltvLimit);
    }


    /**
     * 월 상환액 계산 (원리금균등상환)
     */
    private BigDecimal calculateMonthlyPayment(BigDecimal loanAmount, BigDecimal interestRate, Integer loanPeriod) {
        return CalculationUtil.calculateEqualPayment(loanAmount, interestRate, loanPeriod);
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
     * 기존 대출의 월 상환액 계산
     */
    private BigDecimal calculateExistingLoanMonthlyPayment(Long userId) {
        log.info("기존 대출 월 상환액 계산 시작 - userId: {}", userId);
        
        BigDecimal totalMonthlyPayment = BigDecimal.ZERO;
        
        try {
            // 보험 대출 월 상환액 계산 (실제 상환방식 적용)
            List<MdInsuranceLoanResponseDto> insuranceLoans = mdInsuranceLoanService.getInsuranceLoansByUserId(userId);
            for (MdInsuranceLoanResponseDto loan : insuranceLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null) {
                    // 실제 상환방식이 있으면 사용, 없으면 원리금균등으로 기본값 설정
                    String repayMethod = loan.getRepayMethod() != null ? loan.getRepayMethod() : "원리금균등";
                    
                    // 만기일이 있으면 사용, 없으면 5년으로 가정
                    LocalDate maturityDate = parseMaturityDate(loan.getMaturityDate());
                    if (maturityDate == null) {
                        maturityDate = LocalDate.now().plusYears(5); // 기본값: 5년 후
                    }
                    
                    BigDecimal annualPayment = calculateLoanAnnualPaymentByRepayMethod(
                            loan.getBalanceAmt(), loan.getIntRate(), repayMethod, maturityDate);
                    BigDecimal monthlyPayment = CalculationUtil.convertAnnualToMonthly(annualPayment);
                    
                    totalMonthlyPayment = totalMonthlyPayment.add(monthlyPayment);
                    log.debug("보험 대출 월 상환액 추가 - loanId: {}, balance: {}, repayMethod: {}, monthlyPayment: {}", 
                            loan.getInsLoanId(), loan.getBalanceAmt(), repayMethod, monthlyPayment);
                }
            }
            
            // 할부 대출 월 상환액 계산 (실제 상환방식 적용)
            List<MdInstallmentLoanResponseDto> installmentLoans = mdInstallmentLoanService.getInstallmentLoansByUserId(userId);
            for (MdInstallmentLoanResponseDto loan : installmentLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null) {
                    // 실제 상환방식이 있으면 사용, 없으면 원리금균등으로 기본값 설정
                    String repayMethod = loan.getRepayMethod() != null ? loan.getRepayMethod() : "원리금균등";
                    
                    // 만기일이 있으면 사용, 없으면 5년으로 가정
                    LocalDate maturityDate = parseMaturityDate(loan.getMaturityDate());
                    if (maturityDate == null) {
                        maturityDate = LocalDate.now().plusYears(5); // 기본값: 5년 후
                    }
                    
                    BigDecimal annualPayment = calculateLoanAnnualPaymentByRepayMethod(
                            loan.getBalanceAmt(), loan.getIntRate(), repayMethod, maturityDate);
                    BigDecimal monthlyPayment = CalculationUtil.convertAnnualToMonthly(annualPayment);
                    
                    totalMonthlyPayment = totalMonthlyPayment.add(monthlyPayment);
                    log.debug("할부 대출 월 상환액 추가 - loanId: {}, balance: {}, repayMethod: {}, monthlyPayment: {}", 
                            loan.getInstLoanId(), loan.getBalanceAmt(), repayMethod, monthlyPayment);
                }
            }
            
            // 은행 대출 월 상환액 계산
            List<MdBankLoanResponseDto> bankLoans = mdBankLoanService.getBankLoansByUserId(userId);
            for (MdBankLoanResponseDto loan : bankLoans) {
                if (loan.getBalanceAmt() != null && loan.getIntRate() != null) {
                    BigDecimal monthlyPayment = calculateMonthlyPaymentForExistingLoan(
                            loan.getBalanceAmt(), loan.getIntRate());
                    totalMonthlyPayment = totalMonthlyPayment.add(monthlyPayment);
                    log.debug("은행 대출 월 상환액 추가 - loanId: {}, balance: {}, monthlyPayment: {}", 
                            loan.getLoanId(), loan.getBalanceAmt(), monthlyPayment);
                }
            }
            
            // 카드 대출 월 상환액 계산
            try {
                List<MdCardResponseDto> cardsByUserId = mdCardService.getCardsByUserId(userId);
                for (MdCardResponseDto card : cardsByUserId) {
                    List<MdCardLoanResponseDto> cardLoans = mdCardLoanService.getCardLoansByCardId(card.getCardId());
                    for (MdCardLoanResponseDto cardLoan : cardLoans) {
                        if (cardLoan.getBalanceAmt() != null && cardLoan.getIntRate() != null) {
                            BigDecimal monthlyPayment = calculateMonthlyPaymentForExistingLoan(
                                    cardLoan.getBalanceAmt(), cardLoan.getIntRate());
                            totalMonthlyPayment = totalMonthlyPayment.add(monthlyPayment);
                            log.debug("카드 대출 월 상환액 추가 - cardLoanId: {}, balance: {}, monthlyPayment: {}", 
                                    cardLoan.getCardLoanId(), cardLoan.getBalanceAmt(), monthlyPayment);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("카드 대출 월 상환액 계산 중 오류 발생: {}", e.getMessage());
            }
            
            log.info("기존 대출 월 상환액 계산 완료 - userId: {}, totalMonthlyPayment: {}", userId, totalMonthlyPayment);
            
        } catch (Exception e) {
            log.warn("기존 대출 월 상환액 계산 실패: {}", e.getMessage());
        }
        
        return totalMonthlyPayment;
    }

    /**
     * 원리금 균등분할상환 (Equal Payment of Principal & Interest) 계산
     * 매월 상환액 공식: M = P × r × (1+r)^n / ((1+r)^n - 1)
     * 반환값: 월 상환액
     */
    private BigDecimal calculateEqualPayment(BigDecimal principalAmt, BigDecimal annualRate, int months) {
        if (principalAmt == null || annualRate == null || months <= 0) {
            log.warn("원리금균등상환 계산 실패 - principalAmt: {}, annualRate: {}, months: {}", principalAmt, annualRate, months);
            return BigDecimal.ZERO;
        }
        
        double principalAmtDouble = principalAmt.doubleValue();
        double annualRateDouble = annualRate.doubleValue();
        
        double monthlyRate = annualRateDouble / 100.0 / 12.0;
        if (monthlyRate == 0) {
            double monthlyPayment = principalAmtDouble / months; // 무이자일 경우
            BigDecimal result = BigDecimal.valueOf(monthlyPayment).setScale(0, RoundingMode.HALF_UP);
            log.info("원리금균등상환 계산 (무이자) - 원금: {}, 개월수: {}, 월상환액: {}", principalAmt, months, result);
            return result;
        }
        
        double monthlyPayment = principalAmtDouble * monthlyRate * Math.pow(1 + monthlyRate, months)
                / (Math.pow(1 + monthlyRate, months) - 1);
        
        BigDecimal result = BigDecimal.valueOf(monthlyPayment).setScale(0, RoundingMode.HALF_UP);
        log.info("원리금균등상환 계산 - 원금: {}, 연이율: {}%, 개월수: {}, 월이율: {}%, 월상환액: {}", 
                principalAmt, annualRate, months, monthlyRate * 100, result);
        
        return result;
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
     * 만기일시상환 (Bullet Payment) 연간 상환액 계산
     * 매월 이자만 내다가 만기 시 원금을 일시 상환
     * 반환값: 연간 원리금 상환액
     */
    private BigDecimal calculateBulletAnnual(BigDecimal balanceAmt, BigDecimal annualRate, boolean isMaturityYear) {
        if (balanceAmt == null || annualRate == null) {
            log.warn("만기일시상환 계산 실패 - balanceAmt: {}, annualRate: {}", balanceAmt, annualRate);
            return BigDecimal.ZERO;
        }
        
        double balanceAmtDouble = balanceAmt.doubleValue();
        double annualRateDouble = annualRate.doubleValue();
        
        double annualInterest = balanceAmtDouble * (annualRateDouble / 100.0);
        double annualPayment;
        
        if (isMaturityYear) {
            annualPayment = annualInterest + balanceAmtDouble; // 만기년도에는 원금 포함
            log.info("만기일시상환 계산 (만기년도) - 잔액: {}, 연이율: {}%, 연이자: {}, 연간상환액: {}", 
                    balanceAmt, annualRate, annualInterest, annualPayment);
        } else {
            annualPayment = annualInterest; // 일반년도에는 이자만
            log.info("만기일시상환 계산 (일반년도) - 잔액: {}, 연이율: {}%, 연간상환액: {}", 
                    balanceAmt, annualRate, annualPayment);
        }
        
        return BigDecimal.valueOf(annualPayment).setScale(0, RoundingMode.HALF_UP);
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
     * 기존 대출의 월 상환액 계산 (원리금균등상환, 잔여기간 5년 가정)
     * @deprecated 상환방식별 계산 함수로 대체 예정
     */
    @Deprecated
    private BigDecimal calculateMonthlyPaymentForExistingLoan(BigDecimal balanceAmt, BigDecimal interestRate) {
        if (balanceAmt == null || interestRate == null) {
            return BigDecimal.ZERO;
        }
        
        // 기존 대출은 잔여기간 5년으로 가정 (실제로는 만기일 기준으로 계산해야 함)
        int remainingMonths = 60; // 5년
        BigDecimal monthlyRate = interestRate.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
                .divide(CalculationConstants.MONTHS_PER_YEAR, CalculationConstants.DEFAULT_SCALE, RoundingMode.HALF_UP);
        
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return balanceAmt.divide(BigDecimal.valueOf(remainingMonths), 0, RoundingMode.HALF_UP);
        }
        
        BigDecimal power = BigDecimal.ONE.add(monthlyRate).pow(remainingMonths);
        BigDecimal monthlyPayment = balanceAmt.multiply(monthlyRate).multiply(power)
                .divide(power.subtract(BigDecimal.ONE), 0, RoundingMode.HALF_UP);
        
        return monthlyPayment;
    }


    /**
     * 간단한 LTV 계산 내부 로직
     */
    private SimpleLtvCalculationResponseDto calculateLtvInternalEnhanced(SimpleLtvCalculationRequestDto request) {
        log.info("간단한 LTV 계산 시작 - 주택가격: {}, 지역: {}, 주택보유현황: {}", 
                request.getHousePrice(), request.getRegion(), request.getHousingStatus());

        // 1. 지역 규제 정보 조회
        boolean isRegulationArea = isRegulationRegion(request.getRegion());
        String regionType = isRegulationArea ? "투기과열지구" : "일반지역";
        log.info("지역 규제 정보 조회 완료 - 지역: {}, 규제지역: {}, 유형: {}", 
                request.getRegion(), isRegulationArea, regionType);

        // 2. 사용자 신청 조건 조회 -> LTV 한도 계산
        Integer ltvLimit = getLtvLimit(request.getRegion(), request.getHousingStatus());
        log.info("LTV 한도 계산 완료 - 주택보유현황: {}, LTV한도: {}%", 
                request.getHousingStatus(), ltvLimit);

        // 3. 사용자한테 입력받은 주택값에 LTV 한도 적용해서, 대출가능 금액 계산
        BigDecimal maxLoanAmount = calculateMaxAllowedLoanAmount(request.getHousePrice(), ltvLimit);
        log.info("최대 대출 가능 금액 계산 완료 - 주택가격: {}, LTV한도: {}%, 최대대출금액: {}", 
                request.getHousePrice(), ltvLimit, maxLoanAmount);

        // 4. 최대 대출 가능 금액 기준으로 대출 상환 계산
        BigDecimal monthlyPayment = calculateMonthlyPayment(maxLoanAmount, request.getInterestRate(), request.getLoanPeriod()); // 개월당 지불금액
        BigDecimal totalRepaymentAmount = monthlyPayment.multiply(BigDecimal.valueOf(request.getLoanPeriod() * 12)); // 총 갚아야 하는 금액 (년수 × 12개월)
        
        // 5. 스트레스 DSR 계산 (지역별 스트레스 금리 적용, 최대 대출 가능 금액 기준)
        BigDecimal stressRate = calculateStressRate(request.getRegion(), request.getInterestRate());
        BigDecimal stressMonthlyPayment = calculateMonthlyPayment(maxLoanAmount, stressRate, request.getLoanPeriod()); // 스트레스 금리 적용 월상환액
        BigDecimal stressTotalRepaymentAmount = stressMonthlyPayment.multiply(BigDecimal.valueOf(request.getLoanPeriod() * 12)); // 스트레스 금리 적용 총상환액 (년수 × 12개월)
        
        log.info("대출 상환 계산 완료 - 최대대출금액: {}, 대출개월수: {}, 월상환액: {}, 총상환액: {}", 
                maxLoanAmount, request.getLoanPeriod(), monthlyPayment, totalRepaymentAmount);
        log.info("스트레스 DSR 계산 완료 - 스트레스금리: {}%, 스트레스월상환액: {}, 스트레스총상환액: {}", 
                stressRate, stressMonthlyPayment, stressTotalRepaymentAmount);

        return SimpleLtvCalculationResponseDto.builder()
                // 1. 지역 규제 정보
                .region(request.getRegion())
                .regionType(regionType)
                .isRegulationArea(isRegulationArea)
                
                // 2. 사용자 신청 조건 및 LTV 한도
                .housingStatus(request.getHousingStatus())
                .ltvLimit(ltvLimit)
                
                // 3. 대출 가능 금액 계산
                .housePrice(request.getHousePrice())
                .maxLoanAmount(maxLoanAmount)
                
                // 4. 대출 상환 계산 (최대 대출 가능 금액 기준)
                .loanPeriod(request.getLoanPeriod())
                .totalRepaymentAmount(totalRepaymentAmount)
                .monthlyPayment(monthlyPayment)
                .interestRate(request.getInterestRate())
                
                // 5. 스트레스 DSR 계산
                .stressRate(stressRate)
                .stressMonthlyPayment(stressMonthlyPayment)
                .stressTotalRepaymentAmount(stressTotalRepaymentAmount)
                
                // 계산 정보
                .calculationDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .message("LTV 계산이 완료되었습니다.")
                .build();
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
     * 만기일까지 남은 개월수 계산
     */
    private int calculateRemainingMonths(LocalDate maturityDate) {
        if (maturityDate == null) {
            // 만기일이 없으면 기본값 5년(60개월)으로 설정
            return 60;
        }
        
        LocalDate now = LocalDate.now();
        if (maturityDate.isBefore(now)) {
            // 이미 만기된 경우 기본값 1년(12개월)으로 설정
            return 12;
        }
        
        // 만기일까지 남은 개월수 계산
        int months = (int) ChronoUnit.MONTHS.between(now, maturityDate);
        return Math.max(months, 1); // 최소 1개월
    }
    

        /**
     * 지역별 스트레스 금리 계산
     * 서울, 경기, 인천: +1.5%p, 기타 지역: +0.75%p
     */
    private BigDecimal calculateStressRate(String region, BigDecimal baseRate) {
        return CalculationUtil.calculateStressRate(region, baseRate);
    }

    /**
     * 규제 지역 여부 판단 (강남구, 서초구, 송파구, 용산구 포함 시 true 반환)
     */
    private boolean isRegulationRegion(String region) {
        return CalculationUtil.isRegulationRegion(region);
    }
    
    /**
     * 사용자 조건에 따른 LTV 한도 계산
     * 
     * @param region 지역명
     * @param housingStatus 주택보유현황 (무주택자, 일시적1주택, 신혼부부, 생애최초, 다주택자)
     * @return LTV 한도 (%)
     */
    private Integer getLtvLimit(String region, String housingStatus) {
        return CalculationUtil.getLtvLimit(region, housingStatus);
    }

    /**
     * JWT 토큰 기반 간단한 연소득 조회
     * 사용자 ID를 추출하고 CI로 연소득을 조회하여 간단한 응답을 반환합니다.
     */
    public SimpleAnnualIncomeResponseDto getSimpleAnnualIncomeByJwt(String jwtToken) {
        log.info("JWT 토큰 기반 간단한 연소득 조회 시작");
        
        try {
            // 1. JWT 토큰에서 사용자 ID 추출
            String userId = jwtUtil.getUserIdFromToken(jwtToken);
            if (userId == null) {
                throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
            }
            
            // 2. USERS 테이블에서 사용자 정보 조회
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
            
            // 3. CI 값 조회
            String ci = user.getResNum();
            log.info("사용자 CI 값 조회완료 - userId: {}, ci: {}", userId, ci);

            // 4. CI로 외부 서버에서 사용자 정보 조회하여 userId 추출
            var externalUser = externalMyDataService.getUserByResNum(ci);
            Long mdUserId = externalUser.getUserId();

            // 5. my_data ID 값으로 MY_DATA 조회
            AnnualIncomeResponseDto annualIncome = getAnnualIncomeByCiInternal(mdUserId);
            
            // 6. 간단한 응답 DTO 구성
            Long numericUserId = extractNumericUserId(userId);
            return SimpleAnnualIncomeResponseDto.builder()
                    .userId(numericUserId)
                    .userName(user.getUserNm())
                    .annualIncome(annualIncome.getAnnualIncome())
                    .calculationMethod(annualIncome.getAnnualIncome().compareTo(BigDecimal.ZERO) > 0 ? "실제소득" : "기본값")
                    .build();
                    
        } catch (Exception e) {
            log.error("간단한 연소득 조회 중 오류 발생", e);
            
            // 기본값으로 응답 반환
            return SimpleAnnualIncomeResponseDto.builder()
                    .userId(null)
                    .userId(null)
                    .annualIncome(BigDecimal.valueOf(30000000)) // 기본값 3천만원
                    .calculationMethod("기본값")
                    .build();
        }
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
