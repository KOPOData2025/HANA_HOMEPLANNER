package com.hana_ti.home_planner.domain.auth.service;

import com.hana_ti.home_planner.domain.auth.dto.SmsSendRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsSendResponseDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationResponseDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationConfirmRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationConfirmResponseDto;
import com.hana_ti.home_planner.global.util.CiUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final CiUtil ciUtil;

    @Value("${coolsms.key}")
    private String smsApiKey;

    @Value("${coolsms.secret}")
    private String smsApiSecret;

    @Value("${coolsms.from-number}")
    private String fromNumber;

    private DefaultMessageService messageService;

    private final ConcurrentHashMap<String, VerificationData> verificationStorage = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.messageService = NurigoApp.INSTANCE.initialize(smsApiKey, smsApiSecret, "https://api.coolsms.co.kr");
        log.info("SMS 서비스 초기화 완료 - API Key: {}, From Number: {}", smsApiKey, fromNumber);
    }

    /**
     * 일반 SMS 발송
     */
    public SmsSendResponseDto sendSms(SmsSendRequestDto request) {
        log.info("SMS 발송 시작 - 수신번호: {}, 메시지: {}", request.getPhoneNumber(), request.getMessage());

        try {
            Message message = new Message();
            message.setFrom(fromNumber);
            message.setTo(request.getPhoneNumber());
            message.setText(request.getMessage());

            messageService.send(message);

            log.info("SMS 발송 성공 - 수신번호: {}", request.getPhoneNumber());
            return SmsSendResponseDto.success(request.getPhoneNumber(), request.getMessage());

        } catch (NurigoMessageNotReceivedException e) {
            log.error("SMS 발송 실패 - 수신번호: {}, 실패 메시지: {}", request.getPhoneNumber(), e.getFailedMessageList());
            return SmsSendResponseDto.failure(request.getPhoneNumber(), request.getMessage(), "SEND_FAILED");
        } catch (Exception e) {
            log.error("SMS 발송 중 오류 발생 - 수신번호: {}, 오류: {}", request.getPhoneNumber(), e.getMessage());
            return SmsSendResponseDto.failure(request.getPhoneNumber(), request.getMessage(), "ERROR");
        }
    }

    /**
     * 인증번호 SMS 발송
     */
    public SmsVerificationResponseDto sendVerificationSms(SmsVerificationRequestDto request) {
        log.info("인증번호 SMS 발송 시작 - 수신번호: {}, 이름: {}", request.getPhoneNumber(), request.getName());

        try {
            // 6자리 인증번호 생성
            String verificationCode = generateVerificationCode();
            String message = String.format("[홈플래너] 인증번호: %s", verificationCode);

            Message smsMessage = new Message();
            smsMessage.setFrom(fromNumber);
            smsMessage.setTo(request.getPhoneNumber());
            smsMessage.setText(message);

            messageService.send(smsMessage);

            // CI값 생성
            String ciValue = ciUtil.generateCi(request.getResidentNumber());
            log.info("CI값 생성 완료 - 주민번호: {}, CI: {}", request.getResidentNumber(), ciValue);

            // 인증번호와 사용자 정보를 메모리에 저장 (5분 유효)
            verificationStorage.put(request.getPhoneNumber(), new VerificationData(
                    verificationCode, 
                    System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5),
                    request.getName(),
                    ciValue
            ));

            log.info("인증번호 SMS 발송 성공 - 수신번호: {}, 인증번호: {}, 이름: {}", 
                    request.getPhoneNumber(), verificationCode, request.getName());
            return SmsVerificationResponseDto.success(request.getPhoneNumber());

        } catch (NurigoMessageNotReceivedException e) {
            log.error("인증번호 SMS 발송 실패 - 수신번호: {}, 실패 메시지: {}", request.getPhoneNumber(), e.getFailedMessageList());
            return SmsVerificationResponseDto.failure(request.getPhoneNumber(), "SEND_FAILED", "인증번호 발송에 실패했습니다.");
        } catch (Exception e) {
            log.error("인증번호 SMS 발송 중 오류 발생 - 수신번호: {}, 오류: {}", request.getPhoneNumber(), e.getMessage());
            return SmsVerificationResponseDto.failure(request.getPhoneNumber(), "ERROR", "인증번호 발송 중 오류가 발생했습니다.");
        }
    }

    /**
     * 인증번호 검증
     */
    public SmsVerificationConfirmResponseDto confirmVerification(SmsVerificationConfirmRequestDto request) {
        log.info("인증번호 검증 시작 - 수신번호: {}, 입력 인증번호: {}", request.getPhoneNumber(), request.getVerificationCode());

        try {
            // 저장된 인증번호 조회
            VerificationData storedData = verificationStorage.get(request.getPhoneNumber());
            
            if (storedData == null) {
                log.warn("인증번호 검증 실패 - 수신번호: {} (인증번호가 존재하지 않음)", request.getPhoneNumber());
                return SmsVerificationConfirmResponseDto.failure(request.getPhoneNumber(), "NOT_FOUND", "인증번호가 존재하지 않습니다. 다시 발송해주세요.");
            }

            // 만료 시간 확인
            if (System.currentTimeMillis() > storedData.getExpireTime()) {
                log.warn("인증번호 검증 실패 - 수신번호: {} (인증번호 만료)", request.getPhoneNumber());
                verificationStorage.remove(request.getPhoneNumber()); // 만료된 데이터 제거
                return SmsVerificationConfirmResponseDto.failure(request.getPhoneNumber(), "EXPIRED", "인증번호가 만료되었습니다. 다시 발송해주세요.");
            }

            // 인증번호 일치 확인
            if (!storedData.getCode().equals(request.getVerificationCode())) {
                log.warn("인증번호 검증 실패 - 수신번호: {} (인증번호 불일치)", request.getPhoneNumber());
                return SmsVerificationConfirmResponseDto.failure(request.getPhoneNumber(), "INVALID", "인증번호가 일치하지 않습니다.");
            }

            // 인증 성공 - 저장된 인증번호 제거
            String name = storedData.getName();
            String ci = storedData.getCi();
            verificationStorage.remove(request.getPhoneNumber());
            log.info("인증번호 검증 성공 - 수신번호: {}, 이름: {}, CI: {}", request.getPhoneNumber(), name, ci);
            return SmsVerificationConfirmResponseDto.success(request.getPhoneNumber(), name, ci);

        } catch (Exception e) {
            log.error("인증번호 검증 중 오류 발생 - 수신번호: {}, 오류: {}", request.getPhoneNumber(), e.getMessage());
            return SmsVerificationConfirmResponseDto.failure(request.getPhoneNumber(), "ERROR", "인증번호 검증 중 오류가 발생했습니다.");
        }
    }

    /**
     * 6자리 인증번호 생성
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000; // 100000 ~ 999999
        return String.valueOf(code);
    }

    /**
     * 인증번호 데이터 내부 클래스
     */
    private static class VerificationData {
        private final String code;
        private final long expireTime;
        private final String name;
        private final String ci;

        public VerificationData(String code, long expireTime, String name, String ci) {
            this.code = code;
            this.expireTime = expireTime;
            this.name = name;
            this.ci = ci;
        }

        public String getCode() {
            return code;
        }

        public long getExpireTime() {
            return expireTime;
        }

        public String getName() {
            return name;
        }

        public String getCi() {
            return ci;
        }
    }
}
