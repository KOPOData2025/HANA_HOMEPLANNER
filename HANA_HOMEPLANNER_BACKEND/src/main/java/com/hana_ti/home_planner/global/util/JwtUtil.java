package com.hana_ti.home_planner.global.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtUtil(
            @Value("${jwt.secret:home-planner-secret-key-for-jwt-token-generation-and-validation}") String secret,
            @Value("${jwt.access-token-expiration:3600000}") long accessTokenExpiration, // 1시간
            @Value("${jwt.refresh-token-expiration:86400000}") long refreshTokenExpiration // 24시간
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * Access Token 생성
     */
    public String generateAccessToken(String userId, String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(String userId) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .subject(userId)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject();
        } catch (Exception e) {
            log.error("토큰에서 사용자 ID 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 토큰에서 이메일 추출
     */
    public String getEmailFromToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.get("email", String.class);
        } catch (Exception e) {
            log.error("토큰에서 이메일 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("잘못된 JWT 토큰: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("잘못된 JWT 서명: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 잘못되었습니다: {}", e.getMessage());
        }
        return false;
    }

    /**
     * 토큰 만료 시간 확인
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = parseClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * 토큰이 만료되었는지 확인 (예외 발생 시에도 처리)
     */
    public boolean isTokenExpiredWithException(String token) {
        try {
            parseClaims(token);
            return false; // 예외가 발생하지 않으면 만료되지 않음
        } catch (ExpiredJwtException e) {
            return true; // 만료됨
        } catch (Exception e) {
            return true; // 기타 예외도 만료로 처리
        }
    }

    /**
     * 토큰 타입 확인 (access/refresh)
     */
    public String getTokenType(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.get("type", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Refresh Token으로 Access Token 갱신
     * @param refreshToken Refresh Token
     * @param email 사용자 이메일 (사용자 정보 조회를 위해 필요)
     */
    public String refreshAccessToken(String refreshToken, String email) {
        try {
            // 1. Refresh Token 만료 여부 먼저 확인
            if (isTokenExpiredWithException(refreshToken)) {
                log.warn("만료된 Refresh Token으로 갱신 시도");
                throw new IllegalArgumentException("TOKEN_EXPIRED: Refresh Token이 만료되었습니다. 다시 로그인해주세요");
            }
            
            // 2. Refresh Token 유효성 검증
            if (!validateToken(refreshToken)) {
                throw new IllegalArgumentException("INVALID_REFRESH_TOKEN: 유효하지 않은 Refresh Token입니다");
            }
            
            // 3. Refresh Token 타입 확인
            String tokenType = getTokenType(refreshToken);
            if (!"refresh".equals(tokenType)) {
                throw new IllegalArgumentException("INVALID_TOKEN_TYPE: Refresh Token이 아닙니다");
            }
            
            // 4. 사용자 ID 추출
            String userId = getUserIdFromToken(refreshToken);
            if (userId == null) {
                throw new IllegalArgumentException("INVALID_REFRESH_TOKEN: Refresh Token에서 사용자 ID를 추출할 수 없습니다");
            }
            
            // 5. 새로운 Access Token 생성
            return generateAccessToken(userId, email);
            
        } catch (IllegalArgumentException e) {
            // 이미 적절한 에러 메시지가 설정된 경우 그대로 전달
            throw e;
        } catch (Exception e) {
            log.error("Access Token 갱신 실패: {}", e.getMessage());
            throw new IllegalArgumentException("AUTHENTICATION_ERROR: Access Token 갱신에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * Refresh Token 갱신 (새로운 Refresh Token 생성)
     */
    public String refreshRefreshToken(String oldRefreshToken) {
        try {
            // 1. 기존 Refresh Token 유효성 검증
            if (!validateToken(oldRefreshToken)) {
                throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다");
            }
            
            // 2. 사용자 ID 추출
            String userId = getUserIdFromToken(oldRefreshToken);
            if (userId == null) {
                throw new IllegalArgumentException("Refresh Token에서 사용자 ID를 추출할 수 없습니다");
            }
            
            // 3. 새로운 Refresh Token 생성
            return generateRefreshToken(userId);
            
        } catch (Exception e) {
            log.error("Refresh Token 갱신 실패: {}", e.getMessage());
            throw new IllegalArgumentException("Refresh Token 갱신에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * JWT 토큰 파싱
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}