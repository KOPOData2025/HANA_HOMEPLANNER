/**
 * 자산 요약 카드 컴포넌트
 * 순자산, 총자산, 총부채 정보를 표시
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const AssetsSummaryCard = ({ summary, analysis }) => {
  if (!summary) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getNetWorthColor = (netWorth) => {
    if (netWorth > 0) return 'text-green-600';
    if (netWorth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case '매우 높음':
        return 'text-red-600 bg-red-100';
      case '높음':
        return 'text-orange-600 bg-orange-100';
      case '보통':
        return 'text-yellow-600 bg-yellow-100';
      case '낮음':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">자산 현황</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">마지막 업데이트</p>
            <p className="text-xs text-gray-400">
              {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString('ko-KR') : '정보 없음'}
            </p>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 순자산 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">순자산</span>
            </div>
            <p className={`text-2xl font-bold ${getNetWorthColor(summary.netWorth)}`}>
              {formatCurrency(summary.netWorth)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {summary.netWorth > 0 ? '양수' : summary.netWorth < 0 ? '음수' : '0'}
            </p>
          </div>

          {/* 총자산 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-500">총자산</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalAssets)}
            </p>
            <p className="text-xs text-gray-400 mt-1">보유 자산</p>
          </div>

          {/* 총부채 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-gray-500">총부채</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalLiabilities)}
            </p>
            <p className="text-xs text-gray-400 mt-1">미상환 부채</p>
          </div>
        </div>

        {/* 리스크 분석 */}
        {analysis && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">부채비율</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-800">
                  {analysis.formattedDebtToAssetRatio}%
                </span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel}
                </span>
              </div>
            </div>
            
            {analysis.recommendation && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>권장사항:</strong> {analysis.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsSummaryCard;
