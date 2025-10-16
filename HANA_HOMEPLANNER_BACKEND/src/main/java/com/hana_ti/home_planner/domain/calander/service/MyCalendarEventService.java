package com.hana_ti.home_planner.domain.calander.service;

import com.hana_ti.home_planner.domain.calander.dto.MyCalendarEventRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.MyCalendarEventResponseDto;
import com.hana_ti.home_planner.domain.calander.dto.MyCalendarEventUpdateDto;
import com.hana_ti.home_planner.domain.calander.dto.SavingsScheduleRegistrationRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.LoanScheduleRegistrationRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.RecurringEventRequestDto;
import com.hana_ti.home_planner.domain.calander.dto.ConsumptionSummaryResponseDto;
import com.hana_ti.home_planner.domain.calander.dto.TransactionHistoryRegistrationRequestDto;
import com.hana_ti.home_planner.domain.calander.entity.MyCalendarEvent;
import com.hana_ti.home_planner.domain.calander.repository.MyCalendarEventRepository;
import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import com.hana_ti.home_planner.domain.bank.repository.TransactionHistoryRepository;
import com.hana_ti.home_planner.domain.savings.entity.PaymentSchedule;
import com.hana_ti.home_planner.domain.savings.repository.PaymentScheduleRepository;
import com.hana_ti.home_planner.domain.loan.entity.LoanContract;
import com.hana_ti.home_planner.domain.loan.entity.LoanRepaymentSchedule;
import com.hana_ti.home_planner.domain.loan.repository.LoanContractRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanRepaymentScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MyCalendarEventService {

    private final MyCalendarEventRepository myCalendarEventRepository;
    private final AccountRepository accountRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;
    private final LoanContractRepository loanContractRepository;
    private final LoanRepaymentScheduleRepository loanRepaymentScheduleRepository;

    /**
     * 캘린더 이벤트 생성
     */
    @Transactional
    public MyCalendarEventResponseDto createEvent(MyCalendarEventRequestDto request) {
        log.info("캘린더 이벤트 생성 시작 - 사용자ID: {}, 제목: {}", request.getUserId(), request.getTitle());

        // 중복 제목 검증
        if (myCalendarEventRepository.existsByUserIdAndTitle(request.getUserId(), request.getTitle())) {
            throw new IllegalArgumentException("이미 같은 제목의 일정이 존재합니다: " + request.getTitle());
        }

        MyCalendarEvent event = MyCalendarEvent.create(
                request.getUserId(),
                request.getEventDate(),
                request.getTransactionType(),
                request.getEventType(),
                request.getTitle(),
                request.getDescription(),
                request.getAmount(),
                request.getRelatedId()
        );

        MyCalendarEvent savedEvent = myCalendarEventRepository.save(event);
        
        log.info("캘린더 이벤트 생성 완료 - 이벤트ID: {}", savedEvent.getEventId());
        
        return MyCalendarEventResponseDto.from(savedEvent);
    }

    /**
     * 캘린더 이벤트 수정
     */
    @Transactional
    public MyCalendarEventResponseDto updateEvent(Long eventId, MyCalendarEventUpdateDto updateDto) {
        log.info("캘린더 이벤트 수정 시작 - 이벤트ID: {}", eventId);

        MyCalendarEvent event = myCalendarEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("캘린더 이벤트를 찾을 수 없습니다. ID: " + eventId));

        if (updateDto.getTitle() != null) {
            event.updateEvent(updateDto.getTitle(), updateDto.getDescription(), updateDto.getAmount());
        }
        
        if (updateDto.getStatus() != null) {
            event.updateStatus(updateDto.getStatus());
        }

        MyCalendarEvent updatedEvent = myCalendarEventRepository.save(event);
        
        log.info("캘린더 이벤트 수정 완료 - 이벤트ID: {}", updatedEvent.getEventId());
        
        return MyCalendarEventResponseDto.from(updatedEvent);
    }

    /**
     * 캘린더 이벤트 삭제
     */
    @Transactional
    public void deleteEvent(Long eventId) {
        log.info("캘린더 이벤트 삭제 시작 - 이벤트ID: {}", eventId);

        if (!myCalendarEventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("캘린더 이벤트를 찾을 수 없습니다. ID: " + eventId);
        }

        myCalendarEventRepository.deleteById(eventId);
        
        log.info("캘린더 이벤트 삭제 완료 - 이벤트ID: {}", eventId);
    }

    /**
     * 사용자별 캘린더 이벤트 목록 조회
     */
    public List<MyCalendarEventResponseDto> getUserEvents(String userId) {
        log.info("사용자별 캘린더 이벤트 목록 조회 - 사용자ID: {}", userId);

        List<MyCalendarEvent> events = myCalendarEventRepository.findByUserIdOrderByEventDateAsc(userId);
        
        return events.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자별 특정 날짜의 캘린더 이벤트 목록 조회
     */
    public List<MyCalendarEventResponseDto> getUserEventsByDate(String userId, LocalDate eventDate) {
        log.info("사용자별 특정 날짜 캘린더 이벤트 목록 조회 - 사용자ID: {}, 날짜: {}", userId, eventDate);

        List<MyCalendarEvent> events = myCalendarEventRepository.findByUserIdAndEventDateOrderByCreatedAtAsc(userId, eventDate);
        
        return events.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자별 특정 기간의 캘린더 이벤트 목록 조회
     */
    public List<MyCalendarEventResponseDto> getUserEventsByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        log.info("사용자별 특정 기간 캘린더 이벤트 목록 조회 - 사용자ID: {}, 시작일: {}, 종료일: {}", userId, startDate, endDate);

        List<MyCalendarEvent> events = myCalendarEventRepository.findByUserIdAndEventDateBetween(userId, startDate, endDate);
        
        return events.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자별 특정 월의 캘린더 이벤트 목록 조회
     */
    public List<MyCalendarEventResponseDto> getUserEventsByMonth(String userId, int year, int month) {
        log.info("사용자별 특정 월 캘린더 이벤트 목록 조회 - 사용자ID: {}, 년: {}, 월: {}", userId, year, month);

        List<MyCalendarEvent> events = myCalendarEventRepository.findByUserIdAndYearAndMonth(userId, year, month);
        
        return events.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 사용자별 오늘 예정된 캘린더 이벤트 목록 조회
     */
    public List<MyCalendarEventResponseDto> getTodayScheduledEvents(String userId) {
        log.info("사용자별 오늘 예정된 캘린더 이벤트 목록 조회 - 사용자ID: {}", userId);

        List<MyCalendarEvent> events = myCalendarEventRepository.findTodayScheduledEvents(userId, LocalDate.now());
        
        return events.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }


    /**
     * 캘린더 이벤트 상세 조회
     */
    public MyCalendarEventResponseDto getEventById(Long eventId) {
        log.info("캘린더 이벤트 상세 조회 - 이벤트ID: {}", eventId);

        MyCalendarEvent event = myCalendarEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("캘린더 이벤트를 찾을 수 없습니다. ID: " + eventId));
        
        return MyCalendarEventResponseDto.from(event);
    }

    /**
     * 적금 상납 일정 등록
     * 로직 흐름:
     * 1. accountTypeDescription이 적금인지 확인
     * 2. accountNum으로 ACCOUNT 테이블에서 ACCOUNT_ID 조회
     * 3. ACCOUNT_ID로 PAYMENT_SCHEDULE 조회
     * 4. 조회된 PAYMENT_SCHEDULE 모든 데이터에 대해서 MY_CALENDAR_EVENT에 데이터 삽입
     */
    @Transactional
    public List<MyCalendarEventResponseDto> registerSavingsSchedule(String userId, SavingsScheduleRegistrationRequestDto request) {
        log.info("적금 상납 일정 등록 시작 - 사용자ID: {}, 계좌번호: {}", userId, request.getAccountNum());

        // 1. accountTypeDescription이 적금인지 확인
        if (!"적금".equals(request.getAccountTypeDescription())) {
            throw new IllegalArgumentException("계좌 타입이 적금이 아닙니다. 계좌 타입: " + request.getAccountTypeDescription());
        }

        // 2. accountNum으로 ACCOUNT 테이블에서 ACCOUNT_ID 조회
        Account account = accountRepository.findByAccountNum(request.getAccountNum())
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다. 계좌번호: " + request.getAccountNum()));

        String accountId = account.getAccountId();
        log.info("계좌 ID 조회 완료 - ACCOUNT_ID: {}", accountId);

        // 3. ACCOUNT_ID로 PAYMENT_SCHEDULE 조회
        List<PaymentSchedule> paymentSchedules = paymentScheduleRepository.findByAccountIdOrderByDueDateAsc(accountId);
        
        if (paymentSchedules.isEmpty()) {
            throw new IllegalArgumentException("해당 계좌의 상납 일정을 찾을 수 없습니다. ACCOUNT_ID: " + accountId);
        }

        log.info("상납 일정 조회 완료 - 일정 수: {}", paymentSchedules.size());

        // 4. 중복 체크: 이미 등록된 적금 일정이 있는지 확인
        List<String> existingRelatedIds = paymentSchedules.stream()
                .map(PaymentSchedule::getPaymentId)
                .filter(paymentId -> myCalendarEventRepository.existsByUserIdAndRelatedId(userId, paymentId))
                .collect(Collectors.toList());

        if (!existingRelatedIds.isEmpty()) {
            throw new IllegalArgumentException("이미 등록된 적금 일정이 있습니다. 중복된 PAYMENT_ID: " + existingRelatedIds);
        }

        // 5. 조회된 PAYMENT_SCHEDULE 모든 데이터에 대해서 MY_CALENDAR_EVENT에 데이터 삽입
        List<MyCalendarEvent> createdEvents = paymentSchedules.stream()
                .map(paymentSchedule -> {
                    // TRANSACTION_TYPE 결정: STATUS가 PAID면 WITHDRAW, 그 외면 DEPOSIT
                    MyCalendarEvent.TransactionType transactionType =
                            MyCalendarEvent.TransactionType.WITHDRAW;

                    return MyCalendarEvent.create(
                            userId,
                            paymentSchedule.getDueDate(),           // EVENT_DATE: DUE_DATE 값
                            transactionType,                         // TRANSACTION_TYPE: STATUS에 따라 결정
                            MyCalendarEvent.EventType.SAVINGS,       // EVENT_TYPE: SAVINGS
                            request.getTitle(),                      // TITLE: 사용자에게 입력받음
                            "적금 자동이체",                         // DESCRIPTION: 적금 자동이체
                            paymentSchedule.getAmount(),             // AMOUNT: AMOUNT
                            paymentSchedule.getPaymentId()          // RELATED_ID: PAYMENT_ID
                    );
                })
                .collect(Collectors.toList());

        // 모든 이벤트를 한 번에 저장
        List<MyCalendarEvent> savedEvents = myCalendarEventRepository.saveAll(createdEvents);

        log.info("적금 상납 일정 등록 완료 - 생성된 이벤트 수: {}", savedEvents.size());

        return savedEvents.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 대출 상환 일정 등록
     * 로직 흐름:
     * 1. accountTypeDescription이 대출인지 확인
     * 2. accountNum으로 ACCOUNT 테이블에서 ACCOUNT_ID 조회
     * 3. ACCOUNT_ID로 LOAN_CONTRACT 테이블에서 LOAN_ID 조회
     * 4. LOAN_ID로 LOAN_REPAYMENT_SCHEDULE 테이블 조회
     * 5. 조회된 LOAN_REPAYMENT_SCHEDULE 모든 데이터에 대해서 MY_CALENDAR_EVENT에 데이터 삽입
     */
    @Transactional
    public List<MyCalendarEventResponseDto> registerLoanSchedule(String userId, LoanScheduleRegistrationRequestDto request) {
        log.info("대출 상환 일정 등록 시작 - 사용자ID: {}, 계좌번호: {}", userId, request.getAccountNum());

        // 1. accountTypeDescription이 대출인지 확인
        if (!"대출".equals(request.getAccountTypeDescription())) {
            throw new IllegalArgumentException("계좌 타입이 대출이 아닙니다. 계좌 타입: " + request.getAccountTypeDescription());
        }

        // 2. accountNum으로 ACCOUNT 테이블에서 ACCOUNT_ID 조회
        Account account = accountRepository.findByAccountNum(request.getAccountNum())
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다. 계좌번호: " + request.getAccountNum()));

        String accountId = account.getAccountId();
        log.info("계좌 ID 조회 완료 - ACCOUNT_ID: {}", accountId);

        // 3. ACCOUNT_ID로 LOAN_CONTRACT 테이블에서 LOAN_ID 조회
        LoanContract loanContract = loanContractRepository.findByLoanAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("대출 계약을 찾을 수 없습니다. ACCOUNT_ID: " + accountId));

        String loanId = loanContract.getLoanId();
        log.info("대출 계약 조회 완료 - LOAN_ID: {}", loanId);

        // 4. LOAN_ID로 LOAN_REPAYMENT_SCHEDULE 테이블 조회
        List<LoanRepaymentSchedule> repaymentSchedules = loanRepaymentScheduleRepository.findByLoanIdOrderByDueDateAsc(loanId);
        
        if (repaymentSchedules.isEmpty()) {
            throw new IllegalArgumentException("해당 대출의 상환 일정을 찾을 수 없습니다. LOAN_ID: " + loanId);
        }

        log.info("상환 일정 조회 완료 - 일정 수: {}", repaymentSchedules.size());

        // 5. 중복 체크: 이미 등록된 대출 일정이 있는지 확인
        List<String> existingRelatedIds = repaymentSchedules.stream()
                .map(LoanRepaymentSchedule::getRepayId)
                .filter(repayId -> myCalendarEventRepository.existsByUserIdAndRelatedId(userId, repayId))
                .collect(Collectors.toList());

        if (!existingRelatedIds.isEmpty()) {
            throw new IllegalArgumentException("이미 등록된 대출 일정이 있습니다. 중복된 REPAYMENT_ID: " + existingRelatedIds);
        }

        // 6. 조회된 LOAN_REPAYMENT_SCHEDULE 모든 데이터에 대해서 MY_CALENDAR_EVENT에 데이터 삽입
        List<MyCalendarEvent> createdEvents = repaymentSchedules.stream()
                .map(repaymentSchedule -> {
                    // TRANSACTION_TYPE: 대출은 항상 WITHDRAW
                    MyCalendarEvent.TransactionType transactionType = MyCalendarEvent.TransactionType.WITHDRAW;

                    return MyCalendarEvent.create(
                            userId,
                            repaymentSchedule.getDueDate(),           // EVENT_DATE: DUE_DATE 값
                            transactionType,                           // TRANSACTION_TYPE: WITHDRAW
                            MyCalendarEvent.EventType.LOAN,            // EVENT_TYPE: LOAN
                            request.getTitle(),                        // TITLE: 사용자에게 입력받음
                            "대출 상환금 납입",                        // DESCRIPTION: 대출 상환금 납입
                            repaymentSchedule.getTotalDue(),          // AMOUNT: TOTAL_DUE
                            repaymentSchedule.getRepayId()            // RELATED_ID: REPAYMENT_ID
                    );
                })
                .collect(Collectors.toList());

        // 모든 이벤트를 한 번에 저장
        List<MyCalendarEvent> savedEvents = myCalendarEventRepository.saveAll(createdEvents);

        log.info("대출 상환 일정 등록 완료 - 생성된 이벤트 수: {}", savedEvents.size());

        return savedEvents.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 반복일정 등록
     */
    @Transactional
    public List<MyCalendarEventResponseDto> createRecurringEvents(String userId, RecurringEventRequestDto request) {
        log.info("반복일정 등록 시작 - 사용자ID: {}, 이벤트타입: {}, 거래유형: {}, 반복타입: {}", 
                userId, request.getEventType(), request.getTransactionType(), request.getRecurrenceType());

        // 1. 입력값 검증
        validateRecurringEventRequest(request);

        // 2. 중복 제목 검증
        if (myCalendarEventRepository.existsByUserIdAndTitle(userId, request.getTitle())) {
            throw new IllegalArgumentException("이미 같은 제목의 일정이 존재합니다: " + request.getTitle());
        }

        // 3. 반복일정 날짜 계산
        List<LocalDate> eventDates = calculateRecurringDates(request);

        // 4. 이벤트 생성
        List<MyCalendarEvent> createdEvents = eventDates.stream()
                .map(eventDate -> MyCalendarEvent.create(
                        userId,
                        eventDate,
                        request.getTransactionType(), // 사용자가 선택한 거래 유형 (입금/출금)
                        request.getEventType(),
                        request.getTitle(),
                        request.getDescription(),
                        request.getAmount(),
                        null // 반복일정은 외부 테이블과 연결 없음
                ))
                .collect(Collectors.toList());

        // 5. 데이터베이스에 저장
        List<MyCalendarEvent> savedEvents = myCalendarEventRepository.saveAll(createdEvents);

        log.info("반복일정 등록 완료 - 생성된 이벤트 수: {}", savedEvents.size());

        return savedEvents.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 제목으로 모든 일정 삭제
     */
    @Transactional
    public int deleteEventsByTitle(String userId, String title) {
        log.info("제목으로 일정 삭제 시작 - 사용자ID: {}, 제목: {}", userId, title);

        // 삭제 전 일정 개수 확인
        List<MyCalendarEvent> eventsToDelete = myCalendarEventRepository.findByUserIdAndTitle(userId, title);
        int deleteCount = eventsToDelete.size();

        if (deleteCount == 0) {
            log.warn("삭제할 일정이 없음 - 사용자ID: {}, 제목: {}", userId, title);
            return 0;
        }

        // 일정 삭제
        myCalendarEventRepository.deleteByUserIdAndTitle(userId, title);

        log.info("제목으로 일정 삭제 완료 - 사용자ID: {}, 제목: {}, 삭제된 일정 수: {}", userId, title, deleteCount);
        return deleteCount;
    }

    /**
     * 반복일정 요청 데이터 검증
     */
    private void validateRecurringEventRequest(RecurringEventRequestDto request) {
        // 시작일이 종료일보다 이전인지 확인
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("시작일은 종료일보다 이전이어야 합니다.");
        }

        // 반복 타입별 필수값 검증
        if (request.getRecurrenceType() == RecurringEventRequestDto.RecurrenceType.WEEKLY) {
            if (request.getDayOfWeek() == null) {
                throw new IllegalArgumentException("매주 반복일정의 경우 요일(1-7)을 입력해주세요.");
            }
            if (request.getDayOfWeek() < 1 || request.getDayOfWeek() > 7) {
                throw new IllegalArgumentException("요일은 1(월요일)부터 7(일요일)까지 입력해주세요.");
            }
        } else if (request.getRecurrenceType() == RecurringEventRequestDto.RecurrenceType.MONTHLY) {
            if (request.getDayOfMonth() == null) {
                throw new IllegalArgumentException("매월 반복일정의 경우 날짜(1-31)를 입력해주세요.");
            }
            if (request.getDayOfMonth() < 1 || request.getDayOfMonth() > 31) {
                throw new IllegalArgumentException("날짜는 1일부터 31일까지 입력해주세요.");
            }
        }
    }

    /**
     * 반복일정 날짜 계산
     */
    private List<LocalDate> calculateRecurringDates(RecurringEventRequestDto request) {
        List<LocalDate> eventDates = new ArrayList<>();
        LocalDate currentDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (request.getRecurrenceType() == RecurringEventRequestDto.RecurrenceType.WEEKLY) {
            // 매주 반복
            DayOfWeek targetDayOfWeek = DayOfWeek.of(request.getDayOfWeek());
            
            // 시작일이 지정된 요일과 다르면, 다음 해당 요일로 이동
            if (currentDate.getDayOfWeek() != targetDayOfWeek) {
                currentDate = currentDate.with(TemporalAdjusters.next(targetDayOfWeek));
            }
            
            // 시작일부터 종료일까지 매주 같은 요일에 이벤트 생성
            while (!currentDate.isAfter(endDate)) {
                eventDates.add(currentDate);
                currentDate = currentDate.plusWeeks(1);
            }
            
        } else if (request.getRecurrenceType() == RecurringEventRequestDto.RecurrenceType.MONTHLY) {
            // 매월 반복
            int targetDayOfMonth = request.getDayOfMonth();
            
            // 시작일이 지정된 날짜와 다르면, 다음 해당 날짜로 이동
            if (currentDate.getDayOfMonth() != targetDayOfMonth) {
                currentDate = currentDate.withDayOfMonth(targetDayOfMonth);
                // 해당 월에 해당 날짜가 없으면 다음 달로 이동
                if (currentDate.isBefore(request.getStartDate())) {
                    currentDate = currentDate.plusMonths(1);
                }
            }
            
            // 시작일부터 종료일까지 매월 같은 날짜에 이벤트 생성
            while (!currentDate.isAfter(endDate)) {
                eventDates.add(currentDate);
                currentDate = currentDate.plusMonths(1);
                
                // 다음 달에 해당 날짜가 없으면 그 달의 마지막 날로 설정
                if (currentDate.getDayOfMonth() != targetDayOfMonth) {
                    currentDate = currentDate.withDayOfMonth(Math.min(targetDayOfMonth, currentDate.lengthOfMonth()));
                }
            }
        }

        return eventDates;
    }

    /**
     * 소비 요약 조회
     */
    public ConsumptionSummaryResponseDto getConsumptionSummary(String userId, Integer year, Integer month) {
        log.info("소비 요약 조회 시작 - 사용자ID: {}, 년도: {}, 월: {}", userId, year, month);

        // 해당 월의 시작일과 종료일 계산
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        // 해당 월의 모든 이벤트 조회
        List<MyCalendarEvent> events = myCalendarEventRepository.findByUserIdAndEventDateBetween(userId, startDate, endDate);

        // 전월 데이터 조회 (비교용)
        LocalDate prevStartDate = startDate.minusMonths(1);
        LocalDate prevEndDate = prevStartDate.plusMonths(1).minusDays(1);
        List<MyCalendarEvent> prevEvents = myCalendarEventRepository.findByUserIdAndEventDateBetween(userId, prevStartDate, prevEndDate);

        // 1. 기본 소비 통계 계산
        ConsumptionSummaryResponseDto.BasicStatistics basicStats = calculateBasicStatistics(events, prevEvents);

        // 2. 카테고리별 소비 분석
        ConsumptionSummaryResponseDto.CategoryAnalysis categoryAnalysis = analyzeCategoryExpense(events);

        // 3. 금융 상품 관련 분석
        ConsumptionSummaryResponseDto.FinancialProductAnalysis financialAnalysis = analyzeFinancialProducts(events);

        // 4. 소비 인사이트 및 추천
        ConsumptionSummaryResponseDto.ConsumptionInsights insights = generateInsights(events, basicStats, categoryAnalysis);

        // 5. 목표 기반 분석
        ConsumptionSummaryResponseDto.GoalBasedAnalysis goalAnalysis = analyzeGoals(events, basicStats);

        log.info("소비 요약 조회 완료 - 사용자ID: {}", userId);

        return ConsumptionSummaryResponseDto.builder()
                .year(year)
                .month(month)
                .basicStatistics(basicStats)
                .categoryAnalysis(categoryAnalysis)
                .financialProductAnalysis(financialAnalysis)
                .consumptionInsights(insights)
                .goalBasedAnalysis(goalAnalysis)
                .build();
    }

    /**
     * 기본 소비 통계 계산
     */
    private ConsumptionSummaryResponseDto.BasicStatistics calculateBasicStatistics(
            List<MyCalendarEvent> events, List<MyCalendarEvent> prevEvents) {
        
        BigDecimal totalIncome = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.DEPOSIT)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int incomeCount = (int) events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.DEPOSIT)
                .count();

        int expenseCount = (int) events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .count();

        BigDecimal netAmount = totalIncome.subtract(totalExpense);

        // 일평균 소비액 (해당 월의 일수로 나눔)
        int daysInMonth = events.isEmpty() ? 30 : 
                (int) events.stream()
                        .map(MyCalendarEvent::getEventDate)
                        .max(LocalDate::compareTo)
                        .orElse(LocalDate.now())
                        .lengthOfMonth();
        BigDecimal avgDailyExpense = totalExpense.divide(BigDecimal.valueOf(daysInMonth), 2, java.math.RoundingMode.HALF_UP);

        // 전월 대비 변화율 계산
        BigDecimal prevExpense = prevEvents.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expenseChangeRate = BigDecimal.ZERO;
        String trend = "유지";
        if (prevExpense.compareTo(BigDecimal.ZERO) > 0) {
            expenseChangeRate = totalExpense.subtract(prevExpense)
                    .divide(prevExpense, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            
            if (expenseChangeRate.compareTo(BigDecimal.valueOf(5)) > 0) {
                trend = "증가";
            } else if (expenseChangeRate.compareTo(BigDecimal.valueOf(-5)) < 0) {
                trend = "감소";
            }
        }

        return ConsumptionSummaryResponseDto.BasicStatistics.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .avgDailyExpense(avgDailyExpense)
                .totalTransactionCount(events.size())
                .incomeCount(incomeCount)
                .expenseCount(expenseCount)
                .expenseChangeRate(expenseChangeRate)
                .expenseChangeTrend(trend)
                .build();
    }

    /**
     * 카테고리별 소비 분석
     */
    private ConsumptionSummaryResponseDto.CategoryAnalysis analyzeCategoryExpense(List<MyCalendarEvent> events) {
        // 출금만 필터링
        List<MyCalendarEvent> expenses = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .collect(Collectors.toList());

        BigDecimal totalExpense = expenses.stream()
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 카테고리별 그룹화
        Map<MyCalendarEvent.EventType, List<MyCalendarEvent>> groupedByCategory = expenses.stream()
                .collect(Collectors.groupingBy(MyCalendarEvent::getEventType));

        // 카테고리별 소비 계산
        List<ConsumptionSummaryResponseDto.CategoryExpense> categoryExpenses = groupedByCategory.entrySet().stream()
                .map(entry -> {
                    MyCalendarEvent.EventType eventType = entry.getKey();
                    List<MyCalendarEvent> categoryEvents = entry.getValue();
                    
                    BigDecimal amount = categoryEvents.stream()
                            .map(MyCalendarEvent::getAmount)
                            .filter(java.util.Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal percentage = totalExpense.compareTo(BigDecimal.ZERO) > 0 
                            ? amount.divide(totalExpense, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                            : BigDecimal.ZERO;
                    
                    return ConsumptionSummaryResponseDto.CategoryExpense.builder()
                            .category(eventType.name())
                            .categoryDescription(eventType.getDescription())
                            .amount(amount)
                            .count(categoryEvents.size())
                            .percentage(percentage)
                            .build();
                })
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        // TOP 5 카테고리
        List<ConsumptionSummaryResponseDto.CategoryExpense> topCategories = categoryExpenses.stream()
                .limit(5)
                .collect(Collectors.toList());

        // 가장 많이 소비한 카테고리
        String mostExpensiveCategory = categoryExpenses.isEmpty() ? "없음" : 
                categoryExpenses.get(0).getCategoryDescription();
        BigDecimal mostExpensiveAmount = categoryExpenses.isEmpty() ? BigDecimal.ZERO : 
                categoryExpenses.get(0).getAmount();

        return ConsumptionSummaryResponseDto.CategoryAnalysis.builder()
                .categoryExpenses(categoryExpenses)
                .topCategories(topCategories)
                .mostExpensiveCategory(mostExpensiveCategory)
                .mostExpensiveAmount(mostExpensiveAmount)
                .build();
    }

    /**
     * 금융 상품 관련 분석
     */
    private ConsumptionSummaryResponseDto.FinancialProductAnalysis analyzeFinancialProducts(List<MyCalendarEvent> events) {
        BigDecimal totalExpense = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.DEPOSIT)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 대출 상환
        List<MyCalendarEvent> loanEvents = events.stream()
                .filter(e -> e.getEventType() == MyCalendarEvent.EventType.LOAN)
                .collect(Collectors.toList());
        BigDecimal loanAmount = loanEvents.stream()
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal loanRate = totalExpense.compareTo(BigDecimal.ZERO) > 0 
                ? loanAmount.divide(totalExpense, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // 적금 납입
        List<MyCalendarEvent> savingsEvents = events.stream()
                .filter(e -> e.getEventType() == MyCalendarEvent.EventType.SAVINGS)
                .collect(Collectors.toList());
        BigDecimal savingsAmount = savingsEvents.stream()
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0 
                ? savingsAmount.divide(totalIncome, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // 카드 사용
        List<MyCalendarEvent> cardEvents = events.stream()
                .filter(e -> e.getEventType() == MyCalendarEvent.EventType.CARD)
                .collect(Collectors.toList());
        BigDecimal cardAmount = cardEvents.stream()
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cardRate = totalExpense.compareTo(BigDecimal.ZERO) > 0 
                ? cardAmount.divide(totalExpense, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return ConsumptionSummaryResponseDto.FinancialProductAnalysis.builder()
                .loanRepaymentAmount(loanAmount)
                .loanRepaymentCount(loanEvents.size())
                .loanRepaymentRate(loanRate)
                .savingsDepositAmount(savingsAmount)
                .savingsDepositCount(savingsEvents.size())
                .savingsDepositRate(savingsRate)
                .cardExpenseAmount(cardAmount)
                .cardExpenseCount(cardEvents.size())
                .cardExpenseRate(cardRate)
                .build();
    }

    /**
     * 소비 인사이트 및 추천 생성
     */
    private ConsumptionSummaryResponseDto.ConsumptionInsights generateInsights(
            List<MyCalendarEvent> events,
            ConsumptionSummaryResponseDto.BasicStatistics basicStats,
            ConsumptionSummaryResponseDto.CategoryAnalysis categoryAnalysis) {
        
        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> savingOpportunities = new ArrayList<>();

        // 인사이트 생성
        if (basicStats.getExpenseChangeTrend().equals("증가")) {
            insights.add(String.format("전월 대비 소비가 %.2f%% 증가했습니다.", basicStats.getExpenseChangeRate()));
        } else if (basicStats.getExpenseChangeTrend().equals("감소")) {
            insights.add(String.format("전월 대비 소비가 %.2f%% 감소했습니다. 잘하고 있어요!", basicStats.getExpenseChangeRate().abs()));
        }

        if (!categoryAnalysis.getTopCategories().isEmpty()) {
            ConsumptionSummaryResponseDto.CategoryExpense topCategory = categoryAnalysis.getTopCategories().get(0);
            insights.add(String.format("'%s' 카테고리에서 가장 많이 소비했습니다 (%.2f%%).", 
                    topCategory.getCategoryDescription(), topCategory.getPercentage()));
        }

        // 추천 사항 생성
        if (basicStats.getNetAmount().compareTo(BigDecimal.ZERO) < 0) {
            recommendations.add("이번 달 소비가 수입을 초과했습니다. 지출을 줄이는 것을 권장합니다.");
        } else {
            recommendations.add(String.format("이번 달 %.0f원을 절약했습니다!", basicStats.getNetAmount()));
        }

        // 절약 기회 발견
        for (ConsumptionSummaryResponseDto.CategoryExpense category : categoryAnalysis.getTopCategories()) {
            if (category.getPercentage().compareTo(BigDecimal.valueOf(30)) > 0) {
                savingOpportunities.add(String.format("'%s' 카테고리 소비 비중이 높습니다 (%.2f%%). 절약을 고려해보세요.", 
                        category.getCategoryDescription(), category.getPercentage()));
            }
        }

        // 소비 패턴 분석
        BigDecimal fixedExpenseRate = calculateFixedExpenseRate(events);
        BigDecimal variableExpenseRate = BigDecimal.valueOf(100).subtract(fixedExpenseRate);
        String concentration = categoryAnalysis.getTopCategories().isEmpty() ? "낮음" :
                categoryAnalysis.getTopCategories().get(0).getPercentage().compareTo(BigDecimal.valueOf(50)) > 0 ? "높음" : "보통";

        ConsumptionSummaryResponseDto.ConsumptionPattern pattern = ConsumptionSummaryResponseDto.ConsumptionPattern.builder()
                .fixedExpenseRate(fixedExpenseRate)
                .variableExpenseRate(variableExpenseRate)
                .consumptionConcentration(concentration)
                .spendingTrend(basicStats.getExpenseChangeTrend())
                .build();

        return ConsumptionSummaryResponseDto.ConsumptionInsights.builder()
                .insights(insights)
                .recommendations(recommendations)
                .savingOpportunities(savingOpportunities)
                .consumptionPattern(pattern)
                .build();
    }

    /**
     * 고정비 비율 계산
     */
    private BigDecimal calculateFixedExpenseRate(List<MyCalendarEvent> events) {
        // 고정비로 간주되는 카테고리
        List<MyCalendarEvent.EventType> fixedCategories = Arrays.asList(
                MyCalendarEvent.EventType.UTILITY,
                MyCalendarEvent.EventType.MANAGEMENT_FEE,
                MyCalendarEvent.EventType.INSURANCE,
                MyCalendarEvent.EventType.SUBSCRIPTION,
                MyCalendarEvent.EventType.LOAN
        );

        BigDecimal totalExpense = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal fixedExpense = events.stream()
                .filter(e -> e.getTransactionType() == MyCalendarEvent.TransactionType.WITHDRAW)
                .filter(e -> fixedCategories.contains(e.getEventType()))
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalExpense.compareTo(BigDecimal.ZERO) > 0 
                ? fixedExpense.divide(totalExpense, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
    }

    /**
     * 목표 기반 분석
     */
    private ConsumptionSummaryResponseDto.GoalBasedAnalysis analyzeGoals(
            List<MyCalendarEvent> events,
            ConsumptionSummaryResponseDto.BasicStatistics basicStats) {
        
        // 적금 목표 분석
        BigDecimal actualSavings = events.stream()
                .filter(e -> e.getEventType() == MyCalendarEvent.EventType.SAVINGS)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 목표 적금액 (수입의 20%로 가정)
        BigDecimal targetSavings = basicStats.getTotalIncome().multiply(BigDecimal.valueOf(0.2));
        BigDecimal savingsAchievementRate = targetSavings.compareTo(BigDecimal.ZERO) > 0 
                ? actualSavings.divide(targetSavings, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        List<String> savingsSuggestions = new ArrayList<>();
        String savingsStatus;
        if (savingsAchievementRate.compareTo(BigDecimal.valueOf(100)) >= 0) {
            savingsStatus = "초과달성";
            savingsSuggestions.add("목표 적금액을 달성했습니다! 훌륭합니다!");
        } else if (savingsAchievementRate.compareTo(BigDecimal.valueOf(80)) >= 0) {
            savingsStatus = "달성";
            savingsSuggestions.add("목표에 근접했습니다. 조금만 더 노력하세요!");
        } else {
            savingsStatus = "미달성";
            savingsSuggestions.add(String.format("목표 적금액까지 %.0f원이 부족합니다.", 
                    targetSavings.subtract(actualSavings)));
        }

        ConsumptionSummaryResponseDto.SavingsGoal savingsGoal = ConsumptionSummaryResponseDto.SavingsGoal.builder()
                .plannedAmount(targetSavings)
                .actualAmount(actualSavings)
                .achievementRate(savingsAchievementRate)
                .status(savingsStatus)
                .suggestions(savingsSuggestions)
                .build();

        // 대출 목표 분석
        BigDecimal actualLoanRepayment = events.stream()
                .filter(e -> e.getEventType() == MyCalendarEvent.EventType.LOAN)
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MyCalendarEvent> scheduledLoans = events.stream()
                .filter(e -> e.getEventType() == MyCalendarEvent.EventType.LOAN)
                .filter(e -> e.getStatus() == MyCalendarEvent.EventStatus.SCHEDULED)
                .collect(Collectors.toList());

        BigDecimal plannedLoanRepayment = scheduledLoans.stream()
                .map(MyCalendarEvent::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal loanAchievementRate = plannedLoanRepayment.compareTo(BigDecimal.ZERO) > 0 
                ? actualLoanRepayment.divide(plannedLoanRepayment, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.valueOf(100);

        List<String> loanSuggestions = new ArrayList<>();
        String loanStatus;
        if (loanAchievementRate.compareTo(BigDecimal.valueOf(100)) >= 0) {
            loanStatus = "정상";
            loanSuggestions.add("대출 상환 계획을 잘 지키고 있습니다.");
        } else {
            loanStatus = "지연";
            loanSuggestions.add("대출 상환이 지연되고 있습니다. 신속한 상환을 권장합니다.");
        }

        ConsumptionSummaryResponseDto.LoanGoal loanGoal = ConsumptionSummaryResponseDto.LoanGoal.builder()
                .plannedRepayment(plannedLoanRepayment)
                .actualRepayment(actualLoanRepayment)
                .achievementRate(loanAchievementRate)
                .status(loanStatus)
                .suggestions(loanSuggestions)
                .build();

        // 소비 목표 분석
        // 목표 소비액 (수입의 70%로 가정)
        BigDecimal targetExpense = basicStats.getTotalIncome().multiply(BigDecimal.valueOf(0.7));
        BigDecimal expenseAchievementRate = targetExpense.compareTo(BigDecimal.ZERO) > 0 
                ? basicStats.getTotalExpense().divide(targetExpense, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal remainingBudget = targetExpense.subtract(basicStats.getTotalExpense());

        List<String> expenseSuggestions = new ArrayList<>();
        String expenseStatus;
        if (expenseAchievementRate.compareTo(BigDecimal.valueOf(100)) > 0) {
            expenseStatus = "초과";
            expenseSuggestions.add(String.format("목표 소비액을 %.0f원 초과했습니다. 지출을 줄이세요.", 
                    remainingBudget.abs()));
        } else if (expenseAchievementRate.compareTo(BigDecimal.valueOf(90)) >= 0) {
            expenseStatus = "목표 내";
            expenseSuggestions.add("소비 목표를 잘 지키고 있습니다!");
        } else {
            expenseStatus = "미달";
            expenseSuggestions.add(String.format("아직 %.0f원의 예산이 남았습니다.", remainingBudget));
        }

        ConsumptionSummaryResponseDto.ExpenseGoal expenseGoal = ConsumptionSummaryResponseDto.ExpenseGoal.builder()
                .targetExpense(targetExpense)
                .actualExpense(basicStats.getTotalExpense())
                .achievementRate(expenseAchievementRate)
                .status(expenseStatus)
                .remainingBudget(remainingBudget)
                .suggestions(expenseSuggestions)
                .build();

        return ConsumptionSummaryResponseDto.GoalBasedAnalysis.builder()
                .savingsGoal(savingsGoal)
                .loanGoal(loanGoal)
                .expenseGoal(expenseGoal)
                .build();
    }

    /**
     * 계좌 거래내역을 캘린더에 등록 (개선된 중복 처리)
     */
    @Transactional
    public List<MyCalendarEventResponseDto> registerTransactionHistory(String userId, TransactionHistoryRegistrationRequestDto request) {
        log.info("계좌 거래내역 캘린더 등록 시작 - 사용자ID: {}, 계좌ID: {}", userId, request.getAccountId());

        // 1. 계좌 정보 조회 및 소유자 확인
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다: " + request.getAccountId()));
        
        if (!account.getUserId().equals(userId)) {
            throw new IllegalArgumentException("해당 계좌에 대한 권한이 없습니다.");
        }

        // 2. 거래내역 조회
        List<TransactionHistory> transactions;
        if (request.getStartDate() != null && request.getEndDate() != null) {
            transactions = transactionHistoryRepository.findByAccountIdAndTxnDateBetween(
                    request.getAccountId(), request.getStartDate(), request.getEndDate());
        } else {
            transactions = transactionHistoryRepository.findByAccountIdOrderByTxnDateDesc(request.getAccountId());
        }

        if (transactions.isEmpty()) {
            log.info("등록할 거래내역이 없습니다 - 계좌ID: {}", request.getAccountId());
            return Collections.emptyList();
        }

        // 3. 제목 설정
        String baseTitle = request.getTitle() != null ? request.getTitle() : 
                          String.format("%s 거래내역", account.getAccountNum());
        
        // 4. 거래내역을 캘린더 이벤트로 변환
        List<MyCalendarEvent> calendarEvents = transactions.stream()
                .map(transaction -> convertTransactionToCalendarEvent(userId, transaction, baseTitle))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 5. DB에 이미 등록된 거래내역 필터링 (RELATED_ID 기준)
        // 거래내역은 항상 transaction.getTxnId()를 relatedId로 사용하므로 정확한 중복 체크 가능
        List<MyCalendarEvent> newEvents = calendarEvents.stream()
                .filter(event -> {
                    // relatedId가 null이 아닌 경우만 중복 체크 (거래내역 등록)
                    if (event.getRelatedId() != null) {
                        return !myCalendarEventRepository.existsByUserIdAndRelatedIdSafe(userId, event.getRelatedId());
                    }
                    // relatedId가 null인 경우는 사용자 임의 등록이므로 항상 새로 등록
                    return true;
                })
                .collect(Collectors.toList());

        // 6. 새로 등록할 이벤트만 저장
        if (newEvents.isEmpty()) {
            log.info("새로 등록할 거래내역이 없습니다 - 계좌ID: {}, 전체 조회된 거래내역 수: {}", 
                    request.getAccountId(), transactions.size());
            return Collections.emptyList();
        }

        List<MyCalendarEvent> savedEvents = myCalendarEventRepository.saveAll(newEvents);
        
        log.info("계좌 거래내역 캘린더 등록 완료 - 새로 등록된 이벤트 수: {}, 전체 조회된 거래내역 수: {}, 중복 제외된 수: {}", 
                savedEvents.size(), transactions.size(), calendarEvents.size() - newEvents.size());

        return savedEvents.stream()
                .map(MyCalendarEventResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 거래내역을 캘린더 이벤트로 변환
     */
    private MyCalendarEvent convertTransactionToCalendarEvent(String userId, TransactionHistory transaction, String baseTitle) {
        try {
            // 거래 타입에 따른 이벤트 타입 결정
            MyCalendarEvent.EventType eventType = determineEventType(transaction.getTxnType());
            
            // 거래 타입에 따른 거래 유형 결정
            MyCalendarEvent.TransactionType transactionType = determineTransactionType(transaction.getTxnType());
            
            // 제목 생성
            String title = String.format("%s - %s", baseTitle, transaction.getTxnType().getDescription());
            
            // 설명 생성
            String description = transaction.getDescription() != null ? 
                    transaction.getDescription() : 
                    String.format("거래 후 잔액: %s원", transaction.getBalanceAfter());

            return MyCalendarEvent.create(
                    userId,
                    transaction.getTxnDate(),
                    transactionType,
                    eventType,
                    title,
                    description,
                    transaction.getAmount(),
                    transaction.getTxnId() // relatedId로 거래ID 사용
            );
        } catch (Exception e) {
            log.error("거래내역을 캘린더 이벤트로 변환 실패 - 거래ID: {}, 오류: {}", 
                    transaction.getTxnId(), e.getMessage());
            return null;
        }
    }

    /**
     * 거래 타입에 따른 이벤트 타입 결정
     */
    private MyCalendarEvent.EventType determineEventType(TransactionHistory.TransactionType txnType) {
        return switch (txnType) {
            case DEPOSIT, INTEREST -> MyCalendarEvent.EventType.SAVINGS;
            case WITHDRAWAL -> MyCalendarEvent.EventType.CONSUMPTION;
            case LOAN_OUT -> MyCalendarEvent.EventType.LOAN;
            case LOAN_IN -> MyCalendarEvent.EventType.SAVINGS;
        };
    }

    /**
     * 거래 타입에 따른 거래 유형 결정
     */
    private MyCalendarEvent.TransactionType determineTransactionType(TransactionHistory.TransactionType txnType) {
        return switch (txnType) {
            case DEPOSIT, INTEREST, LOAN_IN -> MyCalendarEvent.TransactionType.DEPOSIT;
            case WITHDRAWAL, LOAN_OUT -> MyCalendarEvent.TransactionType.WITHDRAW;
        };
    }
}
