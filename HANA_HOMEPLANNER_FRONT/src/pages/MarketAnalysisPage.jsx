import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/layout"
import { TrendingUp, TrendingDown, Home, Building, Calendar, Filter, HomeIcon, X, PiggyBank, ExternalLink, Bell } from 'lucide-react'
import KakaoMapComponent from "@/components/map/kakao-map"
import { mockSubscriptionData, mockAreaData, upcomingSubscriptionData } from "@/data/mockData"
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { getIndividualHouseData } from '@/utils/individualHouseService';

import { PaymentInfoPanel } from "@/components/market-analysis/PaymentInfoPanel"
import HouseTypePanel from "@/components/market-analysis/HouseTypePanel"
import LeftHouseTypePanel from "@/components/market-analysis/LeftHouseTypePanel"
import { RightLoanPlannerPanel } from "@/components/market-analysis/RightLoanPlannerPanel"
import { FilterSidebar } from "@/components/market-analysis/FilterSidebar"
import Snackbar from "@/components/common/Snackbar"

// 커스텀 훅들 import
import { useSubscriptionData } from "@/hooks/useSubscriptionData"
import { useHouseData } from "@/hooks/useHouseData"
import { useSearch } from "@/hooks/useSearch"
import { useSigunguStats } from "@/hooks/useSigunguStats"
import { useHouseDetails } from "@/hooks/useHouseDetails"
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription"
import { useRealTimeFilter } from "@/hooks/useRealTimeFilter"
import useErrorNotification from "@/hooks/useErrorNotification"
import { useLoanPlanner } from "@/hooks/useLoanPlanner"
import { getCacheStatus, cleanupExpiredCache } from "@/utils/cacheUtils"
import { usePdfViewer } from "@/hooks/usePdfViewer"
import PdfViewerModal from "@/components/common/PdfViewerModal"

// 유틸리티 함수들 import
import { parsePrice, calculateTenPercent, getPriceMarkers } from "@/utils/priceUtils"
import { getAreaPriceMarkers } from "@/utils/coordinateUtils"

// Reusable Search Panel Component for the overlay
const OverlaySearchPanel = ({ selectedRegion, setSelectedRegion, searchQuery, setSearchQuery, cities, getDistricts, getDongs, onSearch }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
    <div className="flex items-center gap-2 text-sm">
      <select className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white" value={selectedRegion.city} onChange={(e) => setSelectedRegion({ ...selectedRegion, city: e.target.value, district: '', dong: '' })}>
        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
      </select>
      <select className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white" value={selectedRegion.district} onChange={(e) => setSelectedRegion({ ...selectedRegion, district: e.target.value, dong: '' })} disabled={!selectedRegion.city}>
        <option value="">시군구</option>
        {getDistricts(selectedRegion.city).map((district) => <option key={district} value={district}>{district}</option>)}
      </select>
      <select className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white" value={selectedRegion.dong} onChange={(e) => setSelectedRegion({ ...selectedRegion, dong: e.target.value })} disabled={!selectedRegion.district}>
        <option value="">읍면동</option>
        {getDongs(selectedRegion.city, selectedRegion.district).map((dong) => <option key={dong} value={dong}>{dong}</option>)}
      </select>
      
      <div className="relative flex-grow">
        <input type="text" placeholder="주소나 단지명으로 검색" className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      
      <button 
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 flex-shrink-0"
        onClick={onSearch}
        disabled={!selectedRegion.city || !selectedRegion.district || !selectedRegion.dong}
      >
        <span>검색</span>
      </button>
    </div>
  </div>
);

