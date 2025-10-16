import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react';

/**
 * 대출 상환 일정 카드 컴포넌트
 * 대출 계좌의 상환 일정을 표시합니다.
 */
const LoanRepaymentScheduleCard = ({ 
  repaymentSchedules = [], 
  isLoading = false, 
  formatCurrency,
  formatDate 
}) => {
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showDetails, setShowDetails] = useState(false);

  // 필터링된 상환 일정
  const filteredSchedules = useMemo(() => {
    let filtered = repaymentSchedules;

    // 상태별 필터링
    if (filter !== 'ALL') {
      filtered = filtered.filter(schedule => schedule.status === filter);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'amount':
          return b.totalDue - a.totalDue;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [repaymentSchedules, filter, sortBy]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = repaymentSchedules.length;
    const paid = repaymentSchedules.filter(s => s.status === 'PAID').length;
    const pending = repaymentSchedules.filter(s => s.status === 'PENDING').length;
    
    const totalAmount = repaymentSchedules.reduce((sum, s) => sum + (s.totalDue || 0), 0);
    const paidAmount = repaymentSchedules.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.totalDue || 0), 0);
    const remainingAmount = totalAmount - paidAmount;
    
    const progress = total > 0 ? (paid / total) * 100 : 0;

    return {
      total,
      paid,
      pending,
      totalAmount,
      paidAmount,
      remainingAmount,
      progress: progress.toFixed(1)
    };
  }, [repaymentSchedules]);

  // 상태별 아이콘 반환
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // 상태별 배지 색상 반환
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">상환 일정</h3>
            <p className="text-sm text-gray-500">대출 상환 계획 및 진행 상황</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
        >
          <span className="text-sm font-medium">
            {showDetails ? '간단히 보기' : '상세 보기'}
          </span>
          <div className={`transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
            <TrendingDown className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">총 상환 건수</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-500">완료 건수</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">대기 건수</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.progress}%</div>
          <div className="text-sm text-gray-500">진행률</div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>상환 진행률</span>
          <span>{stats.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.progress}%` }}
          ></div>
        </div>
      </div>

      {/* 필터 및 정렬 - 상세 보기일 때만 표시 */}
      {showDetails && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'ALL' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체 ({stats.total})
            </button>
            <button
              onClick={() => setFilter('PAID')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'PAID' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              완료 ({stats.paid})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'PENDING' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              대기 ({stats.pending})
            </button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="dueDate">상환일 순</option>
            <option value="amount">금액 순</option>
            <option value="status">상태 순</option>
          </select>
        </div>
      )}

      {/* 상환 일정 목록 - 상세 보기일 때만 표시 */}
      {showDetails && (
        <div className="space-y-3">
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>상환 일정이 없습니다.</p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.repayId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(schedule.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {formatDate(schedule.dueDate)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(schedule.status)}`}>
                        {schedule.statusDescription}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      상환일: {formatDate(schedule.dueDate)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-800">
                    {formatCurrency(schedule.totalDue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    원금: {formatCurrency(schedule.principalDue)} | 이자: {formatCurrency(schedule.interestDue)}
                  </div>
                </div>
              </div>
              
              {schedule.paidAt && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    납입 완료: {formatDate(schedule.paidAt)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        </div>
      )}

      {/* 금액 요약 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-sm text-gray-500">총 상환액</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(stats.paidAmount)}
            </div>
            <div className="text-sm text-gray-500">납입 완료</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(stats.remainingAmount)}
            </div>
            <div className="text-sm text-gray-500">잔여 상환액</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanRepaymentScheduleCard;
