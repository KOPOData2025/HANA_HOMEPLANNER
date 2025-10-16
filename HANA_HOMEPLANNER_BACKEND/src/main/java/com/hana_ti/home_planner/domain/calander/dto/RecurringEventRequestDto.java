package com.hana_ti.home_planner.domain.calander.dto;

import com.hana_ti.home_planner.domain.calander.entity.MyCalendarEvent;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringEventRequestDto {
    
    @NotNull(message = "이벤트 타입은 필수 입력값입니다.")
    private MyCalendarEvent.EventType eventType;
    
    @NotNull(message = "거래 유형은 필수 입력값입니다.")
    private MyCalendarEvent.TransactionType transactionType;
    
    @NotBlank(message = "제목은 필수 입력값입니다.")
    private String title;
    
    @NotBlank(message = "설명은 필수 입력값입니다.")
    private String description;
    
    @NotNull(message = "금액은 필수 입력값입니다.")
    @DecimalMin(value = "0.01", message = "금액은 0.01 이상이어야 합니다.")
    private BigDecimal amount;
    
    @NotNull(message = "반복 타입은 필수 입력값입니다.")
    private RecurrenceType recurrenceType;
    
    @NotNull(message = "시작일은 필수 입력값입니다.")
    private LocalDate startDate;
    
    @NotNull(message = "종료일은 필수 입력값입니다.")
    private LocalDate endDate;
    
    @Min(value = 1, message = "요일은 1(월요일)부터 7(일요일)까지 입력해주세요.")
    @Max(value = 7, message = "요일은 1(월요일)부터 7(일요일)까지 입력해주세요.")
    private Integer dayOfWeek;  // WEEKLY인 경우만 사용 (1=월요일, 7=일요일)
    
    @Min(value = 1, message = "날짜는 1일부터 31일까지 입력해주세요.")
    @Max(value = 31, message = "날짜는 1일부터 31일까지 입력해주세요.")
    private Integer dayOfMonth; // MONTHLY인 경우만 사용 (1-31)

    public enum RecurrenceType {
        WEEKLY("매주"),
        MONTHLY("매월");
        
        private final String description;
        
        RecurrenceType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
