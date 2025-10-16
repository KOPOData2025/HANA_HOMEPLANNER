import React from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Target, 
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  PiggyBank,
  CreditCard,
  Home
} from 'lucide-react';

const ConsumptionSummaryModal = ({ 
  isOpen, 
  onClose, 
  data, 
  year, 
  month, 
  isLoading 
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '초과달성':
        return 'text-green-600 bg-green-100';
      case '정상':
        return 'text-blue-600 bg-blue-100';
      case '미달':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case '상승':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case '하락':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">소비 요약을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터 없음</h3>
            <p className="text-gray-600 mb-6">해당 기간의 소비 데이터가 없습니다.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { basicStatistics, categoryAnalysis, financialProductAnalysis, consumptionInsights, goalBasedAnalysis } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">소비 요약</h2>
              <p className="text-sm text-gray-600">{year}년 {month}월</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">총 수입</h3>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(basicStatistics.totalIncome)}
              </p>
              <p className="text-sm text-green-600">
                {basicStatistics.incomeCount}건
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">총 지출</h3>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(basicStatistics.totalExpense)}
              </p>
              <p className="text-sm text-red-600">
                {basicStatistics.expenseCount}건
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">순수익</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(basicStatistics.netAmount)}
              </p>
              <p className="text-sm text-blue-600">
                일평균 {formatCurrency(basicStatistics.avgDailyExpense)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">거래 건수</h3>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {basicStatistics.totalTransactionCount}건
              </p>
              <p className="text-sm text-purple-600">
                변화율 {basicStatistics.expenseChangeRate}%
              </p>
            </div>
          </div>

          {/* 카테고리 분석 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              카테고리별 지출 분석
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 카테고리별 지출 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">지출 카테고리</h4>
                <div className="space-y-3">
                  {categoryAnalysis.categoryExpenses.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-gray-800">
                          {category.categoryDescription}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(category.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPercentage(category.percentage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최고 지출 카테고리 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">최고 지출 카테고리</h4>
                <div className="bg-white rounded-lg border p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {categoryAnalysis.mostExpensiveCategory}
                    </h5>
                    <p className="text-2xl font-bold text-red-600 mb-2">
                      {formatCurrency(categoryAnalysis.mostExpensiveAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      전체 지출의 {formatPercentage(100)}를 차지
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 금융 상품 분석 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              금융 상품별 분석
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Home className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-gray-800">대출 상환</h4>
                </div>
                <p className="text-xl font-bold text-red-600 mb-1">
                  {formatCurrency(financialProductAnalysis.loanRepaymentAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  {financialProductAnalysis.loanRepaymentCount}건
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                    {formatPercentage(financialProductAnalysis.loanRepaymentRate)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-800">적금 납입</h4>
                </div>
                <p className="text-xl font-bold text-green-600 mb-1">
                  {formatCurrency(financialProductAnalysis.savingsDepositAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  {financialProductAnalysis.savingsDepositCount}건
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                    {formatPercentage(financialProductAnalysis.savingsDepositRate)}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-800">카드 결제</h4>
                </div>
                <p className="text-xl font-bold text-purple-600 mb-1">
                  {formatCurrency(financialProductAnalysis.cardExpenseAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  {financialProductAnalysis.cardExpenseCount}건
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                    {formatPercentage(financialProductAnalysis.cardExpenseRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 소비 인사이트 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              소비 인사이트 & 권장사항
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 인사이트 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">주요 인사이트</h4>
                <div className="space-y-2">
                  {consumptionInsights.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 권장사항 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">권장사항</h4>
                <div className="space-y-2">
                  {consumptionInsights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 소비 패턴 */}
            <div className="mt-6 bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-800 mb-3">소비 패턴 분석</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">고정비 비율</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPercentage(consumptionInsights.consumptionPattern.fixedExpenseRate)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">변동비 비율</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPercentage(consumptionInsights.consumptionPattern.variableExpenseRate)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">소비 집중도</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {consumptionInsights.consumptionPattern.consumptionConcentration}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">지출 트렌드</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {consumptionInsights.consumptionPattern.spendingTrend}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 목표 기반 분석 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              목표 달성 현황
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 저축 목표 */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-gray-800">저축 목표</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">계획</span>
                    <span className="font-medium">{formatCurrency(goalBasedAnalysis.savingsGoal.plannedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">실제</span>
                    <span className="font-medium">{formatCurrency(goalBasedAnalysis.savingsGoal.actualAmount)}</span>
                  </div>
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goalBasedAnalysis.savingsGoal.status)}`}>
                      {goalBasedAnalysis.savingsGoal.status} ({formatPercentage(goalBasedAnalysis.savingsGoal.achievementRate)})
                    </span>
                  </div>
                </div>
              </div>

              {/* 대출 목표 */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Home className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-gray-800">대출 상환</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">계획</span>
                    <span className="font-medium">{formatCurrency(goalBasedAnalysis.loanGoal.plannedRepayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">실제</span>
                    <span className="font-medium">{formatCurrency(goalBasedAnalysis.loanGoal.actualRepayment)}</span>
                  </div>
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goalBasedAnalysis.loanGoal.status)}`}>
                      {goalBasedAnalysis.loanGoal.status} ({formatPercentage(goalBasedAnalysis.loanGoal.achievementRate)})
                    </span>
                  </div>
                </div>
              </div>

              {/* 지출 목표 */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-800">지출 목표</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">목표</span>
                    <span className="font-medium">{formatCurrency(goalBasedAnalysis.expenseGoal.targetExpense)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">실제</span>
                    <span className="font-medium">{formatCurrency(goalBasedAnalysis.expenseGoal.actualExpense)}</span>
                  </div>
                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goalBasedAnalysis.expenseGoal.status)}`}>
                      {goalBasedAnalysis.expenseGoal.status} ({formatPercentage(goalBasedAnalysis.expenseGoal.achievementRate)})
                    </span>
                  </div>
                  {goalBasedAnalysis.expenseGoal.remainingBudget > 0 && (
                    <div className="mt-2 text-xs text-green-600">
                      남은 예산: {formatCurrency(goalBasedAnalysis.expenseGoal.remainingBudget)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionSummaryModal;
