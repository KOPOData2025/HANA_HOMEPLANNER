/**
 * 적금 가입 2단계: 상품 주요사항 컴포넌트
 * 금리, 중도해지 불이익 등 정보 제공
 */

import React from 'react';
import { ArrowLeft, Percent, AlertTriangle, Clock, DollarSign, Calendar } from 'lucide-react';

const SavingsTermsStep = ({ 
  productDetail, 
  signupData, 
  onNext, 
  onBack, 
  getInterestRateText, 
  getAmountRangeText, 
  getPeriodText, 
  getProductIcon,
  isCompleted = false
}) => {
  const handleNext = () => {
    onNext();
  };

  if (!productDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">상품 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">상품 주요사항</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 금리 정보 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Percent className="w-5 h-5 text-blue-600 mr-2" />
            금리 정보
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">기본 금리</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {getInterestRateText(productDetail)}
                </p>
                <p className="text-sm text-gray-600">
                  연 기준 금리 (세전)
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">세후 수익률</h4>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  약 {productDetail.interestRate ? (productDetail.interestRate * 0.846).toFixed(2) : '2.5'}%
                </p>
                <p className="text-sm text-gray-600">
                  이자소득세 15.4% 차감 후
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 가입 조건 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            가입 조건
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">월 납입액</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {getAmountRangeText(productDetail)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">가입기간</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {getPeriodText(productDetail)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">자동이체일</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                1일 ~ 31일
              </p>
            </div>
          </div>
        </div>

        {/* 중도해지 불이익 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            중도해지 불이익
          </h3>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">중도해지 시 불이익</p>
                  <p className="text-sm text-gray-600 mt-1">
                    가입 후 1년 미만 중도해지 시 약정금리의 50% 적용
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">해지 수수료</p>
                  <p className="text-sm text-gray-600 mt-1">
                    중도해지 시 수수료 없음 (단, 불이익 적용)
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">만기 시 우대</p>
                  <p className="text-sm text-gray-600 mt-1">
                    만기까지 유지 시 약정금리 그대로 적용
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 기타 주요사항 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기타 주요사항</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">이자 지급</h4>
              <p className="text-sm text-gray-600">
                만기 시 원금과 이자를 함께 지급합니다.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">자동이체</h4>
              <p className="text-sm text-gray-600">
                자동이체 실패 시 다음 달에 재시도하며, 연속 3회 실패 시 자동이체가 중단됩니다.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">세제 혜택</h4>
              <p className="text-sm text-gray-600">
                이자소득세 15.4%가 원천징수되며, 연간 이자소득 2,000만원까지 비과세 혜택을 받을 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">주의사항</h4>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>금리는 시장 상황에 따라 변동될 수 있습니다</li>
                  <li>중도해지 시 예상보다 낮은 수익을 얻을 수 있습니다</li>
                  <li>자동이체 계좌 잔액 부족 시 이체가 실패할 수 있습니다</li>
                  <li>상품 가입 전 모든 조건을 충분히 검토해주세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 다음 단계 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsTermsStep;
