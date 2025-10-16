package com.hana_ti.home_planner.domain.calander.dto;

import com.hana_ti.home_planner.domain.calander.entity.MyCalendarEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyCalendarEventUpdateDto {

    private String title;
    private String description;
    private BigDecimal amount;
    private MyCalendarEvent.EventStatus status;
}
