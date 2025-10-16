package com.hana_ti.home_planner.domain.my_data.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalCardResponseDto {
    private Long cardId;
    private Long userId;
    private String orgCode;
    private String cardNum;
    private String cardType;
    private String cardName;
    private String status;
    private String createdAt;
}
