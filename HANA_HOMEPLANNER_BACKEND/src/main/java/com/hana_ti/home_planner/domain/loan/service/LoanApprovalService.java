package com.hana_ti.home_planner.domain.loan.service;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.AccountParticipant;
import com.hana_ti.home_planner.domain.bank.repository.AccountParticipantRepository;
import com.hana_ti.home_planner.domain.bank.service.AccountService;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import com.hana_ti.home_planner.domain.loan.dto.LoanApprovalRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanApprovalResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.JointLoanApprovalRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.JointLoanApprovalResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import com.hana_ti.home_planner.domain.loan.entity.LoanContract;
import com.hana_ti.home_planner.domain.loan.entity.LoanRepaymentSchedule;
import com.hana_ti.home_planner.domain.loan.repository.LoanApplicationRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanContractRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanRepaymentScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanApprovalService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanContractRepository loanContractRepository;
    private final LoanRepaymentScheduleRepository loanRepaymentScheduleRepository;
    private final AccountService accountService;
    private final FinancialProductRepository financialProductRepository;
    private final AccountParticipantRepository accountParticipantRepository;

    /**
     * 대출 승인 처리
     */
    @Transactional
    public LoanApprovalResponseDto approveLoan(LoanApprovalRequestDto request) {
        log.info("대출 승인 처리 시작 - 신청ID: {}, 심사자: {}", request.getLoanApplicationId(), request.getReviewerId());

        // 1. 대출 신청 조회 및 상태 변경
        LoanApplication application = loanApplicationRepository.findById(request.getLoanApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + request.getLoanApplicationId()));

        if (application.getStatus() != LoanApplication.ApplicationStatus.PENDING &&
                application.getStatus() != LoanApplication.ApplicationStatus.JOINT_ACCEPTED) {
            throw new IllegalArgumentException("승인 가능한 상태가 아닙니다. 현재 상태: " + application.getStatus());
        }

        // 신청 상태를 APPROVED로 변경 (reviewedAt은 현재 시간으로 자동 설정)
        application.updateStatus(
                LoanApplication.ApplicationStatus.APPROVED,
                request.getReviewerId(),
                request.getRemarks()
        );

        // 2. 대출 계좌 생성 (상품 타입과 신청서의 공동대출 여부에 따라 적절한 AccountType 결정)
        Account.AccountType accountType = determineLoanAccountType(application.getProductId(), application.getIsJoint());
        Account loanAccount = accountService.createAccount(
                application.getUserId(),
                application.getProductId(),
                accountType,
                BigDecimal.ZERO
        );

        // 2-2 공동 대출 계좌라면 공동 계좌 참여자 테이블 생성
        if(accountType.equals(Account.AccountType.JOINT_LOAN)){
            log.info("공동 대출 계좌 감지 - 참여자 테이블 생성 시작");
            
            // 주계좌 사용자를 PRIMARY 역할로 생성
            AccountParticipant primaryParticipant = AccountParticipant.create(
                    UUID.randomUUID().toString(), // participantId
                    loanAccount.getAccountId(),
                    application.getUserId(),
                    AccountParticipant.Role.PRIMARY,
                    new BigDecimal("100.00") // 주계좌는 100% 기여율
            );
            
            AccountParticipant savedPrimaryParticipant = accountParticipantRepository.save(primaryParticipant);
            log.info("주계좌 참여자 생성 완료 - 참여자ID: {}, 사용자ID: {}, 역할: {}", 
                    savedPrimaryParticipant.getParticipantId(), 
                    savedPrimaryParticipant.getUserId(), 
                    savedPrimaryParticipant.getRole());
        }

        // 3. 대출 계약 생성
        String loanId = UUID.randomUUID().toString();
        LocalDate startDate = application.getDisburseDate(); // 신청서의 희망 상환일을 시작일로 사용
        LocalDate endDate = startDate.plusMonths(request.getTermMonths());

        LoanContract contract = LoanContract.create(
                loanId,
                application.getAppId(),
                application.getUserId(),
                application.getProductId(),
                request.getLoanAmount(),
                request.getFinalRate(),
                startDate,
                endDate,
                LoanContract.RepaymentType.EQ_INSTALLMENT, // 기본값: 원리금균등상환
                application.getDisburseAccountId(),
                loanAccount.getAccountId(), // 생성된 대출 계좌 ID
                request.getAccountId() // 요청에서 받은 계좌 ID
        );

        LoanContract savedContract = loanContractRepository.save(contract);

        // 4. 상환 스케줄 생성
        List<LoanRepaymentSchedule> schedules = createRepaymentSchedules(
                savedContract, request.getTermMonths(), request.getFinalRate()
        );
        loanRepaymentScheduleRepository.saveAll(schedules);

        log.info("대출 승인 완료 - 계약ID: {}, 계좌ID: {}, 상환스케줄: {}개", 
                loanId, loanAccount.getAccountId(), schedules.size());

        // 응답 DTO 생성
        return LoanApprovalResponseDto.create(
                application.getAppId(),
                loanId,
                loanAccount.getAccountId(),
                loanAccount.getAccountNum(),
                application.getUserId(),
                application.getProductId(),
                request.getLoanAmount(),
                request.getFinalRate(),
                startDate,
                endDate,
                request.getTermMonths(),
                LoanContract.RepaymentType.EQ_INSTALLMENT.name(),
                application.getDisburseAccountId(),
                request.getAccountId(),
                "ACTIVE",
                application.getReviewedAt(),
                request.getReviewerId(),
                request.getRemarks(),
                schedules.size()
        );
    }

    /**
     * 공동 대출 승인 처리
     */
    @Transactional
    public JointLoanApprovalResponseDto approveJointLoan(JointLoanApprovalRequestDto request) {
        log.info("공동 대출 승인 처리 시작 - 신청ID: {}, 심사자: {}, 공동참여자: {}", 
                request.getLoanApplicationId(), request.getReviewerId(), request.getJointParticipantId());

        // 1. 대출 신청 조회 및 상태 확인 (UNDER_REVIEW 상태 확인)
        LoanApplication application = loanApplicationRepository.findById(request.getLoanApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + request.getLoanApplicationId()));

        if (application.getStatus() != LoanApplication.ApplicationStatus.UNDER_REVIEW) {
            throw new IllegalArgumentException("공동 대출 승인 가능한 상태가 아닙니다. 현재 상태: " + application.getStatus());
        }

        // 공동 대출인지 확인
        if (!"Y".equals(application.getIsJoint())) {
            throw new IllegalArgumentException("공동 대출이 아닌 신청입니다. IS_JOINT: " + application.getIsJoint());
        }

        // 신청 상태를 APPROVED로 변경
        application.updateStatus(
                LoanApplication.ApplicationStatus.APPROVED,
                request.getReviewerId(),
                request.getRemarks()
        );

        // 2. 대출 계좌 생성 (AccountType을 JOINT_LOAN으로 설정)
        Account loanAccount = accountService.createAccount(
                application.getUserId(),
                application.getProductId(),
                Account.AccountType.JOINT_LOAN,
                BigDecimal.ZERO
        );

        // 3. AccountParticipant 2개 생성 (대출 신청자 + 공동참여자)
        log.info("공동 대출 참여자 생성 시작 - 대출신청자: {}, 공동참여자: {}", 
                application.getUserId(), request.getJointParticipantId());

        // 주계좌 참여자 (대출 신청자)
        AccountParticipant primaryParticipant = AccountParticipant.create(
                UUID.randomUUID().toString(),
                loanAccount.getAccountId(),
                application.getUserId(),
                AccountParticipant.Role.PRIMARY,
                new BigDecimal("50.00") // 공동 대출이므로 50% 기여율
        );
        AccountParticipant savedPrimaryParticipant = accountParticipantRepository.save(primaryParticipant);

        // 공동계좌 참여자 (공동 참여자)
        AccountParticipant jointParticipant = AccountParticipant.create(
                UUID.randomUUID().toString(),
                loanAccount.getAccountId(),
                request.getJointParticipantId(),
                AccountParticipant.Role.JOINT,
                new BigDecimal("50.00") // 공동 대출이므로 50% 기여율
        );
        AccountParticipant savedJointParticipant = accountParticipantRepository.save(jointParticipant);

        log.info("공동 대출 참여자 생성 완료 - 주계좌: {}, 공동계좌: {}", 
                savedPrimaryParticipant.getParticipantId(), savedJointParticipant.getParticipantId());

        // 4. 대출 계약 생성 (대출 신청자 ID로)
        String loanId = UUID.randomUUID().toString();
        LocalDate startDate = application.getDisburseDate(); // 신청서의 희망 상환일을 시작일로 사용
        LocalDate endDate = startDate.plusMonths(request.getTermMonths());

        LoanContract contract = LoanContract.create(
                loanId,
                application.getAppId(),
                application.getUserId(), // 대출 신청자 ID로 계약 생성
                application.getProductId(),
                request.getLoanAmount(),
                request.getFinalRate(),
                startDate,
                endDate,
                LoanContract.RepaymentType.EQ_INSTALLMENT,
                application.getDisburseAccountId(),
                loanAccount.getAccountId(),
                request.getAccountId() // 요청에서 받은 계좌 ID
        );

        LoanContract savedContract = loanContractRepository.save(contract);

        // 5. 상환 스케줄 생성
        List<LoanRepaymentSchedule> schedules = createRepaymentSchedules(
                savedContract, request.getTermMonths(), request.getFinalRate()
        );
        loanRepaymentScheduleRepository.saveAll(schedules);

        log.info("공동 대출 승인 완료 - 계약ID: {}, 계좌ID: {}, 상환스케줄: {}개", 
                loanId, loanAccount.getAccountId(), schedules.size());

        // 6. 응답 DTO 생성 및 반환
        return JointLoanApprovalResponseDto.create(
                application.getAppId(),
                loanId,
                loanAccount.getAccountId(),
                loanAccount.getAccountNum(),
                application.getUserId(),
                request.getJointParticipantId(),
                application.getProductId(),
                request.getLoanAmount(),
                request.getFinalRate(),
                startDate,
                endDate,
                request.getTermMonths(),
                LoanContract.RepaymentType.EQ_INSTALLMENT.name(),
                application.getDisburseAccountId(),
                request.getAccountId(),
                "ACTIVE",
                application.getReviewedAt(),
                request.getReviewerId(),
                request.getRemarks(),
                schedules.size(),
                savedPrimaryParticipant.getParticipantId(),
                savedJointParticipant.getParticipantId()
        );
    }

    /**
     * 상환 스케줄 생성 (원리금균등상환)
     */
    private List<LoanRepaymentSchedule> createRepaymentSchedules(LoanContract contract, 
                                                               Integer termMonths, 
                                                               BigDecimal interestRate) {
        List<LoanRepaymentSchedule> schedules = new ArrayList<>();
        
        BigDecimal loanAmount = contract.getLoanAmount();
        BigDecimal monthlyRate = interestRate.divide(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);
        
        // 원리금균등상환 계산
        BigDecimal monthlyPayment = calculateMonthlyPayment(loanAmount, monthlyRate, termMonths);
        
        BigDecimal remainingPrincipal = loanAmount;
        LocalDate dueDate = contract.getStartDate(); // 시작일을 첫 번째 상환일로 사용
        
        for (int i = 1; i <= termMonths; i++) {
            String repayId = UUID.randomUUID().toString();
            
            // 이자 계산
            BigDecimal interestDue = remainingPrincipal.multiply(monthlyRate).setScale(0, RoundingMode.HALF_UP);
            
            // 원금 계산 (마지막 달은 남은 원금 전부)
            BigDecimal principalDue;
            if (i == termMonths) {
                principalDue = remainingPrincipal;
            } else {
                principalDue = monthlyPayment.subtract(interestDue);
            }
            
            BigDecimal totalDue = principalDue.add(interestDue);
            
            LoanRepaymentSchedule schedule = LoanRepaymentSchedule.create(
                    repayId,
                    contract.getLoanId(),
                    dueDate,
                    principalDue,
                    interestDue,
                    totalDue
            );
            
            schedules.add(schedule);
            
            // 다음 달로 업데이트
            remainingPrincipal = remainingPrincipal.subtract(principalDue);
            dueDate = dueDate.plusMonths(1);
        }
        
        return schedules;
    }

    /**
     * 월 상환액 계산 (원리금균등상환)
     */
    private BigDecimal calculateMonthlyPayment(BigDecimal principal, BigDecimal monthlyRate, Integer months) {
        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(months), 0, RoundingMode.HALF_UP);
        }
        
        BigDecimal factor = BigDecimal.ONE.add(monthlyRate).pow(months);
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(factor);
        BigDecimal denominator = factor.subtract(BigDecimal.ONE);
        
        return numerator.divide(denominator, 0, RoundingMode.HALF_UP);
    }

    /**
     * 상품 타입과 신청서의 공동대출 여부에 따라 적절한 대출 AccountType 결정
     */
    private Account.AccountType determineLoanAccountType(String productId, String isJoint) {
        ProductType productType = financialProductRepository.getReferenceById(productId).getProductType();
        
        // 신청서에서 공동대출로 신청했거나, 상품이 공동대출 상품인 경우
        if ("Y".equals(isJoint) || productType.equals(ProductType.JOINT_LOAN)) {
            log.info("공동 대출 감지 - 신청서: {}, 상품타입: {}, AccountType: JOINT_LOAN", isJoint, productType);
            return Account.AccountType.JOINT_LOAN;
        } else {
            log.info("일반 대출 감지 - 신청서: {}, 상품타입: {}, AccountType: LOAN", isJoint, productType);
            return Account.AccountType.LOAN;
        }
    }
}
