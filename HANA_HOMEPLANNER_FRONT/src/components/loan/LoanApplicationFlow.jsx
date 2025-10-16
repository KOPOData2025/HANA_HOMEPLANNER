/**
 * 대출 신청 누적식 패널 플로우 컴포넌트
 * 관심사 분리: 각 단계별 컴포넌트를 분리하여 재사용성과 유지보수성 향상
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { useSavingsSignup } from '@/hooks/useSavingsSignup';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Percent, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// 단계별 컴포넌트들
import LoanIntroStep from './steps/LoanIntroStep';
import LoanTermsStep from './steps/LoanTermsStep';
import LoanAgreementStep from './steps/LoanAgreementStep';

const LoanApplicationFlow = () => {
  const { productType, productId } = useParams();
  const navigate = useNavigate();

  // 로그인 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('로그인이 필요한 서비스입니다.');
      navigate('/login', { 
        state: { from: `/loan-application/${productType}/${productId}` }
      });
    }
  }, [navigate, productType, productId]);
  
  const { productDetail, isLoading, error, getInterestRateText, getAmountRangeText, getPeriodText, getProductIcon } = useProductDetail(productId, productType);

  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    // 대출 기본 정보
    loanAmount: '',
    loanPeriod: '',
    repaymentMethod: 'EQUAL_PRINCIPAL_INTEREST', // 원리금균등
    purpose: '',
    disburseAccountNumber: '',
    disburseDate: '', // 상환날짜
    
    // 신청인 인적사항
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    address: '',
    gender: '',
    
    // 주택 정보
    propertyType: '',
    propertyAddress: '',
    propertyValue: '',
    propertySize: '',
    contractAmount: '',
    downPayment: '',
    remainingAmount: '',
    
    // 소득 및 재직 정보
    incomeType: 'SALARIED', // 근로소득자
    monthlyIncome: '',
    companyName: '',
    jobTitle: '',
    workPeriod: '',
    
    // 기존 대출 내역
    existingLoans: [],
    
    // 상담 정보
    consultationInfo: {
      housingRelated: '',
      fundingRelated: '',
      loanConditions: '',
      householdInfo: '',
      preferentialConditions: ''
    },
    
    // 제출 서류
    documents: {
      idCard: false,
      incomeCertificate: false,
      propertyCertificate: false,
      bankStatement: false
    },
    
    // 약관 동의
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
    
    // 공동 대출 관련 (배우자 정보)
    isJoint: 'N', // Y 또는 N
    jointName: '', // 배우자 이름
    jointPhone: '', // 배우자 핸드폰번호
    
    // 신청 결과
    applicationId: '',
    applicationNumber: ''
  });

  // 대출 신청 관련 훅
  const {
    isLoading: isSubmitting,
    error: submitError,
    submitLoanApplication,
    clearError
  } = useLoanApplication();

  // 계좌 목록 조회 훅
  const {
    accounts,
    isLoadingAccounts,
    fetchAllAccounts
  } = useSavingsSignup();

  const steps = [
    { id: 1, title: '대출 정보 입력', description: '대출희망금액, 대출기간, 상환방식' },
    { id: 2, title: '자동이체 설정', description: '자동이체 계좌 및 납부일 설정' },
    { id: 3, title: '공동 대출자 설정', description: '공동 대출자 포함 여부 선택' }
  ];

  // 컴포넌트 마운트 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 컴포넌트 마운트 시 계좌 목록 조회
  useEffect(() => {
    if (currentStep >= 2) { // 자동이체 설정 단계부터 계좌 목록 필요
      fetchAllAccounts();
    }
  }, [currentStep, fetchAllAccounts]);

  // 다음 단계로 이동
  const handleNext = (stepData = {}) => {
    console.log('🔄 LoanApplicationFlow handleNext:', { stepData, currentStep });
    setApplicationData(prev => {
      const newData = { ...prev, ...stepData };
      console.log('📊 LoanApplicationFlow applicationData 업데이트:', { prev, stepData, newData });
      return newData;
    });
    
    const nextStep = currentStep + 1;
    
    if (currentStep < 3) {
      console.log('🔄 패널 전환:', { currentStep, nextStep, completedSteps });
      
      // 상태 업데이트를 한 번에 처리
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(nextStep);
      
      console.log('✅ 상태 업데이트 완료:', { currentStep, nextStep });
      
      // 스크롤을 새로 추가된 패널로 이동
      setTimeout(() => {
        const newPanel = document.getElementById(`step-${nextStep}`);
        if (newPanel) {
          newPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // 3단계 완료 시 바로 대출 신청 (stepData를 직접 전달)
      handleFinalSubmit(stepData);
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
      navigate('/loan-products');
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

  // 최종 신청 처리
  const handleFinalSubmit = async (additionalData = {}) => {
    try {
      clearError();
      
      // 최종 데이터 구성 (applicationData + additionalData)
      const finalData = { ...applicationData, ...additionalData };
      
      console.log('대출신청 데이터:', finalData);
      console.log('🔍 계좌번호 확인:', {
        disburseAccountNumber: finalData.disburseAccountNumber,
        autoDebitAccountNumber: finalData.autoDebitAccountNumber,
        최종계좌번호: finalData.disburseAccountNumber || finalData.autoDebitAccountNumber
      });
      console.log('🔍 공동 대출 정보 확인:', {
        isJoint: finalData.isJoint,
        jointName: finalData.jointName,
        jointPhone: finalData.jointPhone,
        includeCoBorrower: finalData.includeCoBorrower
      });
      
      // 유효성 검사 제거 - 바로 API 호출
      const result = await submitLoanApplication({
        productId,
        loanAmount: finalData.loanAmount,
        loanPeriod: finalData.loanPeriod,
        disburseAccountNumber: finalData.disburseAccountNumber || finalData.autoDebitAccountNumber,
        disburseDate: finalData.disburseDate, // 상환날짜
        isJoint: finalData.isJoint || "N", // 공동 대출 여부
        jointName: finalData.jointName || '', // 배우자 이름
        jointPhone: finalData.jointPhone || '' // 배우자 핸드폰번호
      });
      
      // 신청 완료 데이터 저장
      setApplicationData(prev => ({
        ...prev,
        applicationId: result.applicationId,
        applicationNumber: result.applicationNumber
      }));
      
      toast.success('대출 신청이 완료되었습니다!');
      
      // 1초 후 마이페이지로 이동
      setTimeout(() => {
        navigate('/mypage');
      }, 1000);
      
    } catch (error) {
      toast.error(error.message || '대출 신청 중 오류가 발생했습니다.');
    }
  };


  // 단계별 컨텐츠 렌더링
  const renderStepContent = (stepId, isCompleted) => {
    const commonProps = {
      productDetail,
      applicationData,
      onNext: handleNext,
      onBack: handleBack,
      getInterestRateText,
      getAmountRangeText,
      getPeriodText,
      getProductIcon,
      isCompleted
    };

    switch (stepId) {
      case 1:
        return <LoanIntroStep {...commonProps} isSubmitting={isSubmitting} />;
      case 2:
        return <LoanTermsStep {...commonProps} isSubmitting={isSubmitting} />;
      case 3:
        return <LoanAgreementStep {...commonProps} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
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
                onClick={() => navigate('/loan-products')}
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
                onClick={() => navigate('/loan-products')}
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
                    {productDetail.description || '안정적인 자금 조달을 위한 대출 상품입니다.'}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">금리</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">대출한도</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">대출기간</span>
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
              console.log('📋 완료된 단계 렌더링:', { stepId, step, completedSteps });
              
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
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
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
              {(() => {
                const shouldRender = currentStep <= 3 && !completedSteps.includes(currentStep);
                console.log('🎯 현재 단계 렌더링 조건:', { 
                  currentStep, 
                  completedSteps, 
                  shouldRender,
                  condition1: currentStep <= 3,
                  condition2: !completedSteps.includes(currentStep)
                });
                
                return shouldRender && (
                  <div id={`step-${currentStep}`} className="bg-white rounded-xl shadow-lg border-2 border-[#009071]">
                    {renderStepContent(currentStep, false)}
                  </div>
                );
              })()}
            
            {/* 신청하기 버튼 - 3단계 완료 시 표시 */}
            {completedSteps.includes(3) && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">대출 신청하기</h3>
                  <p className="text-gray-600 mb-6">
                    모든 정보를 확인하신 후 대출 신청을 진행해주세요.
                  </p>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#009071] text-white py-4 px-8 rounded-xl hover:bg-[#007a5f] transition-colors font-bold text-lg flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        신청 중...
                      </>
                    ) : (
                      <>
                        대출 신청하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanApplicationFlow;
