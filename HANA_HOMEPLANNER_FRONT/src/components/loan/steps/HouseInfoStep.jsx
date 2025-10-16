/**
 * 1단계: 주택 정보 입력/확인 컴포넌트
 */

import React from 'react';
import { 
  Home, 
  DollarSign, 
  MapPin, 
  Save, 
  Edit3, 
  ChevronRight 
} from 'lucide-react';
import { regionData } from '@/utils/regionData';

const HouseInfoStep = ({ 
  formData, 
  houseData, 
  isEditingHouseInfo, 
  setIsEditingHouseInfo, 
  handleInputChange, 
  onNext,
  formatCurrency 
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
              alt="주택 아이콘" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* 우측 절반 - 모든 내용 */}
        <div className="w-1/2 flex flex-col">
          {/* 심플한 헤더 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              주택정보를 확인해주세요
            </h2>
            
          </div>
          
          {!isEditingHouseInfo ? (
            // 읽기 모드 - 심플한 카드 디자인
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <div className="space-y-3">
                {/* 주택 가격 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 whitespace-nowrap">주택 가격</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(formData.housePrice)}
                  </span>
                </div>
                
                {/* 전용면적 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 whitespace-nowrap">전용면적</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formData.houseSize}㎡
                  </span>
                </div>
                
                {/* 주택 유형 */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 whitespace-nowrap">주택 유형</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formData.houseType}
                  </span>
                </div>
                
                {/* 지역 */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">지역</span>
                  <span className="text-base font-semibold text-gray-900 text-right">
                    {formData.region}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // 편집 모드 - 폼 입력
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="space-y-6">
                {/* 주택 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주택 가격
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={formData.housePrice ? formData.housePrice.toLocaleString() : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        handleInputChange('housePrice', parseInt(value) || 0);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-all duration-200 text-lg"
                      placeholder="예: 500,000,000"
                    />
                    <span className="ml-2 text-sm text-gray-500">원</span>
                  </div>
                </div>
                
                {/* 전용면적 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전용면적
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.houseSize}
                      onChange={(e) => handleInputChange('houseSize', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-all duration-200 text-lg"
                      placeholder="예: 84.5"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ㎡
                    </div>
                  </div>
                </div>
                
                {/* 주택 유형 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주택 유형
                  </label>
                  <select
                    value={formData.houseType}
                    onChange={(e) => handleInputChange('houseType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-all duration-200 text-lg appearance-none bg-white"
                  >
                    <option value="아파트">아파트</option>
                    <option value="오피스텔">오피스텔</option>
                    <option value="빌라">빌라</option>
                    <option value="단독주택">단독주택</option>
                    <option value="연립주택">연립주택</option>
                    <option value="다세대주택">다세대주택</option>
                  </select>
                </div>
                
                {/* 지역 선택 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시도
                    </label>
                    <select
                      value={formData.city || ''}
                      onChange={(e) => {
                        const cityName = e.target.value;
                        handleInputChange('city', cityName);
                        handleInputChange('district', '');
                        handleInputChange('region', cityName);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-all duration-200 appearance-none bg-white"
                    >
                      <option value="">시도 선택</option>
                      {Object.values(regionData).map((region) => (
                        <option key={region.name} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시군구
                    </label>
                    <select
                      value={formData.district || ''}
                      onChange={(e) => {
                        const districtName = e.target.value;
                        handleInputChange('district', districtName);
                        const fullRegion = formData.city && districtName 
                          ? `${formData.city} ${districtName}` 
                          : formData.city || '';
                        handleInputChange('region', fullRegion);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-all duration-200 appearance-none bg-white"
                      disabled={!formData.city}
                    >
                      <option value="">시군구 선택</option>
                      {formData.city && Object.values(regionData).find(r => r.name === formData.city)?.districts && 
                        Object.values(Object.values(regionData).find(r => r.name === formData.city).districts).map((district) => (
                          <option key={district.name} value={district.name}>
                            {district.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 수정 버튼 - 시세 마커 데이터가 있을 때만 표시 */}
          {houseData && (
            <div className="mb-6">
              <button
                onClick={() => setIsEditingHouseInfo(!isEditingHouseInfo)}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isEditingHouseInfo 
                    ? 'bg-[#009071] hover:bg-[#007a5e] text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {isEditingHouseInfo ? (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    저장하기
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 inline mr-2" />
                    정보 수정
                  </>
                )}
              </button>
            </div>
          )}

          {/* 다음 단계 버튼 */}
          <div className="mt-auto pt-6">
            <button
              onClick={onNext}
              className="w-full bg-[#009071] hover:bg-[#007a5e] text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
            >
              다음 단계
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseInfoStep;