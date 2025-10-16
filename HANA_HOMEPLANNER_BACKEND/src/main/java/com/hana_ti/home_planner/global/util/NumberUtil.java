package com.hana_ti.home_planner.global.util;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.Optional;


@Slf4j
public class NumberUtil {

    /**
     * String을 BigDecimal로 안전하게 변환
     * 
     * @param value 변환할 문자열
     * @return 변환된 BigDecimal (변환 실패 시 Optional.empty())
     */
    public static Optional<BigDecimal> safeParseBigDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            log.warn("빈 문자열 또는 null 값으로 BigDecimal 변환 시도");
            return Optional.empty();
        }

        try {
            // 공백 제거 후 변환
            String trimmedValue = value.trim();
            BigDecimal result = new BigDecimal(trimmedValue);
            log.debug("String '{}' -> BigDecimal '{}' 변환 성공", value, result);
            return Optional.of(result);
        } catch (NumberFormatException e) {
            log.warn("String '{}' -> BigDecimal 변환 실패: {}", value, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * String을 BigDecimal로 변환 (실패 시 기본값 반환)
     * 
     * @param value 변환할 문자열
     * @param defaultValue 변환 실패 시 반환할 기본값
     * @return 변환된 BigDecimal 또는 기본값
     */
    public static BigDecimal parseBigDecimalWithDefault(String value, BigDecimal defaultValue) {
        return safeParseBigDecimal(value).orElse(defaultValue);
    }

    /**
     * 숫자 문자열인지 검증
     * 
     * @param value 검증할 문자열
     * @return 숫자 문자열이면 true, 그렇지 않으면 false
     */
    public static boolean isNumeric(String value) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }

        try {
            new BigDecimal(value.trim());
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * 주택관리번호 유효성 검증
     * 주택관리번호는 양의 정수여야 함
     * 
     * @param houseManagementNumberStr 검증할 주택관리번호 문자열
     * @return 유효한 주택관리번호이면 true, 그렇지 않으면 false
     */
    public static boolean isValidHouseManagementNumber(String houseManagementNumberStr) {
        if (!isNumeric(houseManagementNumberStr)) {
            return false;
        }

        try {
            BigDecimal number = new BigDecimal(houseManagementNumberStr.trim());
            // 양수이고 소수점이 없는 정수여야 함
            return number.compareTo(BigDecimal.ZERO) > 0 && number.scale() <= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
