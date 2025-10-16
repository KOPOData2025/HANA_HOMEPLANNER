/**
 * 소비요약 권장사항 컴포넌트
 * 주차별 배정액, 잔여 생활비 현황, 경고/알림을 표시
 */

import React from 'react';
import { AlertTriangle, CheckCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';

const ConsumptionRecommendations = ({ 
  weeklyAllocations, 
  remainingBudget, 
  warnings, 
  recommendations 
}) => {
  const formatCurrency = (amount) => {
    return Math.round(amount).toLocaleString();
  };

  const getWarningStyle = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWarningIcon = (level) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 주차별 배정액 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-teal-600" />
          주차별 생활비 배정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyAllocations.map((allocation, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-2">
                {index + 1}주차
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">
                {formatCurrency(allocation)}원
              </div>
              <div className="text-xs text-gray-500">
                일평균 {formatCurrency(allocation / 7)}원
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 잔여 생활비 현황 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
          잔여 생활비 현황
        </h3>
        
        <div className="space-y-3">
          {remainingBudget.map((budget, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-teal-600">{index + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{index + 1}주차</div>
                  <div className="text-xs text-gray-500">잔여 예산</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">
                  {formatCurrency(budget)}원
                </div>
                <div className={`text-xs ${
                  budget > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {budget > 0 ? '여유' : '부족'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 경고/알림 박스 */}
      {warnings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            주의사항 및 알림
          </h3>
          
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getWarningStyle(warning.level)}`}>
                <div className="flex items-start gap-3">
                  {getWarningIcon(warning.level)}
                  <div className="flex-1">
                    <div className="font-medium mb-1">{warning.title}</div>
                    <div className="text-sm">{warning.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 권장사항 */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            권장사항
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionRecommendations;
