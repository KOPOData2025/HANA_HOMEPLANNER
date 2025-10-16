/**
 * 적금 가입 1단계: 가입 정보 입력 컴포넌트
 * 만기일과 월 적금액 설정
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Calendar, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const SavingsInputStep = ({ 
  productDetail, 
  signupData, 
  onNext, 
  onBack, 
  accounts,
  isLoadingAccounts,
  isSubmitting,
  isCompleted = false,
  // 공동적금 초대 정보
  isJointSavingsInvite = false,
  maturityInfo = null,
  isLoadingMaturityInfo = false,
  fixedMaturityDate = null
}) => {
  const [formData, setFormData] = useState({
    monthlyAmount: signupData.monthlyAmount || '',
    termMonths: signupData.termMonths || '',
    initialDeposit: signupData.initialDeposit || '',
    autoDebitAccountId: signupData.autoDebitAccountId || null,
    maturityDate: signupData.maturityDate || '',
    selectedYear: '',
    selectedMonth: '',
    selectedDay: ''
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 상품 정보에서 기본값 설정
  useEffect(() => {
    if (productDetail && !formData.termMonths) {
      // 상품의 기본 기간 설정 (예: 12개월, 24개월 등)
      const defaultTerm = productDetail.defaultTerm || 12;
      setFormData(prev => ({
        ...prev,
        termMonths: defaultTerm.toString()
      }));
    }
  }, [productDetail, formData.termMonths]);

  // 공동적금 초대인 경우 고정 만기일 설정
  useEffect(() => {
    if (isJointSavingsInvite && fixedMaturityDate) {
      let formattedDate;
      
      // 배열 형태 [2026, 10, 15]인 경우
      if (Array.isArray(fixedMaturityDate) && fixedMaturityDate.length === 3) {
        const [year, month, day] = fixedMaturityDate;
        formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
      // 문자열 YYYYMMDD 형식인 경우
      else if (typeof fixedMaturityDate === 'string' && fixedMaturityDate.length === 8) {
        formattedDate = `${fixedMaturityDate.slice(0, 4)}-${fixedMaturityDate.slice(4, 6)}-${fixedMaturityDate.slice(6, 8)}`;
      }
      // 이미 올바른 형식인 경우
      else {
        formattedDate = fixedMaturityDate;
      }
      
      setFormData(prev => ({
        ...prev,
        maturityDate: formattedDate
      }));
    }
  }, [isJointSavingsInvite, fixedMaturityDate]);

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date();
    const todayDay = today.getDate().toString().padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      selectedDay: todayDay
    }));
  }, []);

  // 만기일 계산
  useEffect(() => {
    if (formData.termMonths) {
      const months = parseInt(formData.termMonths);
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + months);
      const formattedDate = `${futureDate.getFullYear()}년 ${String(futureDate.getMonth() + 1).padStart(2, '0')}월 ${String(futureDate.getDate()).padStart(2, '0')}일`;
      setFormData(prev => ({
        ...prev,
        maturityDate: formattedDate
      }));
    }
  }, [formData.termMonths]);

  const handleInputChange = (field, value) => {
    console.log('📝 폼 데이터 변경:', { field, value, before: formData[field] });
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCurrency = (value) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 만기일 업데이트 함수
  const updateMaturityDate = (year, month, day) => {
    if (year && month && day) {
      const maturityDate = `${year}-${month}-${day}`;
      handleInputChange('maturityDate', maturityDate);
      
      // 만기일로부터 가입기간 계산
      const today = new Date();
      const maturityDateObj = new Date(year, month - 1, day);
      const diffTime = maturityDateObj.getTime() - today.getTime();
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      
      if (diffMonths > 0) {
        handleInputChange('termMonths', diffMonths.toString());
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('🔍 검증 시작 - 현재 formData:', formData);

    // 월 납입액 검증
    const monthlyAmount = parseInt(formData.monthlyAmount.replace(/[^\d]/g, ''));
    console.log('💰 월 납입액 검증:', { monthlyAmount, original: formData.monthlyAmount });
    if (!monthlyAmount || monthlyAmount < 10000) {
      newErrors.monthlyAmount = '월 납입액은 최소 10,000원 이상이어야 합니다.';
    } else if (monthlyAmount > 10000000) {
      newErrors.monthlyAmount = '월 납입액은 최대 10,000,000원까지 가능합니다.';
    }

    // 만기일 검증 (공동적금 초대가 아닌 경우만)
    console.log('📅 만기일 검증:', formData.maturityDate);
    if (!isJointSavingsInvite && !formData.maturityDate) {
      newErrors.maturityDate = '만기일을 선택해주세요.';
    }

    // 가입 기간 검증 (자동 계산되므로 만기일이 있으면 자동으로 설정됨)
    console.log('📆 가입 기간 검증:', formData.termMonths);
    if (!formData.termMonths) {
      newErrors.termMonths = '가입 기간을 확인해주세요.';
    }

    console.log('❌ 검증 결과 에러들:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🚀 폼 제출 시작:', {
      formData,
      maturityDate: formData.maturityDate,
      termMonths: formData.termMonths,
      monthlyAmount: formData.monthlyAmount,
      errors: errors
    });
    
    const isValid = validateForm();
    console.log('🔍 폼 검증 결과:', isValid);
    
    if (isValid) {
      console.log('✅ 폼 검증 통과, 데이터 전송:', formData);
      onNext({
        ...formData,
        preferredDay: formData.maturityDate
      });
    } else {
      console.log('❌ 폼 검증 실패:', errors);
    }
  };

  const calculateTotalAmount = () => {
    const monthlyAmount = parseInt(formData.monthlyAmount.replace(/[^\d]/g, '') || '0');
    const termMonths = parseInt(formData.termMonths || '0');
    const initialDeposit = parseInt(formData.initialDeposit.replace(/[^\d]/g, '') || '0');
    
    return monthlyAmount * termMonths + initialDeposit;
  };

  const calculateInterest = () => {
    const monthlyAmount = parseInt(formData.monthlyAmount.replace(/[^\d]/g, '') || '0');
    const termMonths = parseInt(formData.termMonths || '0');
    const interestRate = productDetail?.interestRate || 0.03; // 기본 3%
    
    // 단리 계산 (간단한 예시)
    const totalAmount = calculateTotalAmount();
    const interest = totalAmount * interestRate * (termMonths / 12);
    
    return Math.round(interest);
  };

  // 완료된 상태일 때 읽기 전용으로 표시
  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              
              <span className="text-sm font-medium text-gray-700">월 납입액</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formData.monthlyAmount ? `${parseInt(formData.monthlyAmount.replace(/[^\d]/g, '')).toLocaleString()}원` : '미설정'}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              
              <span className="text-sm font-medium text-gray-700">가입 기간</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formData.termMonths ? `${formData.termMonths}개월` : '미설정'}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">만기일</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formData.maturityDate ? 
              (() => {
                const dateParts = formData.maturityDate.split('-');
                if (dateParts.length === 3) {
                  return `${dateParts[0]}년 ${dateParts[1]}월 ${dateParts[2]}일`;
                }
                return formData.maturityDate;
              })()
              : '미설정'
            }
          </p>
        </div>
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
          <h1 className="text-xl font-semibold text-gray-900">
            가입 정보 입력
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 메인 질문 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            얼마를 저축할까요?
          </h2>
        </div>

        {/* 만기일 선택 */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-block">
              <span className="text-lg text-gray-700">만기일: </span>
              {isJointSavingsInvite ? (
                // 공동적금 초대인 경우 고정 만기일 표시
                <span className="text-lg font-semibold text-[#009071]">
                  {isLoadingMaturityInfo
                    ? "로딩 중..."
                    : fixedMaturityDate
                    ? (() => {
                        // 배열 형태 [2026, 10, 15]인 경우
                        if (
                          Array.isArray(fixedMaturityDate) &&
                          fixedMaturityDate.length === 3
                        ) {
                          const [year, month, day] = fixedMaturityDate;
                          return `${year}-${month
                            .toString()
                            .padStart(2, "0")}-${day
                            .toString()
                            .padStart(2, "0")}`;
                        }
                        // 문자열 YYYYMMDD 형식인 경우
                        else if (
                          typeof fixedMaturityDate === "string" &&
                          fixedMaturityDate.length === 8
                        ) {
                          return `${fixedMaturityDate.slice(
                            0,
                            4
                          )}-${fixedMaturityDate.slice(
                            4,
                            6
                          )}-${fixedMaturityDate.slice(6, 8)}`;
                        }
                        // 이미 올바른 형식인 경우
                        else {
                          return fixedMaturityDate;
                        }
                      })()
                    : "YYYY-MM-DD"}
                </span>
              ) : (
                // 일반 적금인 경우 만기일 선택 가능
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`text-lg font-semibold text-[#009071] underline underline-offset-2 hover:text-[#007a5f] transition-colors ${
                    errors.maturityDate ? "text-red-500" : ""
                  }`}
                >
                  {formData.maturityDate || "YYYY-MM-DD"}
                </button>
              )}
              <span className="text-lg text-gray-700"> 만기로</span>
            </div>
            {errors.maturityDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.maturityDate}
              </p>
            )}

            {/* 날짜 선택 패널 (공동적금 초대가 아닌 경우만 표시) */}
            {showDatePicker && !isJointSavingsInvite && (
              <div className="mt-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-4">
                  {/* 년도 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      년도
                    </label>
                    <select
                      value={formData.selectedYear}
                      onChange={(e) => {
                        const year = e.target.value;
                        handleInputChange("selectedYear", year);
                        updateMaturityDate(
                          year,
                          formData.selectedMonth,
                          formData.selectedDay
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">년도</option>
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() + i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 월 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      월
                    </label>
                    <select
                      value={formData.selectedMonth}
                      onChange={(e) => {
                        const month = e.target.value;
                        handleInputChange("selectedMonth", month);
                        updateMaturityDate(
                          formData.selectedYear,
                          month,
                          formData.selectedDay
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">월</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option
                            key={month}
                            value={month.toString().padStart(2, "0")}
                          >
                            {month}월
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* 일 선택 (고정값) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      일
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      {formData.selectedDay}일
                    </div>
                  </div>
                </div>

                {/* 확인 버튼 */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 bg-[#009071] text-white rounded-lg hover:bg-[#007a5f] transition-colors text-sm"
                  >
                    확인
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 월 납입액 입력 */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <span className="text-lg text-gray-700">매월</span>
              <span className="text-2xl font-bold text-[#009071] underline underline-offset-2">
                {formData.monthlyAmount || "10,000"}원
              </span>
              <span className="text-lg text-gray-700">가입하기</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {formData.monthlyAmount
                ? `${parseInt(
                    formData.monthlyAmount.replace(/[^\d]/g, "") / 10000
                  )}만원`
                : "1만원"}
            </p>

            {/* 직접 금액 입력 */}
            <div className="mt-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  value={formData.monthlyAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    const formattedValue = value
                      ? parseInt(value).toLocaleString()
                      : "";
                    handleInputChange("monthlyAmount", formattedValue);
                  }}
                  placeholder="예: 100,000"
                  className={`w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                    errors.monthlyAmount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  원
                </span>
              </div>
              {errors.monthlyAmount && (
                <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.monthlyAmount}
                </p>
              )}
            </div>

            {/* 빠른 금액 선택 버튼들 */}
            <div className="mt-6">
              <div className="flex justify-center space-x-3">
                {[10000, 50000, 100000, 300000, 500000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      handleInputChange(
                        "monthlyAmount",
                        formatCurrency(amount.toString())
                      )
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      parseInt(
                        formData.monthlyAmount.replace(/[^\d]/g, "") || "0"
                      ) === amount
                        ? "bg-[#009071] text-white border-[#009071]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#009071] hover:text-[#009071]"
                    }`}
                  >
                    {amount >= 10000 ? `${amount / 10000}만원` : `${amount}원`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 가입 기간 표시 */}
        {formData.termMonths && (
          <div className="mb-6">
            <div className="text-center">
              <p className="text-base text-gray-700">
                가입 기간:{" "}
                <span className="text-green-600 font-semibold">
                  {formData.termMonths}개월
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 예상 수익 계산 */}
        {formData.monthlyAmount && formData.termMonths && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                예상 수익 계산
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">총 납입액</p>
                  <p className="text-xl font-bold text-gray-900">
                    {calculateTotalAmount().toLocaleString()}원
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">예상 이자</p>
                  <p className="text-xl font-bold text-blue-600">
                    {calculateInterest().toLocaleString()}원
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">만기 수령액</p>
                  <p className="text-xl font-bold text-green-600">
                    {(
                      calculateTotalAmount() + calculateInterest()
                    ).toLocaleString()}
                    원
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                * 예상 이자는 단리 기준이며, 실제 이자와 다를 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 다음 단계 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
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

export default SavingsInputStep;