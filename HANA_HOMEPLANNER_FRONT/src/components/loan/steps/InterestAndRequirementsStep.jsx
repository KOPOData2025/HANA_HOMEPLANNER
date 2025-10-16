/**
 * 3단계: 금리 및 신청요건 설정 컴포넌트
 */

import React from 'react';
import { 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';

const InterestAndRequirementsStep = ({ 
  formData, 
  handleInputChange, 
  onNext, 
  onPrevious 
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
              alt="금리 및 요건 아이콘" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* 우측 절반 - 모든 내용 */}
        <div className="w-1/2 flex flex-col">
          {/* 토스뱅크 스타일 헤더 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              금리 및 신청요건
            </h2>
            <p className="text-sm text-gray-600">
              희망 금리와 신청요건을 설정해주세요
            </p>
          </div>
      
          <div className="space-y-6">
            {/* 희망 금리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                희망 금리
              </label>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-[#2b9d5c]">
                  {formData.desiredInterestRate}%
                </div>
              </div>
              
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.1"
                value={formData.desiredInterestRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  handleInputChange('desiredInterestRate', rate);
                  handleInputChange('interestRate', rate);
                }}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2b9d5c 0%, #2b9d5c ${((formData.desiredInterestRate - 1.0) / 7.0) * 100}%, #d1d5db ${((formData.desiredInterestRate - 1.0) / 7.0) * 100}%, #d1d5db 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1.0%</span>
                <span>8.0%</span>
              </div>

              {/* 빠른 금리 선택 */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      handleInputChange('desiredInterestRate', rate);
                      handleInputChange('interestRate', rate);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.desiredInterestRate === rate
                        ? 'bg-[#2b9d5c] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* 대상 요건 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 요건
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '무주택자', label: '무주택자', desc: '주택 미소유' },
                  { value: '일시적1주택', label: '일시적1주택', desc: '일시적 보유' },
                  { value: '신혼부부', label: '신혼부부', desc: '신혼부부 우대' },
                  { value: '생애최초', label: '생애최초', desc: '최초 구입' },
                  { value: '다주택자', label: '다주택자', desc: '2주택 이상' }
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => handleInputChange('housingStatus', value)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      formData.housingStatus === value
                        ? 'bg-[#2b9d5c] border-2 border-[#2b9d5c] text-white'
                        : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-xs">{label}</div>
                    <div className={`text-xs mt-1 ${
                      formData.housingStatus === value ? 'text-white' : 'text-gray-600'
                    }`}>{desc}</div>
                  </button>
                ))}
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

export default InterestAndRequirementsStep;
