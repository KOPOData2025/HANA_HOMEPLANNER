/**
 * 소비요약 캘린더 컴포넌트
 * 월별/주별 배정 내역을 달력 형태로 표시
 */

import React from 'react';
import { Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const ConsumptionSummaryCalendar = ({ 
  monthlyData, 
  weeklyAllocations, 
  fixedExpenses, 
  onEventClick 
}) => {
  const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekStart = firstDay.getDate() - firstDay.getDay();
    return Math.ceil((date.getDate() - firstWeekStart) / 7);
  };

  const getWeekAllocation = (date) => {
    const weekNumber = getWeekNumber(date);
    return weeklyAllocations[weekNumber - 1] || 0;
  };

  const getEventType = (date) => {
    const dayOfMonth = date.getDate();
    
    // 대출 상환일 (매월 1일)
    if (dayOfMonth === 1) return 'loan';
    
    // 고정비 납부일 (매월 15일)
    if (dayOfMonth === 15) return 'fixed';
    
    // 청약 납부일 (매월 25일)
    if (dayOfMonth === 25) return 'subscription';
    
    return 'normal';
  };

  const getEventStyle = (type) => {
    switch (type) {
      case 'loan':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fixed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'subscription':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'loan':
        return <DollarSign className="w-3 h-3" />;
      case 'fixed':
        return <AlertTriangle className="w-3 h-3" />;
      case 'subscription':
        return <Calendar className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  const generateCalendar = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
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

  const calendar = generateCalendar();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">소비요약 캘린더</h3>
      
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-gray-800">
          {new Date().getFullYear()}년 {monthNames[new Date().getMonth()]}
        </h4>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((date, index) => {
          const isCurrentMonth = date.getMonth() === new Date().getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const eventType = getEventType(date);
          const weekAllocation = getWeekAllocation(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${isToday ? 'bg-teal-50 border-teal-300' : ''} ${
                isWeekend ? 'bg-blue-50' : ''
              }`}
              onClick={() => onEventClick(date, eventType, weekAllocation)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-teal-600' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {date.getDate()}
              </div>
              
              {/* 주차별 배정액 */}
              {isCurrentMonth && weekAllocation > 0 && (
                <div className="text-xs text-gray-600 mb-1">
                  {weekAllocation.toLocaleString()}원
                </div>
              )}
              
              {/* 이벤트 표시 */}
              {isCurrentMonth && eventType !== 'normal' && (
                <div className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${getEventStyle(eventType)}`}>
                  {getEventIcon(eventType)}
                  <span className="truncate">
                    {eventType === 'loan' ? '대출상환' :
                     eventType === 'fixed' ? '고정비' :
                     eventType === 'subscription' ? '청약납부' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConsumptionSummaryCalendar;
