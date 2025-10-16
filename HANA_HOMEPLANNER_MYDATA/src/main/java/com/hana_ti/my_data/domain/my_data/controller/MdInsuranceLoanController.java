package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdInsuranceLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdInsuranceLoanService;
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
@RequestMapping("/api/my-data/insurance-loans")
@RequiredArgsConstructor
public class MdInsuranceLoanController {

    private final MdInsuranceLoanService mdInsuranceLoanService;

    /**
     * 사용자 ID로 보험 대출 조회 API
     * GET /api/my-data/insurance-loans?userId={userId}
     * @param userId 사용자 ID
     * @return 보험 대출 정보
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MdInsuranceLoanResponseDto>>> getInsuranceLoansByUserId(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 보험 대출 조회 API 호출 - 사용자 ID: {}", userId);
        
        try {
            List<MdInsuranceLoanResponseDto> insuranceLoans = mdInsuranceLoanService.getInsuranceLoansByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("보험 대출 조회 성공", insuranceLoans));
        } catch (Exception e) {
            log.error("보험 대출 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보험 대출 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 사용자 ID로 보험 대출 조회 API (대체 경로)
     * GET /api/my-data/insurance-loans/by-user?userId={userId}
     * @param userId 사용자 ID
     * @return 보험 대출 정보
     */
    @GetMapping("/by-user")
    public ResponseEntity<ApiResponse<List<MdInsuranceLoanResponseDto>>> getInsuranceLoansByUserIdAlt(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 보험 대출 조회 API 호출 (대체 경로) - 사용자 ID: {}", userId);
        
        try {
            List<MdInsuranceLoanResponseDto> insuranceLoans = mdInsuranceLoanService.getInsuranceLoansByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("보험 대출 조회 성공", insuranceLoans));
        } catch (Exception e) {
            log.error("보험 대출 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보험 대출 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 상환 방법으로 보험 대출 조회 API
     * GET /api/my-data/insurance-loans/by-repay-method?repayMethod={repayMethod}
     * @param repayMethod 상환 방법
     * @return 보험 대출 정보
     */
    @GetMapping("/by-repay-method")
    public ResponseEntity<ApiResponse<List<MdInsuranceLoanResponseDto>>> getInsuranceLoansByRepayMethod(
            @RequestParam("repayMethod") String repayMethod) {
        log.info("상환 방법으로 보험 대출 조회 API 호출 - 상환 방법: {}", repayMethod);
        
        try {
            List<MdInsuranceLoanResponseDto> insuranceLoans = mdInsuranceLoanService.getInsuranceLoansByRepayMethod(repayMethod);
            return ResponseEntity.ok(ApiResponse.success("보험 대출 조회 성공", insuranceLoans));
        } catch (Exception e) {
            log.error("보험 대출 조회 실패 - 상환 방법: {}, 에러: {}", repayMethod, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("보험 대출 조회 실패: " + e.getMessage()));
        }
    }


}
