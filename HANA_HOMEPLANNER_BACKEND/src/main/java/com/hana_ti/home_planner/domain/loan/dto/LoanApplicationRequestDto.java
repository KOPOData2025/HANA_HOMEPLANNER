package com.hana_ti.home_planner.domain.loan.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class LoanApplicationRequestDto {

    @NotBlank(message = "상품 ID는 필수입니다")
    @Size(max = 36, message = "상품 ID는 36자를 초과할 수 없습니다")
    private String productId;

    @NotNull(message = "희망 금액은 필수입니다")
    @DecimalMin(value = "100000", message = "희망 금액은 최소 100,000원 이상이어야 합니다")
    @DecimalMax(value = "1000000000", message = "희망 금액은 최대 1,000,000,000원을 초과할 수 없습니다")
    private BigDecimal requestAmount;

    @NotNull(message = "희망 기간은 필수입니다")
    @Min(value = 1, message = "희망 기간은 최소 1개월 이상이어야 합니다")
    @Max(value = 360, message = "희망 기간은 최대 360개월을 초과할 수 없습니다")
    private Integer requestTerm;

    @NotBlank(message = "입금받을 계좌번호는 필수입니다")
    @Size(max = 50, message = "계좌번호는 50자를 초과할 수 없습니다")
    private String disburseAccountNumber;

    @Pattern(regexp = "^[YN]$", message = "공동대출 여부는 Y 또는 N이어야 합니다")
    private String isJoint = "N"; // 기본값 'N'

    @Size(max = 50, message = "공동대출자 이름은 50자를 초과할 수 없습니다")
    private String jointName;

    @Pattern(regexp = "^01[0-9]-[0-9]{4}-[0-9]{4}$", message = "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)")
    private String jointPhone;

    @NotNull(message = "희망 상환일은 필수입니다")
    @FutureOrPresent(message = "희망 상환일은 미래 날짜여야 합니다")
    private LocalDate disburseDate; // 희망 상환일

    public LoanApplicationRequestDto(String productId, BigDecimal requestAmount, 
                                   Integer requestTerm, String disburseAccountNumber, String isJoint) {
        this.productId = productId;
        this.requestAmount = requestAmount;
        this.requestTerm = requestTerm;
        this.disburseAccountNumber = disburseAccountNumber;
        this.isJoint = isJoint != null ? isJoint : "N";
    }
}
