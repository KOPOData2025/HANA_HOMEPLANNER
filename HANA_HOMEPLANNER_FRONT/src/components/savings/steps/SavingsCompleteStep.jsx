/**
 * 적금 가입 5단계: 가입 성공 컴포넌트
 * 가입 완료 화면
 */

import React from 'react';
import { CheckCircle, Calendar, DollarSign, CreditCard, ArrowRight, Home } from 'lucide-react';

const SavingsCompleteStep = ({ 
  productDetail, 
  signupData, 
  onNext, 
  onBack, 
  onComplete,
  isCompleted = false
}) => {
  const handleComplete = () => {
    onComplete();
  };

  const handleGoHome = () => {
    // 홈으로 이동
    window.location.href = '/';
  };

  const formatCurrency = (value) => {
    return parseInt(value || '0').toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 성공 메시지 */}
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            적금 가입이 완료되었습니다!
          </h1>
          <p className="text-gray-600">
            안전하고 안정적인 자산 형성을 시작하세요
          </p>
        </div>

        {/* 가입 정보 요약 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">가입 정보</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">상품명</span>
                <span className="font-medium text-gray-900">{productDetail?.productName}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">계좌번호</span>
                <span className="font-medium text-gray-900">{signupData.accountNumber}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">월 납입액</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(signupData.monthlyAmount)}원
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">가입 기간</span>
                <span className="font-medium text-gray-900">
                  {signupData.termMonths}개월
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">자동이체일</span>
                <span className="font-medium text-gray-900">
                  매월 {signupData.preferredDay}일
                </span>
              </div>
              
              {signupData.initialDeposit && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">초기 입금액</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(signupData.initialDeposit)}원
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">다음 단계</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  자동이체 설정이 완료되었습니다. 매월 {signupData.preferredDay}일에 자동으로 납입됩니다.
                </span>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  첫 납입일은 가입일로부터 1개월 후입니다.
                </span>
              </div>
              
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  자동이체 계좌 잔액을 충분히 유지해주세요.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 공동적금 초대 안내 */}
        {productDetail?.productType === 'JOINT_SAVING' && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">공동적금 초대</h3>
              <p className="text-purple-800 mb-4">
                가족이나 친구를 초대하여 함께 목표를 달성해보세요!
              </p>
              <div className="flex items-center text-purple-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                <span className="text-sm">초대 링크를 생성하여 공유할 수 있습니다</span>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {productDetail?.productType === 'JOINT_SAVING' ? (
            <button
              onClick={handleComplete}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              초대 링크 생성하기
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              상품 목록으로 이동
            </button>
          )}
          
          <button
            onClick={handleGoHome}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            홈으로 이동
          </button>
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            가입 관련 문의사항이 있으시면 고객센터(1588-1111)로 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsCompleteStep;
