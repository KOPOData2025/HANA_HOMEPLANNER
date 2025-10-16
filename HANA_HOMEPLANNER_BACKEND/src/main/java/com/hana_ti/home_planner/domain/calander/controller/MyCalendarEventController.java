package com.hana_ti.home_planner.domain.calander.controller;

import com.hana_ti.home_planner.domain.calander.dto.MyCalendarEventRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.MyCalendarEventResponseDto;
import com.hana_ti.home_planner.domain.calander.dto.MyCalendarEventUpdateDto;
import com.hana_ti.home_planner.domain.calander.dto.SavingsScheduleRegistrationRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.LoanScheduleRegistrationRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.RecurringEventRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.ConsumptionSummaryResponseDto;
import com.hana_ti.home_planner.domain.calander.dto.TransactionHistoryRegistrationRequestDto;
import com.hana_ti.home_planner.domain.calander.service.MyCalendarEventService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Slf4j
public class MyCalendarEventController {

    private final MyCalendarEventService myCalendarEventService;
    private final JwtUtil jwtUtil;

    /**
     * 캘린더 이벤트 생성
     */
    @PostMapping("/events")
    public ResponseEntity<ApiResponse<MyCalendarEventResponseDto>> createEvent(
            @RequestBody MyCalendarEventRequestDto request,
            @RequestHeader("Authorization") String authorization) {
        log.info("캘린더 이벤트 생성 API 호출 - 제목: {}", request.getTitle());
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            // 요청 DTO에 사용자 ID 설정
            MyCalendarEventRequestDto requestWithUserId = MyCalendarEventRequestDto.builder()
                    .userId(userId)
                    .eventDate(request.getEventDate())
                    .transactionType(request.getTransactionType())
                    .eventType(request.getEventType())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .amount(request.getAmount())
                    .relatedId(request.getRelatedId())
                    .build();
            
            MyCalendarEventResponseDto event = myCalendarEventService.createEvent(requestWithUserId);
            return ResponseEntity.ok(ApiResponse.success("캘린더 이벤트 생성 성공", event));
        } catch (Exception e) {
            log.error("캘린더 이벤트 생성 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("캘린더 이벤트 생성 실패: " + e.getMessage()));
        }
    }

    /**
     * 캘린더 이벤트 수정
     */
    @PutMapping("/events/{eventId}")
    public ResponseEntity<ApiResponse<MyCalendarEventResponseDto>> updateEvent(
            @PathVariable Long eventId,
            @RequestBody MyCalendarEventUpdateDto updateDto,
            @RequestHeader("Authorization") String authorization) {
        log.info("캘린더 이벤트 수정 API 호출 - 이벤트ID: {}", eventId);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            MyCalendarEventResponseDto event = myCalendarEventService.updateEvent(eventId, updateDto);
            return ResponseEntity.ok(ApiResponse.success("캘린더 이벤트 수정 성공", event));
        } catch (Exception e) {
            log.error("캘린더 이벤트 수정 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("캘린더 이벤트 수정 실패: " + e.getMessage()));
        }
    }

