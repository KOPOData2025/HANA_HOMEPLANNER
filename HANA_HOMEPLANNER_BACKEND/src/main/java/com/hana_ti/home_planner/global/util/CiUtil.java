package com.hana_ti.home_planner.global.util;

import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class CiUtil {

    private static final String SALT_PREFIX = "HANA_TI_HOME_PLANNER_";
    private static final String HASH_ALGORITHM = "SHA-256";

    /**
     * 주민등록번호로부터 CI값을 생성합니다.
     * 
     * @param residentNumber 주민등록번호 (하이픈 포함 또는 미포함)
     * @return 암호화된 CI값
     */
    public String generateCi(String residentNumber) {
        try {
            // 주민등록번호 정규화 (하이픈 제거)
            String normalizedNumber = normalizeResidentNumber(residentNumber);
            
            // 고정 솔트와 랜덤 솔트를 조합하여 최종 솔트 생성
            String finalSalt = generateFinalSalt(normalizedNumber);
            
            // 솔트와 주민등록번호를 조합하여 해시 생성
            String combinedValue = finalSalt + normalizedNumber;
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashBytes = digest.digest(combinedValue.getBytes());
            
            // Base64 인코딩하여 CI값 반환
            return Base64.getEncoder().encodeToString(hashBytes);
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("CI값 생성 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 주민등록번호를 정규화합니다 (하이픈 제거)
     */
    private String normalizeResidentNumber(String residentNumber) {
        if (residentNumber == null || residentNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("주민등록번호는 필수입니다.");
        }
        
        // 하이픈 제거 및 공백 제거
        String normalized = residentNumber.replaceAll("[\\s-]", "");
        
        // 주민등록번호 형식 검증 (13자리 숫자)
        if (!normalized.matches("\\d{13}")) {
            throw new IllegalArgumentException("올바른 주민등록번호 형식이 아닙니다. (13자리 숫자)");
        }
        
        return normalized;
    }

    /**
     * 고정 솔트와 주민등록번호 기반 랜덤 솔트를 조합하여 최종 솔트를 생성합니다.
     */
    private String generateFinalSalt(String normalizedNumber) {
        // 고정 솔트
        String fixedSalt = SALT_PREFIX;
        
        // 주민등록번호의 특정 부분을 사용하여 결정적이지만 예측 불가능한 솔트 생성
        String numberBasedSalt = normalizedNumber.substring(0, 6) + normalizedNumber.substring(7, 13);
        
        // 랜덤 솔트 (매번 다른 값이지만 같은 주민등록번호에 대해서는 동일한 값)
        SecureRandom random = new SecureRandom(numberBasedSalt.getBytes());
        byte[] randomBytes = new byte[16];
        random.nextBytes(randomBytes);
        String randomSalt = Base64.getEncoder().encodeToString(randomBytes);
        
        return fixedSalt + numberBasedSalt + randomSalt;
    }

    /**
     * CI값이 유효한지 검증합니다.
     * 
     * @param ci CI값
     * @return 유효성 여부
     */
    public boolean isValidCi(String ci) {
        if (ci == null || ci.trim().isEmpty()) {
            return false;
        }
        
        try {
            // Base64 디코딩 시도
            Base64.getDecoder().decode(ci);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
