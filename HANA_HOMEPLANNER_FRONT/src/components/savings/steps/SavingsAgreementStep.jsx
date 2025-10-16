/**
 * 적금 가입 3단계: 약관 동의 컴포넌트
 * 약관 및 개인정보 처리 동의
 */

import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';

const SavingsAgreementStep = ({ 
  productDetail, 
  signupData, 
  onNext, 
  onBack,
  isCompleted = false
}) => {
  const [agreements, setAgreements] = useState({
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false
  });

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleAgreementChange = (type) => {
    setAgreements(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAllAgreement = () => {
    const allChecked = agreements.termsAgreed && agreements.privacyAgreed;
    setAgreements({
      termsAgreed: !allChecked,
      privacyAgreed: !allChecked,
      marketingAgreed: !allChecked
    });
  };

  const handleNext = () => {
    if (!agreements.termsAgreed || !agreements.privacyAgreed) {
      alert('필수 약관에 동의해주세요.');
      return;
    }
    
    onNext({
      termsAgreed: agreements.termsAgreed,
      privacyAgreed: agreements.privacyAgreed,
      marketingAgreed: agreements.marketingAgreed
    });
  };

  const allRequiredChecked = agreements.termsAgreed && agreements.privacyAgreed;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
          <h1 className="text-xl font-semibold text-gray-900">약관 동의</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 전체 동의 */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allRequiredChecked}
                onChange={handleAllAgreement}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">전체 동의</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  아래 모든 약관에 동의합니다 (선택 약관 포함)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 필수 약관 */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">필수 약관</h3>
          
          {/* 적금 약관 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreements.termsAgreed}
                  onChange={() => handleAgreementChange('termsAgreed')}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">적금 약관</span>
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">필수</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    적금 상품 이용약관 및 계좌약관
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showTerms ? '닫기' : '보기'}
              </button>
            </label>
            
            {showTerms && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700 space-y-2">
                  <h4 className="font-medium">제1조 (목적)</h4>
                  <p>이 약관은 하나은행의 적금 상품 이용에 관한 기본사항을 정함을 목적으로 합니다.</p>
                  
                  <h4 className="font-medium">제2조 (적금의 성질)</h4>
                  <p>적금은 계약기간 동안 정기적으로 일정금액을 납입하고, 만기 시 원금과 이자를 지급받는 상품입니다.</p>
                  
                  <h4 className="font-medium">제3조 (중도해지)</h4>
                  <p>중도해지 시에는 약정금리의 50%가 적용되며, 이는 시행령에 따른 불이익입니다.</p>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    * 상세한 약관 내용은 가입 시 제공되는 약관서를 참조하시기 바랍니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 개인정보 처리 동의 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreements.privacyAgreed}
                  onChange={() => handleAgreementChange('privacyAgreed')}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900">개인정보 처리 동의</span>
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">필수</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    개인정보 수집·이용·제공 동의
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showPrivacy ? '닫기' : '보기'}
              </button>
            </label>
            
            {showPrivacy && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700 space-y-2">
                  <h4 className="font-medium">개인정보 수집·이용 목적</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>적금 계좌 개설 및 관리</li>
                    <li>자동이체 서비스 제공</li>
                    <li>이자 계산 및 지급</li>
                    <li>고객 상담 및 민원 처리</li>
                  </ul>
                  
                  <h4 className="font-medium">수집하는 개인정보 항목</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>필수: 성명, 주민등록번호, 연락처, 주소</li>
                    <li>선택: 이메일 주소, 직업</li>
                  </ul>
                  
                  <h4 className="font-medium">개인정보 보유·이용 기간</h4>
                  <p>계좌 해지 후 5년간 (관련 법령에 따라)</p>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    * 개인정보 처리방침은 하나은행 홈페이지에서 확인하실 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 선택 약관 */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">선택 약관</h3>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.marketingAgreed}
                onChange={() => handleAgreementChange('marketingAgreed')}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">마케팅 정보 수신 동의</span>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">선택</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  상품 정보, 이벤트 안내 등 마케팅 정보 수신에 동의합니다
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 동의 상태 안내 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">
                필수 약관에 동의하지 않으시면 적금 가입이 불가능합니다.
                선택 약관은 가입 후에도 언제든지 변경하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 다음 단계 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!allRequiredChecked}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              allRequiredChecked
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsAgreementStep;
