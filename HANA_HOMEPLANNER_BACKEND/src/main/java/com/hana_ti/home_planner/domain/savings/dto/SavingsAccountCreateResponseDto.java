package com.hana_ti.home_planner.domain.savings.dto;

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
public class SavingsAccountCreateResponseDto {

    private String accountId;
    private String accountNumber;
    private String userSavingsId;
    private String productId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyAmount;
    private BigDecimal initialDeposit;
    private String autoDebitAccountId;
    private LocalDate createdAt;
    private int paymentScheduleCount;
    private List<PaymentScheduleInfo> paymentSchedules;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentScheduleInfo {
        private String paymentId;
        private LocalDate dueDate;
        private BigDecimal amount;
        private String status;
    }
}
