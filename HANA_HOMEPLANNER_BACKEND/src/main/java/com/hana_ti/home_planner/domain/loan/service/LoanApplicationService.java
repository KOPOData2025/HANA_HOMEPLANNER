package com.hana_ti.home_planner.domain.loan.service;

import com.hana_ti.home_planner.domain.auth.dto.SmsSendRequestDto;
import com.hana_ti.home_planner.domain.auth.service.SmsService;
import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import com.hana_ti.home_planner.domain.loan.dto.LoanApplicationRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanApplicationResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import com.hana_ti.home_planner.domain.loan.entity.LoanInvitation;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import com.hana_ti.home_planner.domain.loan.repository.LoanApplicationRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanInvitationRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanApplicationService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanProductRepository loanProductRepository;
    private final AccountRepository accountRepository;
    private final LoanInvitationRepository loanInvitationRepository;
    private final SmsService smsService;

    /**
     * 대출 신청
     */
    @Transactional
    public LoanApplicationResponseDto createLoanApplication(LoanApplicationRequestDto request, String userId) {
        log.info("대출 신청 시작 - 사용자ID: {}, 상품ID: {}, 희망금액: {}, 희망기간: {}개월, 출금계좌: {}, 공동대출: {}",
                userId, request.getProductId(), request.getRequestAmount(),
                request.getRequestTerm(), request.getDisburseAccountNumber(), request.getIsJoint());

        // 상품 존재 여부 확인
        LoanProduct product = loanProductRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 상품입니다: " + request.getProductId()));

        // 계좌번호는 입력받은 값을 그대로 사용 (검증 제거)

        // 대출 한도 확인
        validateLoanLimits(request, product);

        // IS_JOINT 값 처리 및 검증
        String isJoint = processIsJointValue(request.getIsJoint());
        log.info("IS_JOINT 값 처리 완료 - 원본값: {}, 처리된값: {}", request.getIsJoint(), isJoint);

        // 대출 신청 ID 생성
        String appId = UUID.randomUUID().toString();

        Account byAccountNum = accountRepository.findByAccountNum(request.getDisburseAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("출금 계좌를 찾을 수 없습니다: " + request.getDisburseAccountNumber()));

        // 대출 신청 생성
        LoanApplication application = LoanApplication.create(
                appId,
                userId,
                request.getProductId(),
                request.getRequestAmount(),
                request.getRequestTerm(),
                byAccountNum.getAccountId(),
                isJoint,
                request.getDisburseDate()
        );

        // 대출 신청 저장
        LoanApplication savedApplication = loanApplicationRepository.save(application);

        // IS_JOINT가 'Y'인 경우 자동으로 초대 생성 및 알림 발송
        if ("Y".equals(isJoint)) {
            log.info("공동 대출 신청 감지 - 자동 초대 생성 및 알림 발송 시작 - 신청ID: {}, 사용자ID: {}", 
                    savedApplication.getAppId(), userId);
            
            try {
                String inviteId = createAutomaticInvitation(savedApplication.getAppId(), userId, 
                        request.getJointName(), request.getJointPhone());
                
                // 공동대출자에게 알림 메시지 발송
                sendJointLoanNotification(inviteId, request.getJointPhone(), request.getJointName());
                
                log.info("자동 초대 생성 및 알림 발송 완료 - 신청ID: {}, 초대ID: {}", 
                        savedApplication.getAppId(), inviteId);
            } catch (Exception e) {
                log.error("자동 초대 생성 및 알림 발송 중 오류 발생 - 신청ID: {}, 오류: {}", 
                        savedApplication.getAppId(), e.getMessage());
                // 초대 생성 실패해도 대출 신청은 성공으로 처리
            }
        }

        log.info("대출 신청 완료 - 신청ID: {}, 상태: {}", savedApplication.getAppId(), savedApplication.getStatus());

        return LoanApplicationResponseDto.from(savedApplication);
    }

    /**
     * 사용자별 대출 신청 목록 조회
     */
    public List<LoanApplicationResponseDto> getApplicationsByUserId(String userId) {
        log.info("사용자별 대출 신청 목록 조회 - 사용자ID: {}", userId);
        
        List<LoanApplication> applications = loanApplicationRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        
        return applications.stream()
                .map(LoanApplicationResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 대출 신청 상세 조회
     */
    public LoanApplicationResponseDto getApplicationById(String appId, String userId) {
        log.info("대출 신청 상세 조회 - 신청ID: {}, 사용자ID: {}", appId, userId);
        
        LoanApplication application = loanApplicationRepository.findById(appId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + appId));

        if (!application.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 대출 신청만 조회할 수 있습니다.");
        }

        return LoanApplicationResponseDto.from(application);
    }

    /**
     * 대출 한도 검증
     */
    private void validateLoanLimits(LoanApplicationRequestDto request, LoanProduct product) {
        // 최소 대출 금액 확인
        if (product.getMinLoanAmount() != null && 
            request.getRequestAmount().compareTo(product.getMinLoanAmount()) < 0) {
            throw new IllegalArgumentException(
                    String.format("최소 대출 금액은 %,.0f원입니다.", product.getMinLoanAmount()));
        }

        // 최대 대출 금액 확인
        if (product.getMaxLoanAmount() != null && 
            request.getRequestAmount().compareTo(product.getMaxLoanAmount()) > 0) {
            throw new IllegalArgumentException(
                    String.format("최대 대출 금액은 %,.0f원입니다.", product.getMaxLoanAmount()));
        }

        // 최대 대출 기간 확인
        if (product.getMaxLoanPeriodMonths() != null && 
            request.getRequestTerm() > product.getMaxLoanPeriodMonths()) {
            throw new IllegalArgumentException(
                    String.format("최대 대출 기간은 %d개월입니다.", product.getMaxLoanPeriodMonths()));
        }
    }

    /**
     * IS_JOINT 값 처리 및 검증
     * 클라이언트로부터 받은 값을 Y 또는 N으로 정규화
     */
    private String processIsJointValue(String isJoint) {
        if (isJoint == null || isJoint.trim().isEmpty()) {
            log.info("IS_JOINT 값이 null 또는 빈 문자열 - 기본값 'N'으로 설정");
            return "N";
        }

        String trimmedValue = isJoint.trim().toUpperCase();
        
        // Y 또는 YES로 시작하는 경우
        if ("Y".equals(trimmedValue) || "YES".equals(trimmedValue)) {
            log.info("IS_JOINT 값이 공동대출로 인식됨 - 원본: {}, 처리결과: Y", isJoint);
            return "Y";
        }
        
        // N 또는 NO로 시작하는 경우
        if ("N".equals(trimmedValue) || "NO".equals(trimmedValue)) {
            log.info("IS_JOINT 값이 일반대출로 인식됨 - 원본: {}, 처리결과: N", isJoint);
            return "N";
        }
        
        // TRUE/FALSE 처리
        if ("TRUE".equals(trimmedValue) || "T".equals(trimmedValue)) {
            log.info("IS_JOINT 값이 TRUE로 인식됨 - 원본: {}, 처리결과: Y", isJoint);
            return "Y";
        }
        
        if ("FALSE".equals(trimmedValue) || "F".equals(trimmedValue)) {
            log.info("IS_JOINT 값이 FALSE로 인식됨 - 원본: {}, 처리결과: N", isJoint);
            return "N";
        }
        
        // 숫자 처리 (1 = Y, 0 = N)
        try {
            int numericValue = Integer.parseInt(trimmedValue);
            if (numericValue == 1) {
                log.info("IS_JOINT 값이 숫자 1로 인식됨 - 원본: {}, 처리결과: Y", isJoint);
                return "Y";
            } else if (numericValue == 0) {
                log.info("IS_JOINT 값이 숫자 0으로 인식됨 - 원본: {}, 처리결과: N", isJoint);
                return "N";
            }
        } catch (NumberFormatException e) {
            // 숫자가 아닌 경우는 아래에서 처리
        }
        
        // 인식할 수 없는 값인 경우 기본값 N으로 설정
        log.warn("IS_JOINT 값이 인식되지 않음 - 원본: {}, 기본값 'N'으로 설정", isJoint);
        return "N";
    }

    /**
     * 공동 대출 신청 시 자동 초대 생성
     */
    private String createAutomaticInvitation(String appId, String userId, String jointName, String jointPhone) {
        log.info("자동 초대 생성 시작 - 신청ID: {}, 사용자ID: {}, 공동대출자: {}", appId, userId, jointName);

        // 초대 ID 생성
        String inviteId = UUID.randomUUID().toString();

        // 자동 초대 생성 (신청자가 주계좌 역할, 공동대출자 정보 포함)
        LoanInvitation invitation = LoanInvitation.createWithJointInfo(
                inviteId,
                appId,
                userId,
                LoanInvitation.InvitationRole.PRIMARY,
                jointName,
                jointPhone,
                null // CI는 나중에 입력
        );

        // 초대 저장
        LoanInvitation savedInvitation = loanInvitationRepository.save(invitation);

        log.info("자동 초대 생성 완료 - 초대ID: {}, 신청ID: {}, 사용자ID: {}, 역할: {}, 공동대출자: {}", 
                savedInvitation.getInviteId(), appId, userId, savedInvitation.getRole(), jointName);
        
        return savedInvitation.getInviteId();
    }

    /**
     * 공동대출 초대 알림 메시지 발송
     */
    private void sendJointLoanNotification(String inviteId, String phoneNumber, String jointName) {
        log.info("공동대출 초대 알림 발송 시작 - 초대ID: {}, 수신자: {}, 공동대출자: {}", inviteId, phoneNumber, jointName);

        try {
            // 가입 링크 생성
            String registrationLink = generateRegistrationLink(inviteId);

            // 알림 메시지 생성
            String message = createInvitationMessage(jointName, registrationLink);

            // SMS 발송
            SmsSendRequestDto smsRequest = new SmsSendRequestDto();
            smsRequest.setPhoneNumber(phoneNumber);
            smsRequest.setMessage(message);

            var smsResponse = smsService.sendSms(smsRequest);

            if (smsResponse.isSuccess()) {
                log.info("공동대출 초대 알림 발송 성공 - 초대ID: {}, 수신자: {}", inviteId, phoneNumber);
            } else {
                log.error("공동대출 초대 알림 발송 실패 - 초대ID: {}, 수신자: {}, 상태: {}", 
                        inviteId, phoneNumber, smsResponse.getStatus());
            }

        } catch (Exception e) {
            log.error("공동대출 초대 알림 발송 중 오류 발생 - 초대ID: {}, 수신자: {}, 오류: {}", 
                    inviteId, phoneNumber, e.getMessage());
        }
    }

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    /**
     * 가입 링크 생성
     */
    private String generateRegistrationLink(String inviteId) {
        return String.format("%s/register/invite/joint-loan?inviteId=%s", baseUrl, inviteId);
    }

    /**
     * 초대 알림 메시지 생성
     */
    private String createInvitationMessage(String jointName, String registrationLink) {
        return String.format(
                "[홈플래너] 공동대출 초대가 도착했습니다.\n\n" +
                "안녕하세요 %s님,\n\n" +
                "공동대출 신청이 접수되었습니다.\n" +
                "가입 및 초대 수락을 위해 아래 링크를 클릭해주세요:\n" +
                "%s\n\n" +
                "※ 링크는 7일간 유효합니다.",
                jointName,
                registrationLink
        );
    }
}
