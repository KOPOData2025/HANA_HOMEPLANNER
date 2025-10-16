package com.hana_ti.home_planner.domain.calander.dto;

import com.hana_ti.home_planner.domain.calander.entity.MyCalendarEvent;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Builder
public class MyCalendarEventResponseDto {

    private Long eventId;
    private String userId;
    private LocalDate eventDate;
    private String transactionType;
    private String transactionTypeDescription;
    private String eventType;
    private String eventTypeDescription;
    private String title;
    private String description;
    private BigDecimal amount;
    private String status;
    private String statusDescription;
    private String relatedId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * MyCalendarEvent 엔티티를 MyCalendarEventResponseDto로 변환
     */
    public static MyCalendarEventResponseDto from(MyCalendarEvent event) {
        return MyCalendarEventResponseDto.builder()
                .eventId(event.getEventId())
                .userId(event.getUserId())
                .eventDate(event.getEventDate())
                .transactionType(event.getTransactionType() != null ? event.getTransactionType().name() : null)
                .transactionTypeDescription(event.getTransactionType() != null ? event.getTransactionType().getDescription() : null)
                .eventType(event.getEventType() != null ? event.getEventType().name() : null)
                .eventTypeDescription(event.getEventType() != null ? event.getEventType().getDescription() : null)
                .title(event.getTitle())
                .description(event.getDescription())
                .amount(event.getAmount())
                .status(event.getStatus() != null ? event.getStatus().name() : null)
                .statusDescription(event.getStatus() != null ? event.getStatus().getDescription() : null)
                .relatedId(event.getRelatedId())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
