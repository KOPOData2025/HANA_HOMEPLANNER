import React from 'react';
import { X, TrendingUp, DollarSign, Calendar, Target, PieChart, BarChart3 } from 'lucide-react';

const PortfolioDetailModal = ({ isOpen, onClose, portfolioData, analysisData }) => {
  if (!isOpen || !portfolioData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 자금 구성 비율 계산
  const totalFunds = analysisData.housePrice;
  const loanRatio = (portfolioData.loanAmount / totalFunds) * 100;
  const savingsRatio = (portfolioData.totalSavingAtMoveIn / totalFunds) * 100;
  const currentCashRatio = (analysisData.currentCash / totalFunds) * 100;

  // 월저축 부담도 계산 (NaN 방지) - 디버깅 추가
  const monthlySavingBurden = analysisData.annualIncome && analysisData.annualIncome > 0 
    ? ((portfolioData.requiredMonthlySaving / analysisData.annualIncome) * 100)
    : 0;

  // 디버깅: 계산 과정 출력
  console.log('🔍 월저축 부담도 계산 디버깅:');
  console.log('  - portfolioData.requiredMonthlySaving:', portfolioData.requiredMonthlySaving);
  console.log('  - analysisData.annualIncome:', analysisData.annualIncome);
  console.log('  - analysisData:', analysisData);
  console.log('  - portfolioData:', portfolioData);
  console.log('  - 계산 결과:', monthlySavingBurden);
  const monthlyFlowData = Array.from({ length: 24 }, (_, index) => {
    const month = index + 1;
    const cumulativeSavings = portfolioData.requiredMonthlySaving * month;
    const remainingShortfall = Math.max(0, analysisData.totalShortfall - cumulativeSavings);
    
    return {
      month,
      monthlySaving: portfolioData.requiredMonthlySaving,
      cumulativeSavings,
      remainingShortfall,
      totalFunds: analysisData.currentCash + cumulativeSavings + portfolioData.loanAmount
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className={`px-6 py-4 text-white relative ${
          portfolioData.planType === '보수형' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
          portfolioData.planType === '균형형' ? 'bg-gradient-to-r from-green-600 to-green-700' :
          'bg-gradient-to-r from-red-600 to-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{portfolioData.planType} 포트폴리오 상세 분석</h2>
                <p className="text-blue-100 text-sm">자금 구성과 월별 계획을 확인하세요</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 자금 구성 차트 */}
            <div className="space-y-6">
              {/* 자금 구성 원형 차트 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <PieChart className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">자금 구성 비율</h3>
                </div>
                
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    {/* 원형 차트 */}
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      {/* 현재 현금 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        strokeDasharray={`${currentCashRatio * 2.51} 251`}
                        strokeDashoffset="0"
                      />
                      {/* 적금 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="8"
                        strokeDasharray={`${savingsRatio * 2.51} 251`}
                        strokeDashoffset={`-${currentCashRatio * 2.51}`}
                      />
                      {/* 대출 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="8"
                        strokeDasharray={`${loanRatio * 2.51} 251`}
                        strokeDashoffset={`-${(currentCashRatio + savingsRatio) * 2.51}`}
                      />
                    </svg>
                    
                    {/* 중앙 텍스트 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{formatCurrency(totalFunds)}</div>
                        <div className="text-xs text-gray-600">총 필요 자금</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 범례 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">현재 현금</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {formatCurrency(analysisData.currentCash)} ({currentCashRatio.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">적금으로 마련</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {formatCurrency(portfolioData.totalSavingAtMoveIn)} ({savingsRatio.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">대출</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {formatCurrency(portfolioData.loanAmount)} ({loanRatio.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* 월별 자금 흐름 차트 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">월별 자금 마련 현황</h3>
                </div>
                
                <div className="h-64 overflow-x-auto">
                  <div className="flex items-end justify-between h-full min-w-[600px] space-x-1">
                    {monthlyFlowData.filter((_, index) => index % 2 === 0).map((data, index) => (
                      <div key={data.month} className="flex flex-col items-center flex-1">
                        <div className="w-full bg-gray-100 rounded-t flex flex-col justify-end h-48">
                          {/* 누적 적금 */}
                          <div 
                            className="bg-green-400 rounded-t"
                            style={{ height: `${(data.cumulativeSavings / portfolioData.totalSavingAtMoveIn) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">
                          {data.month}개월
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {formatCurrency(data.cumulativeSavings)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-1">목표 달성 시점</div>
                  <div className="text-sm text-green-700">
                    {portfolioData.totalSavingAtMoveIn >= analysisData.totalShortfall 
                      ? `${Math.ceil(analysisData.totalShortfall / portfolioData.requiredMonthlySaving)}개월 후 목표 달성 예상`
                      : '목표 달성 어려움'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상세 정보 테이블 */}
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">포트폴리오 기본 정보</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">포트폴리오 유형</span>
                    <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                      portfolioData.planType === '보수형' ? 'bg-blue-100 text-blue-700' :
                      portfolioData.planType === '균형형' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {portfolioData.planType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">대출 금액</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(portfolioData.loanAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">월 저축액</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(portfolioData.requiredMonthlySaving)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">입주시 저축액</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(portfolioData.totalSavingAtMoveIn)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">부족액 충당</span>
                    <span className="font-semibold text-green-600">{formatCurrency(portfolioData.shortfallCovered)}</span>
                  </div>
                </div>
              </div>

              {/* 위험도 분석 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">위험도 분석</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">대출 의존도</span>
                      <span className="text-sm font-medium text-gray-800">{loanRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          loanRatio > 70 ? 'bg-red-500' : 
                          loanRatio > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(loanRatio, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {loanRatio > 70 ? '높음' : loanRatio > 50 ? '보통' : '낮음'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">월 저축 부담도</span>
                      <span className="text-sm font-medium text-gray-800">
                        {monthlySavingBurden.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          monthlySavingBurden > 10 ? 'bg-red-500' : 
                          monthlySavingBurden > 5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(monthlySavingBurden, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {monthlySavingBurden > 10 ? '높음' : 
                       monthlySavingBurden > 5 ? '보통' : '낮음'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 추천 이유 및 특징 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-5 h-5 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">포트폴리오 특징</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">포트폴리오 설명</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{portfolioData.comment}</p>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">추천 이유</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{portfolioData.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            닫기
          </button>
          <button
            className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${
              portfolioData.planType === '보수형' ? 'bg-blue-600 hover:bg-blue-700' :
              portfolioData.planType === '균형형' ? 'bg-green-600 hover:bg-green-700' :
              'bg-red-600 hover:bg-red-700'
            }`}
          >
            이 플랜 선택하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailModal;
