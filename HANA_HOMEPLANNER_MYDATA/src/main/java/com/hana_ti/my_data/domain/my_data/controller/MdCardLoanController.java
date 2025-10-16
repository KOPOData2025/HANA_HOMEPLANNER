package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdCardLoanResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdCardLoanService;
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
@RequestMapping("/api/my-data/card-loans")
@RequiredArgsConstructor
public class MdCardLoanController {

    private final MdCardLoanService mdCardLoanService;

    /**
     * 카드 ID로 카드 대출 조회 API
     * GET /api/my-data/card-loans?cardId={cardId}
     * @param cardId 카드 ID
     * @return 카드 대출 정보
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MdCardLoanResponseDto>>> getCardLoansByCardId(
            @RequestParam("cardId") Long cardId) {
        log.info("카드 ID로 카드 대출 조회 API 호출 - 카드 ID: {}", cardId);
        
        try {
            List<MdCardLoanResponseDto> cardLoans = mdCardLoanService.getCardLoansByCardId(cardId);
            return ResponseEntity.ok(ApiResponse.success("카드 대출 조회 성공", cardLoans));
        } catch (Exception e) {
            log.error("카드 대출 조회 실패 - 카드 ID: {}, 에러: {}", cardId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("카드 대출 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 사용자 ID로 카드 대출 조회 API
     * GET /api/my-data/card-loans/by-user?userId={userId}
     * @param userId 사용자 ID
     * @return 카드 대출 정보
     */
    @GetMapping("/by-user")
    public ResponseEntity<ApiResponse<List<MdCardLoanResponseDto>>> getCardLoansByUserId(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 카드 대출 조회 API 호출 - 사용자 ID: {}", userId);
        
        try {
            List<MdCardLoanResponseDto> cardLoans = mdCardLoanService.getCardLoansByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("카드 대출 조회 성공", cardLoans));
        } catch (Exception e) {
            log.error("카드 대출 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("카드 대출 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 기관 코드로 카드 대출 조회 API
     * GET /api/my-data/card-loans/by-org?orgCode={orgCode}
     * @param orgCode 기관 코드
     * @return 카드 대출 정보
     */
    @GetMapping("/by-org")
    public ResponseEntity<ApiResponse<List<MdCardLoanResponseDto>>> getCardLoansByOrgCode(
            @RequestParam("orgCode") String orgCode) {
        log.info("기관 코드로 카드 대출 조회 API 호출 - 기관 코드: {}", orgCode);
        
        try {
            List<MdCardLoanResponseDto> cardLoans = mdCardLoanService.getCardLoansByOrgCode(orgCode);
            return ResponseEntity.ok(ApiResponse.success("카드 대출 조회 성공", cardLoans));
        } catch (Exception e) {
            log.error("카드 대출 조회 실패 - 기관 코드: {}, 에러: {}", orgCode, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("카드 대출 조회 실패: " + e.getMessage()));
        }
    }
}