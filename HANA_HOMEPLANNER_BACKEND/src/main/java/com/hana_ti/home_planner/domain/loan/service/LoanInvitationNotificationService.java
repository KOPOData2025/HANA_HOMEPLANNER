package com.hana_ti.home_planner.domain.loan.service;

import com.hana_ti.home_planner.domain.auth.dto.SmsSendRequestDto;
import com.hana_ti.home_planner.domain.auth.service.SmsService;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationNotificationRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationNotificationResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanInvitation;
import com.hana_ti.home_planner.domain.loan.repository.LoanInvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanInvitationNotificationService {

    private final LoanInvitationRepository loanInvitationRepository;
    private final SmsService smsService;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    /**
     * 공동대출 초대 알림 발송
     */
    @Transactional
    public LoanInvitationNotificationResponseDto sendInvitationNotification(LoanInvitationNotificationRequestDto request) {
        log.info("공동대출 초대 알림 발송 시작 - 초대ID: {}, 수신자: {}", request.getInviteId(), request.getPhoneNumber());

        try {
            // 1. 초대 정보 조회
            LoanInvitation invitation = loanInvitationRepository.findById(request.getInviteId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + request.getInviteId()));

            // 2. 초대 상태 확인
            if (invitation.getStatus() != LoanInvitation.InvitationStatus.PENDING) {
                throw new IllegalArgumentException("발송 가능한 상태가 아닙니다. 현재 상태: " + invitation.getStatus());
            }

            // 3. 가입 링크 생성
            String registrationLink = generateRegistrationLink(request.getInviteId());

            // 4. 알림 메시지 생성
            String message = createInvitationMessage(invitation, registrationLink);

            // 5. SMS 발송
            SmsSendRequestDto smsRequest = new SmsSendRequestDto();
            smsRequest.setPhoneNumber(request.getPhoneNumber());
            smsRequest.setMessage(message);

            var smsResponse = smsService.sendSms(smsRequest);

            if (smsResponse.isSuccess()) {
                log.info("공동대출 초대 알림 발송 성공 - 초대ID: {}, 수신자: {}", request.getInviteId(), request.getPhoneNumber());
                return LoanInvitationNotificationResponseDto.success(
                        request.getInviteId(),
                        request.getPhoneNumber(),
                        message,
                        registrationLink
                );
            } else {
                log.error("공동대출 초대 알림 발송 실패 - 초대ID: {}, 수신자: {}, 상태: {}", 
                        request.getInviteId(), request.getPhoneNumber(), smsResponse.getStatus());
                return LoanInvitationNotificationResponseDto.failure(
                        request.getInviteId(),
                        request.getPhoneNumber(),
                        "SMS_SEND_FAILED",
                        "SMS 발송에 실패했습니다"
                );
            }

        } catch (IllegalArgumentException e) {
            log.error("공동대출 초대 알림 발송 실패 - 초대ID: {}, 오류: {}", request.getInviteId(), e.getMessage());
            return LoanInvitationNotificationResponseDto.failure(
                    request.getInviteId(),
                    request.getPhoneNumber(),
                    "INVALID_INVITATION",
                    e.getMessage()
            );
        } catch (Exception e) {
            log.error("공동대출 초대 알림 발송 중 오류 발생 - 초대ID: {}, 오류: {}", request.getInviteId(), e.getMessage());
            return LoanInvitationNotificationResponseDto.failure(
                    request.getInviteId(),
                    request.getPhoneNumber(),
                    "ERROR",
                    "알림 발송 중 오류가 발생했습니다"
            );
        }
    }

    /**
     * 가입 링크 생성
     */
    private String generateRegistrationLink(String inviteId) {
        return String.format("%s/register?inviteId=%s", baseUrl, inviteId);
    }

    /**
     * 초대 알림 메시지 생성
     */
    private String createInvitationMessage(LoanInvitation invitation, String registrationLink) {
        return String.format(
                "[홈플래너] 공동대출 초대가 도착했습니다.\n\n" +
                "초대자: %s\n" +
                "역할: %s\n\n" +
                "가입 및 초대 수락을 위해 아래 링크를 클릭해주세요:\n" +
                "%s\n\n" +
                "※ 링크는 7일간 유효합니다.",
                invitation.getInviterId(),
                getRoleDescription(invitation.getRole()),
                registrationLink
        );
    }

    /**
     * 역할 설명 반환
     */
    private String getRoleDescription(LoanInvitation.InvitationRole role) {
        return switch (role) {
            case PRIMARY -> "주계좌";
            case JOINT -> "공동계좌";
            default -> "알 수 없는 역할";
        };
    }
}
