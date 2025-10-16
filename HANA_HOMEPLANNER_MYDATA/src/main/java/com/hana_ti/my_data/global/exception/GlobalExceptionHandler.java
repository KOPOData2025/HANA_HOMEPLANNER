package com.hana_ti.my_data.global.exception;

import com.hana_ti.my_data.global.dto.ApiResponse;
import com.hana_ti.my_data.global.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * BadCredentialsException 처리 - 로그인 인증 실패
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException e) {
        log.warn("Authentication failed: {}", e.getMessage());
        ApiResponse<Object> response = ApiResponse.error(e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * MethodArgumentNotValidException 처리 - Validation 에러
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("입력 데이터 검증에 실패했습니다.")
                .data(errors)
                .build();
        
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * MethodArgumentTypeMismatchException 처리 - 타입 변환 에러
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        log.warn("Type mismatch error for parameter '{}': {}", e.getName(), e.getMessage());
        
        String message = String.format("파라미터 '%s'의 값이 올바르지 않습니다. 올바른 형식으로 입력해주세요.", e.getName());
        
        // 주택관리번호의 경우 특별한 메시지 제공
        if ("houseManagementNumber".equals(e.getName())) {
            message = "주택관리번호는 숫자로 입력해주세요. 입력값: " + e.getValue();
        }
        
        ApiResponse<Object> response = ApiResponse.error(message);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("IllegalArgumentException occurred: {}", e.getMessage());
        
        String message = e.getMessage();
        String errorCode = null;
        HttpStatus status = HttpStatus.BAD_REQUEST;
        
        // 에러 코드 파싱
        if (message != null && message.contains(":")) {
            String[] parts = message.split(":", 2);
            if (parts.length == 2) {
                errorCode = parts[0].trim();
                message = parts[1].trim();
                
                // 특정 에러 코드에 대한 HTTP 상태 코드 설정
                switch (errorCode) {
                    case "TOKEN_EXPIRED":
                        status = HttpStatus.UNAUTHORIZED;
                        break;
                    case "INVALID_REFRESH_TOKEN":
                    case "INVALID_TOKEN_TYPE":
                        status = HttpStatus.UNAUTHORIZED;
                        break;
                    case "AUTHENTICATION_ERROR":
                        status = HttpStatus.INTERNAL_SERVER_ERROR;
                        break;
                    default:
                        status = HttpStatus.BAD_REQUEST;
                        break;
                }
            }
        }
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(errorCode)
                .message(message)
                .build();
        
        ApiResponse<ErrorResponse> response = ApiResponse.error(errorResponse);
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        log.error("RuntimeException occurred: {}", e.getMessage(), e);
        ApiResponse<Object> response = ApiResponse.error("서버 내부 오류가 발생했습니다.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception e) {
        log.error("Unexpected exception occurred: {}", e.getMessage(), e);
        ApiResponse<Object> response = ApiResponse.error("예상치 못한 오류가 발생했습니다.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}