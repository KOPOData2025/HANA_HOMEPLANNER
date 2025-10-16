package com.hana_ti.scheduler.domain.loan.dto;

import com.hana_ti.scheduler.domain.loan.service.LoanPaymentService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanPaymentTestResponseDto {

    private LocalDateTime executionDate;
    private LocalDate targetDate;
    private int successCount;
    private int failureCount;
    private int errorCount;
    private List<PaymentDetailDto> successDetails;
    private List<PaymentDetailDto> failureDetails;
    private List<PaymentDetailDto> errorDetails;
    private String resultFileName;

    /**
     * LoanPaymentResult로부터 DTO 생성
     */
    public static LoanPaymentTestResponseDto from(LoanPaymentService.LoanPaymentResult result, String fileName) {
        return LoanPaymentTestResponseDto.builder()
                .executionDate(result.getExecutionDate())
                .targetDate(result.getTargetDate())
                .successCount(result.getSuccessCount())
                .failureCount(result.getFailureCount())
                .errorCount(result.getErrorCount())
                .successDetails(result.getSuccessDetails().stream()
                        .map(PaymentDetailDto::from)
                        .toList())
                .failureDetails(result.getFailureDetails().stream()
                        .map(PaymentDetailDto::from)
                        .toList())
                .errorDetails(result.getErrorDetails().stream()
                        .map(PaymentDetailDto::from)
                        .toList())
                .resultFileName(fileName)
                .build();
    }

    /**
     * 결제 상세 정보 DTO
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDetailDto {
        private String scheduleId;
        private String loanId;
        private String fromAccountNum;
        private String toAccountNum;
        private String amount;
        private String fromAccountBalance;
        private String toAccountBalance;
        private String status;
        private String errorMessage;
        private LocalDateTime processedAt;

        /**
         * PaymentDetail로부터 DTO 생성
         */
        public static PaymentDetailDto from(LoanPaymentService.PaymentDetail detail) {
            return PaymentDetailDto.builder()
                    .scheduleId(detail.getScheduleId())
                    .loanId(detail.getLoanId())
                    .fromAccountNum(detail.getFromAccountNum())
                    .toAccountNum(detail.getToAccountNum())
                    .amount(detail.getAmount() != null ? detail.getAmount().toString() : null)
                    .fromAccountBalance(detail.getFromAccountBalance() != null ? detail.getFromAccountBalance().toString() : null)
                    .toAccountBalance(detail.getToAccountBalance() != null ? detail.getToAccountBalance().toString() : null)
                    .status(detail.getStatus())
                    .errorMessage(detail.getErrorMessage())
                    .processedAt(detail.getProcessedAt())
                    .build();
        }
    }
}
