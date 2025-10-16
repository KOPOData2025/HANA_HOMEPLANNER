import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, Check } from 'lucide-react';

/**
 * 자동이체 희망일 선택 컴포넌트
 * 실제 달력 UI로 날짜 선택 기능 제공
 * 오늘 이후 ~ 다음달 오늘 이전까지 선택 가능
 */
const PaymentDateSelector = ({ 
  selectedDay, 
  onDaySelect, 
  className = "",
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 오늘 날짜 정보
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // 달력 상태 관리
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  // 선택된 날짜 정보
  const selectedDayInfo = selectedDay ? {
    day: new Date(selectedDay).getDate(),
    dateString: selectedDay,
    description: getDayDescription(new Date(selectedDay).getDate())
  } : null;

  // 날짜 설명 생성
  function getDayDescription(day) {
    if (day <= 5) return '월초';
    if (day <= 15) return '월상순';
    if (day <= 25) return '월하순';
    return '월말';
  }

  // 달력 데이터 생성
  const getCalendarData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ 
        day, 
        isCurrentMonth: true,
        isToday: year === currentYear && month === currentMonth && day === currentDay,
        isSelectable: isDaySelectable(year, month, day)
      });
    }
    
    return days;
  };

  // 날짜 선택 가능 여부 확인
  const isDaySelectable = (year, month, day) => {
    // 이번 달의 오늘 이후 날짜 (오늘 제외)
    if (year === currentYear && month === currentMonth) {
      return day > currentDay;
    }
    // 다음 달의 오늘 이전 날짜 (오늘 포함)
    if (year === currentYear && month === currentMonth + 1) {
      return day <= currentDay;
    }
    // 다음 달이 아닌 경우는 선택 불가
    return false;
  };

  // 날짜 선택 핸들러
  const handleDaySelect = (day, year, month) => {
    if (isDaySelectable(year, month, day)) {
      console.log('📅 달력에서 날짜 선택:', { day, year, month, currentYear, currentMonth, currentDay });
      
      // 실제 날짜 객체로 변환하여 전달 (시간대 문제 해결)
      const selectedDate = new Date(year, month, day);
      
      // 로컬 시간대로 날짜 문자열 생성 (UTC 변환 문제 방지)
      const yearStr = selectedDate.getFullYear();
      const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;
      
      console.log('📅 날짜 변환 상세:', {
        year, month, day,
        selectedDate,
        getDate: selectedDate.getDate(),
        getMonth: selectedDate.getMonth(),
        getFullYear: selectedDate.getFullYear(),
        manualDateString: dateString,
        toISOString: selectedDate.toISOString()
      });
      
      console.log('📅 선택된 날짜 변환:', { selectedDate, dateString });
      
      // 날짜 문자열을 전달 (YYYY-MM-DD 형식)
      onDaySelect(dateString);
      setIsOpen(false);
    }
  };

  // 달력 네비게이션
  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayYear(displayYear - 1);
      setDisplayMonth(11);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayYear(displayYear + 1);
      setDisplayMonth(0);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  // 달력 데이터
  const calendarDays = getCalendarData(displayYear, displayMonth);
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        자동이체 희망일 <span className="text-red-500">*</span>
      </label>
      
      {/* 선택된 날짜 표시 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-left transition-colors ${
          error 
            ? 'border-red-500 hover:border-red-600' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              {selectedDayInfo ? (
                <div>
                  <p className="font-medium text-gray-800">
                    매월 {selectedDayInfo.day}일
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedDayInfo.description} • 자동이체 예정일
                  </p>
                  <p className="text-xs text-gray-400">
                    시작일: {selectedDayInfo.dateString}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">희망일을 선택해주세요</p>
                  <p className="text-sm text-gray-400">매월 자동이체될 날짜</p>
                </div>
              )}
            </div>
          </div>
          
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* 달력 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg">
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-gray-600 rotate-[-90deg]" />
            </button>
            <h4 className="text-lg font-semibold text-gray-800">
              {displayYear}년 {monthNames[displayMonth]}
            </h4>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronUp className="w-4 h-4 text-gray-600 rotate-90" />
            </button>
          </div>

          {/* 달력 그리드 */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {/* 요일 헤더 */}
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* 날짜 그리드 */}
              {calendarDays.map((dayData, index) => {
                if (!dayData.day) {
                  return <div key={index} className="w-8 h-8"></div>;
                }

                const isSelected = selectedDay && 
                  new Date(selectedDay).getDate() === dayData.day &&
                  new Date(selectedDay).getFullYear() === displayYear &&
                  new Date(selectedDay).getMonth() === displayMonth;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDaySelect(dayData.day, displayYear, displayMonth)}
                    disabled={!dayData.isSelectable}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors relative ${
                      !dayData.isSelectable
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : dayData.isToday
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : isSelected
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-teal-50 text-gray-700'
                    }`}
                  >
                    {dayData.day}
                    {dayData.isToday && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="px-4 pb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">자동이체 안내</p>
                  <p>• 이번 달 {currentDay + 1}일 이후 ~ 다음 달 {currentDay}일 이전까지 선택 가능</p>
                  <p>• 매월 선택한 날짜에 자동이체됩니다</p>
                  <p>• 해당 월에 없는 날짜는 월말로 자동 조정됩니다</p>
                  <p>• 예: 31일 선택 시 2월은 28일(또는 29일)에 이체</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default PaymentDateSelector;
