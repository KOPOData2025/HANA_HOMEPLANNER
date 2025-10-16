package com.hana_ti.home_planner.domain.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsMaturityInfoResponseDto {
    
    private String accountId;
    private String accountNumber;
    private String productId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalMonths;
    private String periodDescription;
    
    /**
     * UserSavings 엔티티로부터 DTO 생성
     */
    public static SavingsMaturityInfoResponseDto from(String accountId, String accountNumber, 
                                                     String productId, LocalDate startDate, LocalDate endDate) {
        Integer totalMonths = null;
        String periodDescription = null;
        
        if (startDate != null && endDate != null) {
            totalMonths = calculateMonthsBetween(startDate, endDate);
            periodDescription = totalMonths + "개월";
        }
        
        return SavingsMaturityInfoResponseDto.builder()
                .accountId(accountId)
                .accountNumber(accountNumber)
                .productId(productId)
                .startDate(startDate)
                .endDate(endDate)
                .totalMonths(totalMonths)
                .periodDescription(periodDescription)
                .build();
    }
    
    /**
     * 두 날짜 사이의 개월수 계산
     */
    private static Integer calculateMonthsBetween(LocalDate startDate, LocalDate endDate) {
        return (int) java.time.temporal.ChronoUnit.MONTHS.between(startDate, endDate);
    }
}
