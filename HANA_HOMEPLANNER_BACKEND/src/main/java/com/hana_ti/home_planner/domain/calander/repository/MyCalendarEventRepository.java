package com.hana_ti.home_planner.domain.calander.repository;

import com.hana_ti.home_planner.domain.calander.entity.MyCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface MyCalendarEventRepository extends JpaRepository<MyCalendarEvent, Long> {

    /**
     * 사용자별 캘린더 이벤트 목록 조회 (날짜순)
     */
    List<MyCalendarEvent> findByUserIdOrderByEventDateAsc(String userId);

    /**
     * 사용자별 특정 날짜의 캘린더 이벤트 목록 조회
     */
    List<MyCalendarEvent> findByUserIdAndEventDateOrderByCreatedAtAsc(String userId, LocalDate eventDate);

    /**
     * 사용자별 특정 기간의 캘린더 이벤트 목록 조회
     */
    @Query("SELECT e FROM MyCalendarEvent e WHERE e.userId = :userId " +
           "AND e.eventDate BETWEEN :startDate AND :endDate " +
           "ORDER BY e.eventDate ASC")
    List<MyCalendarEvent> findByUserIdAndEventDateBetween(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * 사용자별 특정 상태의 캘린더 이벤트 목록 조회
     */
    List<MyCalendarEvent> findByUserIdAndStatusOrderByEventDateAsc(String userId, MyCalendarEvent.EventStatus status);

    /**
     * 사용자별 특정 이벤트 타입의 캘린더 이벤트 목록 조회
     */
    List<MyCalendarEvent> findByUserIdAndEventTypeOrderByEventDateAsc(String userId, MyCalendarEvent.EventType eventType);


    /**
     * 사용자별 특정 월의 캘린더 이벤트 목록 조회
     */
    @Query("SELECT e FROM MyCalendarEvent e WHERE e.userId = :userId " +
           "AND YEAR(e.eventDate) = :year AND MONTH(e.eventDate) = :month " +
           "ORDER BY e.eventDate ASC")
    List<MyCalendarEvent> findByUserIdAndYearAndMonth(
            @Param("userId") String userId,
            @Param("year") int year,
            @Param("month") int month);

    /**
     * 사용자별 오늘 예정된 캘린더 이벤트 목록 조회
     */
    @Query("SELECT e FROM MyCalendarEvent e WHERE e.userId = :userId " +
           "AND e.eventDate = :today AND e.status = 'SCHEDULED' " +
           "ORDER BY e.createdAt ASC")
    List<MyCalendarEvent> findTodayScheduledEvents(
            @Param("userId") String userId,
            @Param("today") LocalDate today);

    /**
     * 사용자별 지난 예정 이벤트 목록 조회 (미완료)
     */
    @Query("SELECT e FROM MyCalendarEvent e WHERE e.userId = :userId " +
           "AND e.eventDate < :today AND e.status = 'SCHEDULED' " +
           "ORDER BY e.eventDate DESC")
    List<MyCalendarEvent> findPastScheduledEvents(
            @Param("userId") String userId,
            @Param("today") LocalDate today);

    /**
     * 사용자별 특정 관련 ID의 캘린더 이벤트 존재 여부 확인
     */
    boolean existsByUserIdAndRelatedId(String userId, String relatedId);

    /**
     * 사용자별 특정 관련 ID의 캘린더 이벤트 존재 여부 확인 (null 안전)
     */
    @Query("SELECT COUNT(e) > 0 FROM MyCalendarEvent e WHERE e.userId = :userId AND e.relatedId = :relatedId")
    boolean existsByUserIdAndRelatedIdSafe(@Param("userId") String userId, @Param("relatedId") String relatedId);


    /**
     * 사용자별 특정 제목의 캘린더 이벤트 존재 여부 확인
     */
    boolean existsByUserIdAndTitle(String userId, String title);

    /**
     * 사용자별 특정 제목의 모든 캘린더 이벤트 삭제
     */
    void deleteByUserIdAndTitle(String userId, String title);

    /**
     * 사용자별 특정 제목의 캘린더 이벤트 목록 조회
     */
    List<MyCalendarEvent> findByUserIdAndTitle(String userId, String title);
}
