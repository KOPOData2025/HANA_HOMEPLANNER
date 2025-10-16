package com.hana_ti.my_data.domain.my_data.dto;

import com.hana_ti.my_data.domain.my_data.entity.MdCardLoan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MdCardLoanResponseDto {

    private Long cardLoanId;
    private Long cardId;
    private String orgCode;
    private String loanType;
    private BigDecimal principalAmt;
    private BigDecimal balanceAmt;
    private BigDecimal intRate;
    private String maturityDate;
    private String nextPayDate;
    private String createdAt;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Entity를 DTO로 변환하는 정적 팩토리 메서드
     */
    public static MdCardLoanResponseDto from(MdCardLoan entity) {
        return MdCardLoanResponseDto.builder()
                .cardLoanId(entity.getCardLoanId())
                .cardId(entity.getCardId())
                .orgCode(entity.getOrgCode())
                .loanType(entity.getLoanType())
                .principalAmt(entity.getPrincipalAmt())
                .balanceAmt(entity.getBalanceAmt())
                .intRate(entity.getIntRate())
                .maturityDate(formatDate(entity.getMaturityDate()))
                .nextPayDate(formatDate(entity.getNextPayDate()))
                .createdAt(formatDateTime(entity.getCreatedAt()))
                .build();
    }

    /**
     * LocalDate를 문자열로 포맷하는 유틸리티 메서드
     */
    private static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    /**
     * LocalDateTime을 문자열로 포맷하는 유틸리티 메서드
     */
    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }
}
