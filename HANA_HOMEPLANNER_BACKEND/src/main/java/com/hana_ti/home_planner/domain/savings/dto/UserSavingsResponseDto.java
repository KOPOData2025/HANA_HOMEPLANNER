package com.hana_ti.home_planner.domain.savings.dto;

import com.hana_ti.home_planner.domain.savings.entity.UserSavings;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class UserSavingsResponseDto {

    private String userSavingsId;
    private String userId;
    private String productId;
    private String accountId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyAmount;
    private String status;
    private String statusDescription;
    private LocalDate createdAt;
    private String autoDebitAccountId;

    /**
     * UserSavings 엔티티를 UserSavingsResponseDto로 변환
     */
    public static UserSavingsResponseDto from(UserSavings userSavings) {
        return UserSavingsResponseDto.builder()
                .userSavingsId(userSavings.getUserSavingsId())
                .userId(userSavings.getUserId())
                .productId(userSavings.getProductId())
                .accountId(userSavings.getAccountId())
                .startDate(userSavings.getStartDate())
                .endDate(userSavings.getEndDate())
                .monthlyAmount(userSavings.getMonthlyAmount())
                .status(userSavings.getStatus() != null ? userSavings.getStatus().name() : null)
                .statusDescription(userSavings.getStatus() != null ? userSavings.getStatus().getDescription() : null)
                .createdAt(userSavings.getCreatedAt())
                .autoDebitAccountId(userSavings.getAutoDebitAccountId())
                .build();
    }
}
