import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Filter
} from 'lucide-react';

/**
 * 납입 일정 카드 컴포넌트
 * 적금 계좌의 납입 일정을 표시합니다.
 */
const PaymentScheduleCard = ({ 
  paymentSchedules, 
  formatCurrency, 
  formatDate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PAID, PENDING
  const [showDetails, setShowDetails] = useState(false);

  if (!paymentSchedules || paymentSchedules.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">납입 일정 없음</h3>
          <p className="text-gray-600">등록된 납입 일정이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 필터링된 일정
  const filteredSchedules = paymentSchedules.filter(schedule => {
    if (filterStatus === 'ALL') return true;
    return schedule.status === filterStatus;
  });

  // 통계 계산
  const stats = {
    total: paymentSchedules.length,
    paid: paymentSchedules.filter(s => s.status === 'PAID').length,
    pending: paymentSchedules.filter(s => s.status === 'PENDING').length,
    totalAmount: paymentSchedules.reduce((sum, s) => sum + s.amount, 0),
    paidAmount: paymentSchedules.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.amount, 0)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">납입 일정</h3>
            <p className="text-sm text-gray-500">적금 납입 계획 및 진행 상황</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200"
        >
          <span className="text-sm font-medium">
            {showDetails ? '간단히 보기' : '상세 보기'}
          </span>
          <div className={`transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">총 납입 건수</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-500">완료</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">대기</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{Math.round((stats.paid / stats.total) * 100)}%</div>
          <div className="text-sm text-gray-500">진행률</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>진행률</span>
          <span>{Math.round((stats.paid / stats.total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stats.paid / stats.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 필터 및 정렬 - 상세 보기일 때만 표시 */}
      {showDetails && (
        <div className="flex items-center space-x-2 mb-6">
          {/* 필터 버튼 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStatus === 'ALL' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('PAID')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStatus === 'PAID' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              완료
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterStatus === 'PENDING' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              대기
            </button>
          </div>
          
          {/* 확장/축소 버튼 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* 금액 요약 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-sm text-gray-500">총 납입액</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(stats.paidAmount)}
            </div>
            <div className="text-sm text-gray-500">납입 완료</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-orange-600">
              {formatCurrency(stats.totalAmount - stats.paidAmount)}
            </div>
            <div className="text-sm text-gray-500">잔여 납입액</div>
          </div>
        </div>
      </div>

      {/* 납입 일정 목록 - 상세 보기일 때만 표시 */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            납입 일정 상세 ({filteredSchedules.length}건)
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredSchedules.map((schedule, index) => (
              <div 
                key={schedule.paymentId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(schedule.status)}
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatDate(schedule.dueDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {schedule.statusDescription}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {formatCurrency(schedule.amount)}
                  </p>
                  {schedule.paidAt && (
                    <p className="text-xs text-gray-500">
                      납입: {formatDate(schedule.paidAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentScheduleCard;
