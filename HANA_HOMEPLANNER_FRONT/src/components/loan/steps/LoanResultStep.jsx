/**
 * 6단계: 대출 조회 결과 컴포넌트 (2단계로 분리)
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Calculator, 
  TrendingUp, 
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  Info,
  Home,
  CreditCard
} from 'lucide-react';
import LoanCommonInfo from '@/components/loan/LoanCommonInfo';
import LoanSummaryCard from './LoanSummaryCard';

const LoanResultStep = ({ 
  isLoading,
  error,
  ltvData,
  dsrData,
  dtiData,
  recommendedType,
  selectedCard,
  setSelectedCard,
  setSelectedModal,
  houseData,
  formData,
  coupleStatus,
  partnerInfo,
  handleLoanInquiry,
  getSelectedCardMaxLoanAmount,
  formatCurrency,
  navigate,
  setCurrentStep
}) => {
  // 신청정보 모달 상태
  const [showApplicationInfo, setShowApplicationInfo] = useState(false);
  const [showLoanStatus, setShowLoanStatus] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 로딩이 끝나고 결과가 있을 때 애니메이션으로 결과 표시
  useEffect(() => {
    if (!isLoading && (ltvData || dsrData || dtiData)) {
      // 1초 후에 결과 표시
      const timer = setTimeout(() => {
        setShowResults(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isLoading) {
      setShowResults(false);
    }
  }, [isLoading, ltvData, dsrData, dtiData]);

  // 신청정보 모달 렌더링
  const renderApplicationInfoModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">신청 정보</h2>
          <button
            onClick={() => setShowApplicationInfo(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 주택 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#009071] mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            주택 정보
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">주택명</div>
              <div className="text-sm font-semibold text-gray-800">{houseData?.houseName || '직접 입력'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">주택가격</div>
              <div className="text-sm font-semibold text-gray-800">{formatCurrency(formData.housePrice)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">주소</div>
              <div className="text-sm font-semibold text-gray-800">{houseData?.hssplyAdres || houseData?.region || formData.region || '주소 정보 없음'}</div>
            </div>
          </div>
        </div>

        {/* 개인정보 및 대출조건 */}
        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#009071]">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            개인정보 및 대출조건
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <span className="text-xs text-gray-600 mr-1">연소득</span>
              <span className="font-semibold">{formatCurrency(formData.annualIncome)}</span>
            </div>
            {formData.isCoupleLoan && coupleStatus?.hasCouple && formData.spouseIncome && (
              <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                <span className="text-xs text-gray-600 mr-1">배우자 연소득</span>
                <span className="font-semibold">{formatCurrency(formData.spouseIncome)}</span>
              </div>
            )}
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <span className="text-xs text-gray-600 mr-1">DSR 한도</span>
              <span className="font-semibold">{formData.dsrLimit}%</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <span className="text-xs text-gray-600 mr-1">희망 대출금액</span>
              <span className="font-semibold">{formatCurrency(formData.desiredLoanAmount)}</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <span className="text-xs text-gray-600 mr-1">희망 금리</span>
              <span className="font-semibold">{formData.desiredInterestRate}%</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <span className="text-xs text-gray-600 mr-1">희망 대출기간</span>
              <span className="font-semibold">{formData.desiredLoanPeriod}년</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              <span className="text-xs text-gray-600 mr-1">주택 보유 상태</span>
              <span className="font-semibold">{formData.housingStatus || '무주택자'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 분석 중 화면 렌더링
  const renderAnalyzingScreen = () => (
    <div className="p-8 max-w-none w-full h-[600px]">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {/* 로딩 애니메이션 */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-[#009071]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[#009071] rounded-full animate-spin"></div>
          </div>
          
          {/* 분석 중 텍스트 */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">대출 조회 분석 중</h2>
          <p className="text-sm text-gray-600 mb-4">잠시만 기다려주세요...</p>
          
          {/* 진행 단계 표시 */}
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-[#009071] rounded-full mr-2"></div>
              <span>LTV 분석 중</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-[#009071] rounded-full mr-2"></div>
              <span>DSR 분석 중</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-[#009071] rounded-full mr-2"></div>
              <span>DTI 분석 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 대출현황 모달 렌더링
  const renderLoanStatusModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">대출 현황</h2>
          <button
            onClick={() => setShowLoanStatus(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 대출 현황 정보 */}
        {(ltvData || dsrData || dtiData) && (
          <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-[#009071]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                대출 현황
              </h3>
              {/* 대출 건수 뱃지 */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {dtiData?.coupleExistingLoanCount || dtiData?.existingLoanCount || dsrData?.coupleExistingLoanCount || dsrData?.existingLoanCount || 0}건
              </span>
            </div>
            
            {/* DTI/DSR 계산 방식 설명 */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 space-y-1">
                <div><span className="font-semibold">DTI:</span> 주택담보대출(원리금) + 기타(이자)</div>
                <div><span className="font-semibold">DSR:</span> 모든 대출(원리금 상환액)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">DTI 기준 - 총 기존 상환액 (연)</div>
                <div className="text-sm font-semibold text-gray-800">{formatCurrency(dtiData?.coupleTotalExistingAnnualPayment || dtiData?.totalExistingAnnualPayment || dsrData?.coupleExistingLoanAnnualPayment || dsrData?.existingLoanAnnualPayment || 0)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">DSR 기준 - 총 기존 상환액 (연)</div>
                <div className="text-sm font-semibold text-gray-800">{formatCurrency(dsrData?.coupleTotalExistingAnnualPayment || dtiData?.totalExistingAnnualPayment || dsrData?.coupleExistingLoanAnnualPayment || dsrData?.existingLoanAnnualPayment || 0)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 대출 결과 단계 렌더링 (합쳐진 화면)
  const renderLoanResultStep = () => (
    <div className="space-y-4">
      {/* 시뮬레이션 결과 제목 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">대출 조회 결과</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowApplicationInfo(true)}
            className="bg-[#009071]/10 hover:bg-[#009071]/20 text-[#009071] border border-[#009071] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <Info className="w-3 h-3 mr-1" />
            신청정보
          </button>
          <button
            onClick={() => setShowLoanStatus(true)}
            className="bg-[#009071]/10 hover:bg-[#009071]/20 text-[#009071] border border-[#009071] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            대출현황
          </button>
        </div>
      </div>


      {/* 추천 기준 안내 */}
      {recommendedType && (
        <div className="bg-gradient-to-r from-[#009071]/10 to-[#009071]/5 border-l-4 border-[#009071] rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#009071] rounded-full flex items-center justify-center mr-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {recommendedType} 기준이 가장 유력합니다
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* 간단한 대출 결과 요약 카드들 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-2">
        {/* LTV 결과 카드 */}
        {ltvData && (
          <LoanSummaryCard
            type="ltv"
            data={ltvData}
            isRecommended={recommendedType === 'LTV'}
            isSelected={selectedCard === 'ltv'}
            onClick={() => setSelectedModal('ltv')}
            onSelect={(type) => setSelectedCard(selectedCard === type ? null : type)}
          />
        )}

        {/* DSR 결과 카드 */}
        {dsrData && (
          <LoanSummaryCard
            type="dsr"
            data={dsrData}
            isRecommended={recommendedType === 'DSR'}
            isSelected={selectedCard === 'dsr'}
            onClick={() => setSelectedModal('dsr')}
            onSelect={(type) => setSelectedCard(selectedCard === type ? null : type)}
          />
        )}

        {/* DTI 결과 카드 */}
        {dtiData && (
          <LoanSummaryCard
            type="dti"
            data={dtiData}
            isRecommended={recommendedType === 'DTI'}
            isSelected={selectedCard === 'dti'}
            onClick={() => setSelectedModal('dti')}
            onSelect={(type) => setSelectedCard(selectedCard === type ? null : type)}
          />
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {/* 대출 조회 결과가 없을 때 안내 메시지 */}
        {(!ltvData && !dsrData && !dtiData) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-gray-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-800">포트폴리오 추천을 받으려면 먼저 대출 조회를 실행해주세요</p>
                <p className="text-xs text-gray-600 mt-1">LTV, DSR, DTI 중 하나 이상의 결과가 필요합니다</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        

          {/* 처음부터 다시 버튼 (중앙) */}
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">처음부터 다시</span>
          </button>

          {/* 나만의 포트폴리오 추천받기 버튼 (오른쪽 끝) */}
          <button
            disabled={!selectedCard}
            onClick={() => {
              console.log('=== 하단 포트폴리오 추천 버튼 클릭 ===');
              console.log('현재 selectedCard:', selectedCard);
              console.log('현재 ltvData:', ltvData);
              console.log('현재 dsrData:', dsrData);
              console.log('현재 dtiData:', dtiData);
              
              // 선택된 카드의 대출 가능 금액을 포트폴리오 추천 페이지로 전달
              const maxLoanAmount = getSelectedCardMaxLoanAmount();
              
              console.log('계산된 maxLoanAmount:', maxLoanAmount);
              
              const loanData = {
                annualIncome: formData.annualIncome,
                housePrice: formData.housePrice,
                houseSize: formData.houseSize,
                assets: formData.assets || 0,
                maxLoanAmount: maxLoanAmount,
                selectedCardType: selectedCard, // 선택된 카드 타입도 함께 전달
                selectedCardInfo: {
                  type: selectedCard,
                  maxLoanAmount: maxLoanAmount,
                  formattedAmount: formatCurrency(maxLoanAmount)
                }
              };
              
              console.log('포트폴리오 추천으로 전달할 데이터:', loanData);
              console.log('선택된 카드:', selectedCard);
              console.log('대출 가능 금액:', formatCurrency(maxLoanAmount));
              console.log('=== 포트폴리오 추천 페이지로 이동 ===');
              
              console.log('🔍 대출조회 - 포트폴리오로 전달할 데이터:', {
                loanData: loanData,
                houseData: houseData,
                'houseData.잔금처리일': houseData?.잔금처리일,
                'houseData 전체 구조': houseData
              });
              
              navigate('/portfolio-recommendation', { 
                state: { 
                  loanData: loanData,
                  houseData: houseData // 주택 데이터도 함께 전달
                }
              });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCard 
                ? 'bg-[#009071] hover:bg-[#007a5e] text-white shadow-md hover:shadow-lg' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{selectedCard ? '나만의 포트폴리오 추천받기' : '대출 유형을 선택해주세요'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="p-8 max-w-none w-full h-[600px]">
        {isLoading ? (
          renderAnalyzingScreen()
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleLoanInquiry}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                다시 시도
              </button>
            </div>
          </div>
        ) : (ltvData || dsrData || dtiData) && showResults ? (
          <div className="h-full flex items-center gap-12 animate-fade-in">
            {/* 좌측 절반 - 아이콘 */}
            <div className="w-1/2 flex justify-center items-center">
              <div className="w-full h-full max-w-lg max-h-lg bg-white rounded-xl flex items-center justify-center p-8">
                <img
                  src="/icon/result.png"
                  alt="대출 결과 아이콘"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* 우측 절반 - 결과 내용 */}
            <div className="w-1/2 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                {renderLoanResultStep()}
              </div>
            </div>
          </div>
        ) : (ltvData || dsrData || dtiData) && !showResults ? (
          renderAnalyzingScreen()
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">대출 조회를 시작하려면 아래 버튼을 클릭하세요</p>
              <button
                onClick={handleLoanInquiry}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                대출 조회 시작
              </button>
            </div>
          </div>
        )}
      </div>
      {showApplicationInfo && renderApplicationInfoModal()}
      {showLoanStatus && renderLoanStatusModal()}
    </>
  );
};

export default LoanResultStep;