package com.hana_ti.home_planner.domain.auth.controller;

import com.hana_ti.home_planner.domain.auth.dto.SmsSendRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsSendResponseDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationResponseDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationConfirmRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.SmsVerificationConfirmResponseDto;
import com.hana_ti.home_planner.domain.auth.service.SmsService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/sms")
@RequiredArgsConstructor
@Slf4j
public class SmsController {

    private final SmsService smsService;

    /**
     * 일반 SMS 발송
     * POST /api/auth/sms/send
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<SmsSendResponseDto>> sendSms(@Valid @RequestBody SmsSendRequestDto request) {
        log.info("SMS 발송 API 호출 - 수신번호: {}", request.getPhoneNumber());

        try {
            SmsSendResponseDto response = smsService.sendSms(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success("SMS가 성공적으로 발송되었습니다.", response));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("SMS 발송에 실패했습니다: " + response.getStatus()));
            }
        } catch (Exception e) {
            log.error("SMS 발송 API 오류 - 수신번호: {}, 오류: {}", request.getPhoneNumber(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("SMS 발송 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 인증번호 SMS 발송
     * POST /api/auth/sms/verification
     */
    @PostMapping("/verification")
    public ResponseEntity<ApiResponse<SmsVerificationResponseDto>> sendVerificationSms(@Valid @RequestBody SmsVerificationRequestDto request) {
        log.info("인증번호 SMS 발송 API 호출 - 수신번호: {}", request.getPhoneNumber());

        try {
            SmsVerificationResponseDto response = smsService.sendVerificationSms(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success("인증번호가 성공적으로 발송되었습니다.", response));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("인증번호 발송에 실패했습니다: " + response.getMessage()));
            }
        } catch (Exception e) {
            log.error("인증번호 SMS 발송 API 오류 - 수신번호: {}, 오류: {}", request.getPhoneNumber(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("인증번호 발송 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 인증번호 검증
     * POST /api/auth/sms/verification/confirm
     */
    @PostMapping("/verification/confirm")
    public ResponseEntity<ApiResponse<SmsVerificationConfirmResponseDto>> confirmVerification(@Valid @RequestBody SmsVerificationConfirmRequestDto request) {
        log.info("인증번호 검증 API 호출 - 수신번호: {}, 인증번호: {}", request.getPhoneNumber(), request.getVerificationCode());

        try {
            SmsVerificationConfirmResponseDto response = smsService.confirmVerification(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success("인증번호가 확인되었습니다.", response));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("인증번호 검증에 실패했습니다: " + response.getMessage()));
            }
        } catch (Exception e) {
            log.error("인증번호 검증 API 오류 - 수신번호: {}, 오류: {}", request.getPhoneNumber(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("인증번호 검증 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
