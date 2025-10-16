package com.hana_ti.my_data.domain.my_data.dto;

import com.hana_ti.my_data.domain.my_data.entity.MdBankLoan;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MdBankLoanResponseDto {

    private Long loanId;
    private Long accountId;
    private Long userId;
    private String orgCode;
    private String loanType;
    private BigDecimal principalAmt;
    private BigDecimal balanceAmt;
    private BigDecimal intRate;
    private String repayMethod;
    private LocalDate maturityDate;
    private LocalDate nextPayDate;
    private LocalDateTime createdAt;

    public static MdBankLoanResponseDto from(MdBankLoan mdBankLoan) {
        return MdBankLoanResponseDto.builder()
                .loanId(mdBankLoan.getLoanId())
                .accountId(mdBankLoan.getAccountId())
                .userId(mdBankLoan.getUserId())
                .orgCode(mdBankLoan.getOrgCode())
                .loanType(mdBankLoan.getLoanType())
                .principalAmt(mdBankLoan.getPrincipalAmt())
                .balanceAmt(mdBankLoan.getBalanceAmt())
                .intRate(mdBankLoan.getIntRate())
                .repayMethod(mdBankLoan.getRepayMethod())
                .maturityDate(mdBankLoan.getMaturityDate())
                .nextPayDate(mdBankLoan.getNextPayDate())
                .createdAt(mdBankLoan.getCreatedAt())
                .build();
    }
}
