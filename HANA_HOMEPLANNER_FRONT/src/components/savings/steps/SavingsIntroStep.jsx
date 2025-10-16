/**
 * 적금 가입 1단계: 가입안내 컴포넌트
 * 상품 이름, 상세 설명, 가입 기간, 설명서 보기 기능
 */

import React from 'react';
import { ArrowLeft, FileText, Calendar, PiggyBank, Percent, DollarSign } from 'lucide-react';

const SavingsIntroStep = ({ 
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

  const handleViewDocument = () => {
    // 설명서 보기 기능 (PDF 뷰어 또는 새 창)
    window.open('/pdfs/마이데이터이용약관.pdf', '_blank');
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
          <h1 className="text-xl font-semibold text-gray-900">적금 가입안내</h1>
          <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              {getProductIcon(productDetail.productType)}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {productDetail.productName}
            </h2>
            <p className="text-gray-600 mb-4">
              {productDetail.description || '안정적인 자산 형성을 위한 적금 상품입니다.'}
            </p>
            
            {/* 주요 정보 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Percent className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">금리</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {getInterestRateText(productDetail)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">납입액</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {getAmountRangeText(productDetail)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">가입기간</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {getPeriodText(productDetail)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 특징 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 특징</h3>
          <div className="space-y-3">
            {productDetail.features?.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">{feature}</p>
              </div>
            )) || (
              <>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700">안정적인 이자 수익 제공</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700">자동이체 서비스 지원</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700">온라인으로 간편하게 가입</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 설명서 보기 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 설명서</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">적금 상품 설명서</p>
                  <p className="text-sm text-gray-600">상품의 자세한 내용을 확인하세요</p>
                </div>
              </div>
              <button
                onClick={handleViewDocument}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                설명서 보기
              </button>
            </div>
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">가입 전 확인사항</h4>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>가입 시 필요한 서류를 미리 준비해주세요</li>
                  <li>자동이체 계좌는 본인 명의의 계좌여야 합니다</li>
                  <li>중도해지 시 불이익이 있을 수 있습니다</li>
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

export default SavingsIntroStep;
