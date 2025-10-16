/**
 * 마이 캘린더 페이지
 * 대출 상환 스케줄, 청약 일정 등을 관리하는 캘린더
 */

import React, { useState } from 'react';
import { Layout } from '@/components/layout/layout';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign,
  Home,
  TrendingUp,
  Calculator,
  CreditCard,
  PiggyBank,
  TrendingDown,
  XCircle,
  ShoppingCart,
  FileText,
  CheckCircle
} from 'lucide-react';
import { 
  MonthlyDashboard
} from '@/components/calendar';
import ConsumptionSummaryModal from '@/components/calendar/ConsumptionSummaryModal';
import CustomSelect from '@/components/common/CustomSelect';
import { useAccounts, useCalendarEvents, useToast } from '@/hooks';
import { calendarService } from '@/services/calendarService';

export default function MyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  // const [events, setEvents] = useState([]); // useCalendarEvents에서 가져오므로 제거
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: 'loan',
    amount: '',
    description: '',
    accountId: ''
  });

  // 일정 추가 모달 타입 상태
  const [eventModalType, setEventModalType] = useState(null); // 'savings', 'loan', 'other'
  
  // 대출일정 등록 상태
  const [showLoanScheduleModal, setShowLoanScheduleModal] = useState(false);
  const [loanScheduleData, setLoanScheduleData] = useState({
    accountNum: '',
    accountTypeDescription: '대출',
    title: ''
  });

  // 적금일정 등록 상태
  const [showSavingsScheduleModal, setShowSavingsScheduleModal] = useState(false);
  const [savingsScheduleData, setSavingsScheduleData] = useState({
    accountNum: '',
    accountTypeDescription: '적금',
    title: ''
  });

  // 계좌 조회 모달 상태
  const [showAccountInquiryModal, setShowAccountInquiryModal] = useState(false);
  const [accountInquiryData, setAccountInquiryData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    selectedAccountId: ''
  });

  // 일정 상세 조회 상태
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [eventDetailData, setEventDetailData] = useState(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);

  // 삭제 확인 모달 상태
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // 개별 일정 등록 상태
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [createEventData, setCreateEventData] = useState({
    eventDate: '',
    transactionType: 'DEPOSIT',
    eventType: 'SAVINGS',
    title: '',
    description: '',
    amount: '',
    relatedId: null
  });

  // 계좌 정보 훅 사용
  const {
    accounts,
    isLoading: accountsLoading,
    formatCurrency: formatAccountCurrency,
    formatAccountNumber,
    getAccountTypeIcon,
    getAccountTypeColor
  } = useAccounts();

  // 캘린더 이벤트 훅 사용
  const {
    events: calendarEvents,
    isLoading: calendarEventsLoading,
    error: calendarEventsError,
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
    formatCurrency: formatEventCurrency,
    formatDate: formatEventDate,
    getEventTypeColor,
    getEventStatusColor,
    getTransactionTypeColor,
    getEventTypeIcon,
    getTransactionTypeIcon
  } = useCalendarEvents();

  // 토스터 알림 훅
  const { toasts, showToast, removeToast } = useToast();

  // 소비 요약 모달 상태
  const [showConsumptionSummaryModal, setShowConsumptionSummaryModal] = useState(false);
  const [consumptionSummaryData, setConsumptionSummaryData] = useState(null);
  const [consumptionSummaryLoading, setConsumptionSummaryLoading] = useState(false);

  // 컴포넌트 마운트 시 캘린더 이벤트 로드
  React.useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  // 날짜 배열을 Date 객체로 변환하는 헬퍼 함수
  const parseDateArray = (dateArray) => {
    if (Array.isArray(dateArray)) {
      if (dateArray.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
        return new Date(year, month - 1, day, hour, minute, second);
      }
    }
    return new Date(dateArray);
  };

  // 날짜 포맷팅 헬퍼 함수
  const formatDateForDisplay = (dateData) => {
    const date = parseDateArray(dateData);
    return date.toLocaleDateString('ko-KR');
  };

  // 날짜시간 포맷팅 헬퍼 함수
  const formatDateTimeForDisplay = (dateData) => {
    const date = parseDateArray(dateData);
    return date.toLocaleString('ko-KR');
  };

  // 디버깅: 캘린더 이벤트 데이터 확인
  React.useEffect(() => {
    console.log('📅 [MyCalendarPage] 캘린더 이벤트 상태:', {
      calendarEvents,
      eventsLength: calendarEvents?.length || 0,
      isLoading: calendarEventsLoading,
      error: calendarEventsError,
      sampleEvent: calendarEvents?.[0]
    });
  }, [calendarEvents, calendarEventsLoading, calendarEventsError]);

  // 새 이벤트 추가
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      alert('제목과 날짜를 입력해주세요.');
      return;
    }

    const eventData = {
      id: Date.now(),
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type,
      amount: newEvent.amount ? parseInt(newEvent.amount) : null,
      description: newEvent.description,
      accountId: newEvent.accountId
    };

    // 이벤트 추가 후 다시 가져오기
    await fetchCalendarEvents();

    // 폼 초기화
    setNewEvent({
      title: '',
      date: '',
      type: 'loan',
      amount: '',
      description: '',
      accountId: ''
    });

    setShowAddEvent(false);
    alert('일정이 추가되었습니다!');
  };

  // 이벤트 삭제 확인 모달 열기
  const handleOpenDeleteConfirm = (eventId) => {
    if (!eventId) {
      showToast('삭제할 일정을 선택해주세요.', 'error');
      return;
    }
    setEventToDelete(eventId);
    setShowDeleteConfirmModal(true);
  };

  // 이벤트 삭제 확인 모달 닫기
  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirmModal(false);
    setEventToDelete(null);
  };

  // 이벤트 삭제 실행
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const result = await deleteEvent(eventToDelete);
      if (result.success) {
        showToast('일정이 성공적으로 삭제되었습니다.', 'success');
        // 일정 상세 모달이 열려있다면 닫기
        if (showEventDetailModal) {
          setShowEventDetailModal(false);
        }
      } else {
        showToast(result.message || '일정 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('일정 삭제 오류:', error);
      showToast('일정 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      handleCloseDeleteConfirm();
    }
  };

  // 일정 추가 모달 열기 함수들
  const handleOpenSavingsModal = () => {
    setEventModalType('savings');
    setNewEvent({
      title: '',
      date: '',
      type: 'savings',
      amount: '',
      description: '',
      accountId: ''
    });
    setShowAddEvent(true);
  };

  const handleOpenLoanModal = () => {
    setEventModalType('loan');
    setNewEvent({
      title: '',
      date: '',
      type: 'loan',
      amount: '',
      description: '',
      accountId: ''
    });
    setShowAddEvent(true);
  };

  const handleOpenAccountInquiryModal = () => {
    // 계좌 조회 모달 열기
    setAccountInquiryData({
      title: '',
      startDate: '',
      endDate: '',
      selectedAccountId: ''
    });
    setShowAccountInquiryModal(true);
  };

  const handleCloseAccountInquiryModal = () => {
    setShowAccountInquiryModal(false);
    setAccountInquiryData({
      title: '',
      startDate: '',
      endDate: '',
      selectedAccountId: ''
    });
  };

  // 적금, 대출이 아닌 계좌들 필터링
  const getNonSavingsLoanAccounts = () => {
    return accounts.filter(account => 
      account.accountType !== 'SAVING' && 
      account.accountType !== 'JOINT_SAVING' &&
      account.accountType !== 'LOAN' && 
      account.accountType !== 'JOINT_LOAN'
    );
  };

  // 대출일정 등록 모달 열기
  const handleOpenLoanScheduleModal = () => {
    setLoanScheduleData({
      accountNum: '',
      accountTypeDescription: '대출',
      title: ''
    });
    setShowLoanScheduleModal(true);
  };

  // 대출일정 등록 모달 닫기
  const handleCloseLoanScheduleModal = () => {
    setShowLoanScheduleModal(false);
    setLoanScheduleData({
      accountNum: '',
      accountTypeDescription: '대출',
      title: ''
    });
  };

  // 대출일정 등록 처리
  const handleCreateLoanSchedule = async () => {
    if (!loanScheduleData.accountNum || !loanScheduleData.title) {
      showToast('계좌번호와 제목을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      const result = await createLoanSchedule(loanScheduleData);
      if (result.success) {
        showToast('대출 상환 일정이 성공적으로 등록되었습니다.', 'success');
        handleCloseLoanScheduleModal();
      }
    } catch (error) {
      console.error('대출일정 등록 오류:', error);
      showToast('대출일정 등록 중 오류가 발생했습니다.', 'error');
    }
  };

  // 적금일정 등록 모달 열기
  const handleOpenSavingsScheduleModal = () => {
    setSavingsScheduleData({
      accountNum: '',
      accountTypeDescription: '적금',
      title: ''
    });
    setShowSavingsScheduleModal(true);
  };

  // 적금일정 등록 모달 닫기
  const handleCloseSavingsScheduleModal = () => {
    setShowSavingsScheduleModal(false);
    setSavingsScheduleData({
      accountNum: '',
      accountTypeDescription: '적금',
      title: ''
    });
  };

  // 적금일정 등록 처리
  const handleCreateSavingsSchedule = async () => {
    if (!savingsScheduleData.accountNum || !savingsScheduleData.title) {
      showToast('계좌번호와 제목을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      const result = await createSavingsSchedule(savingsScheduleData);
      if (result.success) {
        showToast('적금 상납 일정이 성공적으로 등록되었습니다.', 'success');
        handleCloseSavingsScheduleModal();
      }
    } catch (error) {
      console.error('적금일정 등록 오류:', error);
      showToast('적금일정 등록 중 오류가 발생했습니다.', 'error');
    }
  };

  // 개별 일정 등록 모달 열기
  const handleOpenCreateEventModal = () => {
    setCreateEventData({
      eventDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      transactionType: 'DEPOSIT',
      eventType: 'SAVINGS',
      title: '',
      description: '',
      amount: '',
      relatedId: null
    });
    setShowCreateEventModal(true);
  };

  // 개별 일정 등록 모달 닫기
  const handleCloseCreateEventModal = () => {
    setShowCreateEventModal(false);
    setCreateEventData({
      eventDate: '',
      transactionType: 'DEPOSIT',
      eventType: 'SAVINGS',
      title: '',
      description: '',
      amount: '',
      relatedId: null
    });
  };

  // 개별 일정 등록 처리
  const handleCreateEvent = async () => {
    if (!createEventData.eventDate || !createEventData.title || !createEventData.amount) {
      showToast('날짜, 제목, 금액을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      const eventData = {
        ...createEventData,
        amount: parseFloat(createEventData.amount)
      };
      
      const result = await createEvent(eventData);
      if (result.success) {
        showToast('일정이 성공적으로 등록되었습니다.', 'success');
        handleCloseCreateEventModal();
      }
    } catch (error) {
      console.error('일정 등록 오류:', error);
      showToast('일정 등록 중 오류가 발생했습니다.', 'error');
    }
  };

  // 새 이벤트 폼 초기화
  const handleResetForm = () => {
    setNewEvent({
      title: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      type: 'loan',
      amount: '',
      description: '',
      accountId: ''
    });
    setEventModalType(null);
    setShowAddEvent(false);
  };

  // 일정 추가 모달 열기 (선택된 날짜로 초기화)
  const handleOpenAddEvent = () => {
    handleOpenCreateEventModal();
  };

  // 일정 상세 조회 모달 열기
  const handleOpenEventDetail = async (eventId) => {
    if (!eventId) return;
    
    setEventDetailLoading(true);
    setShowEventDetailModal(true);
    
    try {
      const result = await getEventDetail(eventId);
      if (result.success) {
        setEventDetailData(result.data);
      } else {
        showToast('일정 상세 정보를 불러올 수 없습니다.', 'error');
        setShowEventDetailModal(false);
      }
    } catch (error) {
      console.error('일정 상세 조회 오류:', error);
      showToast('일정 상세 조회 중 오류가 발생했습니다.', 'error');
      setShowEventDetailModal(false);
    } finally {
      setEventDetailLoading(false);
    }
  };

  // 일정 상세 조회 모달 닫기
  const handleCloseEventDetail = () => {
    setShowEventDetailModal(false);
    setEventDetailData(null);
    setEventDetailLoading(false);
  };

  // 소비 요약 모달 열기
  const handleOpenConsumptionSummary = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // JavaScript month는 0부터 시작
    
    setConsumptionSummaryLoading(true);
    setShowConsumptionSummaryModal(true);
    
    try {
      const result = await calendarService.getConsumptionSummary(year, month);
      if (result.success) {
        setConsumptionSummaryData(result.data);
      } else {
        showToast('소비 요약을 불러올 수 없습니다.', 'error');
        setConsumptionSummaryData(null);
      }
    } catch (error) {
      console.error('소비 요약 조회 오류:', error);
      showToast('소비 요약 조회 중 오류가 발생했습니다.', 'error');
      setConsumptionSummaryData(null);
    } finally {
      setConsumptionSummaryLoading(false);
    }
  };

  // 소비 요약 모달 닫기
  const handleCloseConsumptionSummary = () => {
    setShowConsumptionSummaryModal(false);
    setConsumptionSummaryData(null);
    setConsumptionSummaryLoading(false);
  };

  // 월별 캘린더 생성
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  };

  // 특정 날짜의 이벤트 가져오기 (API 데이터와 로컬 데이터 통합)
  const getAllEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // API에서 가져온 이벤트 (eventDate 필드 사용)
    // eventDate가 배열 형태 [2024, 1, 1]로 오는 경우를 처리
    const apiEvents = calendarEvents.filter(event => {
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
    
    // 디버깅 로그 추가
    console.log('🔍 [getAllEventsForDate] 날짜별 이벤트 조회:', {
      dateStr,
      totalEvents: calendarEvents.length,
      apiEvents: apiEvents.length,
      sampleEvents: calendarEvents.slice(0, 3).map(e => ({
        eventId: e.eventId,
        eventDate: e.eventDate,
        eventDateType: Array.isArray(e.eventDate) ? 'array' : 'string',
        title: e.title,
        eventType: e.eventType
      }))
    });
    
    // 로컬에서 추가한 이벤트는 별도 상태로 관리되어야 하지만, 
    // 현재는 API 이벤트만 사용하므로 apiEvents만 반환
    return apiEvents;
  };

  // 이벤트 타입별 스타일 (API 데이터와 로컬 데이터 모두 지원)
  const getEventStyle = (event) => {
    // API 이벤트인 경우
    if (event.eventType) {
      switch (event.eventType) {
        case 'SAVINGS':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'LOAN':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'CARD':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'CONSUMPTION':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'UTILITY':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'MANAGEMENT_FEE':
          return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'INSURANCE':
          return 'bg-teal-100 text-teal-800 border-teal-200';
        case 'TAX':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'SUBSCRIPTION':
          return 'bg-pink-100 text-pink-800 border-pink-200';
        case 'EDUCATION':
          return 'bg-cyan-100 text-cyan-800 border-cyan-200';
        case 'MEDICAL':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'TRANSPORTATION':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'FOOD':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'ENTERTAINMENT':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'SHOPPING':
          return 'bg-pink-100 text-pink-800 border-pink-200';
        case 'TRAVEL':
          return 'bg-sky-100 text-sky-800 border-sky-200';
        case 'ETC':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    // 로컬 이벤트인 경우
    switch (event.type) {
      case 'loan':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'installment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'checkpoint':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'subscription':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'savings':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 이벤트 타입별 아이콘 (API 데이터와 로컬 데이터 모두 지원)
  const getEventIcon = (event) => {
    // API 이벤트인 경우
    if (event.eventType) {
      switch (event.eventType) {
        case 'SAVINGS':
          return <PiggyBank className="w-3 h-3" />;
        case 'LOAN':
          return <TrendingDown className="w-3 h-3" />;
        case 'CARD':
          return <CreditCard className="w-3 h-3" />;
        case 'CONSUMPTION':
          return <ShoppingCart className="w-3 h-3" />;
        case 'UTILITY':
          return <DollarSign className="w-3 h-3" />;
        case 'MANAGEMENT_FEE':
          return <Home className="w-3 h-3" />;
        case 'INSURANCE':
          return <FileText className="w-3 h-3" />;
        case 'TAX':
          return <FileText className="w-3 h-3" />;
        case 'SUBSCRIPTION':
          return <Clock className="w-3 h-3" />;
        case 'EDUCATION':
          return <FileText className="w-3 h-3" />;
        case 'MEDICAL':
          return <FileText className="w-3 h-3" />;
        case 'TRANSPORTATION':
          return <DollarSign className="w-3 h-3" />;
        case 'FOOD':
          return <ShoppingCart className="w-3 h-3" />;
        case 'ENTERTAINMENT':
          return <Clock className="w-3 h-3" />;
        case 'SHOPPING':
          return <ShoppingCart className="w-3 h-3" />;
        case 'TRAVEL':
          return <Clock className="w-3 h-3" />;
        case 'ETC':
          return <Clock className="w-3 h-3" />;
        default:
          return <Clock className="w-3 h-3" />;
      }
    }
    
    // 로컬 이벤트인 경우
    switch (event.type) {
      case 'loan':
        return <DollarSign className="w-3 h-3" />;
      case 'installment':
        return <Home className="w-3 h-3" />;
      case 'checkpoint':
        return <TrendingUp className="w-3 h-3" />;
      case 'subscription':
        return <Home className="w-3 h-3" />;
      case 'savings':
        return <TrendingUp className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // 계좌 타입별 아이콘
  const getAccountIcon = (accountType) => {
    switch (accountType) {
      case 'DEMAND':
        return <CreditCard className="w-4 h-4" />;
      case 'SAVING':
        return <PiggyBank className="w-4 h-4" />;
      case 'LOAN':
      case 'JOINT_LOAN':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const calendar = generateCalendar();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <Layout currentPage="my-calendar" backgroundColor="bg-gray-50">
      {/* 토스트 알림 컨테이너 */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[350px] max-w-[500px] bg-white shadow-xl rounded-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out ${
              toast.type === 'success' ? 'border-green-500 bg-green-50' :
              toast.type === 'error' ? 'border-red-500 bg-red-50' :
              toast.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  toast.type === 'success' ? 'bg-green-100' :
                  toast.type === 'error' ? 'bg-red-100' :
                  toast.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {toast.type === 'success' && (
                    <>
                      <span className="text-lg">✅</span>
                    </>
                  )}
                  {toast.type === 'error' && (
                    <>
                      <span className="text-lg">❌</span>
                    </>
                  )}
                  {toast.type === 'warning' && (
                    <>
                      <span className="text-lg">⚠️</span>
                    </>
                  )}
                  {toast.type === 'info' && (
                    <>
                      <span className="text-lg">ℹ️</span>
                    </>
                  )}
                </div>
                <p className={`text-sm font-medium ${
                  toast.type === 'success' ? 'text-green-800' :
                  toast.type === 'error' ? 'text-red-800' :
                  toast.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors ${
                  toast.type === 'success' ? 'text-green-600 hover:text-green-700' :
                  toast.type === 'error' ? 'text-red-600 hover:text-red-700' :
                  toast.type === 'warning' ? 'text-yellow-600 hover:text-yellow-700' :
                  'text-blue-600 hover:text-blue-700'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto max-w-[1600px] px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              <Calendar className="inline-block w-8 h-8 mr-3 text-teal-600" />
              마이 캘린더
            </h1>
            <p className="text-gray-600">
              대출 상환, 청약 일정 등을 한눈에 관리하세요
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenConsumptionSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              소비요약
            </button>
            
            {/* 일정 추가 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={handleOpenSavingsScheduleModal}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <PiggyBank className="w-4 h-4" />
                적금일정
              </button>
        <button
          onClick={handleOpenLoanScheduleModal}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <TrendingDown className="w-4 h-4" />
          대출일정
        </button>
              <button
                onClick={handleOpenAccountInquiryModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                기타일정
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-7 gap-6">
          {/* 캘린더 */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {/* 월 네비게이션 */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* 캘린더 그리드 */}
              <div className="grid grid-cols-7 gap-2">
                {calendar.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                  const dayEvents = getAllEventsForDate(date);

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] px-3 py-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                      } ${isToday ? 'bg-teal-50 border-teal-300' : ''} ${
                        isSelected ? 'bg-teal-100 border-teal-400' : ''
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-teal-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.eventId || event.id}
                            className={`text-sm px-2 py-1 rounded border flex items-center gap-1 ${getEventStyle(event)}`}
                          >
                            {getEventIcon(event)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{dayEvents.length - 2}개 더
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 사이드바 - 선택된 날짜 정보 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 선택된 날짜 이벤트 */}
            {(selectedDate || new Date()) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {(selectedDate || new Date()).getFullYear()}년 {(selectedDate || new Date()).getMonth() + 1}월 {(selectedDate || new Date()).getDate()}일
                  </h3>
                  {/* 일정이 있을 때만 우측 상단 버튼 표시 */}
                  {getAllEventsForDate(selectedDate || new Date()).length > 0 && (
                    <button
                      onClick={handleOpenAddEvent}
                      className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      일정 추가
                    </button>
                  )}
                </div>
                
                {/* 일정 목록 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {getAllEventsForDate(selectedDate || new Date()).map(event => (
                    <div 
                      key={event.eventId || event.id} 
                      className={`border border-gray-200 rounded-lg p-4 flex-shrink-0 min-h-[120px] flex flex-col justify-between ${
                        event.eventId ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
                      }`}
                      onClick={() => event.eventId && handleOpenEventDetail(event.eventId)}
                    >
                      {/* 상단: 제목과 상태 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getEventIcon(event)}
                          </div>
                          <span className="font-medium text-gray-800 truncate">{event.title}</span>
                          {/* API 이벤트인 경우 상태 표시 */}
                          {event.status && (
                            <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${getEventStatusColor(event.status)}`}>
                              {event.statusDescription}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {/* 로컬 이벤트인 경우에만 편집/삭제 버튼 표시 */}
                          {!event.eventId && (
                            <>
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <Edit className="w-3 h-3 text-gray-500" />
                              </button>
                              <button 
                                onClick={() => handleOpenDeleteConfirm(event.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 중간: 설명 */}
                      <div className="mb-3 flex-1">
                        <p className="text-sm text-gray-600 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{event.description}</p>
                      </div>
                      
                      {/* 하단: 금액과 추가 정보 */}
                      <div className="space-y-2">
                        {event.amount && (
                          <p className="text-sm font-semibold text-gray-800">
                            {formatEventCurrency(event.amount)}
                          </p>
                        )}
                        {/* API 이벤트인 경우 추가 정보 표시 */}
                        {event.eventType && (
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>타입: {event.eventTypeDescription}</div>
                            <div>거래: {event.transactionTypeDescription}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* 일정이 없을 때 표시 */}
                  {getAllEventsForDate(selectedDate || new Date()).length === 0 && (
                    <div className="text-center py-8 flex-shrink-0">
                      <p className="text-gray-500 mb-4">등록된 일정이 없습니다</p>
                      <button
                        onClick={handleOpenAddEvent}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        첫 번째 일정 추가하기
                      </button>
                    </div>
                  )}
                </div>
                
                {/* 스크롤 인디케이터 */}
                {getAllEventsForDate(selectedDate || new Date()).length > 3 && (
                  <div className="flex-shrink-0 mt-3 text-center">
                    <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span className="ml-2 text-gray-500">스크롤하여 더 보기</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 이번 달 요약 - 새로운 대시보드 */}
            <MonthlyDashboard 
              events={calendarEvents} 
              currentDate={currentDate}
              formatEventCurrency={formatEventCurrency}
            />
          </div>
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {showAddEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleResetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                {(() => {
                  switch (eventModalType) {
                    case 'savings':
                      return (
                        <>
                          <PiggyBank className="w-12 h-12 text-green-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            적금 일정 추가
                          </h3>
                          <p className="text-sm text-gray-500">
                            적금 납입 일정을 추가하세요
                          </p>
                        </>
                      );
                    case 'loan':
                      return (
                        <>
                          <TrendingDown className="w-12 h-12 text-red-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            대출 일정 추가
                          </h3>
                          <p className="text-sm text-gray-500">
                            대출 상환 일정을 추가하세요
                          </p>
                        </>
                      );
                    case 'other':
                      return (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            기타 일정 추가
                          </h3>
                          <p className="text-sm text-gray-500">
                            기타 일정을 추가하세요
                          </p>
                        </>
                      );
                    default:
                      return (
                        <>
                          <Plus className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            새 일정 추가
                          </h3>
                          <p className="text-sm text-gray-500">
                            캘린더에 새로운 일정을 추가하세요
                          </p>
                        </>
                      );
                  }
                })()}
              </div>
              <button
                onClick={handleResetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="예: 대출 상환일"
                />
              </div>

              {/* 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* 타입 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  타입
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {(() => {
                    switch (eventModalType) {
                      case 'savings':
                        return (
                          <>
                            <option value="savings">적금 납입</option>
                            <option value="installment">적금 만기</option>
                          </>
                        );
                      case 'loan':
                        return (
                          <>
                            <option value="loan">대출 상환</option>
                            <option value="installment">대출 만기</option>
                          </>
                        );
                      case 'other':
                        return (
                          <>
                            <option value="checkpoint">금리 점검</option>
                            <option value="subscription">청약 일정</option>
                            <option value="installment">기타 납부</option>
                          </>
                        );
                      default:
                        return (
                          <>
                            <option value="loan">대출 상환</option>
                            <option value="installment">납부 일정</option>
                            <option value="checkpoint">금리 점검</option>
                            <option value="subscription">청약 일정</option>
                            <option value="savings">적금 만기</option>
                          </>
                        );
                    }
                  })()}
                </select>
              </div>

              {/* 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  금액 (원)
                </label>
                <input
                  type="number"
                  value={newEvent.amount}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="예: 1200000"
                />
              </div>

              {/* 계좌 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관련 계좌 (선택사항)
                </label>
                {accountsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                    계좌 정보를 불러오는 중...
                  </div>
                ) : (
                  <select
                    value={newEvent.accountId}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">계좌를 선택하세요</option>
                    {accounts.filter(account => {
                      switch (eventModalType) {
                        case 'savings':
                          return account.accountType === 'SAVING';
                        case 'loan':
                          return account.accountType === 'LOAN' || account.accountType === 'JOINT_LOAN';
                        case 'other':
                          return true; // 기타일정은 모든 계좌 선택 가능
                        default:
                          return true;
                      }
                    }).map(account => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.accountTypeDescription} - {formatAccountNumber(account.accountNum)} ({formatAccountCurrency(account.balance)})
                      </option>
                    ))}
                  </select>
                )}
                
                {/* 선택된 계좌 정보 표시 */}
                {newEvent.accountId && (
                  <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                    {(() => {
                      const selectedAccount = accounts.find(acc => acc.accountId === newEvent.accountId);
                      if (!selectedAccount) return null;
                      
                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccountTypeColor(selectedAccount.accountType)}`}>
                            {getAccountIcon(selectedAccount.accountType)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {selectedAccount.accountTypeDescription}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatAccountNumber(selectedAccount.accountNum)}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                              {formatAccountCurrency(selectedAccount.balance)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="3"
                  placeholder="예: 월 상환액 120만원"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleResetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 대출일정 등록 모달 */}
      {showLoanScheduleModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseLoanScheduleModal();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <TrendingDown className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  대출 상환 일정 등록
                </h3>
                <p className="text-sm text-gray-500">
                  대출 계좌의 상환 일정을 등록하세요
                </p>
              </div>
              <button
                onClick={handleCloseLoanScheduleModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* 계좌 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대출 계좌 선택 *
                </label>
                {accountsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                    계좌 정보를 불러오는 중...
                  </div>
                ) : (
                  <select
                    value={loanScheduleData.accountNum}
                    onChange={(e) => setLoanScheduleData(prev => ({ ...prev, accountNum: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">대출 계좌를 선택하세요</option>
                    {accounts.filter(account => account.accountType === 'LOAN' || account.accountType === 'JOINT_LOAN').map(account => (
                      <option key={account.accountId} value={account.accountNum}>
                        {account.accountTypeDescription} - {formatAccountNumber(account.accountNum)} ({formatAccountCurrency(account.balance)})
                      </option>
                    ))}
                  </select>
                )}

                {/* 선택된 계좌 정보 표시 */}
                {loanScheduleData.accountNum && (
                  <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                    {(() => {
                      const selectedAccount = accounts.find(acc => acc.accountNum === loanScheduleData.accountNum);
                      if (!selectedAccount) return null;

                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccountTypeColor(selectedAccount.accountType)}`}>
                            {getAccountIcon(selectedAccount.accountType)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {selectedAccount.accountTypeDescription}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatAccountNumber(selectedAccount.accountNum)}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                              {formatAccountCurrency(selectedAccount.balance)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 제목 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 제목 *
                </label>
                <input
                  type="text"
                  value={loanScheduleData.title}
                  onChange={(e) => setLoanScheduleData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="예: 월 대출 상환금"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCloseLoanScheduleModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateLoanSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 적금일정 등록 모달 */}
      {showSavingsScheduleModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseSavingsScheduleModal();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <PiggyBank className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  적금 상납 일정 등록
                </h3>
                <p className="text-sm text-gray-500">
                  적금 계좌의 상납 일정을 등록하세요
                </p>
              </div>
              <button
                onClick={handleCloseSavingsScheduleModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* 계좌 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  적금 계좌 선택 *
                </label>
                {accountsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                    계좌 정보를 불러오는 중...
                  </div>
                ) : (
                  <select
                    value={savingsScheduleData.accountNum}
                    onChange={(e) => setSavingsScheduleData(prev => ({ ...prev, accountNum: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">적금 계좌를 선택하세요</option>
                    {accounts.filter(account => account.accountType === 'SAVING' || account.accountType === 'JOINT_SAVING').map(account => (
                      <option key={account.accountId} value={account.accountNum}>
                        {account.accountTypeDescription} - {formatAccountNumber(account.accountNum)} ({formatAccountCurrency(account.balance)})
                      </option>
                    ))}
                  </select>
                )}

                {/* 선택된 계좌 정보 표시 */}
                {savingsScheduleData.accountNum && (
                  <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                    {(() => {
                      const selectedAccount = accounts.find(acc => acc.accountNum === savingsScheduleData.accountNum);
                      if (!selectedAccount) return null;

                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccountTypeColor(selectedAccount.accountType)}`}>
                            {getAccountIcon(selectedAccount.accountType)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {selectedAccount.accountTypeDescription}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatAccountNumber(selectedAccount.accountNum)}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                              {formatAccountCurrency(selectedAccount.balance)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 제목 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 제목 *
                </label>
                <input
                  type="text"
                  value={savingsScheduleData.title}
                  onChange={(e) => setSavingsScheduleData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="예: 월 적금 납입"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCloseSavingsScheduleModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateSavingsSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 상세 조회 모달 */}
      {showEventDetailModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEventDetail();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                {eventDetailData && (
                  <>
                    {eventDetailData.eventType === 'SAVINGS' && (
                      <PiggyBank className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    )}
                    {(eventDetailData.eventType === 'LOAN' || eventDetailData.eventType === 'JOINT_LOAN') && (
                      <TrendingDown className={`w-12 h-12 mx-auto mb-4 ${
                        eventDetailData.eventType === 'JOINT_LOAN' ? 'text-orange-600' : 'text-red-600'
                      }`} />
                    )}
                    {eventDetailData.eventType === 'CONSUMPTION' && (
                      <ShoppingCart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    )}
                    {eventDetailData.eventType === 'CARD' && (
                      <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    )}
                    {eventDetailData.eventType === 'ETC' && (
                      <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      일정 상세 정보
                    </h3>
                    <p className="text-sm text-gray-500">
                      {eventDetailData.title}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={handleCloseEventDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {eventDetailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-gray-600">일정 정보를 불러오는 중...</span>
              </div>
            ) : eventDetailData ? (
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">제목</label>
                      <p className="text-sm font-medium text-gray-800">{eventDetailData.title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">설명</label>
                      <p className="text-sm font-medium text-gray-800">{eventDetailData.description}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">일정 날짜</label>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDateForDisplay(eventDetailData.eventDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">금액</label>
                      <p className="text-sm font-medium text-gray-800">
                        {formatEventCurrency(eventDetailData.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 일정 타입 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">일정 타입</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">이벤트 타입</label>
                      <p className="text-sm font-medium text-gray-800">{eventDetailData.eventTypeDescription}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">거래 타입</label>
                      <p className="text-sm font-medium text-gray-800">{eventDetailData.transactionTypeDescription}</p>
                    </div>
                  </div>
                </div>

                {/* 상태 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">상태 정보</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">상태</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventStatusColor(eventDetailData.status)}`}>
                          {eventDetailData.statusDescription}
                        </span>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCloseEventDetail}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => handleOpenDeleteConfirm(eventDetailData.eventId)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">일정 정보를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 개별 일정 등록 모달 */}
      {showCreateEventModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseCreateEventModal();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">개별 일정 등록</h3>
                <p className="text-sm text-gray-600">새로운 일정을 등록하세요</p>
              </div>
              <button
                onClick={handleCloseCreateEventModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={createEventData.eventDate}
                  onChange={(e) => setCreateEventData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {/* 거래 타입 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래 타입 *
                </label>
                <select
                  value={createEventData.transactionType}
                  onChange={(e) => setCreateEventData(prev => ({ ...prev, transactionType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="DEPOSIT">입금</option>
                  <option value="WITHDRAW">출금</option>
                </select>
              </div>

              {/* 이벤트 타입 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이벤트 타입 *
                </label>
                <CustomSelect
                  value={createEventData.eventType}
                  onChange={(newValue) => setCreateEventData(prev => ({ ...prev, eventType: newValue }))}
                />
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={createEventData.title}
                  onChange={(e) => setCreateEventData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="예: 월 적금 납입"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={createEventData.description}
                  onChange={(e) => setCreateEventData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                  placeholder="일정에 대한 설명을 입력하세요"
                />
              </div>

              {/* 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  금액 *
                </label>
                <input
                  type="number"
                  value={createEventData.amount}
                  onChange={(e) => setCreateEventData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="예: 500000"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCloseCreateEventModal}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-6 py-3 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDeleteConfirm();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* 아이콘 */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              
              {/* 제목 */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                일정 삭제 확인
              </h3>
              
              {/* 메시지 */}
              <p className="text-gray-600 mb-6">
                정말로 이 일정을 삭제하시겠습니까?<br />
                <span className="text-sm text-gray-500">삭제된 일정은 복구할 수 없습니다.</span>
              </p>
              
              {/* 버튼 */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCloseDeleteConfirm}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 계좌 조회 모달 */}
      {showAccountInquiryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseAccountInquiryModal();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">계좌 등록</h3>
                <p className="text-sm text-gray-600">계좌 거래 내역을 등록하세요</p>
              </div>
              <button
                onClick={handleCloseAccountInquiryModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={accountInquiryData.title}
                  onChange={(e) => setAccountInquiryData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="예: 입출금 내역 조회"
                />
              </div>

              {/* 조회 시작일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  조회 시작일 *
                </label>
                <input
                  type="date"
                  value={accountInquiryData.startDate}
                  onChange={(e) => setAccountInquiryData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {/* 조회 마감일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  조회 마감일 *
                </label>
                <input
                  type="date"
                  value={accountInquiryData.endDate}
                  onChange={(e) => setAccountInquiryData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {/* 계좌 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌 선택 *
                </label>
                {accountsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                    계좌 정보를 불러오는 중...
                  </div>
                ) : (
                  <select
                    value={accountInquiryData.selectedAccountId}
                    onChange={(e) => setAccountInquiryData(prev => ({ ...prev, selectedAccountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">계좌를 선택하세요</option>
                    {getNonSavingsLoanAccounts().map(account => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.accountTypeDescription} - {formatAccountNumber(account.accountNum)} ({formatAccountCurrency(account.balance)})
                      </option>
                    ))}
                  </select>
                )}
                
                {/* 선택된 계좌 정보 표시 */}
                {accountInquiryData.selectedAccountId && (
                  <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                    {(() => {
                      const selectedAccount = accounts.find(acc => acc.accountId === accountInquiryData.selectedAccountId);
                      if (!selectedAccount) return null;
                      
                      return (
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAccountTypeColor(selectedAccount.accountType)}`}>
                            {getAccountIcon(selectedAccount.accountType)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {selectedAccount.accountTypeDescription}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatAccountNumber(selectedAccount.accountNum)}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">
                              {formatAccountCurrency(selectedAccount.balance)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCloseAccountInquiryModal}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  // 입력값 검증
                  if (!accountInquiryData.title.trim()) {
                    showToast('제목을 입력해주세요.', 'error');
                    return;
                  }
                  if (!accountInquiryData.startDate) {
                    showToast('조회 시작일을 선택해주세요.', 'error');
                    return;
                  }
                  if (!accountInquiryData.endDate) {
                    showToast('조회 마감일을 선택해주세요.', 'error');
                    return;
                  }
                  if (!accountInquiryData.selectedAccountId) {
                    showToast('계좌를 선택해주세요.', 'error');
                    return;
                  }

                  try {
                    // API 요청 데이터 구성
                    const requestData = {
                      accountId: accountInquiryData.selectedAccountId,
                      title: accountInquiryData.title,
                      startDate: accountInquiryData.startDate,
                      endDate: accountInquiryData.endDate,
                      includeAllTransactions: true
                    };

                    console.log('계좌 거래내역 등록 요청:', requestData);
                    
                    // API 호출
                    const result = await createTransactionHistory(requestData);
                    
                    if (result.success) {
                      showToast('계좌 거래내역이 성공적으로 등록되었습니다.', 'success');
                      handleCloseAccountInquiryModal();
                    } else {
                      showToast(result.message || '계좌 거래내역 등록에 실패했습니다.', 'error');
                    }
                  } catch (error) {
                    console.error('계좌 거래내역 등록 오류:', error);
                    showToast('계좌 거래내역 등록 중 오류가 발생했습니다.', 'error');
                  }
                }}
                className="px-6 py-3 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 소비 요약 모달 */}
      <ConsumptionSummaryModal
        isOpen={showConsumptionSummaryModal}
        onClose={handleCloseConsumptionSummary}
        data={consumptionSummaryData}
        year={currentDate.getFullYear()}
        month={currentDate.getMonth() + 1}
        isLoading={consumptionSummaryLoading}
      />
    </Layout>
  );
}
