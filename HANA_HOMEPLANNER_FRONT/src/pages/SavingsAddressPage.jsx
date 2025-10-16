import { Layout } from "@/components/layout/layout"
import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

// 커스텀 훅들
import { useRegionSelection } from "@/hooks/useRegionSelection"
import { useHouseInfo } from "@/hooks/useHouseInfo"
import { useTargetAmount } from "@/hooks/useTargetAmount"

// 컴포넌트들
import RegionSelector from "@/components/region/RegionSelector"
import TargetAmountInput from "@/components/savings/TargetAmountInput"
import HouseInfoPanel from "@/components/house/HouseInfoPanel"

// 데이터 및 유틸리티
import { getSavingsTypeById } from "@/data/savingsTypes"
import { regionData, getRegionNames } from "@/utils/regionData"

export default function SavingsAddressPage() {
  const { savingsId } = useParams()
  const navigate = useNavigate()
  
  // 커스텀 훅들 사용
  const {
    selectedSido,
    selectedSigungu,
    selectedNeighborhood,
    openDropdowns,
    handleSidoSelect,
    handleSigunguSelect,
    handleNeighborhoodSelect,
    toggleDropdown,
    isSelectionComplete
  } = useRegionSelection()

  const {
    houseApplyInfo,
    isLoading,
    error,
    fetchHouseApplyInfo,
    retryFetch
  } = useHouseInfo()

  const {
    targetAmount,
    handleTargetAmountChange,
    calculateTargetAmountFromHouse,
    isValidTargetAmount,
    getFormattedTargetAmount
  } = useTargetAmount()

  // 적금 유형 정보
  const currentProduct = getSavingsTypeById(savingsId)

  // 지역 선택 완료 시 API 호출
  useEffect(() => {
    if (isSelectionComplete()) {
      const { sidoName, sigunguName, neighborhoodName } = getRegionNames(selectedSido, selectedSigungu, selectedNeighborhood)
      
      if (sidoName && sigunguName && neighborhoodName) {
        fetchHouseApplyInfo(sidoName, sigunguName, neighborhoodName)
      }
    }
  }, [selectedSido, selectedSigungu, selectedNeighborhood, isSelectionComplete, fetchHouseApplyInfo])

  // 주택 선택 시 목표금액 자동 설정
  const handleHouseSelect = (house) => {
    calculateTargetAmountFromHouse(house)
  }

  // 지역 선택 완료 시 다음 페이지로 이동
  const handleRegionComplete = () => {
    if (savingsId) {
      navigate(`/savings-signup/${savingsId}`, {
        state: {
          selectedSido,
          selectedSigungu,
          selectedNeighborhood,
          targetAmount
        }
      })
    }
  }

  // 재시도 핸들러
  const handleRetry = (sidoName, sigunguName, neighborhoodName) => {
    if (sidoName && sigunguName && neighborhoodName) {
      retryFetch(sidoName, sigunguName, neighborhoodName)
    }
  }

  return (
    <Layout currentPage="savings" backgroundColor="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto max-w-[1200px] px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/savings-recommendation')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">적금 가입</h1>
              <span className="text-sm text-gray-500">- {currentProduct?.title}</span>
              <span className="text-sm text-blue-600">• 지역 선택 필요</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1200px] px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">지역을 선택해주세요</h2>
          <p className="text-lg text-gray-600">시도 → 시군구 → 읍면동 순서로 선택해주세요</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 지역 선택 폼 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <RegionSelector
                  selectedSido={selectedSido}
                  selectedSigungu={selectedSigungu}
                  selectedNeighborhood={selectedNeighborhood}
                  openDropdowns={openDropdowns}
                  onSidoSelect={handleSidoSelect}
                  onSigunguSelect={handleSigunguSelect}
                  onNeighborhoodSelect={handleNeighborhoodSelect}
                  onToggleDropdown={toggleDropdown}
                />

                <TargetAmountInput
                  targetAmount={targetAmount}
                  onTargetAmountChange={handleTargetAmountChange}
                  getFormattedTargetAmount={getFormattedTargetAmount}
                />
              </div>
            </div>

            {/* 우측 주택 신청 정보 */}
            <div className="lg:col-span-1">
              <HouseInfoPanel
                selectedSido={selectedSido}
                selectedSigungu={selectedSigungu}
                selectedNeighborhood={selectedNeighborhood}
                houseApplyInfo={houseApplyInfo}
                isLoading={isLoading}
                error={error}
                onHouseSelect={handleHouseSelect}
                onRetry={handleRetry}
                onRegionComplete={handleRegionComplete}
                targetAmount={targetAmount}
                isValidTargetAmount={isValidTargetAmount}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
