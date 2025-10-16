package com.hana_ti.home_planner.domain.loan.dto;

import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoanApplicationResponseDto {

    private String appId;
    private String userId;
    private String productId;
    private BigDecimal requestAmount;
    private Integer requestTerm;
    private String status;
    private String statusDescription;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewerId;
    private String remarks;
    private String disburseAccountId;
    private String isJoint;
    private LocalDate disburseDate; // 희망 상환일

    /**
     * LoanApplication 엔티티를 ResponseDto로 변환
     */
    public static LoanApplicationResponseDto from(LoanApplication application) {
        return LoanApplicationResponseDto.builder()
                .appId(application.getAppId())
                .userId(application.getUserId())
                .productId(application.getProductId())
                .requestAmount(application.getRequestAmount())
                .requestTerm(application.getRequestTerm())
                .status(application.getStatus().name())
                .statusDescription(application.getStatus().getDescription())
                .submittedAt(application.getSubmittedAt())
                .reviewedAt(application.getReviewedAt())
                .reviewerId(application.getReviewerId())
                .remarks(application.getRemarks())
                .disburseAccountId(application.getDisburseAccountId())
                .isJoint(application.getIsJoint())
                .disburseDate(application.getDisburseDate())
                .build();
    }
}
