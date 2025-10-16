package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdBankLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdBankLoanService;
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
@RequestMapping("/api/my-data/bank-loans")
@RequiredArgsConstructor
public class MdBankLoanController {

    private final MdBankLoanService mdBankLoanService;

    /**
     * 사용자 ID로 대출 정보 조회 API
     * GET /api/my-data/bank-loans/by-user?userId={userId}
     * @param userId 사용자 ID
     * @return 대출 정보
     */
    @GetMapping("/by-user")
    public ResponseEntity<ApiResponse<List<MdBankLoanResponseDto>>> getLoansByUserId(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 대출 정보 조회 API 호출 - 사용자 ID: {}", userId);
        
        try {
            List<MdBankLoanResponseDto> loans = mdBankLoanService.getLoansByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("대출 정보 조회 성공", loans));
        } catch (Exception e) {
            log.error("대출 정보 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 정보 조회 실패: " + e.getMessage()));
        }
    }
}
