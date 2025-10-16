/**
 * 우측 대출 플래너 패널 컴포넌트
 * 마커 클릭 시 우측에 표시되는 대출 플래너 패널
 */

import React from 'react';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  DollarSign,
  Home,
  MapPin,
  Calendar
} from 'lucide-react';
import {
  LoanPlannerKPICards,
  LoanPlannerRecommendations,
  LoanPlannerPlanCards,
  LoanPlannerAdjustmentUI,
  LoanPlannerActionButtons
} from '@/components/loan-planner';

export const RightLoanPlannerPanel = ({
  isVisible,
  onClose,
  selectedProperty,
  ltvResult,
  adjustedResult,
  adjustments,
  isLTVLoading,
  onCalculateLTV,
  onSelectPlan,
  onAdjustLoanAmount,
  onAdjustLoanPeriod,
  onAdjustInterestRate,
  onAdjustRepaymentType,
  onToggleStressRateMode,
  onPreApproval,
  onCalendarExport,
  onPDFDownload,
  generatePlanSuggestions
}) => {
  if (!isVisible || !selectedProperty) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return `${Math.round(amount).toLocaleString()}원`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return Math.round(num).toLocaleString();
  };

  return (
    <div className={`fixed w-[480px] bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out flex flex-col ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`} style={{ 
      top: '82px',
      right: '0px',
      height: 'calc(100vh - 82px)',
      borderLeft: '3px solid #009071'
    }}>
      <div className="bg-white flex flex-col h-full">
        {/* 패널 헤더 */}
        <div className="bg-gradient-to-r from-[#009071] to-[#007a5e] text-white p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-xl font-bold mb-3 flex items-center">
                <Calculator className="w-6 h-6 mr-3" />
                주택형별 상세정보
              </div>
              <div className="text-sm opacity-95 font-medium">
                {selectedProperty.houseName || selectedProperty.name || '선택된 주택'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onCalculateLTV}
                disabled={isLTVLoading}
                className="bg-white bg-opacity-25 hover:bg-opacity-35 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                {isLTVLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    조회중...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    대출조회하기
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-25 hover:bg-opacity-35 text-white rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="패널 닫기"
                title="패널 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 패널 내용 */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
          {/* 선택된 주택 정보 */}
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-[#009071] rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="font-bold text-gray-800 mb-5 flex items-center text-xl">
              <div className="w-8 h-8 bg-[#009071] rounded-lg flex items-center justify-center mr-4">
                <Home className="w-5 h-5 text-white" />
              </div>
              선택된 주택 정보
            </h4>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold text-base">주택명</span>
                  <span className="font-bold text-gray-900 text-right max-w-[200px] truncate text-lg">
                    {selectedProperty.houseName || selectedProperty.name || '정보 없음'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#009071] to-[#007a5e] rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold text-base">가격</span>
                  <span className="font-bold text-white text-2xl">
                    {formatCurrency((selectedProperty.price || 0) * 10000)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold text-base">지역</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[200px] truncate text-base">
                    {selectedProperty.district || selectedProperty.address || '정보 없음'}
                  </span>
                </div>
              </div>
              
              {selectedProperty.size && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold text-base">면적</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {selectedProperty.size}㎡
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 대출 조회 결과 */}
          {ltvResult && (
            <div className="space-y-6">
              {/* 분석 완료 헤더 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xl font-bold text-green-800 mb-3 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  대출 조회 결과
                </h4>
                <p className="text-sm text-green-700 font-medium">
                  선택한 주택에 대한 대출 가능 금액을 조회했습니다
                </p>
              </div>

              {/* KPI 카드 */}
              <LoanPlannerKPICards 
                result={ltvResult} 
                adjustedResult={adjustedResult} 
              />

              {/* 추천 메시지 */}
              <LoanPlannerRecommendations result={ltvResult} />
            </div>
          )}

          {/* 대출 조회 안내 */}
          {!ltvResult && (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#009071] to-[#007a5e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calculator className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  대출 조회하기
                </h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  선택한 주택에 대한 대출 가능 금액을<br />
                  조회해보세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
