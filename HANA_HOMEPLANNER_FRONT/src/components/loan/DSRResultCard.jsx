import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart
} from 'lucide-react';

const DSRResultCard = ({ dsrData }) => {
  if (!dsrData) return null;

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

  // 새로운 API 응답 형식에 맞게 계산 (부부 공동 API 지원)
  const annualIncome = dsrData.coupleTotalAnnualIncome || dsrData.annualIncome;
  const existingLoanAnnualPayment = dsrData.coupleExistingLoanAnnualPayment || dsrData.existingLoanAnnualPayment;
  const existingLoanCount = dsrData.coupleExistingLoanCount || dsrData.existingLoanCount;
  
  const maxAllowedAnnualPayment = (annualIncome * dsrData.dsrLimit) / 100;
  const dsrUsedPercentage = ((existingLoanAnnualPayment / maxAllowedAnnualPayment) * 100).toFixed(1);
  const dsrAvailablePercentage = (((maxAllowedAnnualPayment - existingLoanAnnualPayment) / maxAllowedAnnualPayment) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* 연소득 / DSR 한도 / 최대 허용 연간 상환액 강조 카드 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
        <div className="text-center">
          <h3 className="text-base font-semibold mb-3 flex items-center justify-center">
            <DollarSign className="w-5 h-5 mr-2" />
            DSR 기반 대출 가능 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">연소득</div>
              <div className="text-lg font-bold">
                {formatCurrency(annualIncome)}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">DSR 한도</div>
              <div className="text-lg font-bold">{dsrData.dsrLimit}%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">
                최대 허용 연간 상환액
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(maxAllowedAnnualPayment)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DSR 여력 분석 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
          DSR 여력 분석
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">남은 여력 (연)</div>
            <div className="text-sm font-semibold text-green-600">
              {formatCurrency(
                maxAllowedAnnualPayment - existingLoanAnnualPayment
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">여력 비율</div>
            <div className="text-sm font-semibold text-gray-800">
              {dsrAvailablePercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* DSR 사용률 게이지 차트 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <PieChart className="w-4 h-4 mr-2 text-gray-600" />
          DSR 사용률
        </h4>
        <div className="space-y-3">
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-orange-500"
                style={{ width: `${Math.min(dsrUsedPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>기존 대출: {dsrUsedPercentage}%</span>
              <span>여력: {dsrAvailablePercentage}%</span>
            </div>
          </div>
          <div
            className={`p-2 rounded-lg ${
              parseFloat(dsrUsedPercentage) <= 80
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div
              className={`flex items-center text-xs ${
                parseFloat(dsrUsedPercentage) <= 80
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {parseFloat(dsrUsedPercentage) <= 80 ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {parseFloat(dsrUsedPercentage) <= 80
                ? "DSR 여력이 충분합니다"
                : "DSR 사용률이 높습니다"}
            </div>
          </div>
        </div>
      </div>

      {/* DSR 40% 기준 대출 가능 정보 (새로운 API 필드) */}
      {dsrData.maxLoanAmountForBaseRate && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            DSR 40% 기준 대출 가능 정보
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 기본금리 기준 */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-xs text-green-600 mb-2 font-medium">
                기본금리 기준
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">대출 가능 금액</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(dsrData.maxLoanAmountForBaseRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">월 상환액</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(dsrData.maxMonthlyPaymentForBaseRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">연 상환액</span>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(dsrData.maxAnnualPaymentForBaseRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* 스트레스금리 기준 */}
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <div className="text-xs text-orange-600 mb-2 font-medium">
                스트레스금리 기준
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">대출 가능 금액</span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(dsrData.maxLoanAmountForStressRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">월 상환액</span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(dsrData.maxMonthlyPaymentForStressRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">연 상환액</span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(dsrData.maxAnnualPaymentForStressRate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 차이점 강조 */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Info className="w-3 h-3 text-blue-600 mr-1" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">DSR 40% 기준 안전 대출액</p>
                <p>
                  기본금리 기준으로는 최대{" "}
                  <span className="font-semibold">
                    {formatCurrency(dsrData.maxLoanAmountForBaseRate)}
                  </span>
                  까지, 스트레스금리 기준으로는{" "}
                  <span className="font-semibold">
                    {formatCurrency(dsrData.maxLoanAmountForStressRate)}
                  </span>
                  까지 대출 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기본 금리 vs 스트레스 금리 대출 가능액 비교 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-gray-600" />
          금리별 대출 가능액 비교
        </h4>

        {/* 막대 그래프 */}
        <div className="mb-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>희망 금리 ({dsrData.desiredInterestRate}%)</span>
                <span>DSR: {dsrData.baseDsr.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full flex items-center justify-end pr-1 ${
                    dsrData.baseDsrStatus === "초과"
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                  style={{ width: `${Math.min(dsrData.baseDsr, 100)}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {dsrData.baseDsrStatus}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>스트레스 금리 ({dsrData.stressRate}%)</span>
                <span>DSR: {dsrData.stressDsr.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full flex items-center justify-end pr-1 ${
                    dsrData.stressDsrStatus === "초과"
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-orange-500 to-orange-600"
                  }`}
                  style={{ width: `${Math.min(dsrData.stressDsr, 100)}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {dsrData.stressDsrStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 신규 대출 계산 결과 */}
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-3">
            신규 대출 계산 결과
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 기본 금리 결과 */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h6 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                기본 금리 ({dsrData.desiredInterestRate}%) 적용 결과
              </h6>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">월 상환액</span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatCurrency(dsrData.baseMonthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">연간 상환액</span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatCurrency(dsrData.baseAnnualPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">총 상환액</span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatCurrency(dsrData.baseTotalPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">DSR 비율</span>
                  <span className="text-sm font-bold text-blue-700">
                    {dsrData.baseDsr}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    총 연간 상환액(기존 대출 포함)
                  </span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatCurrency(
                      dsrData.baseAnnualPayment + existingLoanAnnualPayment
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 스트레스 금리 결과 */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h6 className="text-sm font-semibold text-orange-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                스트레스 금리 ({dsrData.stressRate}%) 적용 결과
              </h6>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">월 상환액</span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(dsrData.stressMonthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">연간 상환액</span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(dsrData.stressAnnualPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">총 상환액</span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(dsrData.stressTotalPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">DSR 비율</span>
                  <span className="text-sm font-bold text-orange-700">
                    {dsrData.stressDsr}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    총 연간 상환액(기존 대출 포함)
                  </span>
                  <span className="text-sm font-bold text-orange-700">
                    {formatCurrency(
                      dsrData.stressAnnualPayment + existingLoanAnnualPayment
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 비교표 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-medium text-gray-700">
                  구분
                </th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">
                  금리
                </th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">
                  월 상환액
                </th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">
                  DSR 비율
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">
                  희망 금리
                </td>
                <td className="py-2 px-2 text-right text-gray-600">
                  {dsrData.desiredInterestRate}%
                </td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">
                  {formatCurrency(dsrData.baseMonthlyPayment)}
                </td>
                <td className="py-2 px-2 text-right font-semibold text-blue-600">
                  {dsrData.baseDsr.toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium text-gray-800">
                  스트레스 금리
                </td>
                <td className="py-2 px-2 text-right text-gray-600">
                  {dsrData.stressRate}%
                </td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">
                  {formatCurrency(dsrData.stressMonthlyPayment)}
                </td>
                <td className="py-2 px-2 text-right font-semibold text-red-600">
                  {dsrData.stressDsr.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 차이 강조 */}
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-3 h-3 text-orange-600 mr-1" />
            <div className="text-xs text-orange-700">
              <p className="font-medium mb-1">금리 상승 시 DSR 비율 증가</p>
              <p>
                스트레스 금리({dsrData.stressRate}%)에서는 DSR이{" "}
                <span className="font-semibold">
                  {(dsrData.stressDsr - dsrData.baseDsr).toFixed(2)}%p
                </span>
                만큼 증가합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="w-3 h-3 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">DSR 계산 안내</p>
            <p>
              DSR은 모든 대출을 포함하며 금리 상승까지 고려합니다. 따라서 실제
              가능 대출액은 LTV보다 제한적일 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 계산 정보 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-600 text-center">
          계산일시: {dsrData.calculationDate} | {dsrData.message}
        </div>
      </div>
    </div>
  );
};

export default DSRResultCard;
