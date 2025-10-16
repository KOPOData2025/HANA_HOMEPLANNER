package com.hana_ti.home_planner.domain.loan.dto;

import com.hana_ti.home_planner.domain.loan.entity.LoanRepaymentSchedule;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoanRepaymentScheduleResponseDto {

    private String repayId;
    private String loanId;
    private LocalDate dueDate;
    private BigDecimal principalDue;
    private BigDecimal interestDue;
    private BigDecimal totalDue;
    private String status;
    private String statusDescription;
    private LocalDateTime paidAt;

    /**
     * LoanRepaymentSchedule 엔티티를 LoanRepaymentScheduleResponseDto로 변환
     */
    public static LoanRepaymentScheduleResponseDto from(LoanRepaymentSchedule schedule) {
        return LoanRepaymentScheduleResponseDto.builder()
                .repayId(schedule.getRepayId())
                .loanId(schedule.getLoanId())
                .dueDate(schedule.getDueDate())
                .principalDue(schedule.getPrincipalDue())
                .interestDue(schedule.getInterestDue())
                .totalDue(schedule.getTotalDue())
                .status(schedule.getStatus() != null ? schedule.getStatus().name() : null)
                .statusDescription(schedule.getStatus() != null ? schedule.getStatus().getDescription() : null)
                .paidAt(schedule.getPaidAt())
                .build();
    }
}
