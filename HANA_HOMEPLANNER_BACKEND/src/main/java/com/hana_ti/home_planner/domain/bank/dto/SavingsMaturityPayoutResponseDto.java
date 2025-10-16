package com.hana_ti.home_planner.domain.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsMaturityPayoutResponseDto {

    private String accountId;                    // 적금 계좌 ID
    private String accountNumber;                 // 적금 계좌번호
    private String productId;                     // 상품 ID
    private String productName;                   // 상품명
    private BigDecimal principalAmount;           // 원금 (총 납입액)
    private BigDecimal interestAmount;            // 이자
    private BigDecimal totalPayoutAmount;        // 총 지급액 (원금 + 이자)
    private String targetAccountNumber;           // 지급받을 계좌번호
    private LocalDate processedAt;                // 처리일시
    private String transactionId;                 // 거래 ID
    private String status;                        // 처리 상태
}
