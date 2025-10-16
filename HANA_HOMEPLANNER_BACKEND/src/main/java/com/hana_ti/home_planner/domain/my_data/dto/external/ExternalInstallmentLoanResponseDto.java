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
public class ExternalInstallmentLoanResponseDto {
    private Long loanId;           // instLoanId
    private Long userId;
    private String orgCode;
    private String productName;
    private BigDecimal principalAmt;  // 추가
    private BigDecimal balanceAmt;
    private BigDecimal intRate;
    private String repayMethod;        // 추가
    private String maturityDate;       // 추가
    private String nextPayDate;        // 추가
    private String status;
    private String createdAt;
}
