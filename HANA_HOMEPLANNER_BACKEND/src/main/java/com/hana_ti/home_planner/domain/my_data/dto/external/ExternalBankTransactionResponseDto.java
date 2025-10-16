package com.hana_ti.home_planner.domain.my_data.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalBankTransactionResponseDto {
    private Long transactionId;
    private Long accountId;
    private Long userId;
    private String orgCode;
    private String transactionDate;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String createdAt; // LocalDateTime 대신 String으로 받음
}
