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
public class ExternalInsuranceLoanResponseDto {
    private Long loanId;
    private Long userId;
    private String orgCode;
    private String loanType;
    private BigDecimal balanceAmt;
    private BigDecimal intRate;
    private String status;
    private String createdAt;
}
