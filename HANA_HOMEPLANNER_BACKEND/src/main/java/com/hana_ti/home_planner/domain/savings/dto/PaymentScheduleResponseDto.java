package com.hana_ti.home_planner.domain.savings.dto;

import com.hana_ti.home_planner.domain.savings.entity.PaymentSchedule;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class PaymentScheduleResponseDto {

    private String paymentId;
    private String userId;
    private String accountId;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String status;
    private String statusDescription;
    private LocalDate paidAt;

    /**
     * PaymentSchedule 엔티티를 PaymentScheduleResponseDto로 변환
     */
    public static PaymentScheduleResponseDto from(PaymentSchedule paymentSchedule) {
        return PaymentScheduleResponseDto.builder()
                .paymentId(paymentSchedule.getPaymentId())
                .userId(paymentSchedule.getUserId())
                .accountId(paymentSchedule.getAccountId())
                .dueDate(paymentSchedule.getDueDate())
                .amount(paymentSchedule.getAmount())
                .status(paymentSchedule.getStatus() != null ? paymentSchedule.getStatus().name() : null)
                .statusDescription(paymentSchedule.getStatus() != null ? paymentSchedule.getStatus().getDescription() : null)
                .paidAt(paymentSchedule.getPaidAt())
                .build();
    }
}
