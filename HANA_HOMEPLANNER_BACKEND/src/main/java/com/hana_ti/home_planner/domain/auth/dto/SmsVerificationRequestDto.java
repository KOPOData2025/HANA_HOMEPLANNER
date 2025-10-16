package com.hana_ti.home_planner.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SmsVerificationRequestDto {

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    private String name;

    @NotBlank(message = "주민번호는 필수입니다")
    @Pattern(regexp = "^[0-9]{6}-[0-9]{7}$", message = "주민번호 형식이 올바르지 않습니다 (예: 901201-1234567)")
    private String residentNumber;

    @NotBlank(message = "전화번호는 필수입니다")
    @Pattern(regexp = "^01[0-9]-[0-9]{4}-[0-9]{4}$", message = "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)")
    private String phoneNumber;

    public SmsVerificationRequestDto(String name, String residentNumber, String phoneNumber) {
        this.name = name;
        this.residentNumber = residentNumber;
        this.phoneNumber = phoneNumber;
    }
}
