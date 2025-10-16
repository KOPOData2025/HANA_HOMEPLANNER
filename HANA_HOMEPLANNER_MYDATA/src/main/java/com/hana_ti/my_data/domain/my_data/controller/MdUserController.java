package com.hana_ti.my_data.domain.my_data.controller;

import com.hana_ti.my_data.domain.my_data.dto.MdUserResponseDto;
import com.hana_ti.my_data.domain.my_data.service.MdUserService;
import com.hana_ti.my_data.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/my-data/users")
@RequiredArgsConstructor
public class MdUserController {

    private final MdUserService mdUserService;

    /**
     * resNum으로 사용자 조회 API
     * GET /api/my-data/users?resNum={resNum}
     * @param resNum 마이데이터 CI (resNum)
     * @return 사용자 정보
     */
    @GetMapping
    public ResponseEntity<ApiResponse<MdUserResponseDto>> findUserByResNum(@RequestParam(value = "resNum", required = false) String resNum) {
        log.info("resNum으로 사용자 조회 API 호출: {}", resNum);
        
        if (resNum == null || resNum.trim().isEmpty()) {
            log.warn("resNum 파라미터가 누락되었습니다.");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("resNum 파라미터가 필요합니다."));
        }
        
        try {
            // URL 디코딩 처리 및 공백을 +로 복원
            String decodedResNum = URLDecoder.decode(resNum, StandardCharsets.UTF_8);
            // Spring Boot에서 +가 공백으로 변환되므로 다시 +로 복원
            decodedResNum = decodedResNum.replace(" ", "+");
            log.info("URL 디코딩된 resNum: {}", decodedResNum);
            
            MdUserResponseDto user = mdUserService.getUserByResNum(decodedResNum);
            
            ApiResponse<MdUserResponseDto> response = ApiResponse.<MdUserResponseDto>builder()
                    .success(true)
                    .message("사용자 조회가 완료되었습니다.")
                    .data(user)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("사용자 조회 실패 - resNum: {}, 에러: {}", resNum, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("사용자 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 모든 사용자 조회 API (디버깅용)
     * GET /api/my-data/users/all
     * @return 모든 사용자 정보
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MdUserResponseDto>>> getAllUsers() {
        log.info("모든 사용자 조회 API 호출");
        
        try {
            List<MdUserResponseDto> users = mdUserService.getAllUsers();
            
            ApiResponse<List<MdUserResponseDto>> response = ApiResponse.<List<MdUserResponseDto>>builder()
                    .success(true)
                    .message("모든 사용자 조회가 완료되었습니다.")
                    .data(users)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("모든 사용자 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("모든 사용자 조회 실패: " + e.getMessage()));
        }
    }
}
