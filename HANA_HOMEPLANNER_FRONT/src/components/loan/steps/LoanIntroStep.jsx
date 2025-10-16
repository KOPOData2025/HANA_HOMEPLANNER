/**
 * 대출 신청 1단계: 대출 정보 입력 컴포넌트
 * 대출희망금액, 대출기간, 상환방식 설정
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Calendar, AlertCircle, CheckCircle, ArrowRight, Percent, Clock } from 'lucide-react';

const LoanIntroStep = ({ 
  productDetail, 
  applicationData, 
  onNext, 
  onBack, 
  getInterestRateText, 
  getAmountRangeText, 
  getPeriodText, 
  getProductIcon,
  isSubmitting = false,
  isCompleted = false
}) => {
  
  // 완료된 단계인 경우 요약만 표시
  if (isCompleted) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            대출 금액: <span className="font-semibold text-gray-900">{parseInt(applicationData.loanAmount || 0).toLocaleString()}원</span>
          </p>
          <p className="text-sm text-gray-600">
            대출 기간: <span className="font-semibold text-gray-900">{applicationData.loanPeriod}개월</span>
          </p>
          <p className="text-sm text-gray-600">
            상환 방식: <span className="font-semibold text-gray-900">
              {applicationData.repaymentMethod === 'EQUAL_PRINCIPAL_INTEREST' ? '원리금균등상환' : 
               applicationData.repaymentMethod === 'EQUAL_PRINCIPAL' ? '원금균등상환' : '만기일시상환'}
            </span>
          </p>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    loanAmount: applicationData.loanAmount || '',
    loanPeriod: applicationData.loanPeriod || '',
    repaymentMethod: applicationData.repaymentMethod || 'EQUAL_PRINCIPAL_INTEREST'
  });

  const [errors, setErrors] = useState({});

  // 상품 정보에서 기본값 설정 (개월수로 변환)
  useEffect(() => {
    if (productDetail && !formData.loanPeriod) {
      // 상품의 기본 기간 설정 (예: 10년, 20년 등) - 개월수로 변환
      const defaultPeriodYears = productDetail.defaultPeriod || 10;
      const defaultPeriodMonths = (defaultPeriodYears * 12).toString();
      setFormData(prev => ({
        ...prev,
        loanPeriod: defaultPeriodMonths
      }));
    }
  }, [productDetail, formData.loanPeriod]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 대출희망금액 검증
    if (!formData.loanAmount) {
      newErrors.loanAmount = '대출희망금액을 입력해주세요';
    } else {
      const amount = parseInt(formData.loanAmount.replace(/[^\d]/g, ''));
      if (amount < 1000000) {
        newErrors.loanAmount = '최소 100만원 이상 입력해주세요';
      } else if (productDetail?.loanProduct?.maxLoanAmount && amount > productDetail.loanProduct.maxLoanAmount) {
        newErrors.loanAmount = `최대 ${(productDetail.loanProduct.maxLoanAmount / 100000000).toLocaleString()}억원까지 가능합니다`;
      }
    }

    // 대출기간 검증 (개월수 기준)
    if (!formData.loanPeriod) {
      newErrors.loanPeriod = '대출기간을 입력해주세요';
    } else {
      const periodMonths = parseInt(formData.loanPeriod);
      if (periodMonths < 12) {
        newErrors.loanPeriod = '최소 12개월(1년) 이상 입력해주세요';
      } else if (periodMonths > 360) {
        newErrors.loanPeriod = '최대 360개월(30년)까지 가능합니다';
      }
    }

    // 상환방식 검증
    if (!formData.repaymentMethod) {
      newErrors.repaymentMethod = '상환방식을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // 다음 단계로 데이터 전달
      onNext(formData);
    }
  };

  const formatAmount = (value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    
    const amount = parseInt(numericValue);
    if (amount >= 100000000) {
      return `${(amount / 100000000).toLocaleString()}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toLocaleString()}만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  const repaymentMethods = [
    { value: 'EQUAL_PRINCIPAL_INTEREST', label: '원리금균등상환', description: '매월 동일한 금액으로 상환' },
    { value: 'EQUAL_PRINCIPAL', label: '원금균등상환', description: '매월 동일한 원금 + 이자로 상환' },
    { value: 'BULLET', label: '만기일시상환', description: '만기일에 원금과 이자를 한번에 상환' }
  ];

  if (!productDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">상품 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">대출 정보 입력</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 메인 질문 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">얼마를 대출받을까요?</h2>
        </div>

        {/* 대출기간 선택 */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-block">
              <span className="text-lg text-gray-700">대출기간: </span>
              <span className="text-lg font-semibold text-[#009071]">
                {formData.loanPeriod ? (
                  parseInt(formData.loanPeriod) >= 12 
                    ? `${Math.floor(parseInt(formData.loanPeriod) / 12)}년 ${parseInt(formData.loanPeriod) % 12 > 0 ? `${parseInt(formData.loanPeriod) % 12}개월` : ''}`.trim()
                    : `${formData.loanPeriod}개월`
                ) : '10년'}
              </span>
              <span className="text-lg text-gray-700"> 상환으로</span>
            </div>
            
            {/* 대출기간 선택 버튼들 */}
            <div className="mt-4">
              <div className="flex justify-center space-x-3 flex-wrap gap-2">
                {[5, 10, 15, 20, 25, 30].map((period) => (
                  <button
                    key={period}
                    onClick={() => handleInputChange('loanPeriod', (period * 12).toString())}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      formData.loanPeriod === (period * 12).toString()
                        ? 'bg-[#009071] text-white border-[#009071]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#009071] hover:text-[#009071]'
                    }`}
                  >
                    {period}년
                  </button>
                ))}
              </div>
            </div>
            
            {/* 직접 개월수 입력 */}
            <div className="mt-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  value={formData.loanPeriod}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange('loanPeriod', value);
                  }}
                  placeholder="예: 120 (10년)"
                  className={`w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                    errors.loanPeriod ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  개월
                </span>
              </div>
              {errors.loanPeriod && (
                <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.loanPeriod}
                </p>
              )}
              
            </div>
          </div>
        </div>

        {/* 대출희망금액 입력 */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#009071] underline underline-offset-2">
                {formData.loanAmount ? `${parseInt(formData.loanAmount.replace(/[^\d]/g, '')).toLocaleString()}` : '100,000,000'}원
              </span>
              <span className="text-lg text-gray-700">대출받기</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {formData.loanAmount ? `${Math.floor(parseInt(formData.loanAmount.replace(/[^\d]/g, '')) / 100000000)}억원` : '1억원'}
            </p>
            
            {/* 직접 금액 입력 */}
            <div className="mt-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  value={formData.loanAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formattedValue = value ? parseInt(value).toLocaleString() : '';
                    handleInputChange('loanAmount', formattedValue);
                  }}
                  placeholder="예: 100,000,000"
                  className={`w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                    errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  원
                </span>
              </div>
              {errors.loanAmount && (
                <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.loanAmount}
                </p>
              )}
            </div>
            
            {/* 빠른 금액 선택 버튼들 */}
            <div className="mt-6">
              <div className="flex justify-center space-x-3">
                {[10000000, 50000000, 100000000, 300000000, 500000000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('loanAmount', amount.toLocaleString())}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      parseInt(formData.loanAmount.replace(/[^\d]/g, '') || '0') === amount
                        ? 'bg-[#009071] text-white border-[#009071]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#009071] hover:text-[#009071]'
                    }`}
                  >
                    {amount >= 100000000 ? `${amount / 100000000}억원` : `${amount / 10000}만원`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 상환방식 선택 */}
        <div className="mb-8">
          <div className="text-center">
            <p className="text-base text-gray-700 mb-4">
              상환방식: <span className="text-[#009071] font-semibold">
                {repaymentMethods.find(method => method.value === formData.repaymentMethod)?.label || '원리금균등상환'}
              </span>
            </p>
            
            {/* 상환방식 선택 버튼들 */}
            <div className="flex justify-center space-x-3">
              {repaymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => handleInputChange('repaymentMethod', method.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    formData.repaymentMethod === method.value
                      ? 'bg-[#009071] text-white border-[#009071]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#009071] hover:text-[#009071]'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 예상 상환액 계산 */}
        {(formData.loanAmount && formData.loanPeriod && formData.repaymentMethod) && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">예상 상환액 계산</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">대출원금</p>
                  <p className="text-xl font-bold text-gray-900">
                    {parseInt(formData.loanAmount.replace(/[^\d]/g, '') || '0').toLocaleString()}원
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">예상 이자</p>
                  <p className="text-xl font-bold text-green-600">
                    {Math.round(parseInt(formData.loanAmount.replace(/[^\d]/g, '') || '0') * 0.05 * (parseInt(formData.loanPeriod) / 12)).toLocaleString()}원
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">월 상환액</p>
                  <p className="text-xl font-bold text-[#009071]">
                    {Math.round((parseInt(formData.loanAmount.replace(/[^\d]/g, '') || '0') * 1.05) / parseInt(formData.loanPeriod)).toLocaleString()}원
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                * 예상 이자는 연 5% 기준이며, 실제 이자와 다를 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 다음 단계 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-[#009071] text-white px-12 py-4 rounded-full hover:bg-[#007a5f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                처리 중...
              </>
            ) : (
              <>
                계속
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* 상담 버튼 (플로팅) */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-gray-200 text-gray-700 w-12 h-12 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center text-sm font-medium">
            상담
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanIntroStep;
