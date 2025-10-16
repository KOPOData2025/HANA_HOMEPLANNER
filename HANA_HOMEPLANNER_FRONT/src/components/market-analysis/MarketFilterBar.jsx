import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw, Bell } from 'lucide-react';

export const MarketFilterBar = ({ 
  realTimeData = [], 
  onFilterChange,
  isRealTimeMode = false 
}) => {
  const [isOpen, setIsOpen] = useState({
    housingType: false,
    housingDetail: false,
    speculationArea: false,
    adjustmentArea: false,
    priceLimit: false,
    redevelopment: false,
    publicHousing: false,
    largeScale: false,
    metropolitanPublic: false
  });

  const [selectedValues, setSelectedValues] = useState({
    housingType: '주택구분 선택',
    housingDetail: '주택상세구분 선택',
    region: '지역 선택',
    subscriptionStatus: '청약상태 선택',
    speculationArea: false,
    adjustmentArea: false,
    priceLimit: false,
    redevelopment: false,
    publicHousing: false,
    largeScale: false,
    metropolitanPublic: false
  });

  const dropdownRefs = useRef({});

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setIsOpen(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    // 스크롤 시 드롭다운 닫기
    const handleScroll = () => {
      setIsOpen(prev => ({
        housingType: false,
        housingDetail: false,
        speculationArea: false,
        adjustmentArea: false,
        priceLimit: false,
        redevelopment: false,
        publicHousing: false,
        largeScale: false,
        metropolitanPublic: false
      }));
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // 드롭다운 토글
  const toggleDropdown = (key) => {
    setIsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 값 선택 (드롭다운용)
  const selectValue = (key, value) => {
    const newValues = { ...selectedValues, [key]: value };
    setSelectedValues(newValues);
    setIsOpen(prev => ({ ...prev, [key]: false }));
    
    // 필터 변경 콜백 호출
    if (onFilterChange) {
      onFilterChange(newValues);
    }
  };

  // boolean 값 토글 (투기과열지구 등) - 각각 독립적으로 선택/해제 가능
  const toggleBooleanValue = (key) => {
    const newValues = {
      ...selectedValues,
      [key]: !selectedValues[key]
    };
    setSelectedValues(newValues);
    
    // 필터 변경 콜백 호출
    if (onFilterChange) {
      onFilterChange(newValues);
    }
  };

  // 필터 초기화
  const resetFilters = () => {
    const resetValues = {
      housingType: '주택구분 선택',
      housingDetail: '주택상세구분 선택',
      region: '지역 선택',
      subscriptionStatus: '청약상태 선택',
      speculationArea: false,
      adjustmentArea: false,
      priceLimit: false,
      redevelopment: false,
      publicHousing: false,
      largeScale: false,
      metropolitanPublic: false
    };
    setSelectedValues(resetValues);
    
    // 필터 변경 콜백 호출
    if (onFilterChange) {
      onFilterChange(resetValues);
    }
  };

  // 실시간 데이터에서 드롭다운 옵션 동적 생성
  const dropdownOptions = {
    housingType: isRealTimeMode && realTimeData.length > 0 
      ? ['선택없음', ...new Set(realTimeData.map(item => item.houseSecdNm).filter(Boolean))].sort()
      : ['선택없음', 'APT', '신혼희망타운', '민간사전청약'],
    housingDetail: isRealTimeMode && realTimeData.length > 0
      ? ['선택없음', ...new Set(realTimeData.map(item => item.houseDtlSecdNm).filter(Boolean))].sort()
      : ['선택없음', '국민', '민영'],
    region: isRealTimeMode && realTimeData.length > 0
      ? ['선택없음', ...new Set(realTimeData.map(item => item.subscrptAreaCodeNm).filter(Boolean))].sort()
      : ['선택없음', '서울', '경기', '인천'],
    subscriptionStatus: ['선택없음', '접수예정', '접수중', '접수종료']
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-3">
        <div className="flex items-center justify-between">
                    {/* 좌측: 필터 메뉴들 */}
          <div className="flex items-center gap-3">
                         {/* 주택구분 선택 */}
             <div className="relative flex-shrink-0" ref={el => dropdownRefs.current.housingType = el}>
               <button
                 onClick={() => toggleDropdown('housingType')}
                 className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors w-[140px]"
               >
                 <span className="truncate">{selectedValues.housingType}</span>
                 <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen.housingType ? 'rotate-180' : ''}`} />
               </button>
               
                              {isOpen.housingType && (
                  <div className="absolute top-full left-0 mt-1 w-[140px] bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {dropdownOptions.housingType.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectValue('housingType', option)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
             </div>

                         {/* 주택상세구분 선택 */}
             <div className="relative flex-shrink-0" ref={el => dropdownRefs.current.housingDetail = el}>
               <button
                 onClick={() => toggleDropdown('housingDetail')}
                 className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors w-[140px]"
               >
                 <span className="truncate">{selectedValues.housingDetail}</span>
                 <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen.housingDetail ? 'rotate-180' : ''}`} />
               </button>
               
                              {isOpen.housingDetail && (
                  <div className="absolute top-full left-0 mt-1 w-[140px] bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {dropdownOptions.housingDetail.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectValue('housingDetail', option)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
             </div>

            {/* 지역 선택 */}
            {isRealTimeMode && (
              <div className="relative flex-shrink-0" ref={el => dropdownRefs.current.region = el}>
                <button
                  onClick={() => toggleDropdown('region')}
                  className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors w-[120px]"
                >
                  <span className="truncate">{selectedValues.region}</span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen.region ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen.region && (
                  <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {dropdownOptions.region.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectValue('region', option)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 청약상태 선택 */}
            {isRealTimeMode && (
              <div className="relative flex-shrink-0" ref={el => dropdownRefs.current.subscriptionStatus = el}>
                <button
                  onClick={() => toggleDropdown('subscriptionStatus')}
                  className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors w-[120px]"
                >
                  <span className="truncate">{selectedValues.subscriptionStatus}</span>
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen.subscriptionStatus ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen.subscriptionStatus && (
                  <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-gray-300 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
                    {dropdownOptions.subscriptionStatus.map((option) => (
                      <button
                        key={option}
                        onClick={() => selectValue('subscriptionStatus', option)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 투기과열지구 */}
            <button
              onClick={() => toggleBooleanValue('speculationArea')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.speculationArea
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              투기과열지구
            </button>

            {/* 조정대상지역 */}
            <button
              onClick={() => toggleBooleanValue('adjustmentArea')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.adjustmentArea
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              조정대상지역
            </button>

            {/* 분양가상한제 */}
            <button
              onClick={() => toggleBooleanValue('priceLimit')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.priceLimit
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              분양가상한제
            </button>

            {/* 정비사업 */}
            <button
              onClick={() => toggleBooleanValue('redevelopment')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.redevelopment
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              정비사업
            </button>

            {/* 공공주택지구 */}
            <button
              onClick={() => toggleBooleanValue('publicHousing')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.publicHousing
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              공공주택지구
            </button>

            {/* 대규모택지개발지구 */}
            <button
              onClick={() => toggleBooleanValue('largeScale')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.largeScale
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              대규모택지
            </button>

            {/* 수도권내민영공공주택지구 */}
            <button
              onClick={() => toggleBooleanValue('metropolitanPublic')}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedValues.metropolitanPublic
                  ? 'bg-teal-100 text-teal-700 border border-teal-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              수도권민영공공
            </button>

            {/* 새로고침 버튼 - 분양형태 선택 우측 */}
            <button
              onClick={resetFilters}
              className="flex-shrink-0 p-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              title="필터 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 우측: 청약 알림 버튼 */}
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-lg">
            <Bell className="w-4 h-4" />
            청약 알림
          </button>
        </div>
      </div>
    </div>
  );
};
