import { useState, useEffect, useCallback } from 'react';
import { calendarService } from '@/services/calendarService';
import useErrorNotification from './useErrorNotification';

/**
 * 캘린더 이벤트 훅
 * 사용자의 캘린더 이벤트를 관리합니다.
 */
export const useCalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useErrorNotification();

  /**
   * 캘린더 이벤트 목록 조회
   */
  const fetchCalendarEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📅 [useCalendarEvents] API 호출 시작: /api/calendar/events');
      const response = await calendarService.getCalendarEvents();
      
      console.log('📅 [useCalendarEvents] API 응답:', response);
      
      if (response.success) {
        console.log('📅 [useCalendarEvents] 이벤트 데이터 설정:', response.data);
        setEvents(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message);
      showError('캘린더 이벤트 조회 실패', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  /**
   * 대출 상환 일정 등록
   * @param {Object} scheduleData - 대출 상환 일정 데이터
   * @returns {Promise<Object>} 등록 결과
   */
  const createLoanSchedule = useCallback(async (scheduleData) => {
    try {
      const response = await calendarService.createLoanSchedule(scheduleData);
      
      if (response.success) {
        // 등록 성공 시 이벤트 목록 새로고침
        await fetchCalendarEvents();
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      showError('대출 상환 일정 등록 실패', err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [showError, fetchCalendarEvents]);

  /**
   * 적금 상납 일정 등록
   * @param {Object} scheduleData - 적금 상납 일정 데이터
   * @returns {Promise<Object>} 등록 결과
   */
  const createSavingsSchedule = useCallback(async (scheduleData) => {
    try {
      const response = await calendarService.createSavingsSchedule(scheduleData);
      
      if (response.success) {
        // 등록 성공 시 이벤트 목록 새로고침
        await fetchCalendarEvents();
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      showError('적금 상납 일정 등록 실패', err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [showError, fetchCalendarEvents]);

  /**
   * 개별 일정 등록
   * @param {Object} eventData - 일정 데이터
   * @returns {Promise<Object>} 등록 결과
   */
  const createEvent = useCallback(async (eventData) => {
    try {
      const response = await calendarService.createEvent(eventData);
      
      if (response.success) {
        // 등록 성공 시 이벤트 목록 새로고침
        await fetchCalendarEvents();
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      showError('일정 등록 실패', err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [showError, fetchCalendarEvents]);

  /**
   * 계좌 거래내역 캘린더 등록
   * @param {Object} transactionData - 계좌 거래내역 데이터
   * @returns {Promise<Object>} 등록 결과
   */
  const createTransactionHistory = useCallback(async (transactionData) => {
    try {
      const response = await calendarService.createTransactionHistory(transactionData);
      
      if (response.success) {
        // 등록 성공 시 이벤트 목록 새로고침
        await fetchCalendarEvents();
        return { success: true, message: response.message, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      showError('계좌 거래내역 등록 실패', err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [showError, fetchCalendarEvents]);
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const response = await calendarService.deleteEvent(eventId);
      
      if (response.success) {
        // 삭제 성공 시 이벤트 목록 새로고침
        await fetchCalendarEvents();
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      showError('일정 삭제 실패', err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [showError, fetchCalendarEvents]);

  /**
   * 일정 상세 조회
   * @param {number} eventId - 이벤트 ID
   * @returns {Promise<Object>} 일정 상세 정보
   */
  const getEventDetail = useCallback(async (eventId) => {
    try {
      const response = await calendarService.getEventDetail(eventId);
      
      if (response.success) {
        return { success: true, data: response.data, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      showError('일정 상세 조회 실패', err.message, 'error');
      return { success: false, data: null, message: err.message };
    }
  }, [showError]);

  /**
   * 특정 날짜의 이벤트 조회
   * @param {Date} date - 조회할 날짜
   * @returns {Array} 해당 날짜의 이벤트 목록
   */
  const getEventsForDate = useCallback((date) => {
    return calendarService.filterEventsByDate(events, date);
  }, [events]);

  /**
   * 이벤트 타입별 분류
   * @returns {Object} 이벤트 타입별 분류
   */
  const getEventsByType = useCallback(() => {
    return calendarService.categorizeEventsByType(events);
  }, [events]);

  /**
   * 이벤트 상태별 분류
   * @returns {Object} 이벤트 상태별 분류
   */
  const getEventsByStatus = useCallback(() => {
    return calendarService.categorizeEventsByStatus(events);
  }, [events]);

  /**
   * 월별 이벤트 통계 계산
   * @param {Date} date - 기준 날짜
   * @returns {Object} 월별 통계
   */
  const getMonthlyStats = useCallback((date) => {
    return calendarService.calculateMonthlyStats(events, date);
  }, [events]);

  /**
   * 이벤트 정보 포맷팅
   * @param {Object} event - 이벤트 정보
   * @returns {Object} 포맷팅된 이벤트 정보
   */
  const formatEventInfo = useCallback((event) => {
    return calendarService.formatEventInfo(event);
  }, []);

  /**
   * 통화 포맷팅
   * @param {number} amount - 금액
   * @returns {string} 포맷팅된 금액
   */
  const formatCurrency = useCallback((amount) => {
    return calendarService.formatCurrency(amount);
  }, []);

  /**
   * 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷팅된 날짜
   */
  const formatDate = useCallback((dateString) => {
    return calendarService.formatDate(dateString);
  }, []);

  /**
   * 날짜시간 포맷팅
   * @param {string} dateTimeString - 날짜시간 문자열
   * @returns {string} 포맷팅된 날짜시간
   */
  const formatDateTime = useCallback((dateTimeString) => {
    return calendarService.formatDateTime(dateTimeString);
  }, []);

  /**
   * 이벤트 타입별 색상 반환
   * @param {string} eventType - 이벤트 타입
   * @returns {string} 색상 클래스명
   */
  const getEventTypeColor = useCallback((eventType) => {
    return calendarService.getEventTypeColor(eventType);
  }, []);

  /**
   * 이벤트 상태별 색상 반환
   * @param {string} status - 이벤트 상태
   * @returns {string} 색상 클래스명
   */
  const getEventStatusColor = useCallback((status) => {
    return calendarService.getEventStatusColor(status);
  }, []);

  /**
   * 거래 타입별 색상 반환
   * @param {string} transactionType - 거래 타입
   * @returns {string} 색상 클래스명
   */
  const getTransactionTypeColor = useCallback((transactionType) => {
    return calendarService.getTransactionTypeColor(transactionType);
  }, []);

  /**
   * 이벤트 타입별 아이콘 반환
   * @param {string} eventType - 이벤트 타입
   * @returns {string} 아이콘 컴포넌트
   */
  const getEventTypeIcon = useCallback((eventType) => {
    const iconMap = {
      'SAVINGS': 'PiggyBank',
      'LOAN': 'TrendingDown',
      'JOINT_LOAN': 'TrendingDown',
      'CONSUMPTION': 'ShoppingCart',
      'CARD': 'CreditCard',
      'ETC': 'Clock'
    };
    
    return iconMap[eventType] || 'Clock';
  }, []);

  /**
   * 거래 타입별 아이콘 반환
   * @param {string} transactionType - 거래 타입
   * @returns {string} 아이콘 컴포넌트
   */
  const getTransactionTypeIcon = useCallback((transactionType) => {
    const iconMap = {
      'DEPOSIT': 'ArrowDownLeft',
      'WITHDRAW': 'ArrowUpRight',
      'WITHDRAWAL': 'ArrowUpRight'
    };
    
    return iconMap[transactionType] || 'ArrowRightLeft';
  }, []);

  // 컴포넌트 마운트 시 이벤트 조회
  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  return {
    events,
    isLoading,
    error,
    fetchCalendarEvents,
    createLoanSchedule,
    createSavingsSchedule,
    createEvent,
    createTransactionHistory,
    deleteEvent,
    getEventDetail,
    getEventsForDate,
    getEventsByType,
    getEventsByStatus,
    getMonthlyStats,
    formatEventInfo,
    formatCurrency,
    formatDate,
    formatDateTime,
    getEventTypeColor,
    getEventStatusColor,
    getTransactionTypeColor,
    getEventTypeIcon,
    getTransactionTypeIcon,
  };
};
