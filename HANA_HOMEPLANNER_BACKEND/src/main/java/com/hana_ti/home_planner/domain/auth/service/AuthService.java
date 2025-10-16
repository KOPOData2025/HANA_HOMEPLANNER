package com.hana_ti.home_planner.domain.auth.service;

import com.hana_ti.home_planner.domain.address.dto.AddressCreateDto;
import com.hana_ti.home_planner.domain.address.entity.Address;
import com.hana_ti.home_planner.domain.address.service.AddressService;
import com.hana_ti.home_planner.domain.auth.dto.LoginRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.LoginResponseDto;
import com.hana_ti.home_planner.domain.auth.dto.SignupRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.TokenRefreshRequestDto;
import com.hana_ti.home_planner.domain.auth.dto.TokenRefreshResponseDto;
import com.hana_ti.home_planner.domain.user.dto.UserResponseDto;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.service.UserService;
import com.hana_ti.home_planner.global.util.JwtUtil;
import com.hana_ti.home_planner.global.util.CiUtil;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AuthService {

    private final UserService userService;
    private final AddressService addressService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CiUtil ciUtil;
    
    @Value("${jwt.access-token-expiration:3600000}")
    private long accessTokenExpiration;

    @Transactional
    public UserResponseDto signup(SignupRequestDto request) {
        // 1. 주소 생성
        AddressCreateDto addressDto = AddressCreateDto.builder()
                .sido(request.getSido())
                .sigungu(request.getSigungu())
                .eupmyeondong(request.getEupmyeondong())
                .roadNm(request.getRoadNm())
                .lat(request.getLat())
                .lon(request.getLon())
                .build();
        
        Address address = addressService.createAddress(addressDto);
        
        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPwd());
        
        // 3. CI 값 처리 (요청에 ci가 있으면 사용, 없으면 resNum으로 생성)
        String ciValue;
        if (request.getCi() != null && !request.getCi().trim().isEmpty()) {
            ciValue = request.getCi();
            log.info("요청에서 제공된 CI 값 사용: {}", ciValue);
        } else {
            ciValue = ciUtil.generateCi(request.getResNum());
            log.info("resNum으로 CI 값 생성: {}", ciValue);
        }
        
        // 4. 사용자 생성
        User user = User.create(
                request.getEmail(),
                encodedPassword, // 암호화된 비밀번호
                request.getUserNm(),
                ciValue, // CI값으로 변환된 주민등록번호
                address,
                request.getPhnNum(),
                request.getUserTyp()
        );
        
        User savedUser = userService.saveUser(user);
        
        // 5. Refresh Token 생성 및 저장
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getUserId());
        savedUser.updateRefreshToken(refreshToken);
        userService.updateUser(savedUser); // Refresh Token 업데이트
        
        return UserResponseDto.from(savedUser);
    }

    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {
        try {
            log.info("로그인 시도 - 이메일: {}", request.getEmail());
            
            // 1. 사용자 조회
            User user = userService.findUserEntityByEmail(request.getEmail());
            log.info("사용자 조회 성공 - 사용자 ID: {}, 이메일: {}", user.getUserId(), user.getEmail());
            
            // 2. 비밀번호 검증
            boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPwd());
            log.info("비밀번호 검증 결과: {}", passwordMatches);
            
            if (!passwordMatches) {
                log.warn("비밀번호 불일치 - 입력된 비밀번호와 저장된 비밀번호가 일치하지 않습니다");
                throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
            }
            
            // 3. JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(user.getUserId()
                    , user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
            
            // 4. Refresh Token을 데이터베이스에 저장/업데이트
            user.updateRefreshToken(refreshToken);
            userService.updateUser(user);
            
            // 5. 응답 생성
            UserResponseDto userResponse = UserResponseDto.from(user);
            return LoginResponseDto.of(
                accessToken, 
                refreshToken, 
                accessTokenExpiration / 1000, // 초 단위로 변환
                userResponse
            );
            
        } catch (IllegalArgumentException e) {
            log.error("로그인 실패 - 사용자 조회 오류: {}", e.getMessage());
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        } catch (Exception e) {
            log.error("로그인 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            throw new BadCredentialsException("로그인 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 현재 인증된 사용자 정보 조회
     */
    public UserResponseDto getCurrentUser(String email) {
        User user = userService.findUserEntityByEmail(email);
        return UserResponseDto.from(user);
    }

    /**
     * Refresh Token으로 Access Token 갱신
     */
    @Transactional
    public TokenRefreshResponseDto refreshToken(TokenRefreshRequestDto request) {
        try {
            // 1. Refresh Token 만료 여부 먼저 확인
            if (jwtUtil.isTokenExpiredWithException(request.getRefreshToken())) {
                log.warn("만료된 Refresh Token으로 갱신 시도");
                throw new IllegalArgumentException("TOKEN_EXPIRED: Refresh Token이 만료되었습니다. 다시 로그인해주세요");
            }

            // 2. Refresh Token 유효성 검증
            if (!jwtUtil.validateToken(request.getRefreshToken())) {
                throw new IllegalArgumentException("INVALID_REFRESH_TOKEN: 유효하지 않은 Refresh Token입니다");
            }

            // 3. Refresh Token 타입 확인
            String tokenType = jwtUtil.getTokenType(request.getRefreshToken());
            if (!"refresh".equals(tokenType)) {
                throw new IllegalArgumentException("INVALID_TOKEN_TYPE: Refresh Token이 아닙니다");
            }

            // 4. 데이터베이스에서 Refresh Token으로 사용자 조회
            User user = userService.findUserEntityByRefreshToken(request.getRefreshToken());
            if (user == null) {
                throw new IllegalArgumentException("INVALID_REFRESH_TOKEN: 유효하지 않은 Refresh Token입니다");
            }

            // 5. 새로운 Access Token 생성
            String newAccessToken = jwtUtil.refreshAccessToken(request.getRefreshToken(), user.getEmail());
            
            // 6. 새로운 Refresh Token 생성 (보안을 위해 갱신)
            String newRefreshToken = jwtUtil.refreshRefreshToken(request.getRefreshToken());

            // 7. 새로운 Refresh Token을 데이터베이스에 저장
            user.updateRefreshToken(newRefreshToken);
            userService.updateUser(user);

            // 8. 응답 생성
            return TokenRefreshResponseDto.of(
                newAccessToken,
                newRefreshToken,
                accessTokenExpiration / 1000, // 초 단위로 변환
                "토큰이 성공적으로 갱신되었습니다"
            );

        } catch (IllegalArgumentException e) {
            // 이미 적절한 에러 코드가 설정된 경우 그대로 전달
            log.error("토큰 갱신 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("토큰 갱신 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            throw new IllegalArgumentException("AUTHENTICATION_ERROR: 토큰 갱신에 실패했습니다: " + e.getMessage());
        }
    }
}