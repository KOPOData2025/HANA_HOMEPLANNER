package com.hana_ti.home_planner.domain.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationAccountInfoResponseDto {
    
    // 초대 정보
    private String inviteId;
    private String accountId;
    private String inviterId;
    
    // 적금 정보 (여러 개 가능)
    private List<UserSavingsInfo> userSavingsList;
    
    // 상품 정보
    private SavingsProductInfo savingsProduct;
    
    // 기간 정보
    private PeriodInfo periodInfo;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSavingsInfo {
        private String userSavingsId;
        private String userId;
        private String productId;
        private String accountId;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal monthlyAmount;
        private String status;
        private LocalDate createdAt;
        private String autoDebitAccountId;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SavingsProductInfo {
        private String productId;
        private String productName;
        private String productType;
        private String bankName;
        private String paymentMethod;
        private String isCompoundInterestApplied;
        private String isTaxPreferenceApplied;
        private Integer paymentDelayPeriodMonths;
        private BigDecimal earlyWithdrawPenaltyRate;
        private BigDecimal preferentialInterestRate;
        private Integer termMonths;
        private BigDecimal minDepositAmount;
        private BigDecimal maxDepositAmount;
        private BigDecimal baseInterestRate;
        private String productDescription;
        private String targetDescription;
        private String interestPaymentMethod;
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PeriodInfo {
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalMonths;
        private String periodDescription;
    }
}
