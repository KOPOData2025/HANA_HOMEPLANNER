package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdCardResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdCardService;
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
@RequestMapping("/api/my-data/cards")
@RequiredArgsConstructor
public class MdCardController {

    private final MdCardService mdCardService;

    /**
     * 사용자 ID로 카드 조회 API
     * GET /api/my-data/cards/by-user?userId={userId}
     * @param userId 사용자 ID
     * @return 카드 정보
     */
    @GetMapping("/by-user")
    public ResponseEntity<ApiResponse<List<MdCardResponseDto>>> getCardsByUserId(
            @RequestParam("userId") Long userId) {
        log.info("사용자 ID로 카드 조회 API 호출 - 사용자 ID: {}", userId);
        
        try {
            List<MdCardResponseDto> cards = mdCardService.getCardsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("카드 조회 성공", cards));
        } catch (Exception e) {
            log.error("카드 조회 실패 - 사용자 ID: {}, 에러: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("카드 조회 실패: " + e.getMessage()));
        }
    }
}

