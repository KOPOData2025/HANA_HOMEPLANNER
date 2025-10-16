import { apiClient } from '@/lib/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 캘린더 서비스
 * 사용자의 캘린더 이벤트를 조회하고 관리하는 기능을 제공합니다.
 */
export const calendarService = {
  /**
   * 사용자의 캘린더 이벤트 목록 조회
   * @returns {Promise<Object>} 캘린더 이벤트 목록 응답
   */
  async getCalendarEvents() {
    try {
      console.log('📅 캘린더 이벤트 목록 조회 요청 시작');
      console.log('🔗 API URL:', `${API_BASE_URL}/api/calendar/events`);
      
      const response = await apiClient.get(`${API_BASE_URL}/api/calendar/events`);
      
      console.log('📡 API 응답 상태:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API 에러 응답:', errorData);
        throw new Error(errorData.message || '캘린더 이벤트 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 캘린더 이벤트 목록 조회 성공:', data);
      console.log('📊 응답 데이터 구조:', {
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        dataType: typeof data.data,
        sampleItem: data.data?.[0]
      });
      
      return {
        success: true,
        data: data.data || [],
        message: data.message || '캘린더 이벤트 조회 성공'
      };
    } catch (error) {
      console.error('❌ 캘린더 이벤트 조회 오류:', error);
      return {
        success: false,
        data: [],
        message: error.message || '캘린더 이벤트 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 대출 상환 일정 등록
   * @param {Object} scheduleData - 대출 상환 일정 데이터
   * @returns {Promise<Object>} 대출 상환 일정 등록 응답
   */
  async createLoanSchedule(scheduleData) {
    try {
      console.log('📅 대출 상환 일정 등록 요청 시작:', scheduleData);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/calendar/events/loan-schedule`, scheduleData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '대출 상환 일정 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 대출 상환 일정 등록 성공:', data);
      
      return {
        success: true,
        data: data.data || [],
        message: data.message || '대출 상환 일정 등록 성공'
      };
    } catch (error) {
      console.error('❌ 대출 상환 일정 등록 오류:', error);
      return {
        success: false,
        data: [],
        message: error.message || '대출 상환 일정 등록 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 적금 상납 일정 등록
   * @param {Object} scheduleData - 적금 상납 일정 데이터
   * @returns {Promise<Object>} 적금 상납 일정 등록 응답
   */
  async createSavingsSchedule(scheduleData) {
    try {
      console.log('📅 적금 상납 일정 등록 요청 시작:', scheduleData);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/calendar/events/savings-schedule`, scheduleData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '적금 상납 일정 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 적금 상납 일정 등록 성공:', data);
      
      return {
        success: true,
        data: data.data || [],
        message: data.message || '적금 상납 일정 등록 성공'
      };
    } catch (error) {
      console.error('❌ 적금 상납 일정 등록 오류:', error);
      return {
        success: false,
        data: [],
        message: error.message || '적금 상납 일정 등록 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 개별 일정 등록
   * @param {Object} eventData - 일정 데이터
   * @returns {Promise<Object>} 일정 등록 응답
   */
  async createEvent(eventData) {
    try {
      console.log('📅 개별 일정 등록 요청 시작:', eventData);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/calendar/events`, eventData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '일정 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 개별 일정 등록 성공:', data);
      
      return {
        success: true,
        data: data.data || null,
        message: data.message || '일정 등록 성공'
      };
    } catch (error) {
      console.error('❌ 개별 일정 등록 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '일정 등록 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 개별 일정 삭제
   * @param {number} eventId - 이벤트 ID
   * @returns {Promise<Object>} 일정 삭제 응답
   */
  async deleteEvent(eventId) {
    try {
      console.log('📅 개별 일정 삭제 요청 시작:', eventId);
      
      const response = await apiClient.delete(`${API_BASE_URL}/api/calendar/events/${eventId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '일정 삭제에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 개별 일정 삭제 성공:', data);
      
      return {
        success: true,
        data: data.data || null,
        message: data.message || '일정 삭제 성공'
      };
    } catch (error) {
      console.error('❌ 개별 일정 삭제 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '일정 삭제 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 일정 상세 조회
   * @param {number} eventId - 이벤트 ID
   * @returns {Promise<Object>} 일정 상세 정보 응답
   */
  async getEventDetail(eventId) {
    try {
      console.log('📅 일정 상세 조회 요청 시작:', eventId);
      
      const response = await apiClient.get(`${API_BASE_URL}/api/calendar/events/${eventId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '일정 상세 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 일정 상세 조회 성공:', data);
      
      return {
        success: true,
        data: data.data || null,
        message: data.message || '일정 상세 조회 성공'
      };
    } catch (error) {
      console.error('❌ 일정 상세 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '일정 상세 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 계좌 거래내역 캘린더 등록
   * @param {Object} transactionData - 계좌 거래내역 데이터
   * @returns {Promise<Object>} 계좌 거래내역 등록 응답
   */
  async createTransactionHistory(transactionData) {
    try {
      console.log('📅 계좌 거래내역 등록 요청 시작:', transactionData);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/calendar/events/transaction-history`, transactionData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '계좌 거래내역 등록에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 계좌 거래내역 등록 성공:', data);
      
      return {
        success: true,
        data: data.data || [],
        message: data.message || '계좌 거래내역 등록 성공'
      };
    } catch (error) {
      console.error('❌ 계좌 거래내역 등록 오류:', error);
      return {
        success: false,
        data: [],
        message: error.message || '계좌 거래내역 등록 중 오류가 발생했습니다.'
      };
    }
  },
  async getConsumptionSummary(year, month) {
    try {
      console.log('📊 소비 요약 조회 요청 시작:', { year, month });
      
      const response = await apiClient.get(`${API_BASE_URL}/api/calendar/consumption-summary/${year}/${month}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '소비 요약 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 소비 요약 조회 성공:', data);
      
      return {
        success: true,
        data: data.data || null,
        message: data.message || '소비 요약 조회 성공'
      };
    } catch (error) {
      console.error('❌ 소비 요약 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '소비 요약 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 특정 날짜의 이벤트 필터링
   * @param {Array} events - 이벤트 목록
   * @param {Date} date - 필터링할 날짜
   * @returns {Array} 해당 날짜의 이벤트 목록
   */
  filterEventsByDate(events, date) {
    const dateStr = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      let eventDateStr;
      
      if (Array.isArray(event.eventDate)) {
        // 배열 형태 [년, 월, 일]을 문자열로 변환
        const [year, month, day] = event.eventDate;
        eventDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        // 이미 문자열인 경우
        eventDateStr = event.eventDate;
      }
      
      return eventDateStr === dateStr;
    });
  },

  /**
   * 이벤트 타입별 분류
   * @param {Array} events - 이벤트 목록
   * @returns {Object} 이벤트 타입별 분류
   */
  categorizeEventsByType(events) {
    return {
      savings: events.filter(event => event.eventType === 'SAVINGS'),
      loan: events.filter(event => event.eventType === 'LOAN' || event.eventType === 'JOINT_LOAN'),
      other: events.filter(event => !['SAVINGS', 'LOAN', 'JOINT_LOAN'].includes(event.eventType))
    };
  },

  /**
   * 이벤트 상태별 분류
   * @param {Array} events - 이벤트 목록
   * @returns {Object} 이벤트 상태별 분류
   */
  categorizeEventsByStatus(events) {
    return {
      scheduled: events.filter(event => event.status === 'SCHEDULED'),
      completed: events.filter(event => event.status === 'COMPLETED'),
      cancelled: events.filter(event => event.status === 'CANCELLED')
    };
  },

  /**
   * 월별 이벤트 통계 계산
   * @param {Array} events - 이벤트 목록
   * @param {Date} date - 기준 날짜
   * @returns {Object} 월별 통계
   */
  calculateMonthlyStats(events, date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthlyEvents = events.filter(event => {
      let eventDate;
      
      if (Array.isArray(event.eventDate)) {
        // 배열 형태 [년, 월, 일]을 Date 객체로 변환
        const [eventYear, eventMonth, eventDay] = event.eventDate;
        eventDate = new Date(eventYear, eventMonth - 1, eventDay); // 월은 0부터 시작
      } else {
        // 문자열인 경우
        eventDate = new Date(event.eventDate);
      }
      
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    const stats = {
      total: monthlyEvents.length,
      savings: monthlyEvents.filter(e => e.eventType === 'SAVINGS').length,
      loan: monthlyEvents.filter(e => e.eventType === 'LOAN' || e.eventType === 'JOINT_LOAN').length,
      other: monthlyEvents.filter(e => !['SAVINGS', 'LOAN', 'JOINT_LOAN'].includes(e.eventType)).length,
      scheduled: monthlyEvents.filter(e => e.status === 'SCHEDULED').length,
      completed: monthlyEvents.filter(e => e.status === 'COMPLETED').length,
      cancelled: monthlyEvents.filter(e => e.status === 'CANCELLED').length,
      totalAmount: monthlyEvents.reduce((sum, e) => sum + (e.amount || 0), 0),
      savingsAmount: monthlyEvents.filter(e => e.eventType === 'SAVINGS').reduce((sum, e) => sum + (e.amount || 0), 0),
      loanAmount: monthlyEvents.filter(e => e.eventType === 'LOAN' || e.eventType === 'JOINT_LOAN').reduce((sum, e) => sum + (e.amount || 0), 0)
    };

    return stats;
  },

  /**
   * 이벤트 정보 포맷팅
   * @param {Object} event - 이벤트 정보
   * @returns {Object} 포맷팅된 이벤트 정보
   */
  formatEventInfo(event) {
    return {
      ...event,
      formattedAmount: this.formatCurrency(event.amount),
      formattedDate: this.formatDate(event.eventDate),
      formattedCreatedAt: this.formatDateTime(event.createdAt),
      formattedUpdatedAt: this.formatDateTime(event.updatedAt)
    };
  },

  /**
   * 통화 포맷팅
   * @param {number} amount - 금액
   * @returns {string} 포맷팅된 금액
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷팅된 날짜
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      let date;
      
      if (Array.isArray(dateString)) {
        // 배열 형태 [년, 월, 일]을 Date 객체로 변환
        const [year, month, day] = dateString;
        date = new Date(year, month - 1, day); // 월은 0부터 시작
      } else {
        // 문자열인 경우
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return Array.isArray(dateString) ? dateString.join('-') : dateString;
    }
  },

  /**
   * 날짜시간 포맷팅
   * @param {string} dateTimeString - 날짜시간 문자열
   * @returns {string} 포맷팅된 날짜시간
   */
  formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜시간 포맷팅 오류:', error);
      return dateTimeString;
    }
  },

  /**
   * 이벤트 타입별 색상 반환
   * @param {string} eventType - 이벤트 타입
   * @returns {string} 색상 클래스명
   */
  getEventTypeColor(eventType) {
    const colorMap = {
      'SAVINGS': 'text-green-600 bg-green-100',
      'LOAN': 'text-red-600 bg-red-100',
      'JOINT_LOAN': 'text-orange-600 bg-orange-100',
      'CONSUMPTION': 'text-orange-600 bg-orange-100',
      'CARD': 'text-purple-600 bg-purple-100',
      'ETC': 'text-blue-600 bg-blue-100'
    };
    
    return colorMap[eventType] || 'text-gray-600 bg-gray-100';
  },

  /**
   * 이벤트 상태별 색상 반환
   * @param {string} status - 이벤트 상태
   * @returns {string} 색상 클래스명
   */
  getEventStatusColor(status) {
    const colorMap = {
      'SCHEDULED': 'text-blue-600 bg-blue-100',
      'COMPLETED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100'
    };
    
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  },

  /**
   * 거래 타입별 색상 반환
   * @param {string} transactionType - 거래 타입
   * @returns {string} 색상 클래스명
   */
  getTransactionTypeColor(transactionType) {
    const colorMap = {
      'DEPOSIT': 'text-green-600 bg-green-100',
      'WITHDRAW': 'text-red-600 bg-red-100',
      'WITHDRAWAL': 'text-red-600 bg-red-100'
    };
    
    return colorMap[transactionType] || 'text-gray-600 bg-gray-100';
  }
};

export default calendarService;
