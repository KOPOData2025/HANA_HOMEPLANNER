package com.hana_ti.home_planner.domain.my_data.controller;

import com.hana_ti.home_planner.domain.my_data.dto.MdCiResponseDto;
import com.hana_ti.home_planner.domain.my_data.service.MdCiService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;


@Slf4j
@RestController
@RequestMapping("/api/my-data/ci")
@RequiredArgsConstructor
public class MdCiController {

    private final MdCiService mdCiService;

    /**
     * CI 값으로 사용자의 마이데이터 연동 목록 조회
     * 회원가입 후 CI 인증 시 마이데이터 서버에서 연동할 데이터 목록을 조회합니다.
     * POST /api/my-data/ci/inquiry
     */
    @PostMapping("/inquiry")
    public ResponseEntity<ApiResponse<MdCiResponseDto>> getMyDataIntegrationByCi(
            @RequestBody CiInquiryRequest request) {
        log.info("CI 값으로 마이데이터 연동 목록 조회 API 호출 - CI: {}", request.getCi());

        try {
            // CI 값으로 사용자 정보 조회 (한 번만 조회)
            var user = mdCiService.getUserByCi(request.getCi());
            Long userId = user.getUserId();
            
            // userId로 각종 데이터 조회
            var bankAccounts = mdCiService.getBankAccountsByUserId(userId);
            var cards = mdCiService.getCardsByUserId(userId);
            var bankLoans = mdCiService.getBankLoansByUserId(userId);
            var cardLoans = mdCiService.getCardLoansByUserId(userId);
            var installmentLoans = mdCiService.getInstallmentLoansByUserId(userId);
            var insuranceLoans = mdCiService.getInsuranceLoansByUserId(userId);

            // 통합 응답 생성
            MdCiResponseDto response = MdCiResponseDto.create(
                    String.valueOf(user.getUserId()),
                    user.getName(),
                    request.getCi(),
                    bankAccounts,
                    cards,
                    bankLoans,
                    cardLoans,
                    installmentLoans,
                    insuranceLoans
            );

            log.info("CI 값으로 마이데이터 연동 목록 조회 완료 - 사용자: {}, 계좌: {}개, 카드: {}개, 대출: {}개",
                    user.getName(), response.getBankAccountCount(), response.getCardCount(), 
                    response.getSummary().getTotalLoanCount());

            return ResponseEntity.ok(ApiResponse.success("마이데이터 연동 목록 조회가 완료되었습니다.", response));

        } catch (Exception e) {
            log.error("CI 값으로 마이데이터 연동 목록 조회 실패 - CI: {}, 오류: {}", request.getCi(), e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("마이데이터 연동 목록 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * CI 값 조회 요청 DTO
     */
    public static class CiInquiryRequest {
        @NotBlank(message = "CI 값은 필수입니다")
        private String ci;

        public String getCi() {
            return ci;
        }

        public void setCi(String ci) {
            this.ci = ci;
        }
    }
}
