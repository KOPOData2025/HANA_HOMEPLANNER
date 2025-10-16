package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdInstallmentLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdInstallmentLoanService;
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
@RequestMapping("/api/my-data/installment-loans")
@RequiredArgsConstructor
public class MdInstallmentLoanController {

    private final MdInstallmentLoanService mdInstallmentLoanService;

    /**
     * 사용자 ID로 할부 대출 조회 API
     * GET /api/my-data/installment-loans?userId={userId}
     * @param userId 사용자 ID
     * @return 할부 대출 정보
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MdInstallmentLoanResponseDto>>> getInstallmentLoansByUserId(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 할부 대출 조회 API 호출 - 사용자 ID: {}", userId);
        
        try {
            List<MdInstallmentLoanResponseDto> installmentLoans = mdInstallmentLoanService.getInstallmentLoansByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("할부 대출 조회 성공", installmentLoans));
        } catch (Exception e) {
            log.error("할부 대출 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("할부 대출 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 사용자 ID로 할부 대출 조회 API (대체 경로)
     * GET /api/my-data/installment-loans/by-user?userId={userId}
     * @param userId 사용자 ID
     * @return 할부 대출 정보
     */
    @GetMapping("/by-user")
    public ResponseEntity<ApiResponse<List<MdInstallmentLoanResponseDto>>> getInstallmentLoansByUserIdAlt(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 할부 대출 조회 API 호출 (대체 경로) - 사용자 ID: {}", userId);
        
        try {
            List<MdInstallmentLoanResponseDto> installmentLoans = mdInstallmentLoanService.getInstallmentLoansByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("할부 대출 조회 성공", installmentLoans));
        } catch (Exception e) {
            log.error("할부 대출 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("할부 대출 조회 실패: " + e.getMessage()));
        }
    }
}
