/**
 * 대출 신청 3단계: 공동 대출자 포함 여부 선택 컴포넌트
 */

import React, { useState } from 'react';
import { ArrowLeft, Users, User, Phone, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const LoanAgreementStep = ({ 
  productDetail, 
  applicationData, 
  onNext, 
  onBack,
  isSubmitting = false,
  isCompleted = false
}) => {
  const [includeCoBorrower, setIncludeCoBorrower] = useState(null); // null: 선택 안함, true: 포함, false: 미포함
  const [coBorrowerInfo, setCoBorrowerInfo] = useState({
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleCoBorrowerChoice = (choice) => {
    setIncludeCoBorrower(choice);
    setErrors({}); // 에러 초기화
  };

  const handleInputChange = (field, value) => {
    // 전화번호 필드인 경우 자동 포맷팅
    if (field === 'phone') {
      // 숫자만 추출
      const numbers = value.replace(/[^0-9]/g, '');
      
      // 전화번호 포맷팅 (010-1234-5678)
      let formatted = numbers;
      if (numbers.length >= 4) {
        formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
      }
      if (numbers.length >= 8) {
        formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
      }
      
      value = formatted;
    }
    
    setCoBorrowerInfo(prev => ({
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

  const validateCoBorrowerInfo = () => {
    const newErrors = {};

    if (!coBorrowerInfo.name.trim()) {
      newErrors.name = '공동 대출자 이름을 입력해주세요.';
    }

    if (!coBorrowerInfo.phone.trim()) {
      newErrors.phone = '공동 대출자 전화번호를 입력해주세요.';
    } else if (!/^[0-9-+\s]+$/.test(coBorrowerInfo.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (includeCoBorrower === null) {
      setErrors({ choice: '공동 대출자 포함 여부를 선택해주세요.' });
      return;
    }

    if (includeCoBorrower && !validateCoBorrowerInfo()) {
      return;
    }

    // 다음 단계로 데이터 전달
    onNext({
      includeCoBorrower,
      coBorrowerInfo: includeCoBorrower ? coBorrowerInfo : null,
      isJoint: includeCoBorrower ? "Y" : "N",
      jointName: includeCoBorrower ? coBorrowerInfo.name : '',
      jointPhone: includeCoBorrower ? coBorrowerInfo.phone : ''
    });
  };

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">
              공동 대출자: {includeCoBorrower ? '포함' : '미포함'}
            </p>
            {includeCoBorrower && coBorrowerInfo.name && (
              <>
                <p className="text-sm text-gray-600">이름: {coBorrowerInfo.name}</p>
                <p className="text-sm text-gray-600">전화번호: {coBorrowerInfo.phone}</p>
              </>
            )}
          </div>
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
            공동 대출자 설정
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 메인 질문 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            공동 대출자를 포함하시겠어요?
          </h2>
          <p className="text-gray-600 mb-8">
            공동 대출자를 포함하면 더 높은 대출 한도와 유리한 금리 조건을 받을 수 있습니다.
          </p>
        </div>

        {/* 선택 버튼들 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleCoBorrowerChoice(true)}
              className={`px-8 py-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${
                includeCoBorrower === true
                  ? 'border-[#009071] bg-[#009071] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#009071] hover:text-[#009071]'
              }`}
            >
              <Users className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold text-lg">좋아요</div>
                <div className="text-sm opacity-90">공동 대출자 포함</div>
              </div>
            </button>

            <button
              onClick={() => handleCoBorrowerChoice(false)}
              className={`px-8 py-4 rounded-xl border-2 transition-colors flex items-center space-x-3 ${
                includeCoBorrower === false
                  ? 'border-[#009071] bg-[#009071] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#009071] hover:text-[#009071]'
              }`}
            >
              <User className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold text-lg">아니요</div>
                <div className="text-sm opacity-90">혼자 신청</div>
              </div>
            </button>
          </div>

          {errors.choice && (
            <p className="mt-4 text-sm text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.choice}
            </p>
          )}
        </div>

        {/* 공동 대출자 정보 입력 */}
        {includeCoBorrower === true && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                공동 대출자 정보를 입력해주세요. 
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이름 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공동 대출자 이름
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={coBorrowerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="예: 홍길동"
                      className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* 전화번호 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공동 대출자 전화번호
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={coBorrowerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="예: 010-1234-5678"
                      className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      공동 대출자 정보는 대출 심사 과정에서 신용정보 조회 및 메세지 발송을 위해 사용됩니다.
                    </p>
                  </div>
                </div>
              </div>
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
                {includeCoBorrower === false ? '바로 대출 신청할래요' : '대출 신청하기'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanAgreementStep;
