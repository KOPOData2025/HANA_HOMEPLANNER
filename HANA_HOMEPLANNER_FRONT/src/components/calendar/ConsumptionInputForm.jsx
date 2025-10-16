/**
 * 소비요약 입력 폼 컴포넌트
 * 월 소득, 대출 상환액, 고정지출 등을 입력받는 폼
 */

import React from 'react';
import { Calculator, DollarSign, AlertTriangle, Target } from 'lucide-react';

const ConsumptionInputForm = ({ 
  formData, 
  onInputChange, 
  onCalculate, 
  isLoading 
}) => {
  const handleInputChange = (field, value) => {
    onInputChange(field, value);
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return parseInt(value).toLocaleString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Calculator className="w-5 h-5 mr-2 text-teal-600" />
        소비요약 설정
      </h3>
      
      <div className="space-y-4">
        {/* 월 소득 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월 소득 (원) *
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="5000000"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.monthlyIncome && `월 소득: ${formatCurrency(formData.monthlyIncome)}원`}
          </p>
        </div>

        {/* 기존 대출 월 상환액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기존 대출 월 상환액 (원)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.existingLoanPayment}
              onChange={(e) => handleInputChange('existingLoanPayment', e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
        </div>

        {/* 신규 대출 월 상환액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            신규 대출 월 상환액 (원)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.newLoanPayment}
              onChange={(e) => handleInputChange('newLoanPayment', e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
        </div>

        {/* 고정 지출 합계 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            고정 지출 합계 (원) *
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.fixedExpenses}
              onChange={(e) => handleInputChange('fixedExpenses', e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="1500000"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            통신비, 관리비, 보험료, 기타 고정비
          </p>
        </div>

        {/* 청약 납부액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            청약 납부액 (원)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.subscriptionPayment}
              onChange={(e) => handleInputChange('subscriptionPayment', e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            해당 월 청약 납부액 (선택 입력)
          </p>
        </div>

        {/* 긴급비 버퍼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            긴급비 버퍼
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                value={formData.emergencyBuffer}
                onChange={(e) => handleInputChange('emergencyBuffer', e.target.value)}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="500000"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                원
              </span>
            </div>
            <div className="flex-1 relative">
              <input
                type="number"
                value={formData.emergencyBufferPercent}
                onChange={(e) => handleInputChange('emergencyBufferPercent', e.target.value)}
                className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="10"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                %
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            고정 금액 또는 소득 대비 비율로 설정
          </p>
        </div>

        {/* 목표 저축액 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            목표 저축액 (원)
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.targetSavings}
              onChange={(e) => handleInputChange('targetSavings', e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              원
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            월 목표 저축액 (선택 입력)
          </p>
        </div>

        {/* 계산 버튼 */}
        <button
          onClick={onCalculate}
          disabled={isLoading || !formData.monthlyIncome || !formData.fixedExpenses}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              계산 중...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              소비요약 생성하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConsumptionInputForm;
