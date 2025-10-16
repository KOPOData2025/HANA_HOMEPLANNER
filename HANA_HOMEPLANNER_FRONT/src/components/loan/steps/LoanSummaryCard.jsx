/**
 * 대출 결과 요약 카드 컴포넌트
 */

import React from 'react';

const LoanSummaryCard = ({ type, data, isRecommended, onClick, isSelected, onSelect }) => {
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0원';
    const num = parseInt(amount);
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  const getCardInfo = () => {
    switch (type) {
      case 'ltv':
        return {
          title: 'LTV 분석',
          color: 'blue',
          maxLoanAmount: data?.maxLoanAmount,
          monthlyPayment: data?.monthlyPayment,
          status: data?.regulationArea ? '규제지역' : '일반지역'
        };
      case 'dsr':
        // DSR 한도 초과시 40% 기준 정보, 아닐땐 사용자 입력 금액 정보 표시
        const isDsrExceeded = data?.baseDsrStatus === '초과' || data?.baseDsrStatus === 'FAIL';
        return {
          title: 'DSR 분석',
          color: 'purple',
          maxLoanAmount: isDsrExceeded 
            ? (data?.maxLoanAmountForBaseRate || 0)
            : (data?.desiredLoanAmount || 0),
          monthlyPayment: isDsrExceeded 
            ? (data?.maxMonthlyPaymentForBaseRate || 0)
            : (data?.baseMonthlyPayment || 0),
          status: data?.baseDsrStatus,
          // 새로운 필드들 추가
          maxLoanAmountForBaseRate: data?.maxLoanAmountForBaseRate,
          maxLoanAmountForStressRate: data?.maxLoanAmountForStressRate,
          maxMonthlyPaymentForBaseRate: data?.maxMonthlyPaymentForBaseRate,
          maxMonthlyPaymentForStressRate: data?.maxMonthlyPaymentForStressRate,
          isDsrExceeded: isDsrExceeded
        };
      case 'dti':
        return {
          title: 'DTI 분석',
          color: 'emerald',
          maxLoanAmount: data?.dtiStatus === 'FAIL' 
            ? (data?.maxLoanAmountForDtiLimit || 0)
            : (data?.desiredLoanAmount || 0),
          monthlyPayment: data?.dtiStatus === 'FAIL'
            ? (data?.maxMonthlyPaymentForDtiLimit || 0)
            : (data?.desiredLoanMonthlyPayment || 0),
          status: data?.dtiStatus
        };
      default:
        return null;
    }
  };

  const cardInfo = getCardInfo();
  if (!cardInfo) return null;

  const colorClasses = {
    blue: {
      bg: isRecommended ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-white',
      border: isRecommended ? 'border-blue-500' : 'border-blue-200',
      text: isRecommended ? 'text-blue-800' : 'text-blue-600',
      dot: isRecommended ? 'bg-blue-500' : 'bg-blue-400',
      hoverBg: isRecommended ? 'hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200' : 'hover:bg-blue-50',
      hoverBorder: 'hover:border-blue-400'
    },
    purple: {
      bg: isRecommended ? 'bg-gradient-to-br from-purple-50 to-purple-100' : 'bg-white',
      border: isRecommended ? 'border-purple-500' : 'border-purple-200',
      text: isRecommended ? 'text-purple-800' : 'text-purple-600',
      dot: isRecommended ? 'bg-purple-500' : 'bg-purple-400',
      hoverBg: isRecommended ? 'hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200' : 'hover:bg-purple-50',
      hoverBorder: 'hover:border-purple-400'
    },
    emerald: {
      bg: isRecommended ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-white',
      border: isRecommended ? 'border-emerald-500' : 'border-emerald-200',
      text: isRecommended ? 'text-emerald-800' : 'text-emerald-600',
      dot: isRecommended ? 'bg-emerald-500' : 'bg-emerald-400',
      hoverBg: isRecommended ? 'hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-200' : 'hover:bg-emerald-50',
      hoverBorder: 'hover:border-emerald-400'
    }
  };

  const colors = colorClasses[cardInfo.color];

  return (
    <div 
      className={`rounded-xl shadow-lg p-6 border-2 ${colors.bg} ${colors.border} ${colors.hoverBg} ${colors.hoverBorder} cursor-pointer hover:shadow-xl transition-all duration-300 relative ${
        isSelected ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50' : ''
      }`}
      onClick={() => onSelect && onSelect(type)}
    >
      {/* 추천 배지 */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
          유력
        </div>
      )}
      
      {/* 상세 보기 버튼 */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
          className="w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 border border-gray-200 hover:border-teal-300 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
          title="상세 보기"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center mb-4">
        <div className={`w-3 h-3 rounded-full mr-3 ${colors.dot}`}></div>
        <h3 className={`text-lg font-semibold ${colors.text}`}>
          {cardInfo.title}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">대출 가능 금액</div>
          <div className={`text-lg font-bold ${colors.text}`}>
            {formatCurrency(cardInfo.maxLoanAmount)}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">월 상환액</div>
          <div className={`text-lg font-bold ${colors.text}`}>
            {formatCurrency(cardInfo.monthlyPayment)}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-60 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">상태</div>
          <div className={`text-sm font-semibold ${
            cardInfo.status === 'PASS' || cardInfo.status === '일반지역' 
              ? 'text-green-600' 
              : cardInfo.status === 'FAIL' || cardInfo.status === '규제지역'
              ? 'text-red-600'
              : 'text-orange-600'
          }`}>
            {cardInfo.status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanSummaryCard;
