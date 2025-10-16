/**
 * 대출 신청 5단계: 신청 완료 컴포넌트
 * 신청 완료 화면
 */

import React from 'react';
import { CheckCircle, Calendar, DollarSign, FileText, ArrowRight, Home, Clock } from 'lucide-react';

const LoanCompleteStep = ({ 
  productDetail, 
  applicationData, 
  onNext, 
  onBack, 
  onComplete 
}) => {
  const handleComplete = () => {
    onComplete();
  };

  const handleGoHome = () => {
    // 홈으로 이동
    window.location.href = '/';
  };

  const formatCurrency = (value) => {
    return parseInt(value || '0').toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 성공 메시지 */}
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            대출 신청이 완료되었습니다!
          </h1>
          <p className="text-gray-600">
            신속한 심사 후 결과를 안내드리겠습니다
          </p>
        </div>

        {/* 신청 정보 요약 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">신청 정보</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">상품명</span>
                <span className="font-medium text-gray-900">{productDetail?.productName}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">신청번호</span>
                <span className="font-medium text-gray-900">{applicationData.applicationNumber}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">대출 희망 금액</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(applicationData.loanAmount)}원
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">대출 기간</span>
                <span className="font-medium text-gray-900">
                  {applicationData.loanPeriod}년
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">대출 목적</span>
                <span className="font-medium text-gray-900">
                  {applicationData.purpose === 'HOUSING' ? '주택 구매' :
                   applicationData.purpose === 'REFINANCING' ? '전세자금' :
                   applicationData.purpose === 'RENOVATION' ? '주택 리모델링' :
                   applicationData.purpose === 'BUSINESS' ? '사업자금' : '기타'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">상환 방식</span>
                <span className="font-medium text-gray-900">
                  {applicationData.repaymentType === 'EQUAL_PRINCIPAL_INTEREST' ? '원리금균등' : '원금균등'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">신청인</span>
                <span className="font-medium text-gray-900">{applicationData.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">다음 단계</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  신청서 검토 및 심사가 진행됩니다 (1-2일 소요)
                </span>
              </div>
              
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  추가 서류가 필요한 경우 별도 안내드립니다
                </span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-blue-800">
                  승인 시 계약 체결 및 대출 실행 절차를 안내드립니다
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 심사 기준 안내 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">심사 기준</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">신용등급</p>
                  <p className="text-sm text-gray-600">신용정보원 기준 1~6등급</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">소득 기준</p>
                  <p className="text-sm text-gray-600">연소득 대비 상환액 비율(DTI) 40% 이하</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">담보 기준</p>
                  <p className="text-sm text-gray-600">담보 가치 대비 대출 비율(LTV) 70% 이하</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">주의사항</h3>
            
            <div className="space-y-2 text-sm text-yellow-700">
              <p>• 대출 승인은 신청자의 신용상황에 따라 달라질 수 있습니다</p>
              <p>• 심사 과정에서 추가 서류나 정보가 요구될 수 있습니다</p>
              <p>• 승인된 금리와 조건은 최종 계약 시 확정됩니다</p>
              <p>• 대출 실행 전 최종 심사에서 승인이 취소될 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleComplete}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            상품 목록으로 이동
          </button>
          
          <button
            onClick={handleGoHome}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            홈으로 이동
          </button>
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            대출 신청 관련 문의사항이 있으시면 고객센터(1588-1111)로 연락해주세요.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            신청 상태는 마이페이지에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanCompleteStep;
