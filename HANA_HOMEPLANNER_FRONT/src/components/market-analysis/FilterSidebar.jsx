import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Range } from 'react-range';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Home, 
  MapPin, 
  Calendar, 
  Settings,
  ToggleLeft,
  ToggleRight,
  Sliders
} from 'lucide-react';

export const FilterSidebar = ({ 
  realTimeData = [], 
  onFilterChange,
  isRealTimeMode = false,
  isOpen = false,
  onToggle = () => {}
}) => {
  // 토글 기능 제거 - 모든 섹션 항상 표시

  // 공급세대수 필터 고정 범위 설정
  const SUPPLY_COUNT_MAX = 5000; // 최대 5000세대로 고정

  const [filters, setFilters] = useState({
    // 기본 조건
    housingType: '',
    housingDetail: '',
    subscriptionStatus: '',
    
    // 지역 조건
    region: '',
    
    // 주변 환경
    speculationArea: false,
    adjustmentArea: false,
    priceLimit: false,
    redevelopment: false,
    publicHousing: false,
    largeScale: false,
    metropolitanPublic: false,
    
    // 공급세대수 범위 (고정값)
    supplyCountRange: [0, SUPPLY_COUNT_MAX] // 0세대 ~ 5000세대로 고정
  });

  const sidebarRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // 디바운싱된 필터 변경 핸들러
  const debouncedFilterChange = useCallback((newFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('[필터 변경] 디바운싱된 필터 적용:', newFilters);
      onFilterChange(newFilters);
    }, 150); // 150ms 디바운싱
  }, [onFilterChange]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 외부 클릭 시 사이드바 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // 필터 옵션 동적 생성 (API 데이터 기반)
  const filterOptions = {
    housingTypes: isRealTimeMode && realTimeData.length > 0 
      ? [...new Set(realTimeData.map(item => item.houseSecdNm).filter(Boolean))].sort()
      : ['APT', '신혼희망타운', '민간사전청약'],
    housingDetails: isRealTimeMode && realTimeData.length > 0
      ? [...new Set(realTimeData.map(item => item.houseDtlSecdNm).filter(Boolean))].sort()
      : ['국민', '민영'],
    regions: isRealTimeMode && realTimeData.length > 0
      ? [...new Set(realTimeData.map(item => item.district).filter(Boolean))].sort()
      : ['서울', '경기', '인천'],
    subscriptionStatuses: ['접수예정', '접수중', '접수종료', '당첨자발표완료']
  };


  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // 공급세대수 범위 필터의 경우 디바운싱 적용
    if (key === 'supplyCountRange') {
      debouncedFilterChange(newFilters);
    } else {
      // 다른 필터는 즉시 적용
      onFilterChange(newFilters);
    }
  };

  // 필터 초기화
  const resetFilters = () => {
    const resetValues = {
      housingType: '',
      housingDetail: '',
      subscriptionStatus: '',
      region: '',
      speculationArea: false,
      adjustmentArea: false,
      priceLimit: false,
      redevelopment: false,
      publicHousing: false,
      largeScale: false,
      metropolitanPublic: false,
      supplyCountRange: [0, SUPPLY_COUNT_MAX] // 고정된 범위로 초기화
    };
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억원`;
    } else if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}만원`;
    }
    return `${price.toLocaleString()}원`;
  };

  // 활성 필터 개수 계산
  const activeFilterCount = Object.values(filters).filter(value => {
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value[0] !== 0 || value[1] !== 2000;
    return value !== '';
  }).length;

  return (
    <>

      {/* 사이드바 */}
      <div 
        ref={sidebarRef}
        className={`fixed left-0 w-80 bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '82px', height: 'calc(100vh - 82px)' }}
      >

        {/* 필터 내용 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(100vh - 157px)' }}>
          
          {/* 기본 조건 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Home className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">기본 조건</span>
            </div>

            <div className="space-y-2 pl-4">
                {/* 주택구분 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주택구분</label>
                  <select
                    value={filters.housingType}
                    onChange={(e) => handleFilterChange('housingType', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">전체</option>
                    {filterOptions.housingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 주택상세구분 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주택상세구분</label>
                  <select
                    value={filters.housingDetail}
                    onChange={(e) => handleFilterChange('housingDetail', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">전체</option>
                    {filterOptions.housingDetails.map(detail => (
                      <option key={detail} value={detail}>{detail}</option>
                    ))}
                  </select>
                </div>

                {/* 청약상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">청약상태</label>
                  <select
                    value={filters.subscriptionStatus}
                    onChange={(e) => handleFilterChange('subscriptionStatus', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">전체</option>
                    {filterOptions.subscriptionStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>

          {/* 지역 조건 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">지역 조건</span>
            </div>

            <div className="space-y-3 pl-4">
                {/* 지역 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">전체 지역</option>
                    {filterOptions.regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>

          {/* 주변 환경 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">주변 환경</span>
            </div>

            <div className="space-y-2 pl-4">
                {/* 토글 스위치들 */}
                {[
                  { key: 'speculationArea', label: '투기과열지구', color: 'green' },
                  { key: 'adjustmentArea', label: '조정대상지역', color: 'green' },
                  { key: 'priceLimit', label: '분양가상한제', color: 'green' },
                  { key: 'redevelopment', label: '정비사업', color: 'green' },
                  { key: 'publicHousing', label: '공공주택지구', color: 'green' },
                  { key: 'largeScale', label: '대규모택지', color: 'green' },
                  { key: 'metropolitanPublic', label: '수도권민영공공', color: 'green' }
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <button
                      onClick={() => handleFilterChange(key, !filters[key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        filters[key] 
                          ? `bg-${color}-500` 
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          filters[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* 공급세대수 범위 */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Sliders className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">공급세대수 범위</span>
            </div>

            <div className="space-y-3 pl-4">
                {/* 공급세대수 범위 슬라이더 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    공급세대수: {filters.supplyCountRange[0]}세대 ~ {filters.supplyCountRange[1]}세대
                  </label>
                  <div className="px-2">
                    <Range
                      step={50}
                      min={0}
                      max={SUPPLY_COUNT_MAX} // 고정된 최대값 사용
                      values={filters.supplyCountRange}
                      onChange={(values) => handleFilterChange('supplyCountRange', values)}
                      renderTrack={({ props, children }) => (
                        <div
                          {...props}
                          style={{
                            ...props.style,
                            height: '6px',
                            width: '100%',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '4px',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              height: '6px',
                              backgroundColor: '#10b981',
                              borderRadius: '4px',
                              left: `${(filters.supplyCountRange[0] / SUPPLY_COUNT_MAX) * 100}%`,
                              width: `${((filters.supplyCountRange[1] - filters.supplyCountRange[0]) / SUPPLY_COUNT_MAX) * 100}%`
                            }}
                          />
                          {children}
                        </div>
                      )}
                      renderThumb={({ props }) => {
                        const { key, ...restProps } = props;
                        return (
                          <div
                            key={key}
                            {...restProps}
                            style={{
                              ...restProps.style,
                              height: '20px',
                              width: '20px',
                              backgroundColor: '#ffffff',
                              border: '2px solid #10b981',
                              borderRadius: '50%',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              cursor: 'pointer'
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* 사이드바 푸터 */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={resetFilters}
            className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            필터 초기화
          </button>
        </div>
      </div>
    </>
  );
};
