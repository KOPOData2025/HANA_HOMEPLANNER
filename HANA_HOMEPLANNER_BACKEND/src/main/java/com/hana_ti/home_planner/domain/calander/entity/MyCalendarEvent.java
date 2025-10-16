package com.hana_ti.home_planner.domain.calander.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "MY_CALENDAR_EVENT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MyCalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EVENT_ID")
    private Long eventId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "EVENT_DATE", nullable = false)
    private LocalDate eventDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "TRANSACTION_TYPE", length = 30)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "EVENT_TYPE", length = 30)
    private EventType eventType;

    @Column(name = "TITLE", length = 200, nullable = false)
    private String title;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "AMOUNT", precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private EventStatus status;

    @Column(name = "RELATED_ID", length = 36)
    private String relatedId;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public static MyCalendarEvent create(String userId, LocalDate eventDate, TransactionType transactionType,
                                       EventType eventType, String title, String description, BigDecimal amount,
                                       String relatedId) {
        MyCalendarEvent event = new MyCalendarEvent();
        event.userId = userId;
        event.eventDate = eventDate;
        event.transactionType = transactionType;
        event.eventType = eventType;
        event.title = title;
        event.description = description;
        event.amount = amount;
        // STATUS 결정: 오늘 날짜 기준 이후면 SCHEDULED, 이전이면 DONE
        event.status = eventDate.isAfter(LocalDate.now()) ? EventStatus.SCHEDULED : EventStatus.DONE;
        event.relatedId = relatedId;
        event.createdAt = LocalDateTime.now();
        event.updatedAt = LocalDateTime.now();
        return event;
    }

    public void updateStatus(EventStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateEvent(String title, String description, BigDecimal amount) {
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 거래 유형 열거형
     */
    public enum TransactionType {
        DEPOSIT("입금"),
        WITHDRAW("출금");

        private final String description;

        TransactionType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 이벤트 유형 열거형
     */
    public enum EventType {
        LOAN("대출"),
        SAVINGS("적금"),
        CARD("카드"),
        CONSUMPTION("소비"),
        UTILITY("공과금"),           // 전기요금, 가스요금, 수도요금 등
        MANAGEMENT_FEE("관리비"),    // 아파트 관리비, 오피스텔 관리비 등
        INSURANCE("보험료"),         // 생명보험, 자동차보험, 건강보험 등
        TAX("세금"),                // 자동차세, 주민세, 소득세 등
        SUBSCRIPTION("구독료"),       // 넷플릭스, 유튜브 프리미엄, 음악 스트리밍 등
        EDUCATION("교육비"),         // 학원비, 과외비, 온라인 강의 등
        MEDICAL("의료비"),           // 병원비, 약값, 건강검진 등
        TRANSPORTATION("교통비"),     // 대중교통, 택시비, 주유비 등
        FOOD("식비"),               // 식료품, 외식비 등
        ENTERTAINMENT("오락비"),     // 영화, 게임, 취미 활동 등
        SHOPPING("쇼핑"),            // 의류, 생활용품, 전자제품 등
        TRAVEL("여행비"),           // 숙박비, 항공료, 여행 경비 등
        ETC("기타");

        private final String description;

        EventType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 이벤트 상태 열거형
     */
    public enum EventStatus {
        SCHEDULED("예정"),
        DONE("완료"),
        CANCELED("취소");

        private final String description;

        EventStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
