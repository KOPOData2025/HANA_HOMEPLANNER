import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Home, Calendar, DollarSign, Users, Shield, FileText, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateLTVComplete } from '@/services';
import { useHouseLikes } from '@/hooks';

const LeftHouseTypePanel = ({ 
  isVisible, 
  onClose, 
  houseName, 
  htmlContent,
  jsonData, // JSON 데이터 추가
  houseData // 마커에서 전달받은 주택 데이터
}) => {
  
  // 컴포넌트 마운트 시 받은 데이터 확인
  React.useEffect(() => {
    if (houseData) {
      console.log('🔍 좌측 패널 - 받은 houseData props 전체:', houseData);
      console.log('🔍 좌측 패널 - houseData.houseManageNo:', houseData.houseManageNo);
      console.log('🔍 좌측 패널 - houseData.id:', houseData.id);
      console.log('🔍 좌측 패널 - houseData의 모든 키:', Object.keys(houseData));
      console.log('🔍 좌측 패널 - houseData 타입:', typeof houseData);
    } else {
      console.log('🔍 좌측 패널 - houseData가 null 또는 undefined');
    }
    
    if (jsonData) {
      console.log('🔍 좌측 패널 - 받은 jsonData props 전체:', jsonData);
      console.log('🔍 좌측 패널 - jsonData의 모든 키:', Object.keys(jsonData));
      console.log('🔍 좌측 패널 - jsonData.id:', jsonData.id);
      console.log('🔍 좌측 패널 - jsonData.houseType:', jsonData.houseType);
    } else {
      console.log('🔍 좌측 패널 - jsonData가 null 또는 undefined');
    }
  }, [houseData, jsonData]);
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);
  const [showLoanResult, setShowLoanResult] = useState(false);
  const [isLoadingLoan, setIsLoadingLoan] = useState(false);
  const [loanResult, setLoanResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedHouseType, setSelectedHouseType] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // 찜하기 관련 훅 사용
  const { toggleLike, isLiked, isLoading: isLikeLoading } = useHouseLikes();


  // 찜하기 토글 함수 (API 연동)
  const handleToggleFavorite = async () => {
    if (!houseData?.houseManageNo) return;
    
    try {
      const success = await toggleLike(houseData.houseManageNo);
      if (success) {
        console.log('찜하기 상태 변경 성공:', houseName);
      }
    } catch (error) {
      console.error('찜하기 상태 변경 실패:', error);
    }
  };

  // PDF 보기 함수 (전역 함수 호출)
  const handleViewPdf = () => {
    if (!houseData?.houseManageNo) {
      console.error('주택 관리 번호가 없습니다.');
      return;
    }
    
    console.log('📄 PDF 보기 요청:', houseData.houseManageNo);
    if (window.openPdfViewer) {
      window.openPdfViewer(houseData.houseManageNo);
    } else {
      console.error('PDF 뷰어 함수를 찾을 수 없습니다.');
    }
  };

  // 대출조회 함수
  const handleLoanInquiry = async () => {
    setIsLoadingLoan(true);
    setShowLoanResult(false);
    
    try {
      // 실제 API 호출
      const formData = {
        propertyPrice: 50000, // 기본값: 5억원 (만원 단위)
        region: "seoul",
        housingStatus: "none", // 무주택자
        borrowerType: "first-time", // 생애최초
        creditGrade: "2", // AA 등급
        downPaymentRatio: "20",
        collateralRatio: "100",
        dsrRatio: "40",
        loanInterestRate: "3.5",
        loanTermYears: "30",
        existingLoanRepayment: "120", // 1200만원 (만원 단위)
        desiredLoanAmount: 300000000, // 3억원
        loanPeriod: 30,
        interestRate: 3.5,
        houseType: "아파트",
        houseSize: 84.5
      };

      const result = await calculateLTVComplete(formData);
      
      console.log('API 응답 데이터:', result);
      
      // API 응답을 UI에 맞게 변환 (응답 구조에 맞게 수정)
      const transformedResult = {
        maxLoanAmount: result.data?.maxAllowedLoanAmount || 350000000,
        ltv: result.data?.calculatedLtv || 70,
        dsr: result.data?.dsr || 40,
        monthlyPayment: result.data?.totalMonthlyPayment || 1500000,
        interestRate: result.data?.stressRate || 5.0,
        recommendations: result.data?.recommendations || [
          "선택한 주택에 대한 대출이 가능합니다.",
          "LTV 한도 내에서 대출을 받을 수 있습니다.",
          "월 상환액을 고려하여 대출을 신청하세요."
        ],
        ltvStatus: result.data?.ltvStatus || '미달',
        dsrStatus: result.data?.dsrStatus || '미달',
        stressRate: result.data?.stressRate || 5.0,
        borrowerTypeText: result.data?.borrowerTypeText || '일반 대출자',
        creditGrade: result.data?.creditGrade || 'AA',
        housePrice: result.data?.housePrice || 500000000,
        region: result.data?.region || '서울특별시 강남구',
        regionType: result.data?.regionType || '일반지역',
        ltvLimit: result.data?.ltvLimit || 70,
        dsrLimit: result.data?.dsrLimit || 40,
        annualIncome: result.data?.annualIncome || 42000000,
        availableMonthlyPayment: result.data?.availableMonthlyPayment || 1400000,
        ltvWarnings: result.data?.ltvWarnings || [],
        regulatoryNotices: result.data?.regulatoryNotices || []
      };
      
      setLoanResult(transformedResult);
      setShowLoanResult(true);
    } catch (error) {
      console.error('대출조회 오류:', error);
      // 에러 발생 시에도 기본 결과 표시
      const errorResult = {
        maxLoanAmount: 350000000,
        ltv: 70,
        dsr: 35,
        monthlyPayment: 1500000,
        interestRate: 4.5,
        recommendations: [
          "API 호출 중 오류가 발생했습니다.",
          "기본 대출 조건으로 조회 결과를 표시합니다.",
          "정확한 정보는 담당자에게 문의하세요."
        ]
      };
      setLoanResult(errorResult);
      setShowLoanResult(true);
    } finally {
      setIsLoadingLoan(false);
    }
  };
  
  // 아코디언 상태 관리 (Hook은 최상위에서 호출)
  const [expandedSections, setExpandedSections] = useState({
    specialSupply: false,
    generalSupply: false
  });

  // 스크롤 이동 함수
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };
  
  if (!isVisible || !jsonData) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 1. 기본 정보 파싱 (새로운 API 구조)
  const basicInfo = {
    "주택유형": jsonData.houseType || '정보없음',
    "규제지역": jsonData.regulation || '정보없음',
    "전매제한": jsonData.resaleLimit || '정보없음',
    "거주의무기간": jsonData.residencePeriod || '정보없음',
    "분양가상한제": jsonData.priceCap || '정보없음',
    "택지유형": jsonData.landType || '정보없음',
    "재당첨제한": jsonData.reWinningLimit || '정보없음',
    "해당지역": jsonData.region || '정보없음',
    "기타지역": jsonData.otherRegion || '정보없음'
  };

  // 2. 신청 자격 파싱
  const parseEligibility = () => {
    const eligibility = jsonData.신청자격;
    const result = {
      특별공급: [],
      일반공급: []
    };

    // 특별공급 파싱
    if (eligibility.특별공급) {
      Object.entries(eligibility.특별공급).forEach(([type, details]) => {
        const requirements = details["청약통장 자격 요건"];
        if (requirements && requirements["가입 여부"] === "필요") {
          const summary = `${requirements["가입 개월 수"]}개월 이상, 예치금 ${(requirements["필요 예치금"] / 10000).toLocaleString()}만원`;
          result.특별공급.push({
            type: type,
            requirements: summary,
            houseOwnership: details["세대주 요건"],
            incomeAsset: details["소득 또는 자산 기준"]
                });
              }
            });
          }
          
    // 일반공급 파싱
    if (eligibility.일반공급) {
      Object.entries(eligibility.일반공급).forEach(([type, details]) => {
        const requirements = details["청약통장 자격 요건"];
        if (requirements && requirements["가입 여부"] === "필요") {
          const summary = requirements["가입 개월 수"] > 0 
            ? `${requirements["가입 개월 수"]}개월 이상, 예치금 ${(requirements["필요 예치금"] / 10000).toLocaleString()}만원`
            : "가입 즉시 가능";
          result.일반공급.push({
            type: type,
            requirements: summary,
            houseOwnership: details["세대주 요건"],
            incomeAsset: details["소득 또는 자산 기준"]
          });
        }
      });
    }

    return result;
  };

  // 3. 공급 금액 및 납부 일정 파싱 (기존 구조용)
  const parsePricingSchedule = () => {
    const pricingData = jsonData["공급 금액 및 납부일"];
    if (!pricingData || !pricingData.납부일 || !pricingData.주택형) {
      console.warn('⚠️ parsePricingSchedule - 기존 구조 데이터 없음');
      return { scheduleHeaders: [], houseTypes: [] };
    }
    
    const scheduleHeaders = pricingData.납부일.map(item => item.구분);
    const houseTypes = pricingData.주택형.map(item => {
      const totalContract = item.계약금.reduce((sum, val) => sum + val, 0);
      return {
        type: item.타입,
        contractFee: totalContract,
        interimFee: item.중도금[0], // 첫 번째 중도금 (모두 동일)
        interimCount: item.중도금.length,
        finalFee: item.잔금
      };
    });

    return { scheduleHeaders, houseTypes };
  };

  // 4. 신청 기준 파싱 (기존 구조용)
  const parseDetailedCriteria = () => {
    const criteria = jsonData["신청 기준"];
    if (!criteria) {
      console.warn('⚠️ parseDetailedCriteria - 기존 구조 데이터 없음');
      return {
        무주택: '정보없음',
        자산: '정보없음',
        소득기준: { 우선공급: '정보없음', 일반공급: '정보없음' }
      };
    }
    
    return {
      무주택: criteria.무주택 || '정보없음',
      자산: criteria.자산?.부동산 ? (criteria.자산.부동산 / 100000000).toFixed(1) + '억원 이하' : '정보없음',
      소득기준: {
        우선공급: criteria["소득 기준"]?.우선공급 + '%' || '정보없음',
        일반공급: criteria["소득 기준"]?.일반공급 + '%' || '정보없음'
      }
    };
  };

  // 새로운 API 구조 사용 여부 확인
  const isNewApiStructure = jsonData && jsonData.houseType && jsonData.specialSupplyCount;
  
  let eligibilityData, scheduleHeaders, houseTypes, detailedCriteria, supplyInfo;
  
  if (isNewApiStructure) {
    // 새로운 API 구조 파싱
    console.log('🔍 새로운 API 구조 사용');
    
    // 공급 정보 파싱 (새로운 구조)
    const specialSupply = jsonData.specialSupplyCount || {};
    const generalSupply = jsonData.generalSupplyCount || {};
    
    supplyInfo = {
      특별공급: Object.entries(specialSupply).map(([type, data]) => ({
        type: type,
        totalUnits: data.주택형 || 0,
        houseTypes: { 전체: data.주택형 || 0 }
      })),
      일반공급: Object.entries(generalSupply).map(([type, data]) => ({
        type: type,
        totalUnits: data.주택형 || 0,
        houseTypes: { 전체: data.주택형 || 0 }
      }))
    };
    
    // 주택형 정보 (supplyPriceInfo에서 추출)
    const supplyPriceInfo = jsonData.supplyPriceInfo || {};
    const apiHouseTypes = supplyPriceInfo.houseTypes || [];
    
    houseTypes = apiHouseTypes.map(houseType => {
      console.log('🔍 LeftHouseTypePanel - houseType 처리:', houseType);
      
      // 올바른 가격 계산 (계약금 + 중도금×횟수 + 잔금)
      const contractAmounts = houseType.contractAmounts || [];
      const intermediateAmounts = houseType.intermediateAmounts || [];
      const balanceAmounts = houseType.balanceAmounts || [];
      
      console.log('🔍 LeftHouseTypePanel - 가격 배열들:', {
        contractAmounts,
        intermediateAmounts,
        balanceAmounts,
        balanceAmounts_types: balanceAmounts.map(item => typeof item)
      });
      
      let avgContractFee = 0;
      let avgInterimFee = 0;
      let avgFinalFee = 0;
      
      if (contractAmounts.length > 0) {
        avgContractFee = contractAmounts.reduce((sum, amount) => sum + amount, 0) / contractAmounts.length;
      }
      
      if (intermediateAmounts.length > 0) {
        avgInterimFee = intermediateAmounts.reduce((sum, amount) => sum + amount, 0) / intermediateAmounts.length;
      }
      
      // 잔금은 문자열 범위로 되어 있음 (예: "139230000~167405000")
      if (balanceAmounts.length > 0 && balanceAmounts[0]) {
        const balanceValue = balanceAmounts[0];
        
        // 문자열인지 확인 후 처리
        if (typeof balanceValue === 'string' && balanceValue.includes('~')) {
          const balanceRange = balanceValue.split('~');
          if (balanceRange.length === 2) {
            avgFinalFee = (parseInt(balanceRange[0]) + parseInt(balanceRange[1])) / 2;
          } else {
            avgFinalFee = parseInt(balanceRange[0]);
          }
        } else if (typeof balanceValue === 'string') {
          // 문자열이지만 범위가 아닌 경우
          avgFinalFee = parseInt(balanceValue);
        } else if (typeof balanceValue === 'number') {
          // 숫자인 경우
          avgFinalFee = balanceValue;
        } else {
          console.warn('⚠️ 잘못된 balanceAmounts 형식:', balanceValue, typeof balanceValue);
          avgFinalFee = 0;
        }
      }
      
      return {
        type: houseType.type,
        contractFee: avgContractFee,
        interimFee: avgInterimFee,
        interimCount: intermediateAmounts.length,
        finalFee: avgFinalFee
      };
    });
    
    // 납부 일정 헤더 (새로운 구조에서 추출)
    const paymentDates = supplyPriceInfo.paymentDates || [];
    scheduleHeaders = paymentDates.map(payment => payment.type);
    
    // 신청 자격 정보 (새로운 구조에서 추출)
    const applyQualification = jsonData.applyQualification || {};
    const specialSupplyQual = applyQualification.specialSupply || {};
    const generalSupplyQual = applyQualification.generalSupply || {};
    
    eligibilityData = {
      특별공급: Object.entries(specialSupplyQual).map(([type, qualification]) => {
        const subscriptionReq = qualification.subscriptionAccountRequirement || {};
        const requirements = subscriptionReq.membershipRequired === '필요' 
          ? `${subscriptionReq.membershipMonths}개월 이상, 예치금 ${(subscriptionReq.requiredDeposit / 10000).toLocaleString()}만원`
          : '가입 즉시 가능';
        
        return {
          type: type,
          requirements: requirements,
          houseOwnership: qualification.householdHeadRequirement || '정보없음',
          incomeAsset: qualification.incomeOrAssetCriteria || '정보없음'
        };
      }),
      일반공급: Object.entries(generalSupplyQual).map(([type, qualification]) => {
        const subscriptionReq = qualification.subscriptionAccountRequirement || {};
        const requirements = subscriptionReq.membershipRequired === '필요'
          ? `${subscriptionReq.membershipMonths}개월 이상, 예치금 ${(subscriptionReq.requiredDeposit / 10000).toLocaleString()}만원`
          : '가입 즉시 가능';
        
        return {
          type: type,
          requirements: requirements,
          houseOwnership: qualification.householdHeadRequirement || '정보없음',
          incomeAsset: qualification.incomeOrAssetCriteria || '정보없음'
        };
      })
    };
    
    // 신청 기준 정보 (새로운 구조에서 추출)
    const applyCondition = jsonData.applyCondition || {};
    detailedCriteria = {
      무주택: applyCondition.noHouse || '정보없음',
      자산: applyCondition.asset?.realEstate ? 
        (applyCondition.asset.realEstate / 100000000).toFixed(1) + '억원 이하' : '정보없음',
      소득기준: {
        우선공급: applyCondition.income?.prioritySupply ? 
          (applyCondition.income.prioritySupply / 10000).toLocaleString() + '만원' : '정보없음',
        일반공급: applyCondition.income?.generalSupply ? 
          (applyCondition.income.generalSupply / 10000).toLocaleString() + '만원' : '정보없음'
      }
    };
  } else {
    // 기존 구조 파싱
    console.log('🔍 기존 API 구조 사용');
    eligibilityData = parseEligibility();
    const pricingData = parsePricingSchedule();
    scheduleHeaders = pricingData.scheduleHeaders;
    houseTypes = pricingData.houseTypes;
    detailedCriteria = parseDetailedCriteria();
    supplyInfo = null;
  }

  // 주택형별 총 금액 계산 함수
  const calculateTotalPrice = (houseType) => {
    const totalContract = houseType.contractFee;
    const totalInterim = houseType.interimFee * houseType.interimCount;
    const totalFinal = houseType.finalFee;
    return totalContract + totalInterim + totalFinal;
  };

  // 십만의 자리에서 반올림하는 함수
  const roundToHundredThousand = (value) => {
    return Math.round(value / 100000) * 100000;
  };

  // 주택형별로 데이터 통합하는 함수
  const getConsolidatedHouseTypes = () => {
    if (!houseTypes || houseTypes.length === 0) return [];

    // 주택형별로 그룹화
    const groupedByType = houseTypes.reduce((acc, house) => {
      const typeMatch = house.type.match(/주택형\s*(\d+[A-Z]*)/);
      const houseType = typeMatch ? typeMatch[1] : house.type;
      
      if (!acc[houseType]) {
        acc[houseType] = [];
      }
      acc[houseType].push(house);
      return acc;
    }, {});

    // 각 주택형별로 평균값 계산
    const consolidatedTypes = Object.entries(groupedByType).map(([type, houses]) => {
      const count = houses.length;
      
      // 평균값 계산 (십만의 자리에서 반올림)
      const avgContractFee = roundToHundredThousand(
        houses.reduce((sum, house) => sum + house.contractFee, 0) / count
      );
      const avgInterimFee = roundToHundredThousand(
        houses.reduce((sum, house) => sum + house.interimFee, 0) / count
      );
      const avgFinalFee = roundToHundredThousand(
        houses.reduce((sum, house) => sum + house.finalFee, 0) / count
      );
      const avgInterimCount = Math.round(
        houses.reduce((sum, house) => sum + house.interimCount, 0) / count
      );

      return {
        type: `주택형 ${type}`,
        contractFee: avgContractFee,
        interimFee: avgInterimFee,
        finalFee: avgFinalFee,
        interimCount: avgInterimCount,
        count: count, // 해당 주택형의 개수
        originalHouses: houses // 원본 데이터 보관
      };
    });

    return consolidatedTypes;
  };

  const consolidatedHouseTypes = getConsolidatedHouseTypes();

  // 주택 유형 추출 함수
  const getHouseType = () => {
    return jsonData?.주택유형 || '민영';
  };

  return (
    <div className={`fixed w-[575px] bg-white shadow-2xl border border-gray-200 rounded-lg z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`} style={{ 
      top: '82px',
      right: '0px',
      height: 'calc(100vh - 82px)'
    }}>
      <div className="bg-white flex flex-col h-full">
        {/* 패널 헤더 */}
        <div className="bg-gradient-to-r from-[#009071] to-[#007a5e] text-white p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-xl font-bold mb-3 flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-25 rounded-lg flex items-center justify-center mr-3">
                  🏠
              </div>
                {houseName || '청약 정보'}
              </div>
              <div className="text-sm opacity-95 font-medium mb-2">
                {houseData?.hssplyAdres || '주소 정보 없음'}
            </div>
            
              
              {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                disabled={isLikeLoading}
                  className={`bg-white bg-opacity-25 hover:bg-opacity-35 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg ${
                  isLiked(houseData?.houseManageNo) ? 'bg-red-500 bg-opacity-30' : ''
                } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isLiked(houseData?.houseManageNo) ? '찜하기 해제' : '찜하기'}
              >
                {isLikeLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    처리중...
                  </>
                ) : (
                  <>
                    <Heart className={`w-3 h-3 mr-1 ${isLiked(houseData?.houseManageNo) ? 'fill-current' : ''}`} />
                    {isLiked(houseData?.houseManageNo) ? '찜함' : '찜하기'}
                  </>
                )}
              </button>
              <button
                onClick={handleViewPdf}
                  className="bg-white bg-opacity-25 hover:bg-opacity-35 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
                title="모집 공고 보기"
              >
                <FileText className="w-3 h-3 mr-1" />
                모집공고
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                  className="bg-white bg-opacity-25 hover:bg-opacity-35 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                대출조회
              </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="bg-white bg-opacity-25 hover:bg-opacity-35 text-white rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="패널 닫기"
                title="패널 닫기"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* 스크롤 네비게이션 */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50 sticky top-0 z-10">
          {[
            { id: 'basic', label: '기본 정보', icon: Home },
            { id: 'eligibility', label: '신청 자격', icon: Users },
            { id: 'pricing', label: '금액 일정', icon: DollarSign },
            { id: 'criteria', label: '신청 기준', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="flex-1 px-4 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-gray-500 hover:text-[#009071] hover:bg-gray-100"
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* 통합 콘텐츠 */}
         <div className="p-6 flex-1 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 200px)' }}>
           {/* 대출조회 결과 */}
           {showLoanResult && loanResult && (
             <div className="mb-6">
               <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                 <div className="flex items-center mb-3">
                   <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                   <h4 className="text-lg font-semibold text-blue-800">대출조회 결과</h4>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-white rounded-lg p-3 border border-blue-100">
                     <div className="text-xs text-gray-600 mb-1">최대 대출금액</div>
                     <div className="text-lg font-bold text-blue-800">
                       {(loanResult.maxLoanAmount / 100000000).toFixed(1)}억원
                     </div>
                   </div>
                   <div className="bg-white rounded-lg p-3 border border-blue-100">
                     <div className="text-xs text-gray-600 mb-1">월 상환액</div>
                     <div className="text-lg font-bold text-blue-800">
                       {(loanResult.monthlyPayment / 10000).toFixed(0)}만원
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="text-sm font-medium text-blue-800 mb-2">추천사항</div>
                   {loanResult.recommendations.map((rec, index) => (
                     <div key={index} className="text-xs text-blue-700 bg-white bg-opacity-50 rounded p-2 border border-blue-100">
                       • {rec}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}

          {/* 1. 기본 정보 섹션 */}
          <div id="basic" className="mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-[#009071] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-[#009071] rounded-xl flex items-center justify-center mr-4">
                    <Home className="w-6 h-6 text-white" />
                </div>
                  <h3 className="text-xl font-bold text-gray-800">기본 정보</h3>
                  
                  {/* 태그들 */}
                  <div className="flex items-center gap-2 ml-auto">
                    {/* 주택구분 태그 */}
                    {basicInfo['주택구분'] && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        basicInfo['주택구분'] === '민영' ? 'bg-blue-100 text-blue-800' :
                        basicInfo['주택구분'] === '공공' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {basicInfo['주택구분']}
                      </span>
                    )}
                    
                    {/* 주택유형 태그 */}
                    {basicInfo['주택유형'] && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        basicInfo['주택유형'].includes('아파트') ? 'bg-indigo-100 text-indigo-800' :
                        basicInfo['주택유형'].includes('오피스텔') ? 'bg-teal-100 text-teal-800' :
                        basicInfo['주택유형'].includes('빌라') ? 'bg-cyan-100 text-cyan-800' :
                        basicInfo['주택유형'].includes('단독') ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {basicInfo['주택유형']}
                      </span>
                    )}
                    
                    {/* 규제지역 태그 */}
                    {(() => {
                      // 규제지역이 있는지 확인
                      const hasRegulation = 
                        (basicInfo['투기과열지구'] && basicInfo['투기과열지구'] !== '없음' && basicInfo['투기과열지구'] !== '미적용') ||
                        (basicInfo['투기과열지역'] && basicInfo['투기과열지역'] !== '없음' && basicInfo['투기과열지역'] !== '미적용') ||
                        (basicInfo['조정대상지역'] && basicInfo['조정대상지역'] !== '없음' && basicInfo['조정대상지역'] !== '미적용') ||
                        (basicInfo['규제지역'] && basicInfo['규제지역'] !== '없음' && basicInfo['규제지역'] !== '미적용');
                      
                      // 규제지역명 찾기
                      let regulationName = '';
                      if (basicInfo['투기과열지구'] && basicInfo['투기과열지구'] !== '없음' && basicInfo['투기과열지구'] !== '미적용') {
                        regulationName = basicInfo['투기과열지구'];
                      } else if (basicInfo['투기과열지역'] && basicInfo['투기과열지역'] !== '없음' && basicInfo['투기과열지역'] !== '미적용') {
                        regulationName = basicInfo['투기과열지역'];
                      } else if (basicInfo['조정대상지역'] && basicInfo['조정대상지역'] !== '없음' && basicInfo['조정대상지역'] !== '미적용') {
                        regulationName = basicInfo['조정대상지역'];
                      } else if (basicInfo['규제지역'] && basicInfo['규제지역'] !== '없음' && basicInfo['규제지역'] !== '미적용') {
                        regulationName = basicInfo['규제지역'];
                      }
                      
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          hasRegulation ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {hasRegulation ? regulationName : '비규제지역'}
                        </span>
                      );
                    })()}
                    
                    {/* 택지유형 태그 */}
                    {basicInfo['택지유형'] && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        basicInfo['택지유형'].includes('민간') ? 'bg-purple-100 text-purple-800' :
                        basicInfo['택지유형'].includes('공공') ? 'bg-orange-100 text-orange-800' :
                        basicInfo['택지유형'].includes('국민') ? 'bg-green-100 text-green-800' :
                        basicInfo['택지유형'].includes('영구') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {basicInfo['택지유형']}
                      </span>
                    )}
                      </div>
                       </div>
              {/* 제한사항 통합 섹션 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    제한사항 및 기간
                  </h4>
                  
                  {/* 분양가상한제 */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-600 mb-1">분양가상한제</div>
                    <div className={`text-lg font-bold ${
                      basicInfo['분양가상한제'] === '없음' || basicInfo['분양가상한제'] === '미적용' 
                        ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {basicInfo['분양가상한제'] || '정보없음'}
                </div>
                   </div>
                 </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 전매제한 */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-600 mb-1">전매제한</div>
                      <div className={`text-sm font-bold ${
                        basicInfo['전매제한'] === '없음' || basicInfo['전매제한'] === '미적용' 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {basicInfo['전매제한'] || '정보없음'}
                      </div>
                    </div>
                    
                    {/* 거주의무기간 */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-600 mb-1">거주의무기간</div>
                      <div className={`text-sm font-bold ${
                        basicInfo['거주의무기간'] === '없음' || basicInfo['거주의무기간'] === '미적용' 
                          ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {basicInfo['거주의무기간'] || '정보없음'}
                      </div>
                    </div>
                    
                    {/* 재당첨제한 */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-gray-600 mb-1">재당첨제한</div>
                      <div className={`text-sm font-bold ${
                        basicInfo['재당첨제한'] === '없음' || basicInfo['재당첨제한'] === '미적용' 
                          ? 'text-green-600' : 'text-purple-600'
                      }`}>
                        {basicInfo['재당첨제한'] || '정보없음'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 지역 정보 섹션 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  지역 정보
                </h4>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="space-y-4">
                    {/* 해당지역 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-base font-semibold text-gray-600 mb-2">해당지역</div>
                      <div className="text-base font-bold text-gray-900 break-words">
                        {basicInfo['해당지역'] || '정보없음'}
                </div>
                                  </div>
                    
                    {/* 기타지역 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-base font-semibold text-gray-600 mb-2">기타지역</div>
                      <div className="text-base font-bold text-gray-900 break-words">
                        {basicInfo['기타지역'] || '정보없음'}
                              </div>
                            </div>
                          </div>
                            </div>
                          </div>

              {/* 기타 정보 */}
              <div className="grid gap-4">
                  {Object.entries(basicInfo)
                    .filter(([key]) => !['주택유형', '규제지역', '택지유형', '전매제한', '거주의무기간', '재당첨제한', '분양가상한제', '해당지역', '기타지역'].includes(key))
                    .map(([key, value]) => (
                  <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">{key}</span>
                      <span className="text-sm font-bold text-gray-900 text-right max-w-[200px] break-words">{value || '정보없음'}</span>
                      </div>
                       </div>
                     ))}
                </div>
                   </div>
                 </div>
               
          {/* 2. 신청 자격 섹션 */}
          <div id="eligibility" className="mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                   </div>
                <h3 className="text-xl font-bold text-gray-800">공급 정보</h3>
              </div>
              
              {/* 통합 공급 정보 */}
            <div className="space-y-4">
                {/* 총 공급세대 및 도넛 차트 */}
                {(() => {
                  // 총 공급세대 계산
                  let totalSpecialUnits = 0;
                  let totalGeneralUnits = 0;
                  let specialSupplyBreakdown = [];
                  
                  if (isNewApiStructure) {
                    // 새로운 API 구조에서 모든 특별공급 항목 수집
                    const allSpecialSupply = [];
                    
                    // supplyInfo에서 특별공급 데이터 수집
                    if (supplyInfo?.특별공급) {
                      allSpecialSupply.push(...supplyInfo.특별공급);
                    }
                    
                    // eligibilityData에서도 특별공급 데이터 수집 (노부모 부양, 생애최초 등)
                    // 단, 영어 타입은 제외하고 한국어 타입만 수집
                    if (eligibilityData?.특별공급) {
                      eligibilityData.특별공급.forEach(item => {
                        // 영어 타입 제외 (한글만 포함)
                        const isKoreanType = /[가-힣]/.test(item.type);
                        if (isKoreanType && !allSpecialSupply.find(existing => existing.type === item.type)) {
                          allSpecialSupply.push({
                            type: item.type,
                            totalUnits: 1, // 기본값으로 1세대 설정
                            houseTypes: {}
                          });
                        }
                      });
                    }
                    
                    totalSpecialUnits = allSpecialSupply.reduce((sum, item) => sum + (item.totalUnits || 0), 0);
                    totalGeneralUnits = supplyInfo?.일반공급?.reduce((sum, item) => sum + (item.totalUnits || 0), 0) || 0;
                    
                    // 특별공급 세부 항목별 계산
                    specialSupplyBreakdown = allSpecialSupply.map(item => ({
                      type: item.type,
                      units: item.totalUnits || 0,
                      percentage: 0 // 나중에 계산
                    }));
                  } else {
                    totalSpecialUnits = eligibilityData.특별공급?.length || 0;
                    totalGeneralUnits = eligibilityData.일반공급?.length || 0;
                    
                    // 기존 구조에서는 특별공급 항목별로 계산
                    specialSupplyBreakdown = eligibilityData.특별공급?.map(item => ({
                      type: item.type,
                      units: 1, // 기존 구조에서는 각 항목이 1세대로 계산
                      percentage: 0
                    })) || [];
                  }
                  
                  const totalUnits = totalSpecialUnits + totalGeneralUnits;
                  const specialPercentage = totalUnits > 0 ? (totalSpecialUnits / totalUnits) * 100 : 0;
                  const generalPercentage = totalUnits > 0 ? (totalGeneralUnits / totalUnits) * 100 : 0;
                  
                  // 특별공급 내 각 항목의 비율 계산
                  specialSupplyBreakdown.forEach(item => {
                    item.percentage = totalSpecialUnits > 0 ? (item.units / totalSpecialUnits) * 100 : 0;
                    // 최소 비율 설정 (너무 작은 항목도 최소 1%는 표시되도록)
                    if (item.percentage > 0 && item.percentage < 1) {
                      item.percentage = 1;
                    }
                  });
                  
                  // 비율 재정규화 (최소 비율 적용 후 총합이 100%가 되도록)
                  const totalPercentage = specialSupplyBreakdown.reduce((sum, item) => sum + item.percentage, 0);
                  if (totalPercentage > 100) {
                    specialSupplyBreakdown.forEach(item => {
                      item.percentage = (item.percentage / totalPercentage) * 100;
                    });
                  }
                  
                  // 디버깅용 콘솔 로그
                  console.log('🔍 도넛 차트 데이터:', {
                    totalSpecialUnits,
                    totalGeneralUnits,
                    totalUnits,
                    specialSupplyBreakdown,
                    specialPercentage,
                    generalPercentage
                  });
                  
                  // 전체 항목 통합 (특별공급 + 일반공급)
                  const allItems = [
                    ...specialSupplyBreakdown.map(item => ({
                      ...item,
                      isSpecial: true
                    })),
                    {
                      type: '일반공급',
                      units: totalGeneralUnits,
                      percentage: generalPercentage,
                      isSpecial: false
                    }
                  ];
                  
                  // 전체 비율 재계산 (총합이 100%가 되도록)
                  const totalAllPercentage = allItems.reduce((sum, item) => sum + item.percentage, 0);
                  allItems.forEach(item => {
                    item.percentage = (item.percentage / totalAllPercentage) * 100;
                  });
                  
                  // 항목별 고정 색상 매핑 (UI/UX 고려한 직관적 색상)
                  const getColorForType = (type) => {
                    const colorMap = {
                      '기관추천': '#3B82F6',      // 파란색 - 신뢰와 안정성
                      '다자녀가구': '#F59E0B',    // 주황색 - 활기와 가족
                      '신혼부부': '#EC4899',      // 분홍색 - 사랑과 새로움
                      '노부모 부양': '#6B7280',   // 회색 - 안정과 책임
                      '생애최초': '#8B5CF6',      // 보라색 - 특별함과 첫 경험
                      '일반공급': '#10B981',      // 초록색 - 기본과 일반
                    };
                    return colorMap[type] || '#6B7280'; // 기본값은 회색
                  };
                  
                  // 색상 팔레트 (항목별 고정 색상 사용)
                  const allColors = allItems.map(item => getColorForType(item.type));
                  
                  return (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        {/* 도넛 차트 */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                            {/* 통합된 모든 항목들 */}
                            {allItems.map((item, index) => {
                              const startAngle = allItems.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
                              const circumference = 2 * Math.PI * 40; // 반지름 40
                              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                              const strokeDashoffset = -(startAngle / 100) * circumference;
                              
                              return (
                                <circle
                                  key={index}
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke={getColorForType(item.type)}
                                  strokeWidth="6"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-500"
                                />
                              );
                            })}
                          </svg>
                          {/* 중앙 총 공급세대 */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-gray-800">{totalUnits}</div>
                            <div className="text-xs text-gray-600 font-medium">총 공급세대</div>
                          </div>
                        </div>
                        
                        {/* 범례 - 2열 3행 그리드 */}
                        <div className="flex-1 ml-6">
                          <div className="grid grid-cols-2 gap-3">
                            {/* 통합된 모든 항목들 */}
                            {allItems.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0" 
                                  style={{ backgroundColor: getColorForType(item.type) }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-800 truncate">{item.type}</div>
                                  <div className="text-xs text-gray-600">{item.units}세대</div>
                                </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                            </div>
                  );
                })()}
                          </div>
                    </div>
                </div>
                       
          {/* 3. 공급 금액 및 납부 일정 섹션 */}
          <div id="pricing" className="mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-white" />
                           </div>
                <h3 className="text-xl font-bold text-gray-800">공급 금액 및 납부 일정</h3>
                                  </div>
              {/* 주택형 선택 드롭다운 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white text-xs">🏠</span>
                              </div>
                  주택형 선택
                </h4>
                <div className="relative">
                  <select
                    value={selectedHouseType?.type || ''}
                    onChange={(e) => {
                      const selectedType = consolidatedHouseTypes.find(house => house.type === e.target.value);
                      setSelectedHouseType(selectedType);
                    }}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold focus:border-blue-400 focus:outline-none transition-all duration-300 hover:border-blue-300 appearance-none cursor-pointer"
                  >
                    <option value="">주택형을 선택해주세요</option>
                      {consolidatedHouseTypes.map((house, index) => {
                        const totalPrice = calculateTotalPrice(house);
                        return (
                        <option key={index} value={house.type} className="p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold">
                          {house.type} - {(totalPrice / 100000000).toFixed(1)}억원
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                            </div>
                          </div>
                            </div>

              {/* 선택된 주택형 상세 그래프 */}
              {selectedHouseType && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-white text-xs">📊</span>
                          </div>
                    {selectedHouseType.type} 
                  </h4>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    {/* 총 금액 강조 - 클릭 시 하단에 상세 정보 표시 */}
                    <div 
                      className="relative overflow-hidden bg-gradient-to-br from-[#009071] to-[#007a5e] rounded-2xl p-6 text-center transition-all duration-500 hover:shadow-2xl cursor-pointer"
                      onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                    >
                      <div className="absolute inset-0 bg-white opacity-5"></div>
                      <div className="relative z-10">
                        <div className="text-white text-sm font-medium mb-2 opacity-90">총 분양가</div>
                        <div className="text-white text-4xl font-bold mb-2">
                          {(calculateTotalPrice(selectedHouseType) / 100000000).toFixed(1)}억원
                    </div>
                        <div className="text-white text-sm opacity-80">
                          {calculateTotalPrice(selectedHouseType).toLocaleString()}원
                </div>
            </div>
                      
                      {/* 장식적 요소 */}
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white opacity-10 rounded-full"></div>
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white opacity-5 rounded-full"></div>
                       </div>
                       
                    {/* 클릭 시 나타나는 상세 정보 - 총 분양가 하단에 표시 */}
                    {showPaymentDetails && (
                      <div className="opacity-100 transition-opacity duration-500 mt-4">
                        <div className="grid grid-cols-3 gap-3">
                          {/* 계약금 */}
                          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                            <div className="text-blue-600 text-xs font-medium mb-1">계약금</div>
                            <div className="text-blue-800 font-bold text-sm">
                              {(selectedHouseType.contractFee / 100000000).toFixed(1)}억
                            </div>
                          </div>
                          
                          {/* 중도금 */}
                          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                            <div className="text-green-600 text-xs font-medium mb-1">중도금</div>
                            <div className="text-green-800 font-bold text-sm">
                              {((selectedHouseType.interimFee * selectedHouseType.interimCount) / 100000000).toFixed(1)}억
                            </div>
                          </div>
                          
                          {/* 잔금 */}
                          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                            <div className="text-purple-600 text-xs font-medium mb-1">잔금</div>
                            <div className="text-purple-800 font-bold text-sm">
                              {(selectedHouseType.finalFee / 100000000).toFixed(1)}억
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    
                         </div>
                     </div>
              )}

              {/* 납부 일정 타임라인 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white text-xs">📅</span>
                  </div>
                  납부 일정 타임라인
                </h4>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="relative">
                    {/* 타임라인 라인 */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-green-400 to-purple-400"></div>
                    
                    <div className="space-y-4">
                    {isNewApiStructure ? (
                      // 새로운 API 구조 사용
                      (jsonData.supplyPriceInfo?.paymentDates || []).map((item, index) => (
                          <div key={index} className="relative flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              index === 0 ? 'bg-blue-500' : 
                              index === (jsonData.supplyPriceInfo?.paymentDates || []).length - 1 ? 'bg-purple-500' : 
                              'bg-green-500'
                            }`}>
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold text-gray-800">{item.type}</div>
                                    <div className="text-sm text-gray-600">
                                      {item.paymentDate || '미정'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-bold ${
                                      index === 0 ? 'text-blue-600' : 
                                      index === (jsonData.supplyPriceInfo?.paymentDates || []).length - 1 ? 'text-purple-600' : 
                                      'text-green-600'
                                    }`}>
                                      {index === 0 ? '계약금' : 
                                       index === (jsonData.supplyPriceInfo?.paymentDates || []).length - 1 ? '잔금' : 
                                       '중도금'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                        </div>
                      ))
                    ) : (
                      // 기존 구조 사용
                      (jsonData["공급 금액 및 납부일"]?.납부일 || []).map((item, index) => (
                          <div key={index} className="relative flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              index === 0 ? 'bg-blue-500' : 
                              index === (jsonData["공급 금액 및 납부일"]?.납부일 || []).length - 1 ? 'bg-purple-500' : 
                              'bg-green-500'
                            }`}>
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold text-gray-800">{item.구분}</div>
                                    <div className="text-sm text-gray-600">{item.납부일}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-bold ${
                                      index === 0 ? 'text-blue-600' : 
                                      index === (jsonData["공급 금액 및 납부일"]?.납부일 || []).length - 1 ? 'text-purple-600' : 
                                      'text-green-600'
                                    }`}>
                                      {index === 0 ? '계약금' : 
                                       index === (jsonData["공급 금액 및 납부일"]?.납부일 || []).length - 1 ? '잔금' : 
                                       '중도금'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
              </div>
                </div>
                

          {/* 4. 신청 기준 섹션 */}
          <div id="criteria" className="mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">신청 기준</h3>
              </div>
            <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-600">무주택 요건</span>
                      <div className="text-sm font-bold text-gray-900 leading-relaxed">
                        {detailedCriteria.무주택}
                </div>
                    </div>
                  </div>
                  
                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600">자산 기준</span>
                    <span className="text-sm font-bold text-gray-900">{detailedCriteria.자산}</span>
                    </div>
                  </div>
                  
                <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
                  <div className="text-sm font-semibold text-gray-600 mb-3">소득 기준</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">우선공급</span>
                      <span className="text-sm font-bold text-gray-900">
                        {(() => {
                          const value = detailedCriteria.소득기준.우선공급;
                          if (typeof value === 'number') {
                            return Math.floor(value).toLocaleString() + '만원';
                          } else if (typeof value === 'string') {
                            // 문자열에서 숫자 부분만 추출하고 소수점 제거
                            const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                            return isNaN(numericValue) ? value : Math.floor(numericValue).toLocaleString() + '만원';
                          }
                          return value;
                        })()}
                      </span>
                      </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">일반공급</span>
                      <span className="text-sm font-bold text-gray-900">
                        {(() => {
                          const value = detailedCriteria.소득기준.일반공급;
                          if (typeof value === 'number') {
                            return Math.floor(value).toLocaleString() + '만원';
                          } else if (typeof value === 'string') {
                            // 문자열에서 숫자 부분만 추출하고 소수점 제거
                            const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
                            return isNaN(numericValue) ? value : Math.floor(numericValue).toLocaleString() + '만원';
                          }
                          return value;
                        })()}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                대출조회 페이지로 이동
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                해당 주택으로 대출조회를 진행하시겠습니까?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    
                    // 선택된 주택형이 없으면 첫 번째 주택형을 기본으로 선택
                    const targetHouseType = selectedHouseType || houseTypes[0];
                    const totalPrice = targetHouseType ? calculateTotalPrice(targetHouseType) : 500000000;
                    const houseType = getHouseType();
                    
                    // JSON 파일 경로에서 houseManageNo 추출
                    const extractHouseManageNoFromPath = (parsedjsonfiles) => {
                      if (!parsedjsonfiles) return null;
                      try {
                        const files = JSON.parse(parsedjsonfiles);
                        if (files.length > 0) {
                          const fileName = files[0].split('/').pop(); // 파일명만 추출
                          const match = fileName.match(/^(\d+)_/); // 첫 번째 숫자 추출
                          return match ? match[1] : null;
                        }
                      } catch (e) {
                        console.error('parsedjsonfiles에서 houseManageNo 추출 오류:', e);
                      }
                      return null;
                    };
                    
                    // houseManageNo 추출 (마커 데이터 > JSON 파일명 > null 순서)
                    let extractedHouseManageNo = houseData?.houseManageNo || 
                                                houseData?.id || 
                                                extractHouseManageNoFromPath(houseData?.parsedjsonfiles) ||
                                                null;
                    
                    // houseManageNo 유효성 검사 및 정리
                    if (extractedHouseManageNo) {
                      // 문자열인 경우 숫자만 추출
                      if (typeof extractedHouseManageNo === 'string') {
                        const numericMatch = extractedHouseManageNo.match(/\d+/);
                        extractedHouseManageNo = numericMatch ? numericMatch[0] : null;
                      }
                      
                      // 숫자가 아닌 경우 null로 설정
                      if (!extractedHouseManageNo || isNaN(parseInt(extractedHouseManageNo))) {
                        console.warn('⚠️ 유효하지 않은 houseManageNo:', extractedHouseManageNo);
                        extractedHouseManageNo = null;
                      }
                    }

                    // 납부일정 정보 추가 (새로운 구조 우선 사용)
                    const paymentSchedule = isNewApiStructure
                      ? jsonData.supplyPriceInfo?.paymentDates || []
                      : jsonData["공급 금액 및 납부일"]?.납부일 || [];

                    // paymentSchedule에서 잔금처리일 추출
                    const balancePayment = paymentSchedule.find(p => p.type === '잔금' || p.구분 === '잔금');
                    const 잔금처리일 = balancePayment?.paymentDate || balancePayment?.납부일 || null;

                    const houseDataToSend = {
                      houseName: houseName,
                      price: totalPrice, // 원 단위로 변경
                      region:
                        houseData?.hssplyAdres ||
                        jsonData?.해당지역 ||
                        "서울특별시 강남구", // hssplyAdres를 우선으로 사용
                      size: 84.5,
                      houseType: houseType, // 주택 유형 추가
                      selectedHouseType: targetHouseType?.type || "42A", // 선택된 주택형
                      totalPrice: totalPrice, // 총 금액 (원 단위)
                      hssplyAdres:
                        houseData?.hssplyAdres || jsonData?.hssplyAdres || "", // 공급주소 추가
                      // 주택 관리 번호 추가 (다양한 소스에서 추출)
                      houseManageNo: extractedHouseManageNo,
                      // 잔금처리일 정보 추가 (paymentSchedule에서 추출)
                      잔금처리일: 잔금처리일,
                      // 납부일정 정보 추가
                      paymentSchedule: paymentSchedule,
                    };
                    
                    console.log('🔍 좌측 패널 - houseManageNo 추출 과정:', {
                      'houseData.houseManageNo': houseData?.houseManageNo,
                      'houseData.id': houseData?.id,
                      'parsedjsonfiles': houseData?.parsedjsonfiles,
                      'JSON파일에서 추출': extractHouseManageNoFromPath(houseData?.parsedjsonfiles),
                      '최종 extractedHouseManageNo': extractedHouseManageNo
                    });
                    console.log('🔍 좌측 패널 - 대출조회로 전달할 주택 데이터:', houseDataToSend);
                    console.log('🔍 좌측 패널 - 원본 houseData:', houseData);
                    console.log('🔍 좌측 패널 - 잔금처리일 추출 결과:', {
                      'paymentSchedule': paymentSchedule,
                      'balancePayment': balancePayment,
                      '잔금처리일': 잔금처리일,
                      '최종 houseDataToSend.잔금처리일': houseDataToSend.잔금처리일
                    });
                    
                    navigate('/loan-inquiry', { 
                      state: { 
                        houseData: houseDataToSend
                      } 
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeftHouseTypePanel;
