package com.hana_ti.home_planner.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.dto.ErrorResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 1. 요청에서 JWT 토큰 추출
            String token = extractTokenFromRequest(request);
            
            // 2. 토큰이 있는 경우에만 처리
            if (StringUtils.hasText(token)) {
                // 3. 토큰이 만료되었는지 먼저 확인
                if (jwtUtil.isTokenExpiredWithException(token)) {
                    log.warn("만료된 JWT 토큰");
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED", "토큰이 만료되었습니다. Refresh Token으로 갱신해주세요");
                    return;
                }
                
                // 4. 토큰 유효성 검증
                if (jwtUtil.validateToken(token)) {
                    // Access Token인지 확인
                    String tokenType = jwtUtil.getTokenType(token);
                    if ("access".equals(tokenType)) {
                        setAuthentication(token);
                    } else {
                        log.warn("잘못된 토큰 타입입니다: {}", tokenType);
                        sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN_TYPE", "잘못된 토큰 타입입니다");
                        return;
                    }
                } else {
                    // 토큰이 유효하지 않은 경우
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다");
                    return;
                }
            }
        } catch (MalformedJwtException e) {
            log.warn("잘못된 JWT 토큰 형식: {}", e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "MALFORMED_TOKEN", "잘못된 토큰 형식입니다");
            return;
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰: {}", e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "UNSUPPORTED_TOKEN", "지원되지 않는 토큰입니다");
            return;
        } catch (SignatureException e) {
            log.warn("잘못된 JWT 서명: {}", e.getMessage());
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "INVALID_SIGNATURE", "잘못된 토큰 서명입니다");
            return;
        } catch (Exception e) {
            log.error("JWT 인증 처리 중 오류 발생: {}", e.getMessage());
            sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "AUTHENTICATION_ERROR", "인증 처리 중 오류가 발생했습니다");
            return;
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청에서 JWT 토큰 추출
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    /**
     * JWT 토큰을 사용하여 Spring Security 인증 정보 설정
     */
    private void setAuthentication(String token) {
        String userId = jwtUtil.getUserIdFromToken(token);
        String email = jwtUtil.getEmailFromToken(token);
        
        if (userId != null && email != null) {
            // 간단한 권한 설정 (추후 DB에서 사용자 권한을 조회하도록 개선 가능)
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            
            // UsernamePasswordAuthenticationToken 생성 (email을 principal로 사용하여 Controller에서 접근 가능)
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                email, null, authorities);
            
            // SecurityContext에 인증 정보 설정
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("JWT 인증 성공 - 사용자 ID: {}, 이메일: {}", userId, email);
        }
    }

    /**
     * 에러 응답 전송
     */
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String errorCode, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(errorCode)
                .message(message)
                .build();
        
        ApiResponse<ErrorResponse> apiResponse = ApiResponse.error(errorResponse);
        
        String jsonResponse = objectMapper.writeValueAsString(apiResponse);
        response.getWriter().write(jsonResponse);
    }

    /**
     * 인증이 필요 없는 경로들은 필터를 건너뛰도록 설정
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/signup") || 
               path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/refresh") ||  // refresh 엔드포인트 추가
               path.startsWith("/api/house/") ||
               path.startsWith("/api/health/") ||
               path.startsWith("/api/banks/") ||
               path.startsWith("/api/financial-products/") ||
               path.startsWith("/api/loan-products/") ||
               path.startsWith("/api/savings-products/") ||
               path.equals("/api/couple/accept") ||  // 커플 초대 수락 API는 JWT 필터 제외
               path.startsWith("/h2-console/") ||
               path.startsWith("/actuator/") ||
               path.equals("/");
    }
}