package com.hana_ti.home_planner.domain.loan.dto;

import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import com.hana_ti.home_planner.domain.loan.entity.LoanInvitation;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanInvitationDetailResponseDto {

    // 초대 기본 정보
    private String inviteId;
    private String appId;
    private String inviterId;
    private String inviterName;
    private LoanInvitation.InvitationRole role;
    private LoanInvitation.InvitationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime responseAt;

    // 공동대출자 정보
    private String jointName;
    private String jointPhone;
    private String jointCi;

    // 대출 신청 정보
    private BigDecimal requestAmount;
    private Integer requestTerm;
    private LocalDateTime submittedAt;
    private LoanApplication.ApplicationStatus applicationStatus;

    // 대출 상품 정보
    private String productId;
    private String productName;
    private BigDecimal interestRate;
    private Integer maxLoanPeriodMonths;

    /**
     * LoanInvitation 엔티티로부터 DTO 생성
     */
    public static LoanInvitationDetailResponseDto from(LoanInvitation invitation, 
                                                      String inviterName,
                                                      LoanApplication application,
                                                      LoanProduct product) {
        return LoanInvitationDetailResponseDto.builder()
                // 초대 기본 정보
                .inviteId(invitation.getInviteId())
                .appId(invitation.getAppId())
                .inviterId(invitation.getInviterId())
                .inviterName(inviterName)
                .role(invitation.getRole())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .responseAt(invitation.getResponseAt())
                
                // 공동대출자 정보
                .jointName(invitation.getJointName())
                .jointPhone(invitation.getJointPhone())
                .jointCi(invitation.getJointCi())
                
                // 대출 신청 정보
                .requestAmount(application.getRequestAmount())
                .requestTerm(application.getRequestTerm())
                .submittedAt(application.getSubmittedAt())
                .applicationStatus(application.getStatus())
                
                // 대출 상품 정보
                .productId(product.getProductId())
                .productName(product.getLoanType())
                .interestRate(product.getBaseInterestRate())
                .maxLoanPeriodMonths(product.getMaxLoanPeriodMonths())
                .build();
    }
}
