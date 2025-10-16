import React from 'react';
import { 
  Home, 
  MapPin, 
  CreditCard, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Heart,
  Users
} from 'lucide-react';

const LoanCommonInfo = ({ 
  houseData, 
  personalData, 
  existingLoanData,
  loanConditions,
  coupleData
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    const num = parseInt(amount);
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 주택정보, 개인정보 및 대출조건, 기존 대출 현황을 가로로 나열 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 주택 정보 */}
        {houseData && (
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Home className="w-4 h-4 mr-2 text-blue-600" />
              주택 정보
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">주택명</div>
                <div className="text-sm font-semibold text-gray-800">{houseData.houseName || '직접 입력'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">주택가격</div>
                <div className="text-sm font-semibold text-blue-600">{formatCurrency(houseData.housePrice)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">주소</div>
                <div className="text-sm font-semibold text-gray-800">{houseData.region || '주소 정보 없음'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 개인정보 및 대출조건 통합 - 뱃지 형태 */}
        {(personalData || loanConditions) && (
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
              개인정보 및 대출조건
            </h3>
            <div className="flex flex-wrap gap-2">
              {personalData && (
                <>
                  <div className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <span className="text-xs text-green-600 mr-1">연소득</span>
                    <span className="font-semibold">{formatCurrency(personalData.annualIncome)}</span>
                  </div>
                  {coupleData && coupleData.isCoupleLoan && coupleData.spouseIncome && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                      <span className="text-xs text-pink-600 mr-1">배우자 연소득</span>
                      <span className="font-semibold">{formatCurrency(coupleData.spouseIncome)}</span>
                    </div>
                  )}
                  <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    <span className="text-xs text-gray-600 mr-1">DSR 한도</span>
                    <span className="font-semibold">{personalData.dsrLimit}%</span>
                  </div>
                </>
              )}
              {loanConditions && (
                <>
                  <div className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    <span className="text-xs text-purple-600 mr-1">희망 대출금액</span>
                    <span className="font-semibold">{formatCurrency(loanConditions.desiredLoanAmount)}</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span className="text-xs text-blue-600 mr-1">희망 금리</span>
                    <span className="font-semibold">{loanConditions.desiredInterestRate}%</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    <span className="text-xs text-indigo-600 mr-1">희망 대출기간</span>
                    <span className="font-semibold">{loanConditions.desiredLoanPeriod}년</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    <span className="text-xs text-orange-600 mr-1">주택 보유 상태</span>
                    <span className="font-semibold">{loanConditions.housingStatus || '무주택자'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 기존 대출 현황 */}
        {existingLoanData && (
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-red-600" />
              기존 대출 현황
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">기존 주담대 연간 원리금</div>
                <div className="text-sm font-semibold text-red-600">{formatCurrency(existingLoanData.existingMortgageAnnualPayment)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">기타 대출 연간 이자</div>
                <div className="text-sm font-semibold text-orange-600">{formatCurrency(existingLoanData.existingOtherLoanAnnualInterest)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">총 기존 상환액 (연)</div>
                <div className="text-sm font-semibold text-red-700">{formatCurrency(existingLoanData.totalExistingAnnualPayment)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">대출 건수</div>
                <div className="text-sm font-semibold text-gray-800">{existingLoanData.existingLoanCount}건</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCommonInfo;
