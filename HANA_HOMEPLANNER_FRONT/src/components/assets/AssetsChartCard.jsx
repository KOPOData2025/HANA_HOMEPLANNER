import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  PieChart,
  Info,
  ChevronDown,
  ChevronUp,
  Building,
  Banknote,
  Home,
  Car
} from 'lucide-react';

const AssetsChartCard = ({ summary, analysis, assetsDetails, liabilitiesDetails }) => {
  const [showAssetsDetails, setShowAssetsDetails] = useState(false);
  const [showLiabilitiesDetails, setShowLiabilitiesDetails] = useState(false);
  
  if (!summary) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return '0원';
    }
    const absAmount = Math.abs(amount);
    if (absAmount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (absAmount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    } else {
      return `${amount.toLocaleString()}원`;
    }
  };

  // 차트 데이터 계산
  const totalAssets = summary.totalAssets || 0;
  const totalLiabilities = summary.totalLiabilities || 0;
  // 순자산을 직접 계산 (총자산 - 총부채)
  const netWorth = totalAssets - totalLiabilities;
  
  // 디버깅용 로그
  console.log('🔍 AssetsChartCard 계산:', {
    totalAssets,
    totalLiabilities,
    netWorth,
    netWorthFormatted: formatShortCurrency(netWorth)
  });

  // 원형차트를 위한 데이터 - 자산과 부채를 합산한 총액 기준으로 계산
  const totalValue = Math.max(totalAssets, totalLiabilities);
  
  const chartData = [
    {
      name: '총자산',
      value: totalAssets,
      color: '#10B981', // emerald-500
      percentage: totalValue > 0 ? (totalAssets / totalValue) * 100 : 0
    },
    {
      name: '총부채',
      value: totalLiabilities,
      color: '#EF4444', // red-500
      percentage: totalValue > 0 ? (totalLiabilities / totalValue) * 100 : 0
    }
  ];

  // 순자산 비율 계산 (총자산 기준)
  const netWorthPercentage = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;
  
  // 부채 비율 계산 (총자산 기준)
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // 원형차트 SVG 생성
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 20;

  const getStrokeDasharray = (percentage) => {
    const strokeDasharray = (percentage / 100) * circumference;
    return `${strokeDasharray} ${circumference}`;
  };

  const getStrokeDashoffset = (index) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (chartData[i].percentage / 100) * circumference;
    }
    return -offset;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      {/* 헤더 */}
      <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg mr-4">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">자산 현황</h3>
              <p className="text-slate-600">나의 자산과 부채를 한눈에 확인하세요</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">마지막 업데이트</p>
            <p className="text-xs text-slate-400">
              {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString('ko-KR') : '정보 없음'}
            </p>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* 원형차트 */}
          <div className="flex justify-center">
            <div className="relative">
              <svg width="280" height="280" className="transform -rotate-90">
                {/* 배경 원 */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth={strokeWidth}
                />
                
                {/* 총자산 원 */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={chartData[0].color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={getStrokeDasharray(chartData[0].percentage)}
                  strokeDashoffset={getStrokeDashoffset(0)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* 총부채 원 */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={chartData[1].color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={getStrokeDasharray(chartData[1].percentage)}
                  strokeDashoffset={getStrokeDashoffset(1)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  opacity="0.7"
                />
              </svg>
              
              {/* 중앙 텍스트 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">순자산</p>
                  <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatShortCurrency(netWorth)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {netWorthPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 범례 및 상세 정보 */}
          <div className="space-y-6">
            {/* 범례 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-3">자산 구성</h4>
              
              {/* 총자산 */}
              <div className="relative bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <button 
                  onClick={() => setShowAssetsDetails(!showAssetsDetails)}
                  className="w-full flex items-center justify-between p-4 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 mr-3"></div>
                    <div>
                      <p className="font-semibold text-slate-800">총자산</p>
                      <p className="text-sm text-slate-600">보유 자산</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-2">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatShortCurrency(totalAssets)}
                      </p>
                      <p className="text-xs text-slate-500">100%</p>
                    </div>
                    {showAssetsDetails ? (
                      <ChevronUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                </button>
                
                {/* 자산 상세 내역 오버레이 */}
                {showAssetsDetails && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl border border-emerald-200 shadow-xl">
                    <div className="p-6">
                      <h5 className="text-lg font-semibold text-slate-700 mb-4">자산 상세 내역</h5>
                      {assetsDetails && Array.isArray(assetsDetails) && assetsDetails.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                          <div className="space-y-3">
                            {assetsDetails.map((asset, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                    {asset.type === 'DEPOSIT' ? (
                                      <Banknote className="w-5 h-5 text-white" />
                                    ) : asset.type === 'SAVINGS' ? (
                                      <Building className="w-5 h-5 text-white" />
                                    ) : asset.type === 'INVESTMENT' ? (
                                      <TrendingUp className="w-5 h-5 text-white" />
                                    ) : asset.type === 'REAL_ESTATE' ? (
                                      <Home className="w-5 h-5 text-white" />
                                    ) : (
                                      <Building className="w-5 h-5 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{asset.name}</p>
                                    <p className="text-sm text-slate-500">{asset.bankName || asset.type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-slate-800">{formatShortCurrency(asset.balance)}</p>
                                  <p className="text-sm text-slate-500">{asset.percentage?.toFixed(1) || '0.0'}%</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building className="w-8 h-8 text-emerald-600" />
                          </div>
                          <p className="text-slate-500">등록된 자산 정보가 없습니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 총부채 */}
              <div className="relative bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <button 
                  onClick={() => setShowLiabilitiesDetails(!showLiabilitiesDetails)}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                    <div>
                      <p className="font-semibold text-slate-800">총부채</p>
                      <p className="text-sm text-slate-600">미상환 부채</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-2">
                      <p className="text-lg font-bold text-red-600">
                        {formatShortCurrency(totalLiabilities)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {debtRatio.toFixed(1)}%
                      </p>
                    </div>
                    {showLiabilitiesDetails ? (
                      <ChevronUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </button>
                
                {/* 부채 상세 내역 오버레이 */}
                {showLiabilitiesDetails && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl border border-red-200 shadow-xl">
                    <div className="p-6">
                      <h5 className="text-lg font-semibold text-slate-700 mb-4">대출 상세 내역</h5>
                      {liabilitiesDetails && Array.isArray(liabilitiesDetails) && liabilitiesDetails.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                          <div className="space-y-3">
                            {liabilitiesDetails.map((liability, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                                    {liability.type === '카드대출' ? (
                                      <CreditCard className="w-5 h-5 text-white" />
                                    ) : liability.type === '할부대출' ? (
                                      <Car className="w-5 h-5 text-white" />
                                    ) : liability.type === '보험대출' ? (
                                      <Building className="w-5 h-5 text-white" />
                                    ) : (
                                      <CreditCard className="w-5 h-5 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{liability.name}</p>
                                    <p className="text-sm text-slate-500">{liability.bankName || liability.type}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-slate-800">{formatShortCurrency(liability.balance)}</p>
                                  <p className="text-sm text-slate-500">{liability.interestRate || '0'}%</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-red-600" />
                          </div>
                          <p className="text-slate-500">등록된 대출 정보가 없습니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 핵심 지표 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-slate-500 mr-1" />
                  <span className="text-sm text-slate-500">자산 비율</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {netWorthPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">순자산/총자산</p>
              </div>

              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <CreditCard className="w-5 h-5 text-slate-500 mr-1" />
                  <span className="text-sm text-slate-500">부채 비율</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {debtRatio.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">부채/총자산</p>
              </div>
            </div>

            {/* 분석 정보 */}
            {analysis && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">자산 분석</p>
                    <p className="text-xs text-blue-700">
                      {netWorth >= 0 
                        ? `건전한 자산 구조를 유지하고 있습니다. 순자산이 총자산의 ${netWorthPercentage.toFixed(1)}%를 차지합니다.`
                        : `부채가 자산을 ${debtRatio.toFixed(1)}% 초과하고 있습니다. 자산 증대와 부채 상환 계획이 필요합니다.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsChartCard;
