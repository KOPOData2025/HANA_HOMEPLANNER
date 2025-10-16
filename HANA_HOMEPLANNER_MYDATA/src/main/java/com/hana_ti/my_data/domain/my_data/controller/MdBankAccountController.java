package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdBankAccountResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdBankAccountService;
import com.hana_ti.my_data.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/my-data/bank-accounts")
@RequiredArgsConstructor
public class MdBankAccountController {

    private final MdBankAccountService mdBankAccountService;

    /**
     * 사용자 ID로 계좌 조회 API
     * GET /api/my-data/bank-accounts/by-user?userId={userId}
     * @param userId 사용자 ID
     * @return 계좌 정보
     */
    @GetMapping("/by-user")
    public ResponseEntity<ApiResponse<List<MdBankAccountResponseDto>>> getAccountsByUserId(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 계좌 조회 API 호출 - 사용자 ID: {}", userId);
        
        try {
            List<MdBankAccountResponseDto> accounts = mdBankAccountService.getAccountsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("계좌 조회 성공", accounts));
        } catch (Exception e) {
            log.error("계좌 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 조회 실패: " + e.getMessage()));
        }
    }
}
