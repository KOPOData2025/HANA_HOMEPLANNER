import React from 'react';
import { Calculator, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';

const SimulationResults = ({ 
  simulationResult, 
  formatNumber, 
  onReset = () => {}, 
  onPortfolioRecommendation = () => {} 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        시뮬레이션 결과
      </h2>

      {simulationResult ? (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-teal-600 mr-2" />
              <span className="font-medium text-teal-800">
                월 상환액
              </span>
            </div>
            <div className="text-2xl font-bold text-teal-800">
              {formatNumber(simulationResult.monthlyPayment)}만원
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">
                대출원금
              </div>
              <div className="text-lg font-semibold">
                {formatNumber(simulationResult.principal)}만원
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">
                총 이자
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatNumber(simulationResult.totalInterest)}만원
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">
              총 상환금액
            </div>
            <div className="text-xl font-bold text-blue-800">
              {formatNumber(simulationResult.totalPayment)}만원
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            {/* 처음부터 다시 버튼 (왼쪽 끝) */}
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">처음부터 다시</span>
            </button>

            {/* 나만의 포트폴리오 추천받기 버튼 (오른쪽 끝) */}
            <button
              onClick={onPortfolioRecommendation}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <TrendingUp className="w-4 h-4" />
              <span>나만의 포트폴리오 추천받기</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            대출 조건을 입력하고 계산해보세요
          </p>
        </div>
      )}
    </div>
  );
};

export default SimulationResults;