export default function MarketAnalysisPage() {
  const [selectedRegion, setSelectedRegion] = useState({
    city: "서울특별시",
    district: "강남구",
    dong: "역삼동",
    area: "84",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [regionDetails, setRegionDetails] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isRealTimeMode, setIsRealTimeMode] = useState(true); // 기본적으로 실시간 모드 활성화
  const [realTimeFilters, setRealTimeFilters] = useState({}); // 실시간 데이터 필터 상태
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false); // 필터 사이드바 상태

  // 실시간 청약 데이터 훅
  const {
    realTimeData,
    isLoading: isRealTimeLoading,
    error: realTimeError,
    lastUpdated,
    refetch: refetchRealTimeData
  } = useRealTimeSubscription();

  // 주택 상세 정보 및 JSON 데이터 훅
  const {
    houseDetails,
    jsonData,
    isLoading: isHouseDetailsLoading,
    getIndividualHouseMarkers,
    getJsonDataById,
    getJsonDataByHouseManageNo,
    refetch: refetchHouseDetails
  } = useHouseDetails();

  // 실시간 데이터 필터링 훅
  const {
    filteredData: filteredRealTimeData,
    filterStats: realTimeFilterStats,
    filterOptions: realTimeFilterOptions
  } = useRealTimeFilter(realTimeData, realTimeFilters);

  // 실시간 데이터는 필터링된 데이터 사용
  const displayRealTimeData = filteredRealTimeData;

  // 에러 알림 관리
  const { errors, addError, removeError } = useErrorNotification();

  // JSON 데이터를 전역으로 설정
  useEffect(() => {
    if (jsonData && jsonData.length > 0) {
      window.houseJsonData = jsonData;
      console.log('[전역 JSON 데이터] 설정 완료:', jsonData.length, '개 데이터');
    }
  }, [jsonData]);

  // 캐시 상태 확인 및 정리
  useEffect(() => {
    const checkCacheStatus = () => {
      const status = getCacheStatus();
      console.log('[캐시 상태]', status);
      
      // 만료된 캐시 정리
      const cleanedCount = cleanupExpiredCache();
      if (cleanedCount > 0) {
        console.log(`[캐시 정리] ${cleanedCount}개의 만료된 데이터 정리됨`);
      }
    };

    // 페이지 로드 시 캐시 상태 확인
    checkCacheStatus();
    
    // 10분마다 캐시 정리
    const interval = setInterval(checkCacheStatus, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 개별 아파트 마커 예시 데이터
  const individualAptMarkers = [
    {
      id: 1,
      name: "래미안강동팰리스",
      lat: 37.5595,
      lng: 127.0129,
      price: "8억 5,000만원",
      area: "84.98㎡",
      completionYear: 2020,
      transactionCount: 15,
      priceRange: "7.8억 ~ 9.2억",
      recentTransaction: "8.1억원 (2024.01)",
      type: "아파트"
    },
    {
      id: 2,
      name: "힐스테이트강동",
      lat: 37.5598,
      lng: 127.0132,
      price: "8억 8,000만원",
      area: "109.12㎡",
      completionYear: 2020,
      transactionCount: 8,
      priceRange: "8.2억 ~ 9.5억",
      recentTransaction: "8.6억원 (2024.01)",
      type: "아파트"
    },
    {
      id: 3,
      name: "아크로리버파크",
      lat: 37.5592,
      lng: 127.0125,
      price: "7억 9,000만원",
      area: "59.98㎡",
      completionYear: 2019,
      transactionCount: 22,
      priceRange: "7.5억 ~ 8.3억",
      recentTransaction: "7.7억원 (2024.01)",
      type: "아파트"
    },
    {
      id: 4,
      name: "자이강동",
      lat: 37.5601,
      lng: 127.0135,
      price: "9억 2,000만원",
      area: "109.12㎡",
      completionYear: 2021,
      transactionCount: 5,
      priceRange: "8.8억 ~ 9.6억",
      recentTransaction: "9.0억원 (2024.01)",
      type: "아파트"
    },
    {
      id: 5,
      name: "래미안강동팰리스",
      lat: 37.5589,
      lng: 127.0121,
      price: "7억 6,000만원",
      area: "59.98㎡",
      completionYear: 2020,
      transactionCount: 18,
      priceRange: "7.2억 ~ 8.0억",
      recentTransaction: "7.4억원 (2024.01)",
      type: "아파트"
    }
  ];

  // 시군구별 평균분양가 상세 정보 모달 상태 추가
  const [isAreaPriceModalOpen, setIsAreaPriceModalOpen] = useState(false);
  const [selectedAreaPriceData, setSelectedAreaPriceData] = useState(null);
  const [isRealTimeDetailModalOpen, setIsRealTimeDetailModalOpen] = useState(false);
  const [selectedRealTimeData, setSelectedRealTimeData] = useState(null);

  // PaymentInfoPanel 상태 추가
  const [isPaymentInfoPanelOpen, setIsPaymentInfoPanelOpen] = useState(false);
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState(null);

  // 주택형별 정보 패널 상태 추가
  const [isHouseTypePanelOpen, setIsHouseTypePanelOpen] = useState(false);
  const [selectedHouseManageNo, setSelectedHouseManageNo] = useState(null);
  const [selectedHouseName, setSelectedHouseName] = useState(null);
  const [selectedHtmlContent, setSelectedHtmlContent] = useState(null);

  // 좌측 주택형별 정보 패널 상태 추가
  const [isLeftHouseTypePanelOpen, setIsLeftHouseTypePanelOpen] = useState(false);
  const [leftPanelHouseName, setLeftPanelHouseName] = useState(null);
  const [leftPanelHtmlContent, setLeftPanelHtmlContent] = useState(null);
  const [leftPanelJsonData, setLeftPanelJsonData] = useState(null);
  const [leftPanelHouseData, setLeftPanelHouseData] = useState(null);

  // 우측 대출 플래너 패널 상태 추가
  const [isRightLoanPlannerPanelOpen, setIsRightLoanPlannerPanelOpen] = useState(false);
  const [selectedPropertyForLoanPlanner, setSelectedPropertyForLoanPlanner] = useState(null);

  // 대출 플래너 훅 초기화
  const {
    isLoading: isLTVLoading,
    ltvResult,
    error: ltvError,
    adjustments,
    adjustedResult,
    calculateLTV,
    adjustLoanAmount,
    adjustLoanPeriod,
    adjustInterestRate,
    adjustRepaymentType,
    toggleStressRateMode,
    generatePlanSuggestions,
    resetResult: resetLTVResult
  } = useLoanPlanner();

  // PDF 뷰어 훅 초기화
  const { 
    isLoading: isPdfLoading, 
    error: pdfError, 
    pdfUrl, 
    isModalOpen: isPdfModalOpen, 
    openPdfViewer, 
    closePdfViewer 
  } = usePdfViewer();

  // 대출 플래너 핸들러 함수들
  const handleCalculateLTV = async () => {
    if (!selectedPropertyForLoanPlanner) return;

    const formData = {
      propertyPrice: selectedPropertyForLoanPlanner.price || 50000, // 기본값 설정
      region: "seoul", // 기본값
      housingStatus: "none", // 기본값
      borrowerType: "general", // 기본값
      creditGrade: "3", // 기본값
      downPaymentRatio: "20", // 기본값
      collateralRatio: "100", // 기본값
      dsrRatio: "40", // 기본값
      loanInterestRate: "4.5", // 기본값
      loanTermYears: "30", // 기본값
      existingLoanRepayment: "0", // 기본값
      desiredLoanAmount: (selectedPropertyForLoanPlanner.price || 50000) * 0.7 * 10000, // 주택가격의 70%
      loanPeriod: 30,
      interestRate: 4.5
    };

    try {
      await calculateLTV(formData);
    } catch (error) {
      console.error('LTV 계산 오류:', error);
    }
  };

  const handleSelectPlan = (planId) => {
    const suggestions = generatePlanSuggestions();
    const selectedPlan = suggestions.find(plan => plan.id === planId);
    if (selectedPlan) {
      adjustLoanAmount(selectedPlan.loanAmount);
    }
  };

  const handlePreApproval = () => {
    console.log('사전한도 조회 요청');
  };

  const handleCalendarExport = () => {
    console.log('캘린더 내보내기 요청');
  };

  const handlePDFDownload = () => {
    console.log('PDF 다운로드 요청');
  };

  // 호버창 카드 클릭 시 PaymentInfoPanel 열기 함수
  const handleHoverCardClick = (propertyData) => {
    // 모든 호버창 숨기기
    const state = window.htmlPreviewState;
    if (state && state.currentPopup) {
      window.hideHtmlPreview(state.currentPopup);
    }
    
    // 일반적인 숨기기 함수도 호출
    if (window.hideHtmlPreview && typeof window.hideHtmlPreview === 'function') {
      window.hideHtmlPreview();
    }
    
    // PaymentInfoPanel 열기
    setSelectedPropertyForPayment(propertyData);
    setIsPaymentInfoPanelOpen(true);
  };

  // 마커 클릭 시 주택형별 정보 패널 열기 함수
  const handleHouseTypePanelClick = (houseManageNo, houseName, htmlContent) => {
    // 모든 호버창 숨기기
    const state = window.htmlPreviewState;
    if (state && state.currentPopup) {
      window.hideHtmlPreview(state.currentPopup);
    }
    
    // PaymentInfoPanel 닫기
    setIsPaymentInfoPanelOpen(false);
    
    // 주택형별 정보 패널 열기
    setSelectedHouseManageNo(houseManageNo);
    setSelectedHouseName(houseName);
    setSelectedHtmlContent(htmlContent);
    setIsHouseTypePanelOpen(true);
  };

  // 좌측 패널 열기 함수
  const openLeftHouseTypePanel = (houseName, htmlContent, jsonData, houseData = null) => {
    console.log('🚨 openLeftHouseTypePanel 호출됨!');
    console.log('🔍 openLeftHouseTypePanel - houseName:', houseName);
    console.log('🔍 openLeftHouseTypePanel - houseData:', houseData);
    console.log('🔍 openLeftHouseTypePanel - houseData 타입:', typeof houseData);
    if (houseData) {
      console.log('🔍 openLeftHouseTypePanel - houseData 키들:', Object.keys(houseData));
    }
    
    setLeftPanelHouseName(houseName);
    setLeftPanelHtmlContent(htmlContent);
    setLeftPanelJsonData(jsonData);
    setLeftPanelHouseData(houseData);
    setIsLeftHouseTypePanelOpen(true);
  };

  // 전역 함수로 등록하여 카카오맵 컴포넌트에서 호출 가능하도록 함
  useEffect(() => {
    window.handleHoverCardClick = handleHoverCardClick;
    window.handleHouseTypePanelClick = handleHouseTypePanelClick;
    window.openLeftHouseTypePanel = openLeftHouseTypePanel;
    window.openPdfViewer = openPdfViewer;
    
    return () => {
      delete window.handleHoverCardClick;
      delete window.handleHouseTypePanelClick;
      delete window.openLeftHouseTypePanel;
      delete window.openPdfViewer;
    };
  }, [openPdfViewer]);

  // 캐시 상태 모니터링 및 정리
  useEffect(() => {
    // 페이지 로드 시 캐시 상태 확인
    const cacheStatus = getCacheStatus();
    console.log('🔍 [캐시 상태] 페이지 로드 시 캐시 현황:', {
      totalItems: cacheStatus.totalItems,
      expiredItems: cacheStatus.items.filter(item => item.isExpired).length
    });

    // 만료된 캐시 정리
    const cleanedCount = cleanupExpiredCache();
    if (cleanedCount > 0) {
      console.log(`🧹 [캐시 정리] 만료된 캐시 ${cleanedCount}개 정리 완료`);
    }

    // 주기적으로 캐시 정리 (5분마다)
    const cacheCleanupInterval = setInterval(() => {
      const cleaned = cleanupExpiredCache();
      if (cleaned > 0) {
        console.log(`🧹 [캐시 정리] 주기적 정리: ${cleaned}개 만료된 캐시 제거`);
      }
    }, 5 * 60 * 1000); // 5분

    return () => {
      clearInterval(cacheCleanupInterval);
    };
  }, []);

  // 커스텀 훅들 사용
  const {
    subscriptionCalendarData,
    subscriptionDateRange,
    setSubscriptionDateRange,
    isLoadingSubscription,
    fetchSubscriptionCalendarData,
    getSortedSubscriptionData,
    handleDateRangeChange,
  } = useSubscriptionData();

  const { priceData, areaPriceData } = useHouseData();
  
  const {
    searchResults,
    isSearching,
    searchError,
    handleSearch,
  } = useSearch();

  // 시군구 통계 데이터 훅
  const {
    sigunguStats,
    isLoading: isSigunguLoading,
    error: sigunguError,
    getSigunguMarkers
  } = useSigunguStats();


  // 검색 결과로 스크롤 제어
  const resultsRef = useRef(null);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const RESULTS_SCROLL_OFFSET = 200; // 헤더/마진 고려 상단 여백 (원하시는 만큼 조절 가능)
  const [hasSearched, setHasSearched] = useState(false);

  // 검색 트리거 래퍼: 검색 시작 시 스크롤 플래그 설정
  const handleSearchWithScroll = (region) => {
    setHasSearched(true);
    setShouldScrollToResults(true);
    handleSearch(region);
  };

  // 검색 종료 시점에 딱 1번만 스크롤 수행
  useEffect(() => {
    if (!isSearching && shouldScrollToResults && Array.isArray(searchResults) && searchResults.length > 0) {
      // DOM 업데이트 이후로 미루어 정확한 위치 계산
      const scrollTask = () => {
        if (resultsRef.current) {
          const rect = resultsRef.current.getBoundingClientRect();
          const targetY = rect.top + window.scrollY - RESULTS_SCROLL_OFFSET; // 상단 여백 적용
          const doc = document.documentElement;
          const maxY = Math.max(0, (doc.scrollHeight - window.innerHeight) - 16); // 바닥으로 붙지 않도록 여유 16px
          const clampedY = Math.min(targetY, maxY);
          window.scrollTo({ top: clampedY, behavior: 'smooth' });
        }
        setShouldScrollToResults(false);
      };
      // 두 프레임 뒤로 미뤄 레이아웃 안정화 보장
      requestAnimationFrame(() => requestAnimationFrame(scrollTask));
    }
  }, [isSearching, shouldScrollToResults, searchResults]);

  // 기존 mapMarkers를 API 데이터 기반으로 변경
  const mapMarkers = [];

  // 마커 클릭 핸들러 (좌측 패널 열기) - 최적화된 버전
  const handleMarkerClick = async (marker) => {
    console.log('🚨 마커 클릭 핸들러 호출됨!');
    console.log('[마커 클릭] 좌측 패널 열기:', marker);
    console.log('🔍 마커 클릭 - marker.houseManageNo:', marker?.houseManageNo);
    console.log('🔍 마커 클릭 - marker.id:', marker?.id);
    console.log('🔍 마커 클릭 - 마커 전체 필드:', Object.keys(marker || {}));
    console.log('🔍 마커 클릭 - marker.isRealTime:', marker?.isRealTime);
    
    // 실시간 데이터인 경우에만 좌측 패널 열기
    if (marker.isRealTime) {
      try {
        const houseManageNo = marker.houseManageNo;
        
        if (!houseManageNo) {
          console.warn('⚠️ houseManageNo가 없습니다:', marker);
          return;
        }
        
        console.log('🔍 [시세분석] 최적화된 개별 주택 정보 조회 시작:', houseManageNo);
        
        // 최적화된 개별 주택 정보 조회 (캐싱 및 중복 요청 방지 적용)
        const jsonData = await getIndividualHouseData(houseManageNo);
        
        if (jsonData) {
          console.log('✅ [시세분석] 개별 주택 정보 조회 성공:', {
            houseName: marker.houseName,
            houseManageNo: houseManageNo,
            dataSource: 'Optimized Individual API'
          });
          
          setLeftPanelHouseName(marker.houseName);
          setLeftPanelJsonData(jsonData);
          setLeftPanelHouseData(marker);
          setIsLeftHouseTypePanelOpen(true);
          
          console.log('🔍 시세분석 - 좌측 패널로 전달할 마커 데이터 전체:', marker);
          console.log('🔍 시세분석 - 조회된 JSON 데이터:', jsonData);
        } else {
          console.warn('⚠️ [시세분석] 개별 주택 정보 조회 실패:', houseManageNo);
        }
      } catch (error) {
        console.error('❌ [시세분석] 개별 주택 정보 조회 오류:', error);
      }
    }
  };

  // 폴리곤 클릭 핸들러 (시군구 청약 데이터 표시)
  const handlePolygonClick = (districtName) => {
    const cleanDistrictName = districtName.replace(/시$|구$|군$/, ""); // 시,구,군 제거
    const matchingDistrict = Object.keys(mockSubscriptionData).find(
      (key) =>
        key.includes(cleanDistrictName) ||
        cleanDistrictName.includes(key.replace(/구$/, ""))
    );

    if (matchingDistrict && mockSubscriptionData[matchingDistrict]) {
      setSelectedDistrict(matchingDistrict);
      setSubscriptionData(mockSubscriptionData[matchingDistrict]);
      setIsSubscriptionModalOpen(true);
    } else {
      console.log("[청약 데이터] 해당 지역 데이터 없음:", districtName);
    }
  };

  // 모달 닫기 함수들
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const closeSubscriptionModal = () => {
    setIsSubscriptionModalOpen(false);
    setSelectedDistrict(null);
    setSubscriptionData([]);
  };

  // 청약 알림 모달 핸들러
  const openUpcomingModal = () => {
    setIsUpcomingModalOpen(true);
    // 모달 열 때 기본 데이터 로드
    fetchSubscriptionCalendarData();
  };

  const closeUpcomingModal = () => {
    setIsUpcomingModalOpen(false);
  };

  // 지역 클릭 핸들러 (토글 기능 포함)
  const handleRegionClick = (regionName) => {
    // 같은 지역을 클릭하면 토글 (닫기)
    if (hoveredRegion === regionName) {
      setHoveredRegion(null);
      setRegionDetails(null);
      return;
    }

    // 다른 지역을 클릭하면 새로운 정보 표시
    setHoveredRegion(regionName);
    const regionData = priceData
      .filter((item) => item.region === regionName)
      .sort((a, b) => b.year - a.year); // 2025년부터 내림차순 정렬
    setRegionDetails(regionData);
  };

  // 지도 이동 및 줌 핸들러 추가
  const mapRef = useRef(null);

  // 시군구별 평균분양가 마커 클릭 핸들러 (지도 이동 및 줌 기능 추가)
  const handleAreaPriceMarkerClick = (areaPriceData) => {
    // 상세 정보 모달 표시
    setSelectedAreaPriceData(areaPriceData);
    setIsAreaPriceModalOpen(true);
    
    // 지도를 해당 위치로 이동하고 개별 아파트 마커가 보이게 줌인
    if (mapRef.current && mapRef.current.moveToLocationAndZoom) {
      mapRef.current.moveToLocationAndZoom(areaPriceData.lat, areaPriceData.lng, 6); // 줌 레벨 6으로 설정하여 개별 아파트 마커가 보이게 함
    }
  };

  // 시군구 마커 클릭 시 상세 정보 표시 (API 데이터 기반)
  const handleSigunguMarkerClick = (sigunguData) => {
    // 시군구별 상세 정보를 위한 데이터 구조 생성
    const sigunguDetailData = {
      sigungu: sigunguData.sigungu,
      regionLarge: sigunguData.regionLarge,
      avgPrice: sigunguData.avgPrice,
      minPrice: sigunguData.minPrice,
      maxPrice: sigunguData.maxPrice,
      weightedAvgPrice: sigunguData.weightedAvgPrice,
      complexCount: sigunguData.complexCount,
      // 기존 모달과 호환성을 위한 구조
      priceInfo: {
        averagePrice: sigunguData.avgPrice,
        size60Less: sigunguData.minPrice,
        size60Over85Less: sigunguData.avgPrice,
        size85More: sigunguData.maxPrice
      }
    };
    
    setSelectedAreaPriceData(sigunguDetailData);
    setIsAreaPriceModalOpen(true);
    
    // 지도를 해당 위치로 이동하고 개별 아파트 마커가 보이게 줌인
    if (mapRef.current && mapRef.current.moveToLocationAndZoom) {
      mapRef.current.moveToLocationAndZoom(sigunguData.lat, sigunguData.lng, 6);
    }
  };

  // 개별 주택 마커 클릭 시 상세 정보 표시
  const handleIndividualHouseClick = (houseData) => {
    console.log('개별 주택 클릭:', houseData);
    
    // 개별 주택 상세 정보를 위한 데이터 구조 생성
    const houseDetailData = {
      houseName: houseData.houseName,
      regionName: houseData.regionName,
      sigungu: houseData.sigungu,
      sido: houseData.sido,
      addrRaw: houseData.addrRaw,
      areaM2: houseData.areaM2,
      price: houseData.price,
      generalSupplyHouseholds: houseData.generalSupplyHouseholds,
      specialSupplyHouseholds: houseData.specialSupplyHouseholds,
      totalHouseholds: houseData.totalHouseholds,
      // 기존 모달과 호환성을 위한 구조
      priceInfo: {
        averagePrice: houseData.price,
        size60Less: houseData.price,
        size60Over85Less: houseData.price,
        size85More: houseData.price
      }
    };
    
    setSelectedAreaPriceData(houseDetailData);
    setIsAreaPriceModalOpen(true);
  };

  // 시군구별 평균분양가 모달 닫기
  const closeAreaPriceModal = () => {
    setIsAreaPriceModalOpen(false);
    setSelectedAreaPriceData(null);
  };

  // 실시간 청약 상세 정보 모달 닫기
  const closeRealTimeDetailModal = () => {
    setIsRealTimeDetailModalOpen(false);
    setSelectedRealTimeData(null);
  };

  // 실시간 데이터 토글 핸들러
  const handleToggleDataMode = () => {
    console.log(`[모드 전환] 현재 모드: ${isRealTimeMode ? '실시간' : '과거'} -> ${!isRealTimeMode ? '실시간' : '과거'}`);
    
    // 모드 전환 시 기존 상태 초기화
    setHoveredRegion(null);
    setRegionDetails(null);
    setSelectedProperty(null);
    setSelectedAreaPriceData(null);
    setSelectedRealTimeData(null);
    
    setIsRealTimeMode(!isRealTimeMode);
    
    // 실시간 모드로 전환 시 데이터 새로고침
    if (!isRealTimeMode) {
      console.log('[모드 전환] 실시간 데이터 새로고침 시작');
      refetchRealTimeData();
    }
  };

  // 실시간 데이터 필터링 핸들러
  const handleRealTimeFilterChange = (filters) => {
    console.log('[실시간 필터] 필터 변경:', filters);
    console.log('[실시간 필터] 기존 마커 정리 후 필터링된 마커만 표시');
    
    // 필터 변경 전에 잠시 지연을 두어 드래그 중 중복 호출 방지
    setTimeout(() => {
      setRealTimeFilters(filters);
    }, 50);
  };


  // 에러 발생 시 Snackbar로 표시
  useEffect(() => {
    if (sigunguError) {
      addError({
        message: '시군구 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        type: 'error',
        details: sigunguError
      });
    }
  }, [sigunguError, addError]);


  useEffect(() => {
    if (realTimeError) {
      addError({
        message: '실시간 청약 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        type: 'error',
        details: realTimeError
      });
    }
  }, [realTimeError, addError]);

  // 지급 정보 패널 상태 관리 (위에서 이미 정의됨)
  // const [isPaymentPanelVisible, setIsPaymentPanelVisible] = useState(false);
  // const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState(null);

  // 지급 정보 패널 열기
  const openPaymentPanel = (property) => {
    setSelectedPropertyForPayment(property);
    setIsPaymentInfoPanelOpen(true);
  };

  // 지급 정보 패널 닫기
  const closePaymentPanel = () => {
    setIsPaymentInfoPanelOpen(false);
    setSelectedPropertyForPayment(null);
  };

  // 지역 선택 변경 핸들러
  const handleRegionChange = (field, value) => {
    const newRegion = { ...selectedRegion, [field]: value };
    
    // 시군구나 읍면동이 변경되면 해당하는 하위 옵션들을 초기화
    if (field === 'city') {
      newRegion.district = '';
      newRegion.dong = '';
    } else if (field === 'district') {
      newRegion.dong = '';
    }
    
    setSelectedRegion(newRegion);
  };

  // 청약 카드 컴포넌트
  const SubscriptionCard = ({ apt, type = "normal" }) => {
    const getCardStyle = () => {
      switch (type) {
        case "todayStart":
          return "border-2 border-green-400 bg-green-50 hover:shadow-lg";
        case "todayEnd":
          return "border-2 border-red-400 bg-red-50 hover:shadow-lg";
        default:
          return "border border-gray-200 hover:border-teal-200 hover:shadow-md";
      }
    };

    const getBadge = () => {
      switch (type) {
        case "todayStart":
          return (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              시작
            </span>
          );
        case "todayEnd":
          return (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              마감
            </span>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={`rounded-lg p-5 transition-all relative ${getCardStyle()}`}
      >
        {getBadge() && (
          <div className="absolute top-3 right-3">{getBadge()}</div>
        )}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apt.houseSecdNm === "민영"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                🏢 {apt.houseSecdNm}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                📍 {apt.subscrptAreaCodeNm}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
              🏘️ {apt.houseNm}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  📆 청약접수: {apt.rceptBgnDe} ~ {apt.rceptEndDe}
                </span>
              </div>
              {apt.rcruitPblancDe !== "정보 없음" && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4"></span>
                  <span>📋 모집공고: {apt.rcruitPblancDe}</span>
                </div>
              )}
              {apt.prizeWnerPresnatnDe !== "정보 없음" && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4"></span>
                  <span>🎯 당첨발표: {apt.prizeWnerPresnatnDe}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <a
            href={apt.pblancUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            🔗 상세보기
          </a>
        </div>
      </div>
    );
  };

  return (
    <Layout currentPage="market-analysis" backgroundColor="bg-gray-50" hideFooter={true}>
      {/* 필터 사이드바 */}
      <FilterSidebar
        realTimeData={realTimeData}
        onFilterChange={handleRealTimeFilterChange}
        isRealTimeMode={isRealTimeMode}
        isOpen={true}
        onToggle={setIsFilterSidebarOpen}
      />
      
      <div className="w-full h-full flex flex-col" style={{ height: 'calc(100vh - 95px)' }}>
        
        <div className="h-full relative">
          {/* Full Map */}
          <div className="h-full relative">

            {/* API 로딩 상태 표시 */}
            {isSigunguLoading && (
              <div className="absolute top-4 left-32 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm z-50">
                시군구 데이터 로딩 중...
              </div>
            )}
            

            
            {/* 주택 상세 정보 로딩 상태 표시 */}
            {isHouseDetailsLoading && (
              <div className="absolute top-16 left-32 bg-green-500 text-white px-3 py-2 rounded-lg text-sm z-50">
                주택 상세 정보 로딩 중...
              </div>
            )}
            

            
            {/* 실시간 데이터 로딩 상태 표시 */}
            {isRealTimeLoading && (
              <div className="absolute top-24 left-32 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm z-50">
                실시간 청약 데이터 로딩 중...
              </div>
            )}
 
            <div className="h-full w-full">
              <KakaoMapComponent
                ref={mapRef}
                markers={mapMarkers}
                priceMarkers={getPriceMarkers(priceData)}
                areaPriceMarkers={getSigunguMarkers()} // API 데이터로 교체
                individualAptMarkers={(() => {
                  const markers = getIndividualHouseMarkers();
                  console.log('[MarketAnalysisPage] 개별 주택 마커 데이터:', markers.length, '개');
                  if (markers.length > 0) {
                    console.log('[MarketAnalysisPage] 첫 번째 마커:', markers[0]);
                  } else {
                    console.log('[MarketAnalysisPage] 개별 주택 마커 데이터가 없습니다');
                  }
                  return markers;
                })()}
                realTimeMarkers={displayRealTimeData}
                isRealTimeMode={isRealTimeMode}
                selectedMarkerStyle="classic"
                onToggleDataMode={handleToggleDataMode}
                lastUpdated={lastUpdated}
                isLoadingRealTime={isRealTimeLoading}
                onMarkerClick={handleMarkerClick}
                onPolygonClick={handlePolygonClick}
                onRegionClick={handleRegionClick}
                onAreaPriceMarkerClick={handleSigunguMarkerClick}
                onIndividualHouseClick={handleIndividualHouseClick}
              />
            </div>


            {/* 지역별 상세 정보 패널 - 우측 상단에서 조금 아래로 */}
            {regionDetails && hoveredRegion && (
              <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-40 border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    {hoveredRegion} 평균 시세
                  </h3>
                  <button
                    onClick={() => {
                      setHoveredRegion(null);
                      setRegionDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {regionDetails.map((yearData, index) => (
                    <div
                      key={`${yearData.region}-${yearData.year}`}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">
                          {yearData.year}년
                        </span>
                        <span className="text-lg font-bold text-teal-600">
                          {yearData.priceInfo.averagePrice}만원
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-gray-500">60㎡ 미만</p>
                          <p className="font-semibold">
                            {yearData.priceInfo.size60Less}만원
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-gray-500">60~85㎡</p>
                          <p className="font-semibold">
                            {yearData.priceInfo.size60Over85Less}만원
                          </p>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <p className="text-gray-500">85㎡ 초과</p>
                          <p className="font-semibold">
                            {yearData.priceInfo.size85More}만원
                          </p>
                        </div>
                      </div>

                      {index > 0 && (
                        <div className="mt-2 flex items-center justify-center">
                          {(() => {
                            const prevYear = regionDetails[index - 1];
                            const change =
                              yearData.priceInfo.averagePrice -
                              prevYear.priceInfo.averagePrice;
                            const changePercent = (
                              (change / prevYear.priceInfo.averagePrice) *
                              100
                            ).toFixed(1);
                            const isIncrease = change > 0;

                            return (
                              <span
                                className={`flex items-center gap-1 text-xs ${
                                  isIncrease
                                    ? "text-red-600"
                                    : change < 0
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {isIncrease ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : change < 0 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : null}
                                전년대비 {isIncrease ? "+" : ""}
                                {change.toFixed(0)}만원 ({isIncrease ? "+" : ""}
                                {changePercent}%)
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* 적금 제안 모달 */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 모달 헤더 */}
            <div className="text-center mb-6">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PiggyBank className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                청약 준비 적금 제안
              </h2>
              <p className="text-gray-600">{selectedProperty.complex}</p>
            </div>

            {/* 매물 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">매매가</span>
                  <p className="font-bold text-lg text-gray-800">
                    {selectedProperty.price}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">청약 준비금 (10%)</span>
                  <p className="font-bold text-lg text-teal-600">
                    {calculateTenPercent(selectedProperty.price)}억원
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">유형</span>
                  <p className="font-medium">{selectedProperty.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">면적</span>
                  <p className="font-medium">{selectedProperty.size}</p>
                </div>
              </div>
            </div>

            {/* 제안 내용 */}
            <div className="text-center mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                선택한 매물의{" "}
                <span className="font-bold text-teal-600">
                  {calculateTenPercent(selectedProperty.price)}억원
                </span>
                으로
                <br />
                해당 단지의 청약을 대비하기 위해선
                <br />
                이정도의 금액이 필요해요.
              </p>
              <p className="text-lg font-semibold text-gray-800">
                해당 목표금액으로 목표 적금에 가입해볼까요?
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                나중에
              </button>
              <button
                onClick={() => {
                  // 적금 추천 페이지로 이동하는 로직 추가 가능
                  alert("적금 상품 페이지로 이동합니다!");
                  closeModal();
                }}
                className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                적금 가입하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 청약 데이터 모달 */}
      {isSubscriptionModalOpen && subscriptionData.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden relative">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
              <button
                onClick={closeSubscriptionModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Building className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedDistrict} 청약 정보
                  </h2>
                  <p className="text-teal-100 mt-1">
                    과거 진행된 청약 현황을 확인하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              <div className="grid gap-6">
                {subscriptionData.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* 단지 기본 정보 */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">
                          {item.address}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            총 {item.households.toLocaleString()}세대
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "완료"
                                ? "bg-gray-100 text-gray-700"
                                : item.status === "진행중"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">입주예정</p>
                        <p className="font-semibold text-gray-800">
                          {item.moveInDate}
                        </p>
                      </div>
                    </div>

                    {/* 일정 정보 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-gray-500">청약접수</p>
                        <p className="text-sm font-medium">
                          {item.applicationStart}~{item.applicationEnd}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-gray-500">당첨발표</p>
                        <p className="text-sm font-medium">
                          {item.winnerAnnouncement}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-gray-500">계약시작</p>
                        <p className="text-sm font-medium">
                          {item.contractStart}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Home className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-gray-500">입주</p>
                        <p className="text-sm font-medium">{item.moveInDate}</p>
                      </div>
                    </div>

                    {/* 링크 버튼들 */}
                    <div className="flex gap-3">
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        공식 홈페이지
                      </a>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        청약홈 상세정보
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-center text-sm text-gray-500">
                💡 해당 지역의 청약 트렌드를 파악하여 향후 청약 계획을
                세워보세요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 청약 알림 모달 */}
      {isUpcomingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden relative">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6">
              <button
                onClick={closeUpcomingModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">청약 알림</h2>
                  <p className="text-teal-100 mt-1">
                    향후 청약 접수 예정 아파트를 확인하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 날짜 선택 및 기간 정보 */}
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex flex-col gap-4">
                {/* 날짜 선택 */}
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">시작일:</label>
                    <input
                      type="date"
                      value={subscriptionDateRange.startDate}
                      onChange={(e) =>
                        setSubscriptionDateRange({
                          ...subscriptionDateRange,
                          startDate: e.target.value,
                        })
                      }
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">종료일:</label>
                    <input
                      type="date"
                      value={subscriptionDateRange.endDate}
                      onChange={(e) =>
                        setSubscriptionDateRange({
                          ...subscriptionDateRange,
                          endDate: e.target.value,
                        })
                      }
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={handleDateRangeChange}
                    disabled={isLoadingSubscription}
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {isLoadingSubscription ? "조회중..." : "조회"}
                  </button>
                </div>

                {/* 조회 결과 정보 */}
                <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">조회 기간:</span>
                    <span className="font-semibold text-gray-800">
                      {subscriptionDateRange.startDate} ~{" "}
                      {subscriptionDateRange.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">총 </span>
                    <span className="font-semibold text-teal-600">
                      {subscriptionCalendarData.length}개
                    </span>
                    <span className="text-gray-600">의 청약 정보</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="overflow-y-auto max-h-[55vh] p-6">
              {isLoadingSubscription ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">청약 정보를 불러오는 중...</p>
                  </div>
                </div>
              ) : subscriptionCalendarData.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    선택한 기간에 청약 정보가 없습니다.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    다른 날짜 범위를 선택해보세요.
                  </p>
                </div>
              ) : (
                (() => {
                  const sortedData = getSortedSubscriptionData();

                  return (
                    <div className="grid gap-4">
                      {/* 오늘 시작하는 청약 */}
                      {sortedData.todayStart.map((apt, index) => (
                        <SubscriptionCard
                          key={`today-start-${apt.houseNm}-${index}`}
                          apt={apt}
                          type="todayStart"
                        />
                      ))}

                      {/* 오늘 마감하는 청약 */}
                      {sortedData.todayEnd.map((apt, index) => (
                        <SubscriptionCard
                          key={`today-end-${apt.houseNm}-${index}`}
                          apt={apt}
                          type="todayEnd"
                        />
                      ))}

                      {/* 나머지 청약 (날짜순 정렬) */}
                      {sortedData.others.map((apt, index) => (
                        <SubscriptionCard
                          key={`other-${apt.houseNm}-${index}`}
                          apt={apt}
                          type="normal"
                        />
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  🔔 총 {subscriptionCalendarData.length}개의 청약 예정 아파트가
                  있습니다
                </p>
                <button
                  onClick={closeUpcomingModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 시군구별 평균분양가 상세 정보 모달 */}
      {isAreaPriceModalOpen && selectedAreaPriceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex-shrink-0">
              <button
                onClick={closeAreaPriceModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Building className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedAreaPriceData.sigungu}
                  </h2>
                  <p className="text-green-100 mt-1">
                    시군구별 평균분양가 상세 정보
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 내용 - 스크롤 가능한 영역 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 전체 요약 정보 */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      전체 평균분양가
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedAreaPriceData.avgPrice}만원
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      총 세대수
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedAreaPriceData.totalHouseholds.toLocaleString()}
                      세대
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      주택 유형 수
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedAreaPriceData.typeCount}개
                    </p>
                  </div>
                </div>
              </div>

              {/* 면적구간별 상세 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  면적구간별 평균분양가
                </h3>
                {selectedAreaPriceData.areaRanges.map((areaRange, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {areaRange.range}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {areaRange.totalHouseholds.toLocaleString()}세대 •{" "}
                          {areaRange.typeCount}개 유형
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {areaRange.avgPrice}만원
                        </p>
                      </div>
                    </div>

                    {/* 가격 분포 시각화 (간단한 바 차트) */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (areaRange.avgPrice / 1000) * 10,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 스크롤 하단 여백 추가 */}
              <div className="h-4"></div>
            </div>

            {/* 모달 푸터 - 고정 위치 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  💡 해당 시군구의 분양가 트렌드를 파악하여 청약 계획을
                  세워보세요
                </p>
                <button
                  onClick={closeAreaPriceModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 청약 상세 정보 모달 */}
      {isRealTimeDetailModalOpen && selectedRealTimeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex-shrink-0">
              <button
                onClick={closeRealTimeDetailModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">
                    실시간 청약 정보
                  </h2>
                  <p className="text-orange-100 mt-1">
                    현재 진행 중인 청약 상세 정보
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 기본 정보 */}
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {selectedRealTimeData.houseName}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">위치</p>
                    <p className="font-semibold">{selectedRealTimeData.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">가격</p>
                    <p className="font-semibold text-orange-600">{selectedRealTimeData.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">청약 시작일</p>
                    <p className="font-semibold">{selectedRealTimeData.subscriptionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">공급 세대수</p>
                    <p className="font-semibold">{selectedRealTimeData.supplyCount}세대</p>
                  </div>
                </div>
              </div>

              {/* 청약 현황 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  청약 현황
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">신청 세대수</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedRealTimeData.applyCount?.toLocaleString() || '정보없음'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">경쟁률</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedRealTimeData.competitionRate || '정보없음'}:1
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">상태</p>
                    <p className="text-lg font-bold text-orange-600">
                      진행중
                    </p>
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>청약 진행률</span>
                    <span>{selectedRealTimeData.applyCount} / {selectedRealTimeData.supplyCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (selectedRealTimeData.applyCount / selectedRealTimeData.supplyCount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 실시간 데이터는 수시로 업데이트됩니다</li>
                  <li>• 정확한 정보는 공식 청약 홈페이지를 확인하세요</li>
                  <li>• 청약 마감 시간을 놓치지 마세요</li>
                </ul>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  🔔 실시간으로 업데이트되는 청약 정보입니다
                </p>
                <button
                  onClick={closeRealTimeDetailModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지급 정보 패널 */}
      <PaymentInfoPanel
        selectedProperty={selectedPropertyForPayment}
        isVisible={isPaymentInfoPanelOpen}
        onClose={() => setIsPaymentInfoPanelOpen(false)}
      />

      {/* 주택형별 정보 패널 */}
      <HouseTypePanel
        houseName={selectedHouseName}
        htmlContent={selectedHtmlContent}
        isVisible={isHouseTypePanelOpen}
        onClose={() => setIsHouseTypePanelOpen(false)}
      />

      {/* 좌측 주택형별 정보 패널 */}
      <LeftHouseTypePanel
        houseName={leftPanelHouseName}
        htmlContent={leftPanelHtmlContent}
        jsonData={leftPanelJsonData}
        isVisible={isLeftHouseTypePanelOpen}
        onClose={() => setIsLeftHouseTypePanelOpen(false)}
        houseData={leftPanelHouseData}
      />

      {/* 우측 대출 플래너 패널 */}
      <RightLoanPlannerPanel
        isVisible={isRightLoanPlannerPanelOpen}
        onClose={() => {
          setIsRightLoanPlannerPanelOpen(false);
          setSelectedPropertyForLoanPlanner(null);
          resetLTVResult();
        }}
        selectedProperty={selectedPropertyForLoanPlanner}
        ltvResult={ltvResult}
        adjustedResult={adjustedResult}
        adjustments={adjustments}
        isLTVLoading={isLTVLoading}
        onCalculateLTV={handleCalculateLTV}
        onSelectPlan={handleSelectPlan}
        onAdjustLoanAmount={adjustLoanAmount}
        onAdjustLoanPeriod={adjustLoanPeriod}
        onAdjustInterestRate={adjustInterestRate}
        onAdjustRepaymentType={adjustRepaymentType}
        onToggleStressRateMode={toggleStressRateMode}
        onPreApproval={handlePreApproval}
        onCalendarExport={handleCalendarExport}
        onPDFDownload={handlePDFDownload}
        generatePlanSuggestions={generatePlanSuggestions}
      />

      {/* 에러 알림 Snackbar */}
      {errors.map((error) => (
        <Snackbar
          key={error.id}
          message={error.message}
          type={error.type}
          duration={5000}
          isVisible={true}
          onClose={() => removeError(error.id)}
        />
      ))}

      {/* PDF 뷰어 모달 - 독립적으로 분리 */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={closePdfViewer}
        pdfUrl={pdfUrl}
        isLoading={isPdfLoading}
        error={pdfError}
        houseManageNo={leftPanelHouseData?.houseManageNo}
      />
    </Layout>
  );
} 