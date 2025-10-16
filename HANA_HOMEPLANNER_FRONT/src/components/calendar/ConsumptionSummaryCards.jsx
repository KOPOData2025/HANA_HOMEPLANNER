/**
 * 소비요약 결과 카드 컴포넌트
 * 가처분현금, 생활비 상한, 목표 저축 가능 여부를 카드 형태로 표시
 */

import React from 'react';
import { DollarSign, Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const ConsumptionSummaryCards = ({ summaryData }) => {
  const getRiskLevel = (value, threshold) => {
    if (value >= threshold * 0.8) return 'safe';
    if (value >= threshold * 0.6) return 'warning';
    return 'danger';
  };

  const getCardStyle = (riskLevel) => {
    switch (riskLevel) {
      case 'safe':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return Math.round(amount).toLocaleString();
  };

  const disposableIncome = summaryData?.disposableIncome || 0;
  const livingExpenseLimit = summaryData?.livingExpenseLimit || 0;
  const targetSavings = summaryData?.targetSavings || 0;
  const canSave = summaryData?.canSave || false;

  const disposableRiskLevel = getRiskLevel(disposableIncome, 1000000); // 100만원 기준
  const savingsRiskLevel = canSave ? 'safe' : 'warning';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 가처분현금 카드 */}
      <div className={`border rounded-lg p-4 ${getCardStyle(disposableRiskLevel)}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">이번 달 가처분현금</h4>
          {getIcon(disposableRiskLevel)}
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatCurrency(disposableIncome)}원
        </div>
        <div className="text-xs">
          {disposableRiskLevel === 'safe' && '여유로운 수준입니다'}
          {disposableRiskLevel === 'warning' && '적정 수준입니다'}
          {disposableRiskLevel === 'danger' && '부족할 수 있습니다'}
        </div>
      </div>

      {/* 생활비 상한 카드 */}
      <div className={`border rounded-lg p-4 ${getCardStyle(disposableRiskLevel)}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">생활비 상한</h4>
          <DollarSign className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-2xl font-bold mb-1">
          {formatCurrency(livingExpenseLimit)}원
        </div>
        <div className="text-xs">
          가처분현금의 80% (20% 예비금)
        </div>
      </div>

      {/* 목표 저축 가능 여부 카드 */}
      <div className={`border rounded-lg p-4 ${getCardStyle(savingsRiskLevel)}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">목표 저축</h4>
          {getIcon(savingsRiskLevel)}
        </div>
        <div className="text-2xl font-bold mb-1">
          {canSave ? '가능' : '어려움'}
        </div>
        <div className="text-xs">
          {canSave 
            ? `목표 저축액: ${formatCurrency(targetSavings)}원`
            : '생활비 상한을 초과합니다'
          }
        </div>
      </div>
    </div>
  );
};

export default ConsumptionSummaryCards;
