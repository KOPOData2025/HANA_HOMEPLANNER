package com.hana_ti.home_planner.domain.house.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SubscriptionCalendarResponseDto {

    private String searchPeriod;           // 조회 기간
    private String targetPeriod;           // 청약 대상 기간
    private Integer totalCount;            // 전체 데이터 수
    private Integer filteredCount;         // 필터링된 데이터 수
    private List<SubscriptionInfoDto> subscriptionList; // 청약 정보 리스트

    public static SubscriptionCalendarResponseDto of(String searchPeriod, String targetPeriod,
                                                   Integer totalCount, Integer filteredCount,
                                                   List<SubscriptionInfoDto> subscriptionList) {
        return SubscriptionCalendarResponseDto.builder()
                .searchPeriod(searchPeriod)
                .targetPeriod(targetPeriod)
                .totalCount(totalCount)
                .filteredCount(filteredCount)
                .subscriptionList(subscriptionList)
                .build();
    }
}