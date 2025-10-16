import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart,
  MapPin
} from 'lucide-react';

const DTIResultCard = ({ dtiData }) => {
  if (!dtiData) return null;

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0원';
    const num = parseInt(amount);
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만원`;
    }
    return `${num.toLocaleString()}원`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // 부부 공동 API 응답 지원
  const annualIncome = dtiData.coupleTotalAnnualIncome || dtiData.annualIncome;
  const existingMortgageAnnualPayment = dtiData.coupleExistingMortgageAnnualPayment || dtiData.existingMortgageAnnualPayment;
  const existingOtherLoanAnnualInterest = dtiData.coupleExistingOtherLoanAnnualInterest || dtiData.existingOtherLoanAnnualInterest;
  const totalExistingAnnualPayment = dtiData.coupleTotalExistingAnnualPayment || dtiData.totalExistingAnnualPayment;
  const existingLoanCount = dtiData.coupleExistingLoanCount || dtiData.existingLoanCount;
  
  const dtiPercentage = parseFloat(dtiData.dtiRatio).toFixed(1);
  const isPass = dtiData.dtiStatus === 'PASS';

  return (
    <div className="space-y-4">
      {/* 지역 + 규제 여부 라벨 */}
      <div className={`rounded-lg p-3 border-l-4 ${
        isPass 
          ? 'bg-green-50 border-green-400' 
          : 'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className={`w-4 h-4 mr-2 ${
              isPass ? 'text-green-600' : 'text-red-600'
            }`} />
            <span className={`text-sm font-semibold ${
              isPass ? 'text-green-800' : 'text-red-800'
            }`}>
              {dtiData.region} (규제지역)
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPass 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            DTI {dtiData.dtiStatus}
          </div>
        </div>
      </div>

      {/* 연소득 / DTI 한도 / 최대 허용 상환액 강조 카드 */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-4 text-white">
        <div className="text-center">
          <h3 className="text-base font-semibold mb-3 flex items-center justify-center">
            <DollarSign className="w-5 h-5 mr-2" />
            DTI 기반 대출 가능 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">연소득</div>
              <div className="text-lg font-bold">{formatCurrency(annualIncome)}</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">DTI 한도</div>
              <div className="text-lg font-bold">{dtiData.dtiLimit}%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">최대 허용 상환액 (연)</div>
              <div className="text-lg font-bold">{formatCurrency(dtiData.maxAllowedAnnualPayment)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 기존 대출 정보 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
          기존 대출 정보
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">주담대 연간 상환액</div>
            <div className="text-sm font-semibold text-gray-800">{formatCurrency(existingMortgageAnnualPayment)}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">기타 대출 연간 이자</div>
            <div className="text-sm font-semibold text-gray-800">{formatCurrency(existingOtherLoanAnnualInterest)}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">총 기존 연간 상환액</div>
            <div className="text-sm font-semibold text-orange-600">{formatCurrency(totalExistingAnnualPayment)}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">기존 대출 건수</div>
            <div className="text-sm font-semibold text-gray-800">{existingLoanCount}건</div>
          </div>
        </div>
      </div>

      {/* DTI 여력 분석 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
          DTI 여력 분석
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">가용 연간 상환액</div>
            <div className="text-sm font-semibold text-green-600">{formatCurrency(dtiData.availableAnnualPayment)}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">여력 비율</div>
            <div className="text-sm font-semibold text-gray-800">
              {((dtiData.availableAnnualPayment / dtiData.maxAllowedAnnualPayment) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* DTI 한도 기준 대출금액 정보 */}
      {dtiData.maxLoanAmountForDtiLimit && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
            DTI 한도 기준 대출금액 정보
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="text-xs text-emerald-600 mb-2 font-medium">최대 대출금액</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">대출 가능 금액</span>
                  <span className="text-sm font-bold text-emerald-700">{formatCurrency(dtiData.maxLoanAmountForDtiLimit)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="text-xs text-emerald-600 mb-2 font-medium">월 상환액</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">월 상환액</span>
                  <span className="text-sm font-bold text-emerald-700">{formatCurrency(dtiData.maxMonthlyPaymentForDtiLimit)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="text-xs text-emerald-600 mb-2 font-medium">연 상환액</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">연 상환액</span>
                  <span className="text-sm font-bold text-emerald-700">{formatCurrency(dtiData.maxAnnualPaymentForDtiLimit)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 안내 문구 */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Info className="w-3 h-3 text-blue-600 mr-1" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">DTI 한도 기준 안전 대출액</p>
                <p>
                  DTI {dtiData.dtiLimit}% 한도를 준수하는 최대 대출금액은{' '}
                  <span className="font-semibold">{formatCurrency(dtiData.maxLoanAmountForDtiLimit)}</span>입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 신규 대출 계산 결과 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
          신규 대출 계산 결과
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-medium text-gray-700">구분</th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">값</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">희망 대출 금리</td>
                <td className="py-2 px-2 text-right text-gray-600">{dtiData.desiredInterestRate}%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">희망 대출 기간</td>
                <td className="py-2 px-2 text-right text-gray-600">{dtiData.desiredLoanPeriod}년</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">희망 대출 금액</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">{formatCurrency(dtiData.desiredLoanAmount)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">월 상환액</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">{formatCurrency(dtiData.desiredLoanMonthlyPayment)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">연간 상환액</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">{formatCurrency(dtiData.desiredLoanAnnualPayment)}</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium text-gray-800">총 연간 상환액</td>
                <td className="py-2 px-2 text-right font-semibold text-emerald-600">{formatCurrency(dtiData.totalAnnualPayment)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* DTI 비율과 PASS/FAIL 상태 강조 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <PieChart className="w-4 h-4 mr-2 text-gray-600" />
          DTI 비율 분석
        </h4>
        
        {/* DTI 비율 게이지 차트 */}
        <div className="space-y-3">
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  isPass 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${Math.min(dtiPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0%</span>
              <span className={`font-medium ${
                isPass ? 'text-green-600' : 'text-red-600'
              }`}>
                {dtiPercentage}% (현재 DTI)
              </span>
              <span className="font-medium text-gray-600">
                {dtiData.dtiLimit}% (한도)
              </span>
            </div>
          </div>
          
          {/* 상태 표시 */}
          <div className={`p-2 rounded-lg ${
            isPass 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`flex items-center justify-center text-sm font-semibold ${
              isPass ? 'text-green-700' : 'text-red-700'
            }`}>
              {isPass ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-1" />
              )}
              DTI {dtiData.dtiStatus} - {dtiPercentage}%
            </div>
            <div className={`text-center text-xs mt-1 ${
              isPass ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPass 
                ? '규제 한도를 충족합니다' 
                : '규제 한도를 초과합니다'
              }
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 안내 문구 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="w-3 h-3 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">DTI 계산 안내</p>
            <p>
              DTI는 주담대 원리금 + 기타대출 이자만 반영합니다.
              현재 계산 결과, 귀하의 DTI 비율은 {dtiPercentage}%이며{' '}
              {isPass ? '규제 한도를 충족합니다' : '규제 한도를 초과합니다'}.
            </p>
          </div>
        </div>
      </div>

      {/* 계산 정보 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-600 text-center">
          계산일시: {dtiData.calculationDate} | {dtiData.message}
        </div>
      </div>
    </div>
  );
};

export default DTIResultCard;
