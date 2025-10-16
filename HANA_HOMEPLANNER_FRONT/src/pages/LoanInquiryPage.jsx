/**
 * 원스톱 대출조회 페이지 - 리팩토링된 버전
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { Calculator } from 'lucide-react';
import { 
  calculateLTV, 
  calculateDSR, 
  calculateDTI,
  calculateCoupleLTV,
  calculateCoupleDSR,
  calculateCoupleDTI
} from '@/services';
import { useIncomeData } from '@/hooks/useIncomeData';

// 단계별 컴포넌트들
import HouseInfoStep from '@/components/loan/steps/HouseInfoStep';
import LoanConditionsStep from '@/components/loan/steps/LoanConditionsStep';
import InterestAndRequirementsStep from '@/components/loan/steps/InterestAndRequirementsStep';
import IncomeAndDSRStep from '@/components/loan/steps/IncomeAndDSRStep';
import PersonalInfoStep from '@/components/loan/steps/PersonalInfoStep';
import LoanResultStep from '@/components/loan/steps/LoanResultStep';
import DetailModal from '@/components/loan/steps/DetailModal';

// 공통 컴포넌트들
import StepProgress from '@/components/loan/common/StepProgress';
import AnimatedStep from '@/components/loan/common/AnimatedStep';

export default function LoanInquiryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL에서 전달받은 주택 정보
  const houseData = location.state?.houseData || null;
  
  // 현재 단계 상태
  const [currentStep, setCurrentStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState('right');
  
  // 단계 정의
  const steps = [
    { title: '주택 정보', description: '주택 정보 확인' },
    { title: '대출 조건', description: '대출 조건 설정' },
    { title: '금리 및 요건', description: '금리와 신청요건 설정' },
    { title: '연소득 및 DSR', description: '연소득과 DSR 한도 설정' },
    { title: '부부 공동 대출', description: '부부 공동 대출 정보' },
    { title: '결과 확인', description: '대출 결과 확인' }
  ];
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    // 주택 정보
    housePrice: houseData?.price || 1000000000,
    region: houseData?.region || '서울특별시 강남구',
    city: houseData?.city || '서울특별시',
    district: houseData?.district || '강남구',
    houseType: houseData?.houseType || '아파트',
    houseSize: houseData?.size || 84.5,
    
    // 대출 조건
    desiredLoanAmount: houseData?.price ? houseData.price * 0.4 : 400000000,
    desiredLoanPeriod: 30,
    desiredInterestRate: 3.5,
    housingStatus: '무주택자',
    interestRate: 3.5,
    loanPeriod: 30,
    repayMethod: '만기일시',
    
    // 개인 정보
    dtiLimit: 40,
    dsrLimit: 40,
    annualIncome: 50000000,
    existingLoanRepayment: 0
  });

  // 대출조회 결과 상태
  const [ltvData, setLtvData] = useState(null);
  const [dsrData, setDsrData] = useState(null);
  const [dtiData, setDtiData] = useState(null);
  const [recommendedType, setRecommendedType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 커플 연동 상태
  const [coupleStatus, setCoupleStatus] = useState(null);
  const [isCheckingCouple, setIsCheckingCouple] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isLoadingPartner, setIsLoadingPartner] = useState(false);
  
  // 연소득 데이터 훅
  const { 
    isLoading: isLoadingIncome, 
    incomeData, 
    fetchMyIncome, 
    fetchIncomeByUserId 
  } = useIncomeData();
  
  // 모달 상태
  const [selectedModal, setSelectedModal] = useState(null);
  
  // 선택된 카드 상태
  const [selectedCard, setSelectedCard] = useState(null); // 'ltv', 'dsr', 'dti'
  
  // 주택 정보 편집 모드 상태 (시세 마커 데이터가 없으면 자동으로 편집 모드)
  const [isEditingHouseInfo, setIsEditingHouseInfo] = useState(!houseData);

  // 주택가격이 변경될 때 희망 대출금액 자동 업데이트 (천단위 반올림)
  useEffect(() => {
    if (formData.housePrice > 0) {
      const suggestedLoanAmount = Math.round(formData.housePrice * 0.4 / 1000) * 1000;
      setFormData(prev => ({
        ...prev,
        desiredLoanAmount: suggestedLoanAmount
      }));
    }
  }, [formData.housePrice]);

  // 페이지 로드 시 커플 연동 상태 확인
  useEffect(() => {
    checkCoupleStatus();
  }, []);

  // 입력 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 커플 연동 상태 확인 함수
  const checkCoupleStatus = async () => {
    setIsCheckingCouple(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUPLE.STATUS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCoupleStatus(result.data);
        console.log('커플 연동 상태:', result.data);
      } else {
        console.error('커플 연동 상태 확인 실패');
        setCoupleStatus(null);
      }
    } catch (error) {
      console.error('커플 연동 상태 확인 오류:', error);
      setCoupleStatus(null);
    } finally {
      setIsCheckingCouple(false);
    }
  };

  // 파트너 정보 가져오기 함수
  const fetchPartnerInfo = async (partnerUserId) => {
    setIsLoadingPartner(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUPLE.PARTNER}/${partnerUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPartnerInfo(result.data);
        console.log('파트너 정보:', result.data);
      } else {
        console.error('파트너 정보 조회 실패');
        setPartnerInfo(null);
      }
    } catch (error) {
      console.error('파트너 정보 조회 오류:', error);
      setPartnerInfo(null);
    } finally {
      setIsLoadingPartner(false);
    }
  };

  // 단계 이동 핸들러
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setAnimationDirection('right');
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 100);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setAnimationDirection('left');
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
      }, 100);
    }
  };

  // 내 연소득 불러오기
  const handleLoadMyIncome = async () => {
    try {
      const incomeData = await fetchMyIncome();
      if (incomeData?.annualIncome) {
        handleInputChange('annualIncome', incomeData.annualIncome);
      }
    } catch (error) {
      console.error('연소득 불러오기 실패:', error);
      // 토큰 만료 에러는 useIncomeData 훅에서 이미 처리됨
    }
  };

  // 배우자 연소득 불러오기
  const handleLoadSpouseIncome = async () => {
    try {
      if (coupleStatus?.partnerUserId) {
        const incomeData = await fetchIncomeByUserId(coupleStatus.partnerUserId);
        if (incomeData?.annualIncome) {
          handleInputChange('spouseIncome', incomeData.annualIncome);
        }
      }
    } catch (error) {
      console.error('배우자 연소득 불러오기 실패:', error);
    }
  };

  // 추천 대출 기준 계산
  const calculateRecommendation = (ltv, dsr, dti) => {
    const recommendations = [];
    
    if (ltv) {
      recommendations.push({
        type: 'LTV',
        maxAmount: ltv.maxLoanAmount || 0
      });
    }
    
    if (dsr) {
      // DSR 기준: 실제 대출 가능 금액 사용
      // DSR 한도 초과시 40% 기준 금액, 아닐땐 희망 금액
      const isDsrExceeded = dsr.baseDsrStatus === '초과' || dsr.baseDsrStatus === 'FAIL';
      const maxAmount = isDsrExceeded 
        ? (dsr.maxLoanAmountForBaseRate || 0)
        : (dsr.desiredLoanAmount || 0);
        
      recommendations.push({
        type: 'DSR', 
        maxAmount: maxAmount,
        dsrRatio: dsr.baseDsr,
        dsrStatus: dsr.baseDsrStatus
      });
    }
    
    if (dti) {
      // DTI 기준: 실제 대출 가능 금액 사용
      // DTI 한도 초과시 제한 금액, 아닐땐 희망 금액
      const maxAmount = dti.dtiStatus === 'FAIL' 
        ? (dti.maxLoanAmountForDtiLimit || 0)
        : (dti.desiredLoanAmount || 0);
        
      recommendations.push({
        type: 'DTI', 
        maxAmount: maxAmount,
        dtiRatio: dti.dtiRatio,
        dtiStatus: dti.dtiStatus
      });
    }
    
    // 가장 제한적인(낮은) 대출 금액 찾기
    if (recommendations.length > 0) {
      const sorted = recommendations.sort((a, b) => a.maxAmount - b.maxAmount);
      console.log('추천 기준 계산:', sorted);
      return sorted[0].type;
    }
    
  return null;
};

  // 대출조회 실행 (LTV + DSR + DTI)
  const handleLoanInquiry = async (isCoupleLoanRequest = null) => {
    setIsLoading(true);
    setError(null);
    setLtvData(null);
    setDsrData(null);
    setDtiData(null);
    
    try {
      // 매개변수로 받은 값이 있으면 사용, 없으면 기존 로직 사용
      const isCoupleLoan = isCoupleLoanRequest !== null 
        ? isCoupleLoanRequest 
        : (formData.isCoupleLoan && coupleStatus?.hasCouple && coupleStatus?.partnerUserId);
      
      // 부부 공동 대출인데 coupleStatus의 partnerUserId가 없으면 에러 처리
      if (isCoupleLoan && (!coupleStatus?.partnerUserId)) {
        setError('배우자 정보를 불러올 수 없습니다. 다시 시도해주세요.');
        setIsLoading(false);
        return;
      }
      
      let ltvResult, dsrResult, dtiResult;
      
      if (isCoupleLoan) {
        // 부부 공동 대출 API 호출
        [ltvResult, dsrResult, dtiResult] = await Promise.all([
          calculateCoupleLTV({
            housePrice: formData.housePrice,
            region: formData.region,
            housingStatus: formData.housingStatus,
            interestRate: formData.desiredInterestRate,
            loanPeriod: formData.desiredLoanPeriod,
            repayMethod: formData.repayMethod,
            spouseUserId: coupleStatus.partnerUserId
          }),
          calculateCoupleDSR({
            region: formData.region,
            desiredLoanAmount: formData.desiredLoanAmount,
            desiredInterestRate: formData.desiredInterestRate,
            desiredLoanPeriod: formData.desiredLoanPeriod,
            repayMethod: formData.repayMethod,
            spouseUserId: coupleStatus.partnerUserId
          }),
          calculateCoupleDTI({
            region: formData.region,
            desiredInterestRate: formData.desiredInterestRate,
            desiredLoanPeriod: formData.desiredLoanPeriod,
            desiredLoanAmount: formData.desiredLoanAmount,
            repayMethod: formData.repayMethod,
            spouseUserId: coupleStatus.partnerUserId
          })
        ]);
      } else {
        // 일반 대출 API 호출
        [ltvResult, dsrResult, dtiResult] = await Promise.all([
          calculateLTV({
            housePrice: formData.housePrice,
            region: formData.region,
            housingStatus: formData.housingStatus,
            interestRate: formData.desiredInterestRate,
            loanPeriod: formData.desiredLoanPeriod,
            repayMethod: formData.repayMethod
          }),
          calculateDSR({
            region: formData.region,
            desiredLoanAmount: formData.desiredLoanAmount,
            desiredInterestRate: formData.desiredInterestRate,
            desiredLoanPeriod: formData.desiredLoanPeriod,
            repayMethod: formData.repayMethod,
            dsrLimit: formData.dsrLimit
          }),
          calculateDTI({
            region: formData.region,
            desiredInterestRate: formData.desiredInterestRate,
            desiredLoanPeriod: formData.desiredLoanPeriod,
            desiredLoanAmount: formData.desiredLoanAmount,
            repayMethod: formData.repayMethod,
            dtiLimit: formData.dtiLimit
          })
        ]);
      }
      
      console.log('LTV 결과:', ltvResult);
      console.log('DSR 결과:', dsrResult);
      console.log('DTI 결과:', dtiResult);
      
      // 결과를 상태에 저장 (새로운 API 응답 형식에 맞게 수정)
      setLtvData(ltvResult.data);
      setDsrData(dsrResult.data);
      setDtiData(dtiResult.data);
      
      // 추천 기준 계산
      const recommended = calculateRecommendation(ltvResult.data, dsrResult.data, dtiResult.data);
      setRecommendedType(recommended);
      
      goToNextStep(); // 결과 화면으로 이동
    } catch (error) {
      console.error('대출조회 오류:', error);
      
      // 토큰 관련 오류인 경우 조용히 처리 (이미 logout()에서 리다이렉트됨)
      if (error.message.includes('인증 토큰이 없습니다') || 
          error.message.includes('로그인해주세요') ||
          error.message.includes('인증이 만료되었습니다')) {
        console.log('🔇 [LoanInquiryPage] 인증 오류 - 자동 로그아웃 처리됨');
        return;
      }
      
      setError('대출조회 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 숫자 포맷팅 함수
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0원';
    const num = parseInt(amount);
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    } else {
      return `${num.toLocaleString()}원`;
    }
  };

  // 선택된 카드의 대출 가능 금액 계산 함수
  const getSelectedCardMaxLoanAmount = () => {
    console.log('=== getSelectedCardMaxLoanAmount 디버깅 ===');
    console.log('selectedCard:', selectedCard);
    console.log('ltvData:', ltvData);
    console.log('dsrData:', dsrData);
    console.log('dtiData:', dtiData);
    
    if (!selectedCard) {
      console.log('selectedCard가 없음, 0 반환');
      return 0;
    }
    
    let result = 0;
    
    switch (selectedCard) {
      case 'ltv':
        result = ltvData?.maxLoanAmount || 0;
        console.log('LTV 선택 - maxLoanAmount:', ltvData?.maxLoanAmount, 'result:', result);
        break;
      
      case 'dsr':
        if (dsrData?.baseDsrStatus === '초과' || dsrData?.baseDsrStatus === 'FAIL') {
          result = dsrData?.maxLoanAmountForBaseRate || 0;
          console.log('DSR 초과/FAIL - maxLoanAmountForBaseRate:', dsrData?.maxLoanAmountForBaseRate, 'result:', result);
        } else {
          result = dsrData?.desiredLoanAmount || 0;
          console.log('DSR 정상 - desiredLoanAmount:', dsrData?.desiredLoanAmount, 'result:', result);
        }
        break;
      
      case 'dti':
        if (dtiData?.dtiStatus === 'FAIL') {
          // DTI 한도 내에서의 최대 대출 가능 금액 (새로운 API 필드 사용)
          result = dtiData?.maxLoanAmountForDtiLimit || 0;
          console.log('DTI FAIL - maxLoanAmountForDtiLimit:', dtiData?.maxLoanAmountForDtiLimit, 'result:', result);
        } else {
          result = dtiData?.desiredLoanAmount || 0;
          console.log('DTI 정상 - desiredLoanAmount:', dtiData?.desiredLoanAmount, 'result:', result);
        }
        break;
      
      default:
        console.log('알 수 없는 카드 타입:', selectedCard);
        result = 0;
    }
    
    console.log('최종 결과:', result);
    console.log('=== 디버깅 종료 ===');
    return result;
  };

  return (
    <Layout currentPage="loan-inquiry" backgroundColor="bg-gray-50">
      <div className="min-h-screen bg-gray-50">
        {/* 토스뱅크 스타일 헤더 */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">대출 조회</h1>
              <div className="w-10"></div> {/* 균형을 위한 빈 공간 */}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 min-h-[700px]">
          {/* 간단한 설명 */}
        <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              맞춤형 대출 정보 확인
            </h2>
            <p className="text-sm text-gray-600">
              간단한 정보 입력으로 나에게 맞는 대출 조건을 확인해보세요
          </p>
        </div>

        {/* 단계별 진행 표시 */}
        <StepProgress 
          currentStep={currentStep} 
          totalSteps={steps.length} 
          steps={steps} 
        />

        {/* 단계별 콘텐츠 */}
        <div className="relative">
          {/* 1단계: 주택 정보 입력/확인 */}
          {currentStep === 1 && (
            <AnimatedStep isActive={true} direction={animationDirection}>
              <HouseInfoStep
                formData={formData}
                houseData={houseData}
                isEditingHouseInfo={isEditingHouseInfo}
                setIsEditingHouseInfo={setIsEditingHouseInfo}
                handleInputChange={handleInputChange}
                onNext={goToNextStep}
                formatCurrency={formatCurrency}
              />
            </AnimatedStep>
          )}

          {/* 2단계: 대출 조건 설정 */}
          {currentStep === 2 && (
            <AnimatedStep isActive={true} direction={animationDirection}>
              <LoanConditionsStep
                formData={formData}
                handleInputChange={handleInputChange}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </AnimatedStep>
          )}

          {/* 3단계: 금리 및 신청요건 */}
          {currentStep === 3 && (
            <AnimatedStep isActive={true} direction={animationDirection}>
              <InterestAndRequirementsStep
                formData={formData}
                handleInputChange={handleInputChange}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            </AnimatedStep>
          )}

          {/* 4단계: 연소득 및 DSR 한도 */}
          {currentStep === 4 && (
            <AnimatedStep isActive={true} direction={animationDirection}>
              <IncomeAndDSRStep
                formData={formData}
                handleInputChange={handleInputChange}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isLoadingIncome={isLoadingIncome}
                handleLoadMyIncome={handleLoadMyIncome}
              />
            </AnimatedStep>
          )}

          {/* 5단계: 부부 공동 대출 */}
          {currentStep === 5 && (
            <AnimatedStep isActive={true} direction={animationDirection}>
              <PersonalInfoStep
                formData={formData}
                handleInputChange={handleInputChange}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isLoading={isLoading}
                handleLoanInquiry={(isCoupleLoan) => handleLoanInquiry(isCoupleLoan)}
                coupleStatus={coupleStatus}
                isCheckingCouple={isCheckingCouple}
                partnerInfo={partnerInfo}
                isLoadingPartner={isLoadingPartner}
                isLoadingIncome={isLoadingIncome}
                handleLoadMyIncome={handleLoadMyIncome}
                handleLoadSpouseIncome={handleLoadSpouseIncome}
                fetchPartnerInfo={fetchPartnerInfo}
              />
            </AnimatedStep>
          )}

          {/* 6단계: 결과 화면 */}
          {currentStep === 6 && (
            <AnimatedStep isActive={true} direction={animationDirection}>
              <LoanResultStep
                isLoading={isLoading}
                error={error}
                ltvData={ltvData}
                dsrData={dsrData}
                dtiData={dtiData}
                recommendedType={recommendedType}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                setSelectedModal={setSelectedModal}
                houseData={houseData}
                formData={formData}
                coupleStatus={coupleStatus}
                partnerInfo={partnerInfo}
                handleLoanInquiry={handleLoanInquiry}
                getSelectedCardMaxLoanAmount={getSelectedCardMaxLoanAmount}
                formatCurrency={formatCurrency}
                navigate={navigate}
                setCurrentStep={setCurrentStep}
              />
            </AnimatedStep>
                      )}
                    </div>
        </div>
      </div>

      {/* 상세 정보 모달들 */}
      <DetailModal
        isOpen={selectedModal === 'ltv'}
        onClose={() => setSelectedModal(null)}
        type="ltv"
        data={ltvData}
      />
      <DetailModal
        isOpen={selectedModal === 'dsr'}
        onClose={() => setSelectedModal(null)}
        type="dsr"
        data={dsrData}
      />
      <DetailModal
        isOpen={selectedModal === 'dti'}
        onClose={() => setSelectedModal(null)}
        type="dti"
        data={dtiData}
      />
    </Layout>
  );
}