import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/layout';
import { getLoanRecommendations, getSavingsRecommendations, getCapitalPortfolioRecommendations, saveCapitalPlanSelection, transformPortfolioData, transformSavingsData, transformCapitalPortfolioData } from '@/services/portfolioService';
import { useAssetsData } from '@/hooks/useAssetsData';
import { useCoupleStatus } from '@/hooks/useCoupleStatus';
import PortfolioDetailModal from '@/components/portfolio/PortfolioDetailModal';
import PlanNameModal from '@/components/portfolio/PlanNameModal';
import { getUser } from '@/lib/auth';
import { 
  TrendingUp, 
  DollarSign,
  Target,
  Calendar,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Heart,
  Baby,
  Users,
  ArrowLeft,
  Zap,
  Download,
  Gift,
  Shield,
  Lightbulb,
  Rocket,
  ArrowRight,
  Edit3,
  Save,
  RefreshCw,
  X
} from 'lucide-react';

export default function PortfolioRecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 대출 시뮬레이션에서 전달받은 데이터
  const loanData = location.state?.loanData || null;
  const houseData = location.state?.houseData || null;
  
  // 사용자 정보 가져오기
  const currentUser = getUser();
  
  
  // 현재 활성화된 섹션 상태
  const [activeSection, setActiveSection] = useState('profile');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // API 결과 상태
  const [loanRecommendations, setLoanRecommendations] = useState(null);
  const [savingsRecommendations, setSavingsRecommendations] = useState(null);
  const [capitalPortfolioRecommendations, setCapitalPortfolioRecommendations] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [currentApiStep, setCurrentApiStep] = useState(0); // 0: 대출상품, 1: 적금상품, 2: 포트폴리오
  
  // 포트폴리오 상세 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  
  // 플랜 이름 입력 모달 상태
  const [isPlanNameModalOpen, setIsPlanNameModalOpen] = useState(false);
  const [selectedPlanForSaving, setSelectedPlanForSaving] = useState(null);
  
  // 플랜 저장 상태
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState(null);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    // 기본 정보 (대출 시뮬레이션에서 가져온 데이터)
    annualIncome: loanData?.annualIncome || '',
    housePrice: loanData?.housePrice || '',
    houseSize: loanData?.houseSize || '',
    assets: loanData?.assets || '',
    spouseAssets: '', // 배우자 자산
    
    // 자격 요건
    qualification: '', // 신생아, 신혼부부, 다자녀, 생애최초
    
    // 목표 설정
    targetAmount: 0,
    targetMonths: 0,
    monthlyPayment: 0
  });

  // 배우자 자산 정보 포함 여부
  const [includeSpouseAssets, setIncludeSpouseAssets] = useState(false);

  // 잔금처리일 계산 함수
  const getMoveInDate = () => {
    // 주택 데이터에서 잔금처리일 찾기
    const targetHouseData = houseData || loanData?.houseData || loanData?.house || loanData?.selectedHouse;
    
    console.log('🔍 잔금처리일 디버깅:', {
      houseData,
      loanData,
      targetHouseData,
      잔금처리일: targetHouseData?.잔금처리일,
      'paymentSchedule': targetHouseData?.paymentSchedule,
      'paymentSchedule에서 잔금 찾기': targetHouseData?.paymentSchedule?.find(p => p.type === '잔금' || p.구분 === '잔금'),
      'targetHouseData 전체': targetHouseData
    });
    
    // 잔금처리일 찾기 (직접 필드 또는 paymentSchedule에서)
    let moveInDate = null;
    
    if (targetHouseData?.잔금처리일) {
      moveInDate = targetHouseData.잔금처리일;
      console.log('🔍 잔금처리일 필드에서 발견:', moveInDate);
    } else if (targetHouseData?.paymentSchedule) {
      const balancePayment = targetHouseData.paymentSchedule.find(p => p.type === '잔금' || p.구분 === '잔금');
      if (balancePayment) {
        moveInDate = balancePayment.paymentDate || balancePayment.납부일;
        console.log('🔍 paymentSchedule에서 잔금처리일 발견:', moveInDate);
      }
    }
    
    if (moveInDate) {
      // 날짜 형식 검증 및 변환
      if (moveInDate.includes('-') && moveInDate.split('-').length === 3) {
        // 이미 완전한 날짜 형식인 경우 (예: "2026-01-15")
        console.log('🔍 완전한 날짜 형식:', moveInDate);
        return moveInDate;
      } else if (moveInDate.includes('-') && moveInDate.split('-').length === 2) {
        // 년-월 형식인 경우 (예: "2029-03" -> "2029-03-01")
        const fullDate = `${moveInDate}-01`;
        console.log('🔍 년-월 형식 변환:', fullDate);
        return fullDate;
      }
    }
    
    // 주택 데이터가 없거나 잔금처리일이 없는 경우 목표 개월수로부터 계산
    const targetMonths = parseInt(formData.targetMonths) || 24;
    const fallbackDate = new Date();
    fallbackDate.setMonth(fallbackDate.getMonth() + targetMonths);
    console.log('🔍 기본값 사용 (24개월 후):', fallbackDate.toISOString().split('T')[0]);
    return fallbackDate.toISOString().split('T')[0];
  };

  // 잔금처리일 포맷팅 함수
  const formatMoveInDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // 디데이 계산 함수
  const getDaysUntilMoveIn = () => {
    const moveInDateString = getMoveInDate();
    if (!moveInDateString) return 0;
    
    try {
      const today = new Date();
      const moveInDate = new Date(moveInDateString);
      
      // 시간을 00:00:00으로 설정하여 날짜만 비교
      today.setHours(0, 0, 0, 0);
      moveInDate.setHours(0, 0, 0, 0);
      
      const timeDiff = moveInDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return daysDiff;
    } catch (error) {
      console.error('디데이 계산 오류:', error);
      return 0;
    }
  };

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState({
    profile: false,
    qualification: false,
    goals: false
  });

  // 자산 데이터 훅
  const { 
    isLoading: isLoadingAssets, 
    assetsData, 
    fetchMyTotalAssets, 
    fetchTotalAssetsByUserId 
  } = useAssetsData();

  // 커플 상태 훅
  const { coupleStatus, isLoading: isLoadingCouple } = useCoupleStatus();

  // 대출 시뮬레이션 데이터가 있으면 자동으로 채워주기
  useEffect(() => {
    if (loanData) {
      console.log('포트폴리오 추천 페이지에서 받은 loanData:', loanData);
      console.log('maxLoanAmount:', loanData.maxLoanAmount);
      
      setFormData(prev => ({
        ...prev,
        annualIncome: loanData.annualIncome || '',
        housePrice: loanData.housePrice || '',
        houseSize: loanData.houseSize || '',
        assets: loanData.assets || ''
      }));
    }
  }, [loanData]);

  // D-Day 값을 기준으로 목표 기간 자동 설정
  useEffect(() => {
    const daysUntilMoveIn = getDaysUntilMoveIn();
    
    if (daysUntilMoveIn > 0) {
      // 일수를 개월수로 변환 (30일 = 1개월로 계산)
      const monthsUntilMoveIn = Math.ceil(daysUntilMoveIn / 30);
      
      // 최소 12개월, 최대 60개월 범위 내에서 설정
      const targetMonths = Math.max(12, Math.min(60, monthsUntilMoveIn));
      
      console.log('D-Day 기반 목표 기간 자동 설정:', {
        daysUntilMoveIn,
        monthsUntilMoveIn,
        targetMonths
      });
      
      setFormData(prev => ({
        ...prev,
        targetMonths: targetMonths
      }));
    }
  }, [houseData, loanData]); // houseData나 loanData가 변경될 때마다 재계산

  // 주택가격과 대출 가능 금액을 기준으로 목표희망금 자동 설정
  useEffect(() => {
    // 문자열에서 숫자만 추출하여 변환
    const housePriceStr = String(formData.housePrice || '').replace(/[^\d]/g, '');
    const housePrice = parseInt(housePriceStr) || 0;
    const loanAvailable = parseInt(loanData?.maxLoanAmount) || 0;
    
    console.log('목표희망금 계산 전:', {
      formDataHousePrice: formData.housePrice,
      housePriceStr,
      housePrice,
      loanAvailable,
      loanDataMaxLoanAmount: loanData?.maxLoanAmount
    });
    
    if (housePrice > 0 && loanAvailable > 0) {
      // 주택가격에서 대출 가능 금액을 뺀 금액을 천 단위로 반올림
      const difference = housePrice - loanAvailable;
      const targetAmount = Math.round(difference / 1000) * 1000;
      
      console.log('목표희망금 자동 설정:', {
        housePrice,
        loanAvailable,
        difference,
        targetAmount
      });
      
      setFormData(prev => ({
        ...prev,
        targetAmount: targetAmount
      }));
    }
  }, [formData.housePrice, loanData?.maxLoanAmount]);

  // 목표희망금과 개월수가 변경될 때 매월 납입금액 자동 계산
  useEffect(() => {
    if (formData.targetAmount > 0 && formData.targetMonths > 0) {
      // 천의 자릿수에서 반올림 (예: 8333333 -> 8330000)
      const monthlyPayment = Math.round(formData.targetAmount / formData.targetMonths / 1000) * 1000;
      setFormData(prev => ({
        ...prev,
        monthlyPayment: monthlyPayment
      }));
    } else {
      // 목표 금액이나 개월수가 0이면 월 납입액도 0으로 설정
      setFormData(prev => ({
        ...prev,
        monthlyPayment: 0
      }));
    }
  }, [formData.targetAmount, formData.targetMonths]);

  // 배경 클릭으로 카드 선택 해제
  useEffect(() => {
    const handleBackgroundClick = (e) => {
      // 카드 영역이 아닌 배경을 클릭했을 때만 선택 해제
      const cardContainer = document.querySelector('.card-container');
      if (cardContainer && !cardContainer.contains(e.target)) {
        setActiveSection(null);
      }
    };

    document.addEventListener('click', handleBackgroundClick);
    return () => {
      document.removeEventListener('click', handleBackgroundClick);
    };
  }, []);

  // 입력 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 내 자산 불러오기
  const handleLoadMyAssets = async () => {
    try {
      const assetsData = await fetchMyTotalAssets();
      console.log('🔍 포트폴리오 - 자산 데이터:', assetsData);
      
      // 새로운 API 응답 구조에 맞게 수정
      const totalAssets = assetsData?.summary?.totalAssets || assetsData?.totalAssets;
      if (totalAssets) {
        handleInputChange('assets', totalAssets);
        console.log('🔍 포트폴리오 - 자산 값 설정:', totalAssets);
      } else {
        console.warn('🔍 포트폴리오 - 자산 데이터가 없습니다:', assetsData);
      }
    } catch (error) {
      console.error('자산 불러오기 실패:', error);
    }
  };

  // 배우자 자산 불러오기
  const handleLoadSpouseAssets = async () => {
    try {
      if (coupleStatus?.partnerUserId) {
        const assetsData = await fetchTotalAssetsByUserId(coupleStatus.partnerUserId);
        console.log('🔍 포트폴리오 - 배우자 자산 데이터:', assetsData);
        
        // 새로운 API 응답 구조에 맞게 수정
        const totalAssets = assetsData?.summary?.totalAssets || assetsData?.totalAssets;
        if (totalAssets) {
          handleInputChange('spouseAssets', totalAssets);
          console.log('🔍 포트폴리오 - 배우자 자산 값 설정:', totalAssets);
        } else {
          console.warn('🔍 포트폴리오 - 배우자 자산 데이터가 없습니다:', assetsData);
        }
      }
    } catch (error) {
      console.error('배우자 자산 불러오기 실패:', error);
    }
  };

  // 총 자산 계산 (내 자산 + 배우자 자산)
  const getTotalAssets = () => {
    const myAssets = parseInt(formData.assets) || 0;
    const spouseAssets = includeSpouseAssets ? (parseInt(formData.spouseAssets) || 0) : 0;
    return myAssets + spouseAssets;
  };

  // 포트폴리오 상세 모달 핸들러
  const handleShowPortfolioDetail = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsDetailModalOpen(true);
  };

  const handleClosePortfolioDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedPortfolio(null);
  };

  // 플랜 저장 버튼 클릭 핸들러 (모달 열기)
  const handleSavePlan = (plan) => {
    console.log('🔍 플랜 저장 시도 - houseData:', houseData);
    console.log('🔍 플랜 저장 시도 - houseManageNo:', houseData?.houseManageNo);
    
    if (!houseData?.houseManageNo) {
      console.error('❌ houseManageNo가 없습니다:', houseData);
      toast.error('주택 정보가 없습니다. 시세분석에서 주택을 선택한 후 다시 시도해주세요.', {
        duration: 4000,
        position: 'top-center'
      });
      return;
    }

    // 선택된 플랜 저장하고 모달 열기
    setSelectedPlanForSaving(plan);
    setIsPlanNameModalOpen(true);
  };

  // 플랜 이름 입력 후 실제 저장 처리
  const handleConfirmSavePlan = async (planName) => {
    if (!selectedPlanForSaving) return;

    setIsSavingPlan(true);
    setSavingPlanId(selectedPlanForSaving.planType);

    try {
      // 추천 데이터 구조 확인
      console.log('🔍 플랜 저장 - loanRecommendations:', loanRecommendations);
      console.log('🔍 플랜 저장 - loanRecommendations 타입:', typeof loanRecommendations);
      console.log('🔍 플랜 저장 - loanRecommendations.isArray:', Array.isArray(loanRecommendations));
      console.log('🔍 플랜 저장 - savingsRecommendations:', savingsRecommendations);
      console.log('🔍 플랜 저장 - savingsRecommendations 타입:', typeof savingsRecommendations);
      
      // 선택된 대출 상품과 적금 상품 찾기
      let selectedLoan = null;
      let selectedSavings = null;
      
      // 대출 상품 선택 로직 개선
      if (loanRecommendations) {
        if (Array.isArray(loanRecommendations)) {
          selectedLoan = loanRecommendations.find(loan => loan.isRecommended) || loanRecommendations[0];
        } else if (loanRecommendations.recommendations && Array.isArray(loanRecommendations.recommendations)) {
          selectedLoan = loanRecommendations.recommendations.find(loan => loan.isRecommended) || loanRecommendations.recommendations[0];
        } else {
          selectedLoan = loanRecommendations; // 단일 객체인 경우
        }
      }
      
      // 적금 상품 선택 로직 개선
      if (savingsRecommendations) {
        if (Array.isArray(savingsRecommendations)) {
          selectedSavings = savingsRecommendations.find(savings => savings.isRecommended) || savingsRecommendations[0];
        } else if (savingsRecommendations.data && savingsRecommendations.data.recommendedProduct) {
          selectedSavings = savingsRecommendations.data.recommendedProduct;
        } else if (savingsRecommendations.recommendedProduct) {
          selectedSavings = savingsRecommendations.recommendedProduct;
        } else {
          selectedSavings = savingsRecommendations; // 단일 객체인 경우
        }
      }
      
      console.log('🔍 플랜 저장 - selectedLoan:', selectedLoan);
      console.log('🔍 플랜 저장 - selectedSavings:', selectedSavings);

      if (!selectedLoan || !selectedSavings) {
        throw new Error('대출 상품 또는 적금 상품을 찾을 수 없습니다.');
      }

      // productId 추출 로직 개선
      const loanProductId = selectedLoan.productId || selectedLoan.prodId || selectedLoan.id;
      const savingsProductId = selectedSavings.productId || selectedSavings.prodId || selectedSavings.id;
      
      console.log('🔍 플랜 저장 - 추출된 productId:', {
        loanProductId,
        savingsProductId,
        selectedLoanKeys: Object.keys(selectedLoan),
        selectedSavingsKeys: Object.keys(selectedSavings),
        selectedLoanFull: selectedLoan,
        selectedSavingsFull: selectedSavings
      });

      // productId가 없으면 에러 발생
      if (!loanProductId) {
        console.error('❌ 대출 상품 productId를 찾을 수 없습니다:', selectedLoan);
        throw new Error('대출 상품의 productId를 찾을 수 없습니다.');
      }
      
      if (!savingsProductId) {
        console.error('❌ 적금 상품 productId를 찾을 수 없습니다:', selectedSavings);
        throw new Error('적금 상품의 productId를 찾을 수 없습니다.');
      }

      // 플랜 데이터 구성
      const planData = {
        houseMngNo: houseData.houseManageNo,
        planName: planName, // 사용자가 입력한 플랜 이름 추가
        savingsId: savingsProductId,
        loanId: loanProductId,
        planType: selectedPlanForSaving.planType,
        loanAmount: selectedPlanForSaving.loanAmount,
        requiredMonthlySaving: selectedPlanForSaving.requiredMonthlySaving,
        totalSavingAtMoveIn: selectedPlanForSaving.totalSavingAtMoveIn,
        shortfallCovered: selectedPlanForSaving.shortfallCovered,
        planComment: selectedPlanForSaving.comment,
        planRecommendation: selectedPlanForSaving.recommendation,
        desiredMonthlySaving: capitalPortfolioRecommendations?.desiredSavingAnalysis?.desiredMonthlySaving || 0,
        desiredSavingMaturityAmount: capitalPortfolioRecommendations?.desiredSavingAnalysis?.desiredSavingMaturityAmount || 0,
        shortfallAfterDesiredSaving: capitalPortfolioRecommendations?.desiredSavingAnalysis?.shortfallAfterDesiredSaving || 0,
        comparisonStatus: capitalPortfolioRecommendations?.desiredSavingAnalysis?.comparisonStatus || "SUFFICIENT",
        comparisonComment: capitalPortfolioRecommendations?.desiredSavingAnalysis?.comparisonComment || "",
        comparisonRecommendation: capitalPortfolioRecommendations?.desiredSavingAnalysis?.recommendation || ""
      };

      console.log('🔍 플랜 저장 요청 데이터:', planData);

      const result = await saveCapitalPlanSelection(planData);
      
      if (result.success) {
        toast.success(`"${planName}" 포트폴리오 플랜이 성공적으로 저장되었습니다! 🎉`, {
          duration: 3000,
          position: 'top-center'
        });
        console.log('✅ 플랜 저장 성공:', result.data);
        
        // 모달 닫기
        setIsPlanNameModalOpen(false);
        setSelectedPlanForSaving(null);
        
        // 저장 성공 후 마이페이지로 이동
        setTimeout(() => {
          navigate('/mypage');
        }, 1500); // 토스트 메시지를 잠시 보여준 후 이동
      } else {
        throw new Error(result.message || '플랜 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('플랜 저장 오류:', error);
      toast.error(`플랜 저장 중 오류가 발생했습니다: ${error.message}`, {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setIsSavingPlan(false);
      setSavingPlanId(null);
    }
  };

  // 플랜 이름 모달 닫기 핸들러
  const handleClosePlanNameModal = () => {
    if (!isSavingPlan) {
      setIsPlanNameModalOpen(false);
      setSelectedPlanForSaving(null);
    }
  };

  // 편집 모드 토글
  const toggleEditMode = (section) => {
    setIsEditing(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 섹션 활성화
  const activateSection = (section) => {
    setActiveSection(section);
  };

  // 숫자 포맷팅 함수
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '0원';
    const num = parseInt(amount);
    if (isNaN(num)) return '0원';
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  // 자격 요건 옵션
  const qualificationOptions = [
    {
      id: 'newborn',
      title: '신생아',
      description: '출산 후 24개월 이내',
      icon: Baby,
      color: 'pink',
      gradient: 'from-pink-400 to-rose-500',
      benefits: ['육아비 지원', '저금리 대출', '보육비 지원'],
      emoji: '👶'
    },
    {
      id: 'newlywed',
      title: '신혼부부',
      description: '혼인신고 후 7년 이내',
      icon: Heart,
      color: 'red',
      gradient: 'from-red-400 to-pink-500',
      benefits: ['신혼부부 특별대출', '주거비 지원', '세제 혜택'],
      emoji: '💕'
    },
    {
      id: 'multichild',
      title: '다자녀',
      description: '자녀 2명 이상',
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-400 to-indigo-500',
      benefits: ['다자녀 가구 지원', '교육비 지원', '주거비 지원'],
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      id: 'firsttime',
      title: '생애최초',
      description: '주택 구매 경험 없음',
      icon: Star,
      color: 'green',
      gradient: 'from-green-400 to-emerald-500',
      benefits: ['생애최초 특별대출', 'LTV 우대', '금리 우대'],
      emoji: '⭐'
    }
  ];

  // 포트폴리오 추천 실행
  const handlePortfolioRecommendation = async () => {
    setIsGenerating(true);
    setApiError(null);
    setCurrentApiStep(0);
    
    try {
      console.log('포트폴리오 추천 실행:', formData);
      
      // 1단계: 대출 상품 추천 API 호출
      setCurrentApiStep(1);
      const apiParams = transformPortfolioData(formData);
      console.log('API 요청 파라미터:', apiParams);
      
      const loanResult = await getLoanRecommendations(apiParams);
      console.log('대출 상품 추천 결과:', loanResult);
      
      if (loanResult.success) {
        setLoanRecommendations(loanResult.data);
      } else {
        throw new Error(loanResult.message || '대출 상품 추천에 실패했습니다.');
      }
      
      // 2단계: 적금 상품 추천 API 호출
      setCurrentApiStep(2);
      const savingsParams = transformSavingsData(formData);
      console.log('적금 API 요청 파라미터:', savingsParams);
      
      const savingsResult = await getSavingsRecommendations(savingsParams);
      console.log('적금 상품 추천 결과:', savingsResult);
      
      if (savingsResult.success) {
        setSavingsRecommendations(savingsResult.data);
      } else {
        throw new Error(savingsResult.message || '적금 상품 추천에 실패했습니다.');
      }
      
      // 3단계: 자본 포트폴리오 추천 API 호출
      setCurrentApiStep(3);
      const capitalPortfolioParams = transformCapitalPortfolioData(formData, loanResult.data, loanData, houseData);
      console.log('자본 포트폴리오 API 요청 파라미터:', capitalPortfolioParams);
      
      const capitalPortfolioResult = await getCapitalPortfolioRecommendations(capitalPortfolioParams);
      console.log('자본 포트폴리오 추천 결과:', capitalPortfolioResult);
      
      if (capitalPortfolioResult.success) {
        setCapitalPortfolioRecommendations(capitalPortfolioResult.data);
      } else {
        throw new Error(capitalPortfolioResult.message || '자본 포트폴리오 추천에 실패했습니다.');
      }
      
      setIsGenerating(false);
      
    } catch (error) {
      console.error('포트폴리오 추천 오류:', error);
      setApiError(error.message);
      setIsGenerating(false);
    }
  };

  // 완료 상태 확인
  const isComplete = {
    profile: formData.annualIncome && formData.housePrice && formData.houseSize,
    qualification: formData.qualification !== '',
    goals: formData.targetAmount && formData.targetMonths && formData.monthlyPayment
  };

  const allComplete = isComplete.profile && isComplete.qualification && isComplete.goals;

  return (
    <Layout currentPage="portfolio-recommendation" backgroundColor="bg-gray-50">
      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            내 집 마련 플랜
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            고객님을 위한 맞춤형 내 집 마련 플랜을 만나보세요
          </p>
        </div>

        {/* 진행형 스텝 플로우 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeSection === "profile"
                  ? "bg-[#009071]/30 text-[#009071] border-2 border-[#009071]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeSection === "profile"
                    ? "bg-[#009071] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="font-semibold">기본 정보</span>
            </div>
            <div
              className={`w-8 h-0.5 ${
                activeSection === "qualification" || activeSection === "goals"
                  ? "bg-[#009071]"
                  : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeSection === "qualification"
                  ? "bg-[#009071]/30 text-[#009071] border-2 border-[#009071]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeSection === "qualification"
                    ? "bg-[#009071] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="font-semibold">자격 요건</span>
            </div>
            <div
              className={`w-8 h-0.5 ${
                activeSection === "goals" ? "bg-[#009071]" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeSection === "goals"
                  ? "bg-[#009071]/30 text-[#009071] border-2 border-[#009071]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeSection === "goals"
                    ? "bg-[#009071] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="font-semibold">목표 설정</span>
            </div>
          </div>
        </div>

        {/* 카드 기반 인터랙티브 UI - 진행형 스텝 플로우 */}
        <div className="card-container flex justify-center items-start gap-6 min-h-[400px] p-4">
          {/* 기본 정보 카드 */}
          <div
            className={`bg-[#E5F6F1] rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 w-80 flex flex-col ${
              activeSection === "profile"
                ? "ring-2 ring-[#009071] scale-105 border-[#009071] h-auto"
                : "border-[#009071] h-96"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              activateSection("profile");
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">기본 정보</h3>
                  <p className="text-sm text-gray-500">프로필 설정</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isComplete.profile && (
                  <CheckCircle className="w-5 h-5 text-[#009071]" />
                )}
              </div>
            </div>

            {activeSection === "profile" ? (
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연소득
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={
                        formData.annualIncome
                          ? formData.annualIncome.toLocaleString()
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("annualIncome", parseInt(value) || 0);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="50,000,000"
                    />
                    <span className="ml-2 text-sm text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주택 가격
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={
                        formData.housePrice
                          ? formData.housePrice.toLocaleString()
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("housePrice", parseInt(value) || 0);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1,000,000,000"
                    />
                    <span className="ml-2 text-sm text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주택 면적
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={formData.houseSize || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.]/g, "");
                        handleInputChange("houseSize", parseFloat(value) || 0);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="84.5"
                    />
                    <span className="ml-2 text-sm text-gray-500">㎡</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      자산 정보
                    </label>
                    <button
                      onClick={handleLoadMyAssets}
                      disabled={isLoadingAssets}
                      className="flex items-center px-2 py-1 text-xs font-medium text-[#009071] bg-white border border-[#009071] rounded-lg hover:bg-[#009071]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoadingAssets ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          불러오는 중...
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-1" />내 자산 불러오기
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={
                        formData.assets ? formData.assets.toLocaleString() : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, "");
                        handleInputChange("assets", parseInt(value) || 0);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="200,000,000"
                    />
                    <span className="ml-2 text-sm text-gray-500">원</span>
                  </div>
                  {includeSpouseAssets && formData.spouseAssets && (
                    <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">
                        총 자산 (내 자산 + 배우자 자산)
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {formatCurrency(getTotalAssets())}
                      </div>
                    </div>
                  )}
                </div>

                {/* 배우자 자산 정보 포함 체크박스 (커플 연동 시에만 표시) */}
                {coupleStatus?.hasCouple && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="includeSpouseAssets"
                        checked={includeSpouseAssets}
                        onChange={(e) => {
                          setIncludeSpouseAssets(e.target.checked);
                          if (!e.target.checked) {
                            // 체크박스 해제 시 배우자 자산 초기화
                            handleInputChange("spouseAssets", "");
                          }
                        }}
                        className="w-5 h-5 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <label
                        htmlFor="includeSpouseAssets"
                        className="flex items-center text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        배우자 자산 정보 포함하기
                      </label>
                    </div>

                    {/* 배우자 자산 정보 입력 (체크박스 활성화 시에만 표시) */}
                    {includeSpouseAssets && (
                      <div className="rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            배우자 자산 정보
                          </label>
                          <button
                            onClick={handleLoadSpouseAssets}
                            disabled={
                              isLoadingAssets || !coupleStatus?.partnerUserId
                            }
                            className="flex items-center px-2 py-1 text-xs font-medium text-[#009071] bg-white border border-[#009071] rounded-lg hover:bg-[#009071]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isLoadingAssets ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                불러오는 중...
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3 mr-1" />
                                배우자 자산 불러오기
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={
                              formData.spouseAssets
                                ? formData.spouseAssets.toLocaleString()
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d]/g,
                                ""
                              );
                              handleInputChange(
                                "spouseAssets",
                                parseInt(value) || 0
                              );
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                            placeholder="배우자 자산을 입력하세요"
                          />
                          <span className="ml-2 text-sm text-gray-500">원</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          연동된 배우자의 자산 정보를 불러올 수 있습니다
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 대출 가능 금액 정보 표시 (읽기 전용) */}
                {loanData?.maxLoanAmount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        대출 가능 금액
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(loanData.maxLoanAmount)}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      DSR, LTV 기준 계산된 최대 대출액 (수정 불가)
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">연소득</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(formData.annualIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">주택 가격</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(formData.housePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">주택 면적</span>
                  <span className="font-semibold text-gray-800">
                    {formData.houseSize}㎡
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">자산 정보</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(getTotalAssets())}
                    </span>
                    {includeSpouseAssets && formData.spouseAssets && (
                      <div className="text-xs text-pink-600 mt-1">
                        내 자산 + 배우자 자산
                      </div>
                    )}
                  </div>
                </div>

                {/* 대출 가능 금액 표시 */}
                {loanData?.maxLoanAmount && loanData.maxLoanAmount > 0 && (
                  <div className="pt-2 border-t border-black">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">
                        대출 가능 금액
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(loanData.maxLoanAmount)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      DSR, LTV 기준 계산된 최대 대출액
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 다음 단계 버튼 */}
            {activeSection === "profile" && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    activateSection("qualification");
                  }}
                  className="w-full bg-[#009071] hover:bg-[#007a5e] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  다음 단계
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </div>

          {/* 자격 요건 카드 */}
          <div
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 w-80 flex flex-col ${
              activeSection === "qualification"
                ? "ring-2 ring-[#009071] scale-105 border-[#009071] h-auto"
                : "border-[#009071] h-96"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              activateSection("qualification");
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">자격 요건</h3>
                  <p className="text-sm text-gray-500">혜택 선택</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isComplete.qualification && (
                  <CheckCircle className="w-5 h-5 text-[#009071]" />
                )}
              </div>
            </div>

            {activeSection === "qualification" ? (
              <div className="space-y-3 flex-1">
                {qualificationOptions.map((option) => {
                  const isSelected = formData.qualification === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputChange("qualification", option.id);
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-[#009071] bg-[#009071]/10"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{option.emoji}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {option.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-[#009071] ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {formData.qualification ? (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {
                          qualificationOptions.find(
                            (opt) => opt.id === formData.qualification
                          )?.emoji
                        }
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {
                            qualificationOptions.find(
                              (opt) => opt.id === formData.qualification
                            )?.title
                          }
                        </h4>
                        <p className="text-sm text-gray-600">
                          {
                            qualificationOptions.find(
                              (opt) => opt.id === formData.qualification
                            )?.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">자격 요건을 선택해주세요</p>
                  </div>
                )}
              </div>
            )}

            {/* 다음 단계 버튼 */}
            {activeSection === "qualification" && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    activateSection("goals");
                  }}
                  className="w-full bg-[#009071] hover:bg-[#007a5e] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  다음 단계
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </div>

          {/* 목표 설정 카드 */}
          <div
            className={`bg-[#CCF0E6] rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer border-2 w-80 flex flex-col ${
              activeSection === "goals"
                ? "ring-2 ring-[#009071] scale-105 border-[#009071] h-auto"
                : "border-[#009071] h-96"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              activateSection("goals");
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">목표 설정</h3>
                  <p className="text-sm text-gray-500">투자 목표</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isComplete.goals && (
                  <CheckCircle className="w-5 h-5 text-[#009071]" />
                )}
              </div>
            </div>

            {activeSection === "goals" ? (
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표 희망금
                  </label>
                  <div className="mb-3">
                    <input
                      type="range"
                      min="50000000"
                      max="500000000"
                      step="1000"
                      value={formData.targetAmount || 200000000}
                      onChange={(e) =>
                        handleInputChange(
                          "targetAmount",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #009071 0%, #009071 ${
                          (((formData.targetAmount || 200000000) - 50000000) /
                            450000000) *
                          100
                        }%, #d1d5db ${
                          (((formData.targetAmount || 200000000) - 50000000) /
                            450000000) *
                          100
                        }%, #d1d5db 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>5천만원</span>
                      <span>5억원</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#009071]">
                      {formatCurrency(
                        Math.round(formData.targetAmount / 10000000) * 10000000
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표 개월수
                  </label>
                  <div className="mb-3">
                    <input
                      type="range"
                      min="12"
                      max="60"
                      step="6"
                      value={formData.targetMonths || 60}
                      onChange={(e) =>
                        handleInputChange(
                          "targetMonths",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #009071 0%, #009071 ${
                          (((formData.targetMonths || 60) - 12) / 48) * 100
                        }%, #d1d5db ${
                          (((formData.targetMonths || 60) - 12) / 48) * 100
                        }%, #d1d5db 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>12개월</span>
                      <span>60개월</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#009071]">
                      {formData.targetMonths || 0}개월
                    </div>
                  </div>
                </div>

                {/* 예상 납입금액 결과 박스 */}
                <div className="bg-gradient-to-r from-[#009071] to-[#00C58E] rounded-xl p-4 text-white">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-lg mr-2">💡</span>
                    <span className="text-sm font-medium">
                      월 납입 예상금액
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency(formData.monthlyPayment)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">목표 금액</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(
                      Math.round(formData.targetAmount / 10000000) * 10000000
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">목표 기간</span>
                  <span className="font-semibold text-gray-800">
                    {formData.targetMonths || 0}개월
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">입주 예정일</span>
                  <span className="font-semibold text-blue-600">
                    {formatMoveInDate(getMoveInDate())}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">D-Day</span>
                  <span
                    className={`font-semibold ${
                      getDaysUntilMoveIn() > 0
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {getDaysUntilMoveIn() > 0
                      ? `D-${getDaysUntilMoveIn()}`
                      : "D-Day"}
                  </span>
                </div>
                <div className="pt-4 border-t border-black pb-20">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">
                      예상 월 납입액
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(formData.monthlyPayment)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="mt-12 text-center">
          {isGenerating ? (
            <div className="bg-blue-50 rounded-2xl shadow-lg p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                포트폴리오를 생성하고 있습니다
              </h3>

              {/* API 단계별 진행 표시 */}
              <div className="space-y-4 mb-6">
                <div
                  className={`flex items-center justify-center space-x-3 p-3 rounded-lg ${
                    currentApiStep >= 1
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentApiStep >= 1 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {currentApiStep > 1 ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">1</span>
                    )}
                  </div>
                  <span className="font-medium">대출 상품 추천</span>
                  {currentApiStep === 1 && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                </div>

                <div
                  className={`flex items-center justify-center space-x-3 p-3 rounded-lg ${
                    currentApiStep >= 2
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentApiStep >= 2 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {currentApiStep > 2 ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">2</span>
                    )}
                  </div>
                  <span className="font-medium">적금 상품 추천</span>
                  {currentApiStep === 2 && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                </div>

                <div
                  className={`flex items-center justify-center space-x-3 p-3 rounded-lg ${
                    currentApiStep >= 3
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentApiStep >= 3 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {currentApiStep > 3 ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">3</span>
                    )}
                  </div>
                  <span className="font-medium">포트폴리오 최적화</span>
                  {currentApiStep === 3 && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentApiStep / 3) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
            </div>
          ) : apiError ? (
            <div className="bg-red-50 rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  오류가 발생했습니다
                </h3>
                <p className="text-gray-600 mb-6">{apiError}</p>
                <button
                  onClick={handlePortfolioRecommendation}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : loanRecommendations ||
            savingsRecommendations ||
            capitalPortfolioRecommendations ? (
            <div className="space-y-6">
              {/* 대출 상품 추천 결과 */}
              <div
                className="rounded-2xl shadow-lg p-8"
                style={{ backgroundColor: "#009071" }}
              >
                <div className="flex items-center mb-8">
                  <div
                    className="rounded-full mr-4 flex items-center justify-center"
                    style={{
                      backgroundColor: "#009071",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <img
                      src="/icon/port.png"
                      alt="포트폴리오"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {currentUser?.userNm
                        ? `${currentUser.userNm}님의 내 집 마련 플랜 생성완료!`
                        : "내 집 마련 플랜 생성완료!"}
                    </h3>
                    <p className="text-white">
                      {loanRecommendations?.recommendationSummary ||
                        savingsRecommendations?.recommendedProduct?.comment ||
                        "맞춤형 금융 상품을 추천해드렸습니다."}
                    </p>
                  </div>
                </div>

                {/* 금융 상품 추천 결과 */}
                {(loanRecommendations || savingsRecommendations) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                      추천 금융 상품
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border border-gray-300 rounded-lg p-6 h-[500px]">
                      {/* 대출 상품 섹션 */}
                      {loanRecommendations && (
                        <div className="h-full flex flex-col overflow-y-auto">
                          {/* 헤더 - 고정 높이 */}
                          <div className="flex items-center mb-4 h-8">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center mr-2"
                              style={{ backgroundColor: "#dc231e" }}
                            >
                              <DollarSign className="w-3 h-3 text-white" />
                            </div>
                            <h5
                              className="text-base font-medium"
                              style={{ color: "#dc231e" }}
                            >
                              대출 상품
                            </h5>
                            <div
                              className="ml-auto px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: "#dc231e",
                                color: "white",
                              }}
                            >
                              {loanRecommendations.recommendations.length}개
                              상품
                            </div>
                          </div>

                          {/* 내용 영역 - 남은 공간 모두 사용 */}
                          <div className="space-y-4 flex-1 overflow-y-auto">
                            {loanRecommendations.recommendations.map(
                              (product, index) => (
                                <div
                                  key={product.productId}
                                  className="bg-white border border-gray-200 rounded-lg p-4 h-full hover:border-gray-300 transition-colors flex flex-col"
                                >
                                  {/* 카드 헤더 */}
                                  <div className="border-b border-gray-100 pb-3 mb-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div>
                                          <h6 className="font-medium text-gray-900 text-sm">
                                            {product.productName}
                                          </h6>
                                          <p className="text-gray-500 text-xs">
                                            {product.bankName}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-semibold text-gray-900">
                                          {product.estimatedInterestRate}
                                        </div>
                                        <div className="text-gray-500 text-xs">
                                          연 이자율
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 카드 본문 */}
                                  <div className="space-y-3 flex-1">
                                    {/* 주요 정보 */}
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 text-sm">
                                          최대 대출 한도
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {formatCurrency(
                                            product.maxLoanAmount
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 text-sm">
                                          상환 방법
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {product.repayMethod}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-gray-600 text-sm">
                                          최대 상환 기간
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {product.maxLoanPeriodMonths}개월
                                        </span>
                                      </div>
                                    </div>

                                    {/* 주요 특징 */}
                                    <div className="pt-2 border-t border-gray-100">
                                      <div className="text-xs font-medium text-gray-700 mb-2">
                                        주요 특징
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {product.keyFeatures.map(
                                          (feature, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                            >
                                              {feature}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 액션 버튼 - 하단 고정 */}
                                  <div className="pt-3 mt-auto">
                                    <button
                                      className="w-full text-white py-2 px-4 rounded text-sm font-medium transition-colors hover:opacity-90"
                                      style={{ backgroundColor: "#dc231e" }}
                                    >
                                      상품 자세히 보기
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* 적금 상품 섹션 */}
                      {savingsRecommendations && (
                        <div className="h-full flex flex-col">
                          {/* 헤더 - 고정 높이 */}
                          <div className="flex items-center mb-4 h-8">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center mr-2"
                              style={{ backgroundColor: "#009071" }}
                            >
                              <CreditCard className="w-3 h-3 text-white" />
                            </div>
                            <h5
                              className="text-base font-medium"
                              style={{ color: "#009071" }}
                            >
                              적금 상품
                            </h5>
                            <div
                              className="ml-auto px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: "#009071",
                                color: "white",
                              }}
                            >
                              1개 상품
                            </div>
                          </div>

                          {/* 내용 영역 - 남은 공간 모두 사용 */}
                          <div className="flex-1 overflow-y-auto">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors h-full flex flex-col">
                              {/* 카드 헤더 */}
                              <div className="border-b border-gray-100 pb-3 mb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div>
                                      <h6 className="font-medium text-gray-900 text-sm">
                                        {
                                          (
                                            savingsRecommendations.data
                                              ?.recommendedProduct ||
                                            savingsRecommendations.recommendedProduct
                                          )?.prodName
                                        }
                                      </h6>
                                      <p className="text-gray-500 text-xs">
                                        {
                                          (
                                            savingsRecommendations.data
                                              ?.recommendedProduct ||
                                            savingsRecommendations.recommendedProduct
                                          )?.bankName
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-semibold text-gray-900">
                                      {
                                        (
                                          savingsRecommendations.data
                                            ?.recommendedProduct ||
                                          savingsRecommendations.recommendedProduct
                                        )?.interestRate
                                      }
                                      %
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      연 이자율
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 카드 본문 */}
                              <div className="space-y-3 flex-1">
                                {/* 주요 정보 */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 text-sm">
                                      적립 기간
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {
                                        (
                                          savingsRecommendations.data
                                            ?.recommendedProduct ||
                                          savingsRecommendations.recommendedProduct
                                        )?.termMonths
                                      }
                                      개월
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 text-sm">
                                      월 적립액
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(
                                        (
                                          savingsRecommendations.data
                                            ?.recommendedProduct ||
                                          savingsRecommendations.recommendedProduct
                                        )?.monthlyDeposit
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 text-sm">
                                      만기 수령액
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(
                                        (
                                          savingsRecommendations.data
                                            ?.recommendedProduct ||
                                          savingsRecommendations.recommendedProduct
                                        )?.expectedMaturityAmount
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* 혜택 정보 */}
                                <div className="pt-2 border-t border-gray-100">
                                  <div className="text-xs font-medium text-gray-700 mb-2">
                                    혜택
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {(
                                      savingsRecommendations.data
                                        ?.recommendedProduct ||
                                      savingsRecommendations.recommendedProduct
                                    )?.taxPrefer && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                        세제 혜택
                                      </span>
                                    )}
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      안정적 수익
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 액션 버튼 - 하단 고정 */}
                              <div className="pt-3 mt-auto">
                                <button
                                  className="w-full text-white py-2 px-4 rounded text-sm font-medium transition-colors hover:opacity-90"
                                  style={{ backgroundColor: "#009071" }}
                                >
                                  상품 자세히 보기
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 자본 포트폴리오 추천 결과 */}
                {capitalPortfolioRecommendations && (
                  <div className="space-y-6">
                    {/* 자본 포트폴리오 분석 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                        사용자 자본 분석
                      </h4>

                      {/* 현재 상황 vs 희망 적금액 비교 */}
                      <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* 현재 상황 분석 */}
                        <div
                          className="rounded-lg p-4 border border-gray-200"
                          style={{ backgroundColor: "#fef2f2" }}
                        >
                          <div className="flex items-center mb-4">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center mr-2"
                              style={{ backgroundColor: "#dc231e" }}
                            >
                              <TrendingUp className="w-3 h-3 text-white" />
                            </div>
                            <h5
                              className="text-base font-medium"
                              style={{ color: "#dc231e" }}
                            >
                              현재 상황
                            </h5>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="bg-white rounded border border-gray-200 p-3">
                              <div className="text-xs text-gray-600 mb-1">
                                주택 가격
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  capitalPortfolioRecommendations.analysis
                                    .housePrice
                                )}
                              </div>
                            </div>
                            <div className="bg-white rounded border border-gray-200 p-3">
                              <div className="text-xs text-gray-600 mb-1">
                                현재 현금
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  capitalPortfolioRecommendations.analysis
                                    .currentCash
                                )}
                              </div>
                            </div>
                            <div className="bg-white rounded border border-gray-200 p-3">
                              <div className="text-xs text-gray-600 mb-1">
                                대출 가능 금액
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  capitalPortfolioRecommendations.analysis
                                    .totalLoanAvailable
                                )}
                              </div>
                            </div>
                            <div className="bg-white rounded border border-gray-200 p-3">
                              <div className="text-xs text-gray-600 mb-1">
                                부족 금액
                              </div>
                              <div className="text-sm font-semibold text-red-600">
                                {formatCurrency(
                                  capitalPortfolioRecommendations.analysis
                                    .totalShortfall
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 달성 가능성 상태 */}
                          <div
                            className={`p-3 rounded-lg border-l-4 ${
                              capitalPortfolioRecommendations.analysis
                                .feasibilityStatus === "POSSIBLE"
                                ? "bg-green-50 border-green-400"
                                : "bg-red-50 border-red-400"
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  capitalPortfolioRecommendations.analysis
                                    .feasibilityStatus === "POSSIBLE"
                                    ? "bg-green-400"
                                    : "bg-red-400"
                                }`}
                              ></div>
                              <span
                                className={`text-xs font-medium ${
                                  capitalPortfolioRecommendations.analysis
                                    .feasibilityStatus === "POSSIBLE"
                                    ? "text-green-800"
                                    : "text-red-800"
                                }`}
                              >
                                {capitalPortfolioRecommendations.analysis
                                  .feasibilityStatus === "POSSIBLE"
                                  ? "달성 가능"
                                  : "달성 어려움"}
                              </span>
                            </div>
                            <p
                              className={`text-xs ${
                                capitalPortfolioRecommendations.analysis
                                  .feasibilityStatus === "POSSIBLE"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {
                                capitalPortfolioRecommendations.analysis
                                  .feasibilityComment
                              }
                            </p>
                          </div>
                        </div>

                        {/* 희망 적금액 분석 */}
                        {capitalPortfolioRecommendations.desiredSavingAnalysis && (
                          <div
                            className="rounded-lg p-4 border border-gray-200"
                            style={{ backgroundColor: "#f0fdf4" }}
                          >
                            <div className="flex items-center mb-4">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center mr-2"
                                style={{ backgroundColor: "#009071" }}
                              >
                                <Target className="w-3 h-3 text-white" />
                              </div>
                              <h5
                                className="text-base font-medium"
                                style={{ color: "#009071" }}
                              >
                                희망 적금액
                              </h5>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="bg-white rounded border border-gray-200 p-3">
                                <div className="text-xs text-gray-600 mb-1">
                                  희망 월 적금액
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(
                                    capitalPortfolioRecommendations
                                      .desiredSavingAnalysis
                                      .desiredMonthlySaving
                                  )}
                                </div>
                              </div>
                              <div className="bg-white rounded border border-gray-200 p-3">
                                <div className="text-xs text-gray-600 mb-1">
                                  만기시 예상 적금액
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(
                                    capitalPortfolioRecommendations
                                      .desiredSavingAnalysis
                                      .desiredSavingMaturityAmount
                                  )}
                                </div>
                              </div>
                              <div className="bg-white rounded border border-gray-200 p-3">
                                <div className="text-xs text-gray-600 mb-1">
                                  부족한 금액
                                </div>
                                <div className="text-sm font-semibold text-red-600">
                                  {formatCurrency(
                                    capitalPortfolioRecommendations
                                      .desiredSavingAnalysis
                                      .shortfallAfterDesiredSaving
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 비교 상태 */}
                            <div
                              className={`p-3 rounded-lg border-l-4 ${
                                capitalPortfolioRecommendations
                                  .desiredSavingAnalysis.comparisonStatus ===
                                "SUFFICIENT"
                                  ? "bg-green-50 border-green-400"
                                  : "bg-red-50 border-red-400"
                              }`}
                            >
                              <div className="flex items-center mb-1">
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    capitalPortfolioRecommendations
                                      .desiredSavingAnalysis
                                      .comparisonStatus === "SUFFICIENT"
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                ></div>
                                <span
                                  className={`text-xs font-medium ${
                                    capitalPortfolioRecommendations
                                      .desiredSavingAnalysis
                                      .comparisonStatus === "SUFFICIENT"
                                      ? "text-green-800"
                                      : "text-red-800"
                                  }`}
                                >
                                  {capitalPortfolioRecommendations
                                    .desiredSavingAnalysis.comparisonStatus ===
                                  "SUFFICIENT"
                                    ? "충분한 적금액"
                                    : "부족한 적금액"}
                                </span>
                              </div>
                              <p
                                className={`text-xs ${
                                  capitalPortfolioRecommendations
                                    .desiredSavingAnalysis.comparisonStatus ===
                                  "SUFFICIENT"
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {
                                  capitalPortfolioRecommendations
                                    .desiredSavingAnalysis.comparisonComment
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 추천 포트폴리오 플랜들 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                        추천 내 집 마련 PLAN
                      </h4>

                      <div className="space-y-4">
                        {capitalPortfolioRecommendations.capitalPlans.map(
                          (plan, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 hover:border-opacity-80 transition-colors ${
                                plan.planType === "보수형"
                                  ? "border-blue-200 bg-blue-50"
                                  : plan.planType === "균형형"
                                  ? "border-green-200 bg-green-50"
                                  : "border-red-200 bg-red-50"
                              }`}
                            >
                              {/* 플랜 헤더 */}
                              <div className="border-b border-gray-100 pb-3 mb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-6 h-6 rounded flex items-center justify-center mr-2 ${
                                        plan.planType === "보수형"
                                          ? "bg-blue-600"
                                          : plan.planType === "균형형"
                                          ? "bg-green-600"
                                          : "bg-red-600"
                                      }`}
                                    >
                                      <TrendingUp className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                      <h6
                                        className={`font-medium text-sm ${
                                          plan.planType === "보수형"
                                            ? "text-blue-900"
                                            : plan.planType === "균형형"
                                            ? "text-green-900"
                                            : "text-red-900"
                                        }`}
                                      >
                                        {plan.planType} 포트폴리오
                                      </h6>
                                      <p
                                        className={`text-xs ${
                                          plan.planType === "보수형"
                                            ? "text-blue-600"
                                            : plan.planType === "균형형"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        안정성과 수익성의 균형
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 플랜 본문 */}
                              <div className="space-y-3">
                                <div className="text-xs text-gray-600 mb-2">
                                  {plan.comment}
                                </div>

                                {/* 주요 지표 */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                    <div className="text-xs text-gray-600 mb-1">
                                      대출 금액
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(plan.loanAmount)}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                    <div className="text-xs text-gray-600 mb-1">
                                      월 저축액
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(
                                        plan.requiredMonthlySaving
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                    <div className="text-xs text-gray-600 mb-1">
                                      입주시 저축액
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(plan.totalSavingAtMoveIn)}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                    <div className="text-xs text-gray-600 mb-1">
                                      부족액 충당
                                    </div>
                                    <div className="text-sm font-semibold text-green-600">
                                      {formatCurrency(plan.shortfallCovered)}
                                    </div>
                                  </div>
                                </div>

                                {/* 추천 이유 */}
                                <div className="pt-2 border-t border-gray-100">
                                  <div className="text-xs font-medium text-gray-700 mb-1">
                                    추천 이유
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {plan.recommendation}
                                  </p>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="pt-3 space-y-2">
                                  <button
                                    onClick={() =>
                                      handleShowPortfolioDetail(plan)
                                    }
                                    className={`w-full text-white py-2 px-4 rounded text-sm font-medium transition-colors hover:opacity-90 ${
                                      plan.planType === "보수형"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : plan.planType === "균형형"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                                  >
                                    플랜 자세히 보기
                                  </button>
                                  <button
                                    onClick={() => handleSavePlan(plan)}
                                    disabled={isSavingPlan}
                                    className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center ${
                                      plan.planType === "보수형"
                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        : plan.planType === "균형형"
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                    } ${
                                      isSavingPlan
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    {isSavingPlan &&
                                    savingPlanId === plan.planType ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                        저장 중...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-4 h-4 mr-2" />
                                        플랜 저장하기
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    onClick={() => {
                      setLoanRecommendations(null);
                      setSavingsRecommendations(null);
                      setCapitalPortfolioRecommendations(null);
                      setCurrentApiStep(0);
                    }}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    다시 추천받기
                  </button>
                  <button
                    onClick={() => navigate("/loan-simulation")}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    대출 시뮬레이션으로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 완료 상태 표시 */}
              <div className="bg-gray-50 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-center space-x-8 mb-6">
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                      isComplete.profile
                        ? "bg-[#009071]/10 text-[#009071]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">기본 정보</span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                      isComplete.qualification
                        ? "bg-[#009071]/10 text-[#009071]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">자격 요건</span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                      isComplete.goals
                        ? "bg-[#009071]/10 text-[#009071]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">목표 설정</span>
                  </div>
                </div>

                {allComplete ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      모든 정보가 완성되었습니다!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      이제 당신만의 맞춤형 포트폴리오를 추천해드릴게요
                    </p>
                    <button
                      onClick={handlePortfolioRecommendation}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      포트폴리오 추천받기
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                      <Lightbulb className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      정보를 완성해주세요
                    </h3>
                    <p className="text-gray-600 mb-6">
                      위의 카드들을 클릭하여 필요한 정보를 입력해주세요
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => activateSection("profile")}
                        className="px-6 py-3 bg-[#009071] hover:bg-[#007a5e] text-white rounded-lg transition-colors"
                      >
                        기본 정보 입력
                      </button>
                      <button
                        onClick={() => activateSection("qualification")}
                        className="px-6 py-3 bg-[#009071] hover:bg-[#007a5e] text-white rounded-lg transition-colors"
                      >
                        자격 요건 선택
                      </button>
                      <button
                        onClick={() => activateSection("goals")}
                        className="px-6 py-3 bg-[#009071] hover:bg-[#007a5e] text-white rounded-lg transition-colors"
                      >
                        목표 설정
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 뒤로가기 버튼 */}
              <button
                onClick={() => navigate("/loan-simulation")}
                className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                대출 시뮬레이션으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 포트폴리오 상세 모달 */}
      <PortfolioDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleClosePortfolioDetail}
        portfolioData={selectedPortfolio}
        analysisData={{
          ...capitalPortfolioRecommendations?.analysis,
          annualIncome: formData.annualIncome,
        }}
      />

      {/* 플랜 이름 입력 모달 */}
      <PlanNameModal
        isOpen={isPlanNameModalOpen}
        onClose={handleClosePlanNameModal}
        onConfirm={handleConfirmSavePlan}
        planType={selectedPlanForSaving?.planType}
        isLoading={isSavingPlan}
      />
    </Layout>
  );
}
