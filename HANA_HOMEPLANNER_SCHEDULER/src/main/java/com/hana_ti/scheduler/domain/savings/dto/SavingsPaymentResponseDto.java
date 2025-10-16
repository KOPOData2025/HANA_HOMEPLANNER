package com.hana_ti.scheduler.domain.savings.dto;

import com.hana_ti.scheduler.domain.savings.service.SavingsPaymentService;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SavingsPaymentResponseDto {

    private LocalDate processDate;
    private LocalDateTime processedAt;
    private int successCount;
    private int failureCount;
    private int errorCount;
    private BigDecimal totalAmount;
    private List<String> successList;
    private List<String> failureList;
    private List<String> errorList;
    private List<String> globalErrors;
    private String resultMessage;

    /**
     * 적금 납입 처리 결과를 ResponseDto로 생성
     */
    public static SavingsPaymentResponseDto create(LocalDate processDate, 
                                                 SavingsPaymentService.SavingsPaymentResult result) {
        return SavingsPaymentResponseDto.builder()
                .processDate(processDate)
                .processedAt(LocalDateTime.now())
                .successCount(result.getSuccessCount())
                .failureCount(result.getFailureCount())
                .errorCount(result.getErrorCount())
                .totalAmount(result.getTotalAmount())
                .successList(result.getSuccessList())
                .failureList(result.getFailureList())
                .errorList(result.getErrorList())
                .globalErrors(result.getGlobalErrors())
                .resultMessage(String.format("적금 납입 처리 완료 - 성공: %d건, 실패: %d건, 오류: %d건, 총금액: %,d원", 
                        result.getSuccessCount(), result.getFailureCount(), result.getErrorCount(), 
                        result.getTotalAmount().longValue()))
                .build();
    }
}
