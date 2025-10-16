import React from 'react'
import { Calendar, TrendingUp, ExternalLink } from 'lucide-react'
import { getRegionNames } from '@/utils/regionData'

const HouseInfoPanel = ({
  selectedSido,
  selectedSigungu,
  selectedNeighborhood,
  houseApplyInfo,
  isLoading,
  error,
  onHouseSelect,
  onRetry,
  onRegionComplete,
  targetAmount,
  isValidTargetAmount
}) => {
  const { sidoName, sigunguName, neighborhoodName } = getRegionNames(selectedSido, selectedSigungu, selectedNeighborhood)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">주택 신청 정보</h3>
      
      {selectedSido && selectedSigungu && selectedNeighborhood && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-blue-600 mb-2">선택된 지역</div>
              <div className="font-semibold text-blue-800 text-sm">
                {sidoName} {sigunguName} {neighborhoodName}
              </div>
            </div>
          </div>
          
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">주택 정보를 불러오는 중...</p>
            </div>
          )}
          
          {/* 에러 상태 */}
          {error && !isLoading && (
            <div className="text-center py-4">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={() => onRetry(sidoName, sigunguName, neighborhoodName)}
                className="text-sm text-teal-600 hover:text-teal-700 underline"
              >
                다시 시도
              </button>
            </div>
          )}
          
          {/* 주택 신청 정보 리스트 */}
          {!isLoading && !error && houseApplyInfo.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {houseApplyInfo.map((house, index) => (
                <div 
                  key={`house-${index}-${house?.houseName || 'unknown'}`} 
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onHouseSelect(house)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">
                        {house?.houseName || '이름 없음'}
                      </h4>
                      {house?.overheated === 'Y' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full whitespace-nowrap">
                          과열지역
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>청약시작일: {house?.applyStartDate || '정보없음'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>경쟁률: {house?.competitionRate ? `${house.competitionRate}:1` : '정보없음'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">분양가: {house?.supplyAmount && typeof house.supplyAmount === 'number' ? `${house.supplyAmount.toLocaleString()}만원` : '정보없음'}</span>
                      </div>
                    </div>
                    
                    {house?.homepage && (
                      <a
                        href={house.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        홈페이지
                      </a>
                    )}
                    
                    <div className="text-xs text-teal-600 text-center pt-2 border-t border-gray-200">
                      클릭하면 목표금액이 자동 설정됩니다
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 주택 정보가 없는 경우 */}
          {!isLoading && !error && houseApplyInfo.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">해당 지역의<br />주택 신청 정보가<br />없습니다</p>
            </div>
          )}
          
          <button
            onClick={onRegionComplete}
            disabled={!isValidTargetAmount()}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
              isValidTargetAmount()
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isValidTargetAmount() ? '가입정보 입력하기' : '모든 정보를 입력해주세요'}
          </button>
        </div>
      )}
      
      {/* 지역 선택이 완료되지 않은 경우 안내 메시지 */}
      {(!selectedSido || !selectedSigungu || !selectedNeighborhood) && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">지역을 선택하면<br />주택 신청 정보를<br />확인할 수 있습니다</p>
        </div>
      )}
    </div>
  )
}

export default HouseInfoPanel
