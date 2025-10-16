/**
 * 적금 가입 누적식 패널 플로우 컴포넌트
 * 관심사 분리: 각 단계별 컴포넌트를 분리하여 재사용성과 유지보수성 향상
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useSavingsSignup } from '@/hooks/useSavingsSignup';
import { API_BASE_URL } from '@/config/api';
import toast from 'react-hot-toast';
import { 
  PiggyBank, 
  Percent, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// 단계별 컴포넌트들
import SavingsInputStep from './steps/SavingsInputStep';
import SavingsAccountStep from './steps/SavingsAccountStep';

const SavingsSignupFlow = () => {
  const { productType, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 확인 (공동적금 초대가 아닌 경우만)
  useEffect(() => {
    const inviteId = location.state?.inviteId;
    // 공동적금 초대가 아닌 경우에만 로그인 확인
    if (!inviteId) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('로그인이 필요한 서비스입니다.');
        navigate('/login', { 
          state: { from: `/savings-signup/${productType}/${productId}` }
        });
      }
    }
  }, [navigate, productType, productId, location.state]);
  
  // 공동적금 초대 정보 (location.state에서 가져옴)
  const invitationData = location.state?.invitationData;
  const accountInfo = location.state?.accountInfo;
  const inviterName = location.state?.inviterName;
  const inviteId = location.state?.inviteId;
  
  // 공동적금 초대 정보 디버깅
  console.log('🔍 공동적금 초대 정보:', {
    inviteId,
    invitationData,
    accountInfo,
    inviterName,
    locationState: location.state
  });
  
  // 공동적금 만기일 정보
  const [maturityInfo, setMaturityInfo] = useState(null);
  const [isLoadingMaturityInfo, setIsLoadingMaturityInfo] = useState(false);
  
  const { productDetail, isLoading, error, getInterestRateText, getAmountRangeText, getPeriodText, getProductIcon } = useProductDetail(productId, productType);

  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [collapsedSteps, setCollapsedSteps] = useState(new Set()); // 접기 기능 비활성화
  const [signupData, setSignupData] = useState({
    // 가입 정보
    monthlyAmount: '',
    termMonths: '',
    preferredDay: '',
    initialDeposit: '',
    autoDebitAccountId: null,
    
    // 약관 동의
    termsAgreed: false,
    privacyAgreed: false,
    
    // 가입 결과
    accountNumber: '',
    accountId: ''
  });

  // 적금 가입 관련 훅
  const {
    isLoading: isSubmitting,
    error: submitError,
    accounts,
    isLoadingAccounts,
    fetchAllAccounts,
    submitSavingsSignup,
    validateSignupData,
    clearError
  } = useSavingsSignup();

  const steps = [
    { id: 1, title: '가입 정보 입력', description: '만기일과 월 적금액 설정' },
    { id: 2, title: '초기입금액 및 자동이체 설정', description: '초기입금액과 자동이체 계좌 설정' }
  ];

  // 공동적금 만기일 정보 조회 함수
  const fetchMaturityInfo = async (accountId) => {
    if (!accountId) return;
    
    try {
      setIsLoadingMaturityInfo(true);
      console.log('🔍 공동적금 만기일 정보 조회:', accountId);
      
      const response = await fetch(`${API_BASE_URL}/api/banks/savings/${accountId}/maturity-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMaturityInfo(result.data);
        console.log('✅ 공동적금 만기일 정보 조회 성공:', result.data);
        
        // 만기일을 signupData에 설정
        setSignupData(prev => ({
          ...prev,
          termMonths: calculateTermMonths(result.data.endDate),
          fixedMaturityDate: result.data.endDate
        }));
      } else {
        throw new Error(result.message || '만기일 정보 조회 실패');
      }
    } catch (error) {
      console.error('❌ 공동적금 만기일 정보 조회 실패:', error);
      toast.error('만기일 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingMaturityInfo(false);
    }
  };

  // 만기일로부터 기간 계산 함수
  const calculateTermMonths = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, diffMonths); // 최소 1개월
  };

  // 공동적금 초대 API 호출 함수
  const submitJointSavingsInvite = async (signupData) => {
    if (!inviteId) {
      throw new Error('초대 ID가 없습니다.');
    }

    try {
      const payload = {
        inviteId: inviteId,
        startDate: signupData.startDate,
        endDate: signupData.endDate,
        monthlyAmount: parseInt(signupData.monthlyAmount),
        initialDeposit: parseInt(signupData.initialDeposit),
        sourceAccountNumber: signupData.autoDebitAccountId
      };

      console.log('🔍 공동적금 초대 API 호출:', payload);

      // JWT 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/banks/joint-savings/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 공동적금 초대 API 호출 성공:', result);
        return result;
      } else {
        throw new Error(result.message || '공동적금 초대 API 호출 실패');
      }
    } catch (error) {
      console.error('❌ 공동적금 초대 API 호출 실패:', error);
      throw error;
    }
  };

  // 컴포넌트 마운트 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 공동적금 초대인 경우 만기일 정보 조회
  useEffect(() => {
    if (inviteId && accountInfo?.accountId) {
      fetchMaturityInfo(accountInfo.accountId);
    }
  }, [inviteId, accountInfo?.accountId]);

  // 컴포넌트 마운트 시 모든 계좌 목록 조회
  useEffect(() => {
    if (currentStep >= 2) { // 초기입금액 및 자동이체 설정 단계부터 계좌 목록 필요
      fetchAllAccounts();
    }
  }, [currentStep, fetchAllAccounts]);

  // 다음 단계로 이동
  const handleNext = (stepData = {}) => {
    setSignupData(prev => ({ ...prev, ...stepData }));
    
    // 현재 단계를 완료된 단계에 추가
    setCompletedSteps(prev => [...prev, currentStep]);
    
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
      
      // 스크롤을 새로 추가된 패널로 이동
      setTimeout(() => {
        const newPanel = document.getElementById(`step-${currentStep + 1}`);
        if (newPanel) {
          newPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setCompletedSteps(prev => prev.slice(0, -1));
      
      // 스크롤을 이전 단계로 이동
      setTimeout(() => {
        const prevPanel = document.getElementById(`step-${currentStep - 1}`);
        if (prevPanel) {
          prevPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      navigate('/savings-products');
    }
  };

  // 특정 단계로 이동 (완료된 단계에서 수정할 때)
  const handleGoToStep = (stepId) => {
    if (completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
      setCompletedSteps(prev => prev.filter(id => id < stepId));
      
      // 스크롤을 해당 단계로 이동
      setTimeout(() => {
        const targetPanel = document.getElementById(`step-${stepId}`);
        if (targetPanel) {
          targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };


  // autoDebitDate 계산 함수
  const calculateAutoDebitDate = (selectedDay) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    console.log('📅 autoDebitDate 계산:', {
      selectedDay,
      currentYear,
      currentMonth: currentMonth + 1,
      currentDay
    });
    
    let autoDebitDate;
    
    // 선택된 날짜가 이번 달의 오늘 이후 날짜인 경우
    if (selectedDay > currentDay) {
      // 이번 달의 선택된 날짜로 설정
      autoDebitDate = new Date(currentYear, currentMonth, selectedDay);
      console.log('📅 이번 달 오늘 이후 날짜 선택:', autoDebitDate.toISOString().split('T')[0]);
    } else {
      // 선택된 날짜가 다음 달의 과거 날짜인 경우 (오늘 포함)
      autoDebitDate = new Date(currentYear, currentMonth + 1, selectedDay);
      console.log('📅 다음 달 과거 날짜 선택:', autoDebitDate.toISOString().split('T')[0]);
      
      // 다음 달에 해당 날짜가 없는 경우 (예: 2월 30일, 31일)
      if (autoDebitDate.getDate() !== selectedDay) {
        // 해당 월의 마지막 날로 설정
        autoDebitDate = new Date(autoDebitDate.getFullYear(), autoDebitDate.getMonth() + 1, 0);
        console.log('📅 월말로 조정:', autoDebitDate.toISOString().split('T')[0]);
      }
    }
    
    return autoDebitDate.toISOString().split('T')[0];
  };

  // 최종 가입 처리
  const handleFinalSubmit = async () => {
    try {
      clearError();
      console.log('가입신청 데이터:', signupData);
      console.log('preferredDay 값:', signupData.preferredDay);
      console.log('paymentDay 값:', signupData.paymentDay);
      console.log('autoDebitAccountId 값:', signupData.autoDebitAccountId);
      console.log('autoDebitAccountNumber 값:', signupData.autoDebitAccountNumber);
      console.log('상품 타입:', productDetail?.productType);
      console.log('상품 정보:', productDetail);
      
      // 공동적금 초대 정보 확인
      console.log('🔍 공동적금 초대 정보 확인:', {
        inviteId,
        invitationData,
        accountInfo,
        hasInviteId: !!inviteId,
        hasInvitationData: !!invitationData,
        inviteIdType: typeof inviteId,
        invitationDataType: typeof invitationData
      });

      // 최종 유효성 검사
      const validation = validateSignupData({
        monthlyAmount: parseInt(signupData.monthlyAmount.replace(/[^\d]/g, '')),
        termMonths: parseInt(signupData.termMonths),
        preferredDay: signupData.preferredDay,
        initialDeposit: parseInt(signupData.initialDeposit.replace(/[^\d]/g, '') || '0')
      });
      
      console.log('유효성 검사 결과:', validation);
      
      if (!validation.isValid) {
        Object.values(validation.errors).forEach(error => {
          toast.error(error);
        });
        return;
      }
      
      // autoDebitDate 계산
      const autoDebitDate = calculateAutoDebitDate(parseInt(signupData.preferredDay));
      console.log('📅 계산된 autoDebitDate:', autoDebitDate);
      
      // 공동적금 초대인 경우 공동적금 초대 API 호출
      if (inviteId && invitationData) {
        console.log('🎯 공동적금 초대 가입 - 공동적금 초대 API 호출');
        console.log('🔍 공동적금 초대 조건 확인:', {
          inviteId,
          invitationData,
          hasInviteId: !!inviteId,
          hasInvitationData: !!invitationData
        });
        
        // 시작일과 종료일 계산
        const startDate = autoDebitDate;
        const endDate = new Date(
          new Date(autoDebitDate).getFullYear(),
          new Date(autoDebitDate).getMonth() + parseInt(signupData.termMonths),
          new Date(autoDebitDate).getDate()
        ).toISOString().split('T')[0];

        const jointSavingsData = {
          startDate: startDate,
          endDate: endDate,
          monthlyAmount: parseInt(signupData.monthlyAmount.replace(/[^\d]/g, "")),
          initialDeposit: parseInt(signupData.initialDeposit.replace(/[^\d]/g, "") || "0"),
          autoDebitAccountId: signupData.autoDebitAccountNumber
        };

        const result = await submitJointSavingsInvite(jointSavingsData);
        
        toast.success('공동적금 가입이 완료되었습니다!');
        
        // 마이페이지로 이동 (공동적금 초대인 경우 초대 링크 생성하지 않음)
        setTimeout(() => {
          navigate('/mypage');
        }, 2000);
        
        return; // 공동적금 초대인 경우 여기서 종료
      }
      
      // 일반 적금 가입 (공동적금 초대가 아닌 경우만)
      console.log('🎯 일반 적금 가입 - 일반 적금 가입 API 호출');
      console.log('🔍 일반 적금 가입 조건 확인:', {
        inviteId,
        hasInviteId: !!inviteId,
        isJointSavingsInvite: !!(inviteId && invitationData)
      });
      
      // 공동적금 초대가 아닌 경우에만 일반 적금 가입 API 호출
      if (!inviteId) {
        const result = await submitSavingsSignup({
          productId,
          termMonths: parseInt(signupData.termMonths),
          monthlyAmount: parseInt(signupData.monthlyAmount.replace(/[^\d]/g, "")),
          preferredDay: signupData.preferredDay,
          initialDeposit: parseInt(
            signupData.initialDeposit.replace(/[^\d]/g, "") || "0"
          ),
          autoDebitAccountId: signupData.autoDebitAccountNumber, // 계좌번호 사용
          autoDebitDate: autoDebitDate,
        });
        
        // 가입 완료 데이터 저장
        setSignupData(prev => ({
          ...prev,
          accountNumber: result.accountNumber,
          accountId: result.accountId
        }));
        
        toast.success('적금 가입이 완료되었습니다!');
        
        // 상품 타입에 따른 조건부 네비게이션
        setTimeout(() => {
          // 공동적금인 경우 초대 링크 생성 페이지로 이동 (단, 공동적금 초대가 아닌 경우만)
          if (productDetail?.productType === 'JOINT_SAVING' && !inviteId) {
            console.log('🎯 공동적금 가입 완료 - 초대 링크 생성 페이지로 이동');
            console.log('전달할 데이터:', {
              accountNumber: result.accountNumber,
              productName: productDetail?.productName,
              productId: productDetail?.productId
            });
            
            navigate('/joint-savings-invite', {
              state: {
                accountNumber: result.accountNumber,
                productName: productDetail?.productName,
                productId: productDetail?.productId
              }
            });
          } else {
            // 일반 적금인 경우 마이페이지로 이동
            console.log('🎯 일반 적금 가입 완료 - 마이페이지로 이동');
            navigate('/mypage');
          }
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || '적금 가입 중 오류가 발생했습니다.');
    }
  };

  // 완료 후 이동
  const handleComplete = () => {
    navigate('/mypage');
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">상품 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/savings-products')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              상품 목록으로 돌아가기
            </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 상품 정보가 없는 경우
  if (!productDetail) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-500">상품 정보를 불러올 수 없습니다.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* 상품 정보 헤더 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-[#009071] to-[#007a5f] p-6 text-white">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    {getProductIcon(productDetail.productType)}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{productDetail.productName}</h1>
                  <p className="text-white text-opacity-90 mb-4 text-lg">
                    {productDetail.description || '안정적인 자산 형성을 위한 적금 상품입니다.'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">금리</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">가입금액</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">가입기간</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <span className="text-white text-lg font-semibold">{getInterestRateText(productDetail)}</span>
                    <span className="text-white text-lg font-semibold">{getAmountRangeText(productDetail)}</span>
                    <span className="text-white text-lg font-semibold">{getPeriodText(productDetail)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        

          {/* 단계별 패널들 */}
          <div className="space-y-6">
            {/* 완료된 단계들 */}
            {completedSteps.map(stepId => {
              const step = steps.find(s => s.id === stepId);
              
              return (
                <div key={stepId} id={`step-${stepId}`} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* 완료된 단계 헤더 */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleGoToStep(stepId)}
                          className="px-3 py-1 text-sm text-[#009071] hover:text-[#007a5f] hover:bg-green-100 rounded-lg transition-colors"
                        >
                          수정
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 완료된 단계 내용 - 항상 표시 */}
                  <div className="p-6">
                    {renderStepContent(stepId, true)}
                  </div>
                </div>
              );
            })}
            
            {/* 현재 단계 */}
            {currentStep <= 2 && !completedSteps.includes(currentStep) && (
              <div id={`step-${currentStep}`} className="bg-white rounded-xl shadow-lg border-2 border-blue-200">
                {renderStepContent(currentStep, false)}
              </div>
            )}
            
            {/* 가입신청 버튼 - 2단계 완료 시 표시 */}
            {completedSteps.includes(2) && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">가입 신청하기</h3>
                  <p className="text-gray-600 mb-6">입력하신 정보를 확인하고 적금에 가입하시겠습니까?</p>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => navigate('/savings-products')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-[#009071] text-white rounded-lg hover:bg-[#007a5f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          가입 처리 중...
                        </>
                      ) : (
                        <>
                          가입신청하기
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );

  // 단계별 내용 렌더링 함수
  function renderStepContent(stepId, isCompleted) {
    switch (stepId) {
      case 1:
        return (
          <SavingsInputStep
            productDetail={productDetail}
            signupData={signupData}
            onNext={handleNext}
            onBack={handleBack}
            accounts={accounts}
            isLoadingAccounts={isLoadingAccounts}
            isSubmitting={isSubmitting}
            isCompleted={isCompleted}
            // 공동적금 초대 정보
            isJointSavingsInvite={!!inviteId}
            maturityInfo={maturityInfo}
            isLoadingMaturityInfo={isLoadingMaturityInfo}
            fixedMaturityDate={signupData.fixedMaturityDate}
          />
        );
      case 2:
        return (
          <SavingsAccountStep
            productDetail={productDetail}
            signupData={signupData}
            onNext={handleNext}
            onBack={handleBack}
            isSubmitting={isSubmitting}
            isCompleted={isCompleted}
          />
        );
      default:
        return null;
    }
  }
};

export default SavingsSignupFlow;