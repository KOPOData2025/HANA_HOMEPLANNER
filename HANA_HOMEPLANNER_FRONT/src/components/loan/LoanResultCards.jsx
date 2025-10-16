/**
 * 대출 조회 결과 카드 컴포넌트
 * LTV, DSR, DTI 각 결과를 카드 형태로 표시
 */

import React from 'react';
import { 
  Home, 
  TrendingUp, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  Calendar,
  Percent,
  Info,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// 숫자 포맷팅 함수
const formatCurrency = (amount) => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  } else {
    return `${amount.toLocaleString()}원`;
  }
};

const formatNumber = (num) => {
  return num.toLocaleString();
};

// 상태별 아이콘과 색상
const getStatusConfig = (status, ratio, limit) => {
  const isOverLimit = ratio > limit;
  const isNearLimit = ratio > limit * 0.8;
  
  if (status === 'PASS' || (!isOverLimit && ratio <= limit * 0.7)) {
    return {
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      statusText: '적정'
    };
  } else if (status === 'FAIL' || isOverLimit) {
    return {
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      statusText: '초과'
    };
  } else {
    return {
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      statusText: '주의'
    };
  }
};

// LTV 카드 컴포넌트
const LTVCard = ({ data }) => {
  if (!data) return null;
  
  const ltvRatio = (data.loanAmount / data.housePrice) * 100;
  const statusConfig = getStatusConfig('PASS', ltvRatio, data.ltvLimit);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">LTV</h3>
            <p className="text-sm text-gray-600">주택담보대출비율</p>
          </div>
        </div>
        <div className="flex items-center">
          <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor} mr-2`} />
          <span className={`font-semibold ${statusConfig.textColor}`}>
            {statusConfig.statusText}
          </span>
        </div>
      </div>

      {/* 주요 정보 */}
      <div className="space-y-4">
        {/* LTV 비율 */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">LTV 비율</span>
            <span className="text-xs text-gray-500">한도: {data.ltvLimit}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">
              {ltvRatio.toFixed(1)}%
            </span>
            <div className="flex items-center">
              {ltvRatio > data.ltvLimit ? (
                <ArrowUp className="w-4 h-4 text-red-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          {/* 진행률 바 */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                ltvRatio > data.ltvLimit ? 'bg-red-500' : 
                ltvRatio > data.ltvLimit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((ltvRatio / data.ltvLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 대출 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">대출금액</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(data.loanAmount)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">월상환액</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(data.monthlyPayment)}
            </p>
          </div>
        </div>

        {/* 규제 정보 */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">규제지역</span>
            <span className={`text-sm font-medium ${
              data.regulationArea ? 'text-red-600' : 'text-green-600'
            }`}>
              {data.regionType}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">주택상태</span>
            <span className="text-sm font-medium text-gray-800">
              {data.housingStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// DSR 카드 컴포넌트
const DSRCard = ({ data }) => {
  if (!data) return null;
  
  const dsrRatio = (data.baseAnnualPayment / data.annualIncome) * 100;
  const statusConfig = getStatusConfig('PASS', dsrRatio, data.dsrLimit);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">DSR</h3>
            <p className="text-sm text-gray-600">부채상환비율</p>
          </div>
        </div>
        <div className="flex items-center">
          <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor} mr-2`} />
          <span className={`font-semibold ${statusConfig.textColor}`}>
            {statusConfig.statusText}
          </span>
        </div>
      </div>

      {/* 주요 정보 */}
      <div className="space-y-4">
        {/* DSR 비율 */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">DSR 비율</span>
            <span className="text-xs text-gray-500">한도: {data.dsrLimit}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">
              {dsrRatio.toFixed(1)}%
            </span>
            <div className="flex items-center">
              {dsrRatio > data.dsrLimit ? (
                <ArrowUp className="w-4 h-4 text-red-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          {/* 진행률 바 */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                dsrRatio > data.dsrLimit ? 'bg-red-500' : 
                dsrRatio > data.dsrLimit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((dsrRatio / data.dsrLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 소득 및 상환 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">연소득</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(data.annualIncome)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">월상환액</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(data.baseMonthlyPayment)}
            </p>
          </div>
        </div>

        {/* 대출 가능 금액 */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">대출 가능 금액</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">기준금리 ({data.baseRate}%)</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(data.baseMaxLoanAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">스트레스금리 ({data.stressRate}%)</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(data.stressMaxLoanAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// DTI 카드 컴포넌트
const DTICard = ({ data }) => {
  if (!data) return null;
  
  const statusConfig = getStatusConfig(data.dtiStatus, data.dtiRatio, data.dtiLimit);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
            <CreditCard className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">DTI</h3>
            <p className="text-sm text-gray-600">총부채상환비율</p>
          </div>
        </div>
        <div className="flex items-center">
          <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor} mr-2`} />
          <span className={`font-semibold ${statusConfig.textColor}`}>
            {statusConfig.statusText}
          </span>
        </div>
      </div>

      {/* 주요 정보 */}
      <div className="space-y-4">
        {/* DTI 비율 */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">DTI 비율</span>
            <span className="text-xs text-gray-500">한도: {data.dtiLimit}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">
              {data.dtiRatio.toFixed(1)}%
            </span>
            <div className="flex items-center">
              {data.dtiRatio > data.dtiLimit ? (
                <ArrowUp className="w-4 h-4 text-red-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          {/* 진행률 바 */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                data.dtiRatio > data.dtiLimit ? 'bg-red-500' : 
                data.dtiRatio > data.dtiLimit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((data.dtiRatio / data.dtiLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 상환 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">신규 대출</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(data.newLoanMonthlyPayment)}/월
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-600">기존 대출</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {formatCurrency(data.totalExistingAnnualPayment / 12)}/월
            </p>
          </div>
        </div>

        {/* 총 상환액 */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">총 월상환액</span>
            <span className="text-xs text-gray-500">
              연 {formatCurrency(data.totalAnnualPayment)}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {formatCurrency(data.totalAnnualPayment / 12)}
          </div>
        </div>

        {/* 대출 조건 */}
        <div className="bg-white rounded-lg p-3">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">희망 대출금액</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(data.desiredLoanAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">금리</span>
              <span className="text-sm font-semibold text-gray-800">
                {data.desiredInterestRate}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">기간</span>
              <span className="text-sm font-semibold text-gray-800">
                {data.desiredLoanPeriod}년
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 메인 컴포넌트
const LoanResultCards = ({ ltvData, dsrData, dtiData }) => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          대출 조회 결과
        </h2>
        <p className="text-gray-600">
          LTV, DSR, DTI 각 비율을 종합적으로 분석한 결과입니다
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <LTVCard data={ltvData} />
        <DSRCard data={dsrData} />
        <DTICard data={dtiData} />
      </div>

      {/* 종합 결과 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          종합 대출 가능성
        </h3>
        <div className="flex justify-center">
          {(() => {
            const ltvRatio = ltvData ? (ltvData.loanAmount / ltvData.housePrice) * 100 : 0;
            const dsrRatio = dsrData ? (dsrData.baseAnnualPayment / dsrData.annualIncome) * 100 : 0;
            const dtiRatio = dtiData ? dtiData.dtiRatio : 0;
            
            const ltvOk = ltvRatio <= ltvData?.ltvLimit;
            const dsrOk = dsrRatio <= dsrData?.dsrLimit;
            const dtiOk = dtiData?.dtiStatus === 'PASS';
            
            const allOk = ltvOk && dsrOk && dtiOk;
            const someOk = ltvOk || dsrOk || dtiOk;
            
            if (allOk) {
              return (
                <div className="flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <span className="text-lg font-bold">대출 가능</span>
                </div>
              );
            } else if (someOk) {
              return (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <span className="text-lg font-bold">조건부 가능</span>
                </div>
              );
            } else {
              return (
                <div className="flex items-center bg-red-100 text-red-800 px-6 py-3 rounded-full">
                  <XCircle className="w-6 h-6 mr-2" />
                  <span className="text-lg font-bold">대출 불가</span>
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default LoanResultCards;
