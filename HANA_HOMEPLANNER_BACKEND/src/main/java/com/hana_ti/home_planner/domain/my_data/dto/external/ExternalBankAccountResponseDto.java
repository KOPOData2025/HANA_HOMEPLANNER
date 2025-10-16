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
public class ExternalBankAccountResponseDto {
    private Long accountId;
    private Long userId;
    private String orgCode;
    private String accountNum;
    private String accountType;
    private String accountName;
    private BigDecimal balanceAmt;
    private String status;
    private String openedDate;
    private String consentYn;
    private String createdAt;
}
