/**
 * 4단계: 연소득 및 DSR 한도 입력 컴포넌트
 */

import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  Download 
} from 'lucide-react';

const IncomeAndDSRStep = ({ 
  formData, 
  handleInputChange, 
  onNext, 
  onPrevious,
  isLoadingIncome,
  handleLoadMyIncome
}) => {
  return (
    <div className="p-8 max-w-none w-full h-[600px]">
      {/* 절반으로 나눈 레이아웃 */}
      <div className="flex items-center gap-12 h-full">
        {/* 좌측 절반 - 아이콘 영역 */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-full h-full max-w-lg max-h-lg bg-white rounded-xl flex items-center justify-center p-8">
            <img 
              src="/icon/home-ic.png" 
              alt="연소득 및 DSR 아이콘" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* 우측 절반 - 모든 내용 */}
        <div className="w-1/2 flex flex-col">
          {/* 토스뱅크 스타일 헤더 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              연소득 및 DSR 한도
            </h2>
            <p className="text-sm text-gray-600">
              연소득과 DSR 한도를 입력해주세요
            </p>
          </div>
      
          <div className="space-y-4">
            {/* 연소득 입력 */}
            <div className="rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-800">
                  연소득
                </label>
                <button
                  onClick={handleLoadMyIncome}
                  disabled={isLoadingIncome}
                  className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingIncome ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      불러오는 중...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      내 연소득 불러오기
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.annualIncome ? formData.annualIncome.toLocaleString() : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        handleInputChange('annualIncome', parseInt(value) || 0);
                      }}
                      className="w-full px-3 py-2 text-base font-bold text-center border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="50,000,000"
                    />
                  </div>
                  <div className="text-sm font-bold text-gray-600">원</div>
                </div>
                {/* 빠른 선택 버튼들 */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {[
                    { amount: 30000000, label: '3천만원' },
                    { amount: 40000000, label: '4천만원' },
                    { amount: 50000000, label: '5천만원' },
                    { amount: 60000000, label: '6천만원' },
                    { amount: 70000000, label: '7천만원' },
                    { amount: 80000000, label: '8천만원' }
                  ].map(({ amount, label }) => (
                    <button
                      key={amount}
                      onClick={() => handleInputChange('annualIncome', amount)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        formData.annualIncome === amount
                          ? 'bg-[#2b9d5c] text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DSR 한도 설정 */}
            <div className="rounded-lg p-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                DSR 한도
              </label>
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-base font-bold text-[#2b9d5c] mb-1">
                    {formData.dsrLimit}%
                  </div>
                  <div className="text-xs text-gray-600">현재 설정된 DSR 한도</div>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="5"
                    value={formData.dsrLimit}
                    onChange={(e) => handleInputChange('dsrLimit', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider-green"
                    style={{
                      background: `linear-gradient(to right, #2b9d5c 0%, #2b9d5c ${((formData.dsrLimit - 20) / 40) * 100}%, #d1d5db ${((formData.dsrLimit - 20) / 40) * 100}%, #d1d5db 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>20%</span>
                    <span>40%</span>
                    <span>60%</span>
                  </div>
                </div>

                {/* 빠른 DSR 선택 */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {[30, 35, 40, 45, 50].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleInputChange('dsrLimit', rate)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        formData.dsrLimit === rate
                          ? 'bg-[#2b9d5c] text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
              <button
                onClick={onNext}
                className="flex-1 bg-[#009071] hover:bg-[#007a5e] text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeAndDSRStep;
