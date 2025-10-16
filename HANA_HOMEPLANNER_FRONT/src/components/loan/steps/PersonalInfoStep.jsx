/**
 * 5단계: 부부 공동 대출 정보 입력 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RefreshCw, Download } from 'lucide-react';

const PersonalInfoStep = ({
  formData,
  handleInputChange,
  onNext,
  onPrevious,
  isLoading,
  handleLoanInquiry,
  isLoadingIncome,
  handleLoadMyIncome,
  coupleStatus,
  partnerInfo,
  isCoupleLoanEnabled,
}) => {
  const [showCoupleInfo, setShowCoupleInfo] = useState(false);

  const handleCoupleLoanSelection = (isCoupleLoan) => {
    handleInputChange('isCoupleLoan', isCoupleLoan);
    setShowCoupleInfo(isCoupleLoan);
  };

  const handleDirectLoanInquiry = () => {
    handleInputChange('isCoupleLoan', false);
    if (typeof handleLoanInquiry === 'function') {
      handleLoanInquiry(false); // 일반 대출조회로 호출
    }
  };

  const handleCoupleLoanInquiry = () => {
    // 커플 연동 상태만 확인 (partnerInfo는 API에서 자동으로 가져옴)
    if (!coupleStatus?.hasCouple || !coupleStatus?.partnerUserId) {
      alert('배우자 정보를 불러올 수 없습니다. 먼저 커플 연동을 진행해주세요.');
      return;
    }
    
    handleInputChange('isCoupleLoan', true);
    if (typeof handleLoanInquiry === 'function') {
      handleLoanInquiry(true); // 부부 공동 대출조회로 호출
    }
  };

  return (
    <div className="p-8 max-w-none w-full h-[600px]">
      {/* 절반으로 나눈 레이아웃 */}
      <div className="flex items-center gap-12 h-full">
        {/* 좌측 절반 - 아이콘 영역 */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-full h-full max-w-lg max-h-lg bg-white rounded-xl flex items-center justify-center p-8">
            <img
              src="/icon/home-ic.png"
              alt="부부 공동 대출 아이콘"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 우측 절반 - 모든 내용 */}
        <div className="w-1/2 flex flex-col">
          {/* 토스뱅크 스타일 헤더 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              부부 공동 대출
            </h2>
            <p className="text-sm text-gray-600">
              부부 공동 대출 정보를 입력해주세요
            </p>
          </div>

          <div className="space-y-6">
            {!showCoupleInfo ? (
              /* 공동 대출 선택 화면 */
              <div className="space-y-4">
                <div className="text-center py-8">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    공동 대출 정보를 입력하시겠어요?
                  </h3>
                  <div className="space-y-3">
                    {/* 연동된 부부가 있을 때만 부부 공동 대출 버튼 활성화 */}
                    {coupleStatus && coupleStatus.hasCouple ? (
                      <button
                        onClick={() => handleCoupleLoanSelection(true)}
                        className="w-full bg-[#2b9d5c] hover:bg-[#2a8a52] text-white py-3 px-6 rounded-xl font-medium transition-all duration-200"
                      >
                        예, 공동정보를 입력할게요
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-xl font-medium text-center">
                        연동된 배우자가 없어 부부 공동 대출이 불가능합니다
                      </div>
                    )}
                    
                    <button
                      onClick={handleDirectLoanInquiry}
                      disabled={isLoading}
                      className="w-full bg-[#009071] hover:bg-[#007a5e] disabled:bg-gray-400 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          대출 조회 실행 중...
                        </>
                      ) : (
                        "아니요, 바로 대출조회할래요"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* 공동정보 입력 화면 */
              <div className="space-y-4">
                {/* 연소득 입력 섹션 */}
                <div className="rounded-lg p-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isCoupleLoan}
                          onChange={(e) => {
                            handleInputChange("isCoupleLoan", e.target.checked);
                          }}
                          disabled={!coupleStatus || !coupleStatus.hasCouple}
                          className={`w-4 h-4 border-gray-300 rounded focus:ring-[#2b9d5c] ${
                            coupleStatus && coupleStatus.hasCouple 
                              ? 'text-[#2b9d5c] cursor-pointer' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          coupleStatus && coupleStatus.hasCouple ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          부부 공동 대출 조회하기
                          {(!coupleStatus || !coupleStatus.hasCouple) && ' (연동된 배우자 없음)'}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowCoupleInfo(false)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        뒤로가기
                      </button>
                    </div>

                    {formData.isCoupleLoan && (
                      <div className="space-y-3">
                        {/* 연소득 입력 */}
                        <div className="rounded-lg p-3 border border-gray-200">
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            공동 대출자 연소득
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={formData.spouseIncome ? formData.spouseIncome.toLocaleString() : ''}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^\d]/g, '');
                                    handleInputChange(
                                      "spouseIncome",
                                      parseInt(value) || 0
                                    );
                                  }}
                                  className="w-full px-3 py-2 text-base font-bold text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                  placeholder="30,000,000"
                                />
                              </div>
                              <div className="text-sm font-bold text-gray-600">
                                원
                              </div>
                            </div>
                            {/* 빠른 선택 버튼들 */}
                            <div className="flex flex-wrap gap-1 justify-center">
                              {[
                                { amount: 20000000, label: '2천만원' },
                                { amount: 30000000, label: '3천만원' },
                                { amount: 40000000, label: '4천만원' },
                                { amount: 50000000, label: '5천만원' },
                                { amount: 60000000, label: '6천만원' }
                              ].map(({ amount, label }) => (
                                <button
                                  key={amount}
                                  onClick={() =>
                                    handleInputChange(
                                      "spouseIncome",
                                      amount
                                    )
                                  }
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    formData.spouseIncome === amount
                                      ? "bg-[#2b9d5c] text-white"
                                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="mt-auto pt-6">
            <div className="flex gap-3">
              <button
                onClick={onPrevious}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                이전
              </button>
              {showCoupleInfo && (
                <button
                  onClick={handleCoupleLoanInquiry}
                  disabled={isLoading || !coupleStatus || !coupleStatus.hasCouple || !coupleStatus.partnerUserId}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                    coupleStatus && coupleStatus.hasCouple && coupleStatus.partnerUserId
                      ? 'bg-[#009071] hover:bg-[#007a5e] disabled:bg-gray-400 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      부부 공동 대출 조회 중...
                    </>
                  ) : coupleStatus && coupleStatus.hasCouple && coupleStatus.partnerUserId ? (
                    <>
                      부부 공동 대출 조회
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    '연동된 배우자 없음'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;