    /**
     * 캘린더 이벤트 삭제
     */
    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long eventId,
            @RequestHeader("Authorization") String authorization) {
        log.info("캘린더 이벤트 삭제 API 호출 - 이벤트ID: {}", eventId);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            myCalendarEventService.deleteEvent(eventId);
            return ResponseEntity.ok(ApiResponse.success("캘린더 이벤트 삭제 성공", null));
        } catch (Exception e) {
            log.error("캘린더 이벤트 삭제 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("캘린더 이벤트 삭제 실패: " + e.getMessage()));
        }
    }

    /**
     * 사용자별 캘린더 이벤트 목록 조회
     */
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> getUserEvents(
            @RequestHeader("Authorization") String authorization) {
        log.info("사용자별 캘린더 이벤트 목록 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.getUserEvents(userId);
            return ResponseEntity.ok(ApiResponse.success("캘린더 이벤트 목록 조회 성공", events));
        } catch (Exception e) {
            log.error("캘린더 이벤트 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("캘린더 이벤트 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 특정 날짜의 캘린더 이벤트 목록 조회
     */
    @GetMapping("/events/date/{eventDate}")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> getUserEventsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate eventDate,
            @RequestHeader("Authorization") String authorization) {
        log.info("특정 날짜 캘린더 이벤트 목록 조회 API 호출 - 날짜: {}", eventDate);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.getUserEventsByDate(userId, eventDate);
            return ResponseEntity.ok(ApiResponse.success("특정 날짜 캘린더 이벤트 목록 조회 성공", events));
        } catch (Exception e) {
            log.error("특정 날짜 캘린더 이벤트 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("특정 날짜 캘린더 이벤트 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 특정 기간의 캘린더 이벤트 목록 조회
     */
    @GetMapping("/events/range")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> getUserEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("Authorization") String authorization) {
        log.info("특정 기간 캘린더 이벤트 목록 조회 API 호출 - 시작일: {}, 종료일: {}", startDate, endDate);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.getUserEventsByDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("특정 기간 캘린더 이벤트 목록 조회 성공", events));
        } catch (Exception e) {
            log.error("특정 기간 캘린더 이벤트 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("특정 기간 캘린더 이벤트 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 특정 월의 캘린더 이벤트 목록 조회
     */
    @GetMapping("/events/month/{year}/{month}")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> getUserEventsByMonth(
            @PathVariable int year,
            @PathVariable int month,
            @RequestHeader("Authorization") String authorization) {
        log.info("특정 월 캘린더 이벤트 목록 조회 API 호출 - 년: {}, 월: {}", year, month);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.getUserEventsByMonth(userId, year, month);
            return ResponseEntity.ok(ApiResponse.success("특정 월 캘린더 이벤트 목록 조회 성공", events));
        } catch (Exception e) {
            log.error("특정 월 캘린더 이벤트 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("특정 월 캘린더 이벤트 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 오늘 예정된 캘린더 이벤트 목록 조회
     */
    @GetMapping("/events/today")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> getTodayScheduledEvents(
            @RequestHeader("Authorization") String authorization) {
        log.info("오늘 예정된 캘린더 이벤트 목록 조회 API 호출");
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.getTodayScheduledEvents(userId);
            return ResponseEntity.ok(ApiResponse.success("오늘 예정된 캘린더 이벤트 목록 조회 성공", events));
        } catch (Exception e) {
            log.error("오늘 예정된 캘린더 이벤트 목록 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("오늘 예정된 캘린더 이벤트 목록 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 캘린더 이벤트 상세 조회
     */
    @GetMapping("/events/{eventId}")
    public ResponseEntity<ApiResponse<MyCalendarEventResponseDto>> getEventById(
            @PathVariable Long eventId,
            @RequestHeader("Authorization") String authorization) {
        log.info("캘린더 이벤트 상세 조회 API 호출 - 이벤트ID: {}", eventId);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            MyCalendarEventResponseDto event = myCalendarEventService.getEventById(eventId);
            return ResponseEntity.ok(ApiResponse.success("캘린더 이벤트 상세 조회 성공", event));
        } catch (Exception e) {
            log.error("캘린더 이벤트 상세 조회 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("캘린더 이벤트 상세 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 적금 상납 일정 등록 API
     * 로직 흐름:
     * 1. accountTypeDescription이 적금인지 확인
     * 2. accountNum으로 ACCOUNT 테이블에서 ACCOUNT_ID 조회
     * 3. ACCOUNT_ID로 PAYMENT_SCHEDULE 조회
     * 4. 조회된 PAYMENT_SCHEDULE 모든 데이터에 대해서 MY_CALENDAR_EVENT에 데이터 삽입
     */
    @PostMapping("/events/savings-schedule")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> registerSavingsSchedule(
            @RequestBody SavingsScheduleRegistrationRequestDto request,
            @RequestHeader("Authorization") String authorization) {
        log.info("적금 상납 일정 등록 API 호출 - 계좌번호: {}, 계좌타입: {}", request.getAccountNum(), request.getAccountTypeDescription());
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.registerSavingsSchedule(userId, request);
            return ResponseEntity.ok(ApiResponse.success("적금 상납 일정 등록 성공", events));
        } catch (Exception e) {
            log.error("적금 상납 일정 등록 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("적금 상납 일정 등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 대출 상환 일정 등록 API
     * 로직 흐름:
     * 1. accountTypeDescription이 대출인지 확인
     * 2. accountNum으로 ACCOUNT 테이블에서 ACCOUNT_ID 조회
     * 3. ACCOUNT_ID로 LOAN_CONTRACT 테이블에서 LOAN_ID 조회
     * 4. LOAN_ID로 LOAN_REPAYMENT_SCHEDULE 테이블 조회
     * 5. 조회된 LOAN_REPAYMENT_SCHEDULE 모든 데이터에 대해서 MY_CALENDAR_EVENT에 데이터 삽입
     */
    @PostMapping("/events/loan-schedule")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> registerLoanSchedule(
            @RequestBody LoanScheduleRegistrationRequestDto request,
            @RequestHeader("Authorization") String authorization) {
        log.info("대출 상환 일정 등록 API 호출 - 계좌번호: {}, 계좌타입: {}", request.getAccountNum(), request.getAccountTypeDescription());
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.registerLoanSchedule(userId, request);
            return ResponseEntity.ok(ApiResponse.success("대출 상환 일정 등록 성공", events));
        } catch (Exception e) {
            log.error("대출 상환 일정 등록 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("대출 상환 일정 등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 반복일정 등록 API
     */
    @PostMapping("/events/recurring")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> createRecurringEvents(
            @RequestBody RecurringEventRequestDto request,
            @RequestHeader("Authorization") String authorization) {
        log.info("반복일정 등록 API 호출 - 이벤트타입: {}, 거래유형: {}, 반복타입: {}", 
                request.getEventType(), request.getTransactionType(), request.getRecurrenceType());
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.createRecurringEvents(userId, request);
            return ResponseEntity.ok(ApiResponse.success("반복일정 등록 성공", events));
        } catch (Exception e) {
            log.error("반복일정 등록 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("반복일정 등록 실패: " + e.getMessage()));
        }
    }

    /**
     * 제목으로 모든 일정 삭제 API
     */
    @DeleteMapping("/events/title/{title}")
    public ResponseEntity<ApiResponse<Integer>> deleteEventsByTitle(
            @PathVariable String title,
            @RequestHeader("Authorization") String authorization) {
        log.info("제목으로 일정 삭제 API 호출 - 제목: {}", title);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            int deletedCount = myCalendarEventService.deleteEventsByTitle(userId, title);
            
            if (deletedCount > 0) {
                return ResponseEntity.ok(ApiResponse.success(
                    String.format("'%s' 제목의 일정 %d개가 삭제되었습니다.", title, deletedCount), 
                    deletedCount));
            } else {
                return ResponseEntity.ok(ApiResponse.success(
                    String.format("'%s' 제목의 일정이 존재하지 않습니다.", title), 
                    0));
            }
        } catch (Exception e) {
            log.error("제목으로 일정 삭제 실패 - 제목: {}, 오류: {}", title, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("일정 삭제 실패: " + e.getMessage()));
        }
    }

    /**
     * 소비 요약 조회 API
     */
    @GetMapping("/consumption-summary/{year}/{month}")
    public ResponseEntity<ApiResponse<ConsumptionSummaryResponseDto>> getConsumptionSummary(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestHeader("Authorization") String authorization) {
        log.info("소비 요약 조회 API 호출 - 년도: {}, 월: {}", year, month);
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            // 입력값 검증
            if (year < 2000 || year > 2100) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 년도입니다. (2000-2100)"));
            }
            if (month < 1 || month > 12) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 월입니다. (1-12)"));
            }
            
            ConsumptionSummaryResponseDto summary = myCalendarEventService.getConsumptionSummary(userId, year, month);
            return ResponseEntity.ok(ApiResponse.success("소비 요약 조회 성공", summary));
        } catch (Exception e) {
            log.error("소비 요약 조회 실패 - 년도: {}, 월: {}, 오류: {}", year, month, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("소비 요약 조회 실패: " + e.getMessage()));
        }
    }

    /**
     * 계좌 거래내역을 캘린더에 등록하는 API
     * 로직 흐름:
     * 1. accountId로 ACCOUNT 테이블에서 계좌 정보 조회
     * 2. 계좌 소유자 확인 (보안)
     * 3. TRANSACTION_HISTORY 테이블에서 거래내역 조회
     * 4. 각 거래내역을 MY_CALENDAR_EVENT에 등록
     */
    @PostMapping("/events/transaction-history")
    public ResponseEntity<ApiResponse<List<MyCalendarEventResponseDto>>> registerTransactionHistory(
            @RequestBody TransactionHistoryRegistrationRequestDto request,
            @RequestHeader("Authorization") String authorization) {
        log.info("계좌 거래내역 캘린더 등록 API 호출 - 계좌ID: {}", request.getAccountId());
        
        try {
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
            
            List<MyCalendarEventResponseDto> events = myCalendarEventService.registerTransactionHistory(userId, request);
            return ResponseEntity.ok(ApiResponse.success("계좌 거래내역 캘린더 등록 성공", events));
        } catch (Exception e) {
            log.error("계좌 거래내역 캘린더 등록 실패 - 에러: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("계좌 거래내역 캘린더 등록 실패: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    private String extractUserIdFromToken(String authorization) {
        try {
            String jwtToken = authorization.replace("Bearer ", "");
            String userIdStr = jwtUtil.getUserIdFromToken(jwtToken);
            
            if (userIdStr == null) {
                return null;
            }
            
            return userIdStr;
        } catch (Exception e) {
            log.error("JWT 토큰에서 사용자 ID 추출 실패", e);
            return null;
        }
    }
}
