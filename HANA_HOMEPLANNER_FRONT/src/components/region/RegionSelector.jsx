import React from 'react'
import { regionData } from '@/utils/regionData'

const RegionSelector = ({
  selectedSido,
  selectedSigungu,
  selectedNeighborhood,
  openDropdowns,
  onSidoSelect,
  onSigunguSelect,
  onNeighborhoodSelect,
  onToggleDropdown
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 시도 선택 */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-3">시도</label>
        <div className="relative">
          <button
            onClick={() => onToggleDropdown('sido')}
            className="w-full p-3 text-left border-2 border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:border-teal-500 focus:outline-none transition-colors"
          >
            {selectedSido ? regionData[selectedSido]?.name : '시도를 선택하세요'}
            <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${openDropdowns.sido ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdowns.sido && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {Object.entries(regionData).map(([sidoKey, sido]) => (
                <button
                  key={sidoKey}
                  onClick={() => onSidoSelect(sidoKey, regionData)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedSido === sidoKey ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                  }`}
                >
                  {sido.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 시군구 선택 */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-3">시군구</label>
        <div className="relative">
          <button
            onClick={() => selectedSido && onToggleDropdown('sigungu')}
            disabled={!selectedSido}
            className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
              selectedSido 
                ? 'border-gray-200 bg-white hover:border-gray-300 focus:border-teal-500 focus:outline-none' 
                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedSigungu ? regionData[selectedSido]?.districts?.[selectedSigungu]?.name : '시군구를 선택하세요'}
            {selectedSido && (
              <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${openDropdowns.sigungu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {selectedSido && openDropdowns.sigungu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {Object.entries(regionData[selectedSido]?.districts || {}).map(([sigunguKey, sigungu]) => (
                <button
                  key={sigunguKey}
                  onClick={() => onSigunguSelect(sigunguKey, regionData)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedSigungu === sigunguKey ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                  }`}
                >
                  {sigungu?.name || '이름 없음'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 읍면동 선택 */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-3">읍면동</label>
        <div className="relative">
          <button
            onClick={() => selectedSigungu && onToggleDropdown('neighborhood')}
            disabled={!selectedSigungu}
            className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
              selectedSigungu 
                ? 'border-gray-200 bg-white hover:border-gray-300 focus:border-teal-500 focus:outline-none' 
                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedNeighborhood ? regionData[selectedSido]?.districts?.[selectedSigungu]?.neighborhoods?.[selectedNeighborhood] || '읍면동을 선택하세요' : '읍면동을 선택하세요'}
            {selectedSigungu && (
              <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${openDropdowns.neighborhood ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {selectedSido && selectedSigungu && openDropdowns.neighborhood && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {regionData[selectedSido]?.districts?.[selectedSigungu]?.neighborhoods?.map((neighborhood, index) => (
                <button
                  key={`neighborhood-${index}`}
                  onClick={() => onNeighborhoodSelect(index, regionData)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedNeighborhood === index ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                  }`}
                >
                  {neighborhood || '이름 없음'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionSelector
