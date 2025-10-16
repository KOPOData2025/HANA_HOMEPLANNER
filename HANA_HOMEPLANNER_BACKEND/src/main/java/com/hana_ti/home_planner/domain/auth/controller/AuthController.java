package com.hana_ti.home_planner.domain.auth.controller;

import com.hana_ti.home_planner.domain.auth.dto.LoginRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.LoginResponseDto;
import com.hana_ti.home_planner.domain.auth.dto.SignupRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.TokenRefreshRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.TokenRefreshResponseDto;
import com.hana_ti.home_planner.domain.auth.service.AuthService;
import com.hana_ti.home_planner.domain.user.dto.UserResponseDto;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDto>> signup(@Valid @RequestBody SignupRequestDto request) {
        UserResponseDto userResponse = authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", userResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        LoginResponseDto loginResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("로그인이 완료되었습니다.", loginResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponseDto>> refreshToken(@Valid @RequestBody TokenRefreshRequestDto request) {
        TokenRefreshResponseDto refreshResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("토큰이 성공적으로 갱신되었습니다.", refreshResponse));
    }
}