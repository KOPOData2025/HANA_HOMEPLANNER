package com.hana_ti.home_planner.domain.loan.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class JointLoanApprovalRequestDto {

    @NotBlank(message = "대출 신청 ID는 필수입니다")
    @Size(max = 36, message = "대출 신청 ID는 36자를 초과할 수 없습니다")
    private String loanApplicationId;

    @NotBlank(message = "심사자 ID는 필수입니다")
    @Size(max = 36, message = "심사자 ID는 36자를 초과할 수 없습니다")
    private String reviewerId;

    @Size(max = 500, message = "심사 의견은 500자를 초과할 수 없습니다")
    private String remarks;

    @DecimalMin(value = "0.0", message = "최종 금리는 0% 이상이어야 합니다")
    @DecimalMax(value = "20.0", message = "최종 금리는 20% 이하여야 합니다")
    private BigDecimal finalRate;

    @DecimalMin(value = "100000", message = "대출 금액은 최소 100,000원 이상이어야 합니다")
    @DecimalMax(value = "1000000000", message = "대출 금액은 최대 1,000,000,000원을 초과할 수 없습니다")
    private BigDecimal loanAmount;

    @Min(value = 1, message = "대출 기간은 최소 1개월 이상이어야 합니다")
    @Max(value = 360, message = "대출 기간은 최대 360개월을 초과할 수 없습니다")
    private Integer termMonths;

    @NotBlank(message = "공동 참여자 ID는 필수입니다")
    @Size(max = 36, message = "공동 참여자 ID는 36자를 초과할 수 없습니다")
    private String jointParticipantId;

    @NotBlank(message = "계좌 ID는 필수입니다")
    @Size(max = 36, message = "계좌 ID는 36자를 초과할 수 없습니다")
    private String accountId;

    public JointLoanApprovalRequestDto(String loanApplicationId, String reviewerId, 
                                     String remarks, BigDecimal finalRate,
                                     BigDecimal loanAmount, Integer termMonths, String jointParticipantId, String accountId) {
        this.loanApplicationId = loanApplicationId;
        this.reviewerId = reviewerId;
        this.remarks = remarks;
        this.finalRate = finalRate;
        this.loanAmount = loanAmount;
        this.termMonths = termMonths;
        this.jointParticipantId = jointParticipantId;
        this.accountId = accountId;
    }
}
