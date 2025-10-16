import React from 'react';
import { 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

/**
 * 대출 신청 요약 카드 컴포넌트
 * 대출 신청 현황을 요약하여 표시합니다.
 */
const LoanApplicationsSummaryCard = ({ 
  applications, 
  isLoading, 
  error, 
  onRefresh,
  getApplicationStats,
  formatCurrency
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">대출 신청 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const stats = getApplicationStats();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">대출 신청 현황</h3>
            <p className="text-sm text-gray-500">총 {stats.total}건의 대출 신청</p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-xs text-orange-600 font-medium">심사중</span>
          </div>
          <p className="text-xl font-bold text-orange-800">{stats.pending}건</p>
          <p className="text-xs text-orange-600">{formatCurrency(stats.pendingAmount)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-xs text-green-600 font-medium">승인</span>
          </div>
          <p className="text-xl font-bold text-green-800">{stats.approved}건</p>
          <p className="text-xs text-green-600">{formatCurrency(stats.approvedAmount)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="w-4 h-4 text-red-600 mr-1" />
            <span className="text-xs text-red-600 font-medium">거절</span>
          </div>
          <p className="text-xl font-bold text-red-800">{stats.rejected}건</p>
          <p className="text-xs text-red-600">{formatCurrency(stats.rejectedAmount)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-xs text-blue-600 font-medium">총 신청액</span>
          </div>
          <p className="text-xl font-bold text-blue-800">{formatCurrency(stats.totalRequestAmount)}</p>
          <p className="text-xs text-blue-600">{stats.total}건</p>
        </div>
      </div>

      {/* 진행률 바 */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>승인률</span>
            <span>{stats.approved}/{stats.total}건 승인</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 요약 정보 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">대출 신청 요약</h4>
            <p className="text-xs text-gray-600">현재 진행 중인 대출 신청 현황</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">평균 신청액</p>
            <p className="text-lg font-bold text-red-600">
              {stats.total > 0 ? formatCurrency(stats.totalRequestAmount / stats.total) : '0원'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationsSummaryCard;
