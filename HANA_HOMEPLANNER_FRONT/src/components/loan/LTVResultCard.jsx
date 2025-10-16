import React from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Home, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const LTVResultCard = ({ ltvData }) => {
  if (!ltvData) return null;

  const formatCurrency = (amount) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const ltvRatio = ((ltvData.maxLoanAmount / ltvData.housePrice) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* 지역 정보 + 규제 여부 배너 */}
      <div className={`rounded-lg p-3 border-l-4 ${
        ltvData.regulationArea 
          ? 'bg-red-50 border-red-400' 
          : 'bg-green-50 border-green-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className={`w-4 h-4 mr-2 ${
              ltvData.regulationArea ? 'text-red-600' : 'text-green-600'
            }`} />
            <span className={`text-sm font-semibold ${
              ltvData.regulationArea ? 'text-red-800' : 'text-green-800'
            }`}>
              {ltvData.region} ({ltvData.regionType})
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            ltvData.regulationArea 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {ltvData.regulationArea ? '규제지역' : '일반지역'}
          </div>
        </div>
        {ltvData.regulationArea && (
          <p className="text-xs text-red-700 mt-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            규제지역은 한도가 {ltvData.ltvLimit}%로 제한됩니다
          </p>
        )}
      </div>

      {/* 대출 가능 최대 금액과 LTV 한도 강조 카드 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
        <div className="text-center">
          <h3 className="text-base font-semibold mb-3 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            대출 가능 정보
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">최대 대출금액</div>
              <div className="text-lg font-bold">{formatCurrency(ltvData.maxLoanAmount)}</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90 mb-1">LTV 한도</div>
              <div className="text-lg font-bold">{ltvData.ltvLimit}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 대출 조건 요약 정보 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
          대출 조건
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">대출 가능 한도</div>
            <div className="text-sm font-semibold text-blue-600">{formatCurrency(ltvData.maxLoanAmount)}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">대출기간</div>
            <div className="text-sm font-semibold text-gray-800">{ltvData.loanPeriod}년</div>
          </div>
        </div>
      </div>

      {/* LTV 비율 Progress Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-gray-600" />
          LTV 비율
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>집값 대비 대출 한도</span>
              <span>{ltvRatio}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  parseFloat(ltvRatio) <= ltvData.ltvLimit 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(parseFloat(ltvRatio), 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className={`font-medium ${
                parseFloat(ltvRatio) <= ltvData.ltvLimit ? 'text-green-600' : 'text-red-600'
              }`}>
                {ltvData.ltvLimit}% (한도)
              </span>
              <span>100%</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${
            parseFloat(ltvRatio) <= ltvData.ltvLimit 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`flex items-center text-xs ${
              parseFloat(ltvRatio) <= ltvData.ltvLimit ? 'text-green-700' : 'text-red-700'
            }`}>
              {parseFloat(ltvRatio) <= ltvData.ltvLimit ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {parseFloat(ltvRatio) <= ltvData.ltvLimit 
                ? 'LTV 한도 내에서 대출 가능합니다' 
                : 'LTV 한도를 초과합니다'
              }
            </div>
          </div>
        </div>
      </div>

      {/* 기본 금리 vs 스트레스 금리 비교표 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-gray-600" />
          금리별 상환 정보
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-medium text-gray-700">구분</th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">금리</th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">월 상환액</th>
                <th className="text-right py-2 px-2 font-medium text-gray-700">총 상환액</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-800">기본 금리</td>
                <td className="py-2 px-2 text-right text-gray-600">{ltvData.interestRate}%</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">{formatCurrency(ltvData.monthlyPayment)}</td>
                <td className="py-2 px-2 text-right font-semibold text-gray-800">{formatCurrency(ltvData.totalRepaymentAmount)}</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium text-gray-800">스트레스 금리</td>
                <td className="py-2 px-2 text-right text-gray-600">{ltvData.stressRate}%</td>
                <td className="py-2 px-2 text-right font-semibold text-red-600">{formatCurrency(ltvData.stressMonthlyPayment)}</td>
                <td className="py-2 px-2 text-right font-semibold text-red-600">{formatCurrency(ltvData.stressTotalRepaymentAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Info className="w-3 h-3 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">스트레스 금리란?</p>
              <p>금리 상승 시나리오를 고려한 상환액으로, 금리가 {ltvData.stressRate}%로 상승할 경우의 상환 정보입니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 계산 정보 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-600 text-center">
          계산일시: {ltvData.calculationDate} | {ltvData.message}
        </div>
      </div>
    </div>
  );
};

export default LTVResultCard;
