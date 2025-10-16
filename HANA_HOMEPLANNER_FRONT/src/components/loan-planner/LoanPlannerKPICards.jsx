/**
 * 대출 플래너 KPI 카드 컴포넌트
 * 요약 헤더의 핵심 지표들을 표시
 */

import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Percent
} from "lucide-react";

export const LoanPlannerKPICards = ({ result, adjustedResult }) => {
  if (!result) return null;

  const currentResult = adjustedResult || result;
  
  const formatNumber = (num) => {
    if (!num) return '0';
    return Math.round(num).toLocaleString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return `${formatNumber(amount)}원`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // LTV 상태 색상
  const getLTVStatusColor = (status) => {
    switch (status) {
      case '미달': return 'text-green-600 bg-green-50 border-green-200';
      case '초과': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  // DSR 상태 색상
  const getDSRStatusColor = (status) => {
    switch (status) {
      case '미달': return 'text-green-600 bg-green-50 border-green-200';
      case '초과': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  // LTV 상태 아이콘
  const getLTVStatusIcon = (status) => {
    switch (status) {
      case '미달': return <CheckCircle className="w-4 h-4" />;
      case '초과': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // DSR 상태 아이콘
  const getDSRStatusIcon = (status) => {
    switch (status) {
      case '미달': return <CheckCircle className="w-4 h-4" />;
      case '초과': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 최대 가능 대출금액 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">최대 가능 대출금액</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-900">
          {formatCurrency(currentResult.maxAllowedLoanAmount)}
        </div>
        <div className="text-xs text-blue-600 mt-1">
          LTV와 DSR 중 낮은 한도 적용
        </div>
      </div>

      {/* 현재 LTV */}
      <div className={`border rounded-lg p-4 ${getLTVStatusColor(currentResult.ltvStatus)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">현재 LTV</span>
          </div>
          <div className="flex items-center">
            {getLTVStatusIcon(currentResult.ltvStatus)}
          </div>
        </div>
        <div className="text-2xl font-bold">
          {formatPercentage(currentResult.calculatedLtv)}
        </div>
        <div className="text-xs mt-1">
          한도: {formatPercentage(currentResult.ltvLimit)}
        </div>
      </div>

      {/* 현재 DSR */}
      <div className={`border rounded-lg p-4 ${getDSRStatusColor(currentResult.dsrStatus)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">현재 DSR</span>
          </div>
          <div className="flex items-center">
            {getDSRStatusIcon(currentResult.dsrStatus)}
          </div>
        </div>
        <div className="text-2xl font-bold">
          {formatPercentage(currentResult.dsr)}
        </div>
        <div className="text-xs mt-1">
          한도: {formatPercentage(currentResult.dsrLimit)}
        </div>
      </div>

      {/* 월 상환액 */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-800">월 상환액</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-900">
          {formatCurrency(currentResult.totalMonthlyPayment)}
        </div>
        <div className="text-xs text-purple-600 mt-1">
          {currentResult.stressRateMode ? '스트레스 금리 적용' : '현재 금리 적용'}
        </div>
        {currentResult.stressMonthlyPayment && (
          <div className="text-xs text-purple-500 mt-1">
            스트레스: {formatCurrency(currentResult.stressMonthlyPayment)}
          </div>
        )}
      </div>
    </div>
  );
};
