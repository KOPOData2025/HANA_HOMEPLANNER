package com.hana_ti.home_planner.global.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s를 찾을 수 없습니다. %s: %s", resource, field, value));
    }
}
