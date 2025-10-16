/**
 * 대출 플래너 사용자 조정 UI 컴포넌트
 * 대출금액 슬라이더, 만기/거치/상환 방식 선택, 금리 시나리오 토글
 */

import { 
  Sliders, 
  Calendar, 
  Percent, 
  DollarSign,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export const LoanPlannerAdjustmentUI = ({ 
  result, 
  adjustments, 
  onAdjustLoanAmount,
  onAdjustLoanPeriod,
  onAdjustInterestRate,
  onAdjustRepaymentType,
  onToggleStressRateMode
}) => {
  if (!result) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return `${Math.round(amount).toLocaleString()}원`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  const currentLoanAmount = adjustments.loanAmount || result.desiredLoanAmount || result.maxAllowedLoanAmount;
  const maxLoanAmount = result.maxAllowedLoanAmount;
  const isLTVExceeded = (currentLoanAmount / result.housePrice) * 100 > result.ltvLimit;

  const repaymentTypes = [
    { id: 'principal_interest', name: '원리금균등', description: '매월 동일한 금액' },
    { id: 'interest_only', name: '원금균등', description: '원금을 균등하게' },
    { id: 'principal_first', name: '원금우선', description: '원금을 우선 상환' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Sliders className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">대출 조건 조정</h3>
      </div>

      <div className="space-y-6">
        {/* 대출금액 슬라이더 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              대출금액
            </label>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(currentLoanAmount)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max={maxLoanAmount}
              value={currentLoanAmount}
              onChange={(e) => onAdjustLoanAmount(parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isLTVExceeded 
                  ? 'bg-red-200 slider-red' 
                  : 'bg-blue-200 slider-blue'
              }`}
              style={{
                background: `linear-gradient(to right, ${
                  isLTVExceeded ? '#fecaca' : '#dbeafe'
                } 0%, ${
                  isLTVExceeded ? '#fecaca' : '#dbeafe'
                } ${(currentLoanAmount / maxLoanAmount) * 100}%, #e5e7eb ${
                  (currentLoanAmount / maxLoanAmount) * 100
                }%, #e5e7eb 100%)`
              }}
            />
            
            {/* 범위 표시 */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0원</span>
              <span>{formatCurrency(maxLoanAmount)}</span>
            </div>
          </div>

          {/* LTV 초과 경고 */}
          {isLTVExceeded && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>LTV 한도를 초과했습니다</span>
            </div>
          )}
        </div>

        {/* 대출기간 선택 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            대출기간
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[10, 15, 20, 25, 30].map((period) => (
              <button
                key={period}
                onClick={() => onAdjustLoanPeriod(period)}
                className={`p-2 text-sm border rounded-lg transition-colors ${
                  adjustments.loanPeriod === period
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {period}년
              </button>
            ))}
          </div>
        </div>

        {/* 상환방식 선택 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            상환방식
          </label>
          <div className="space-y-2">
            {repaymentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onAdjustRepaymentType(type.id)}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  adjustments.repaymentType === type.id
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-xs opacity-75">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 금리 시나리오 토글 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            금리 시나리오
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onToggleStressRateMode(false)}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                !adjustments.stressRateMode
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">현재 금리</span>
              <span className="text-xs ml-1">({formatPercentage(result.interestRate || 3.5)})</span>
            </button>
            
            <button
              onClick={() => onToggleStressRateMode(true)}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                adjustments.stressRateMode
                  ? 'bg-orange-50 border-orange-300 text-orange-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-sm">스트레스 금리</span>
              <span className="text-xs ml-1">({formatPercentage(result.stressRate || 6.0)})</span>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            스트레스 금리는 금리 상승 상황을 대비한 시뮬레이션입니다
          </div>
        </div>

        {/* 실시간 계산 결과 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">조정 결과</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">월 상환액:</span>
              <span className="font-medium text-gray-900 ml-2">
                {formatCurrency(result.adjustedMonthlyPayment || result.totalMonthlyPayment)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">DSR:</span>
              <span className="font-medium text-gray-900 ml-2">
                {formatPercentage(result.adjustedDSR || result.dsr)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">LTV:</span>
              <span className="font-medium text-gray-900 ml-2">
                {formatPercentage(result.adjustedLTV || result.calculatedLtv)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">적용 금리:</span>
              <span className="font-medium text-gray-900 ml-2">
                {formatPercentage(adjustments.interestRate || result.stressRate || 3.5)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
