package com.hana_ti.my_data.domain.my_data.dto;

import com.hana_ti.my_data.domain.my_data.entity.MdBankAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MdCardResponseDto {

    private Long cardId;
    private Long userId;
    private String orgCode;
    private String cardNum;
    private String cardName;
    private String cardType;
    private String createdAt;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Entity를 DTO로 변환하는 정적 팩토리 메서드
     */
    public static MdCardResponseDto from(MdBankAccount.MdCard entity) {
        return MdCardResponseDto.builder()
                .cardId(entity.getCardId())
                .userId(entity.getUserId())
                .orgCode(entity.getOrgCode())
                .cardNum(entity.getCardNum())
                .cardName(entity.getCardName())
                .cardType(entity.getCardType())
                .createdAt(formatDateTime(entity.getCreatedAt()))
                .build();
    }

    /**
     * LocalDateTime을 문자열로 포맷하는 유틸리티 메서드
     */
    private static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }
}
