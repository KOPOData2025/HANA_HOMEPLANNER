package com.hana_ti.home_planner.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.frontend-domain:localhost}")
    private String frontendDomain;

    @Value("${app.frontend-port:3000}")
    private String frontendPort;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "http://localhost:*",
                    "http://" + frontendDomain + ":" + frontendPort,
                    "http://" + frontendDomain + ":" + 3000,
                    "http://" + frontendDomain + ":" + 8000,
                    "http://" + frontendDomain + ":" + 80,
                    "http://" + frontendDomain,
                    "http://*.your-domain.com"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true) // HTTP 배포에서는 true로 설정
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("http://localhost:*");
        configuration.addAllowedOriginPattern("http://" + frontendDomain + ":" + frontendPort);
        configuration.addAllowedOriginPattern("http://" + frontendDomain + ":" + 8000);
        configuration.addAllowedOriginPattern("http://" + frontendDomain + ":" + 3000);
        configuration.addAllowedOriginPattern("http://" + frontendDomain +
                ":" + 80);
        configuration.addAllowedOriginPattern("http://" + frontendDomain);
        configuration.addAllowedOriginPattern("http://*.your-domain.com");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true); // HTTP 배포에서는 true
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}