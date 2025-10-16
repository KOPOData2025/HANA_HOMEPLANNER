package com.hana_ti.home_planner.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource)) // CORS 설정 추가
            .csrf(AbstractHttpConfigurer::disable) // CSRF 비활성화
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // JWT 사용으로 세션 비활성화
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/signup", "/api/auth/login", "/api" +
                        "/auth/refresh","/api/auth/sms/**").permitAll() // 인증 관련
                    // API
                    // 모두 허용
                .requestMatchers("/api/users/**").permitAll() // 사용자관련 API 허용
                .requestMatchers("/api/house/**").permitAll() // 주택 관련 API 허용
                .requestMatchers("/api/applyhome/**").permitAll() // 주택 관련
                .requestMatchers("/api/storage/pdfs/**").permitAll() // PDF 파일 목록 조회 허용
                .requestMatchers("/api/storage/pdf/url/**").authenticated() // MongoDB s3_pdf_urls 기반 PDF 다운로드는 인증 필요
                .requestMatchers("/api/my-data/**").permitAll() // 마이 데이터 API 허용
                .requestMatchers("/api/calculation/**").permitAll() // LTV 계산 API 허용
                .requestMatchers("/api/calendar/**").authenticated() // 캘린더 관련 API는 인증 필요
                .requestMatchers("/api/couple/accept").permitAll() // 커플 초대 수락 API 허용 (JWT 토큰 없이 접근 가능)
                .requestMatchers("/api/couple/invite").authenticated() // 커플 초대 생성 API는 인증 필요
                .requestMatchers("/api/couple/my-couples").authenticated() // 커플 관계 조회 API는 인증 필요
                .requestMatchers("/api/health/**").permitAll() // 헬스체크 API 허용
                .requestMatchers("/api/banks/**").permitAll() // 은행 API 허용
                .requestMatchers("/api/financial-products/**").permitAll() // 금융상품 API 허용
                .requestMatchers("/api/loan-products/**").permitAll() // 대출상품 API 허용
                .requestMatchers("/api/savings-products/**").permitAll() // 예금/적금상품 API 허용
                .requestMatchers("/api/savings/**").permitAll() // 적금 관련 API 허용
                .requestMatchers("/api/loans/**").permitAll() // 대출 관련 API 허용
                .requestMatchers("/h2-console/**").permitAll() // H2 콘솔 허용 (개발용)
                .requestMatchers("/actuator/**").permitAll() // Actuator 엔드포인트 허용
                .requestMatchers("/").permitAll() // 루트 경로 허용
                .anyRequest().authenticated() // 나머지는 인증 필요
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable()) // H2 콘솔을 위해 X-Frame-Options 비활성화
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // JWT 필터 추가

        return http.build();
    }
}