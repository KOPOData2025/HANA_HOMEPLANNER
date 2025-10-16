import React from 'react';
import { TrendingUp, TrendingDown, Building, Calendar, MapPin, ExternalLink } from 'lucide-react';

export const PropertyDetailPanel = ({ property, onClose, onViewDetail }) => {
  if (!property) return null;

  // 목데이터 - 실제 API 연동 시 교체
  const mockData = {
    complexName: property.name || '강남 아파트',
    priceRange: {
      min: '8억 5,000',
      max: '12억 2,000',
      average: '10억 3,500'
    },
    recentTransactions: [
      { date: '2024.01', price: '11억 8,000', area: '84㎡', floor: '15층' },
      { date: '2024.01', price: '10억 5,000', area: '84㎡', floor: '8층' },
      { date: '2023.12', price: '9억 8,000', area: '84㎡', floor: '5층' }
    ],
    priceTrend: [
      { year: 2020, average: '8억 2,000', change: '+5.2%' },
      { year: 2021, average: '8억 6,000', change: '+4.9%' },
      { year: 2022, average: '9억 1,000', change: '+5.8%' },
      { year: 2023, average: '9억 7,000', change: '+6.6%' },
      { year: 2024, average: '10억 3,500', change: '+6.7%' }
    ]
  };

  const getTrendIcon = (change) => {
    const isPositive = change.startsWith('+');
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = (change) => {
    const isPositive = change.startsWith('+');
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">단지 상세 정보</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 단지명 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-5 h-5 text-teal-600" />
          <h4 className="text-lg font-semibold text-gray-800">{mockData.complexName}</h4>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{property.address || '강남구 역삼동 123-45'}</span>
        </div>
      </div>

      {/* 분양가 범위 */}
      <div className="mb-6">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">분양가 범위</h5>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">최저가</p>
            <p className="text-sm font-bold text-blue-600">{mockData.priceRange.min}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">평균가</p>
            <p className="text-sm font-bold text-teal-600">{mockData.priceRange.average}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">최고가</p>
            <p className="text-sm font-bold text-red-600">{mockData.priceRange.max}</p>
          </div>
        </div>
      </div>

      {/* 최근 거래가 */}
      <div className="mb-6">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">최근 거래가</h5>
        <div className="space-y-2">
          {mockData.recentTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">{transaction.date}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">{transaction.area} • {transaction.floor}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{transaction.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 평균 분양가 추이 그래프 */}
      <div className="mb-6 flex-1">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">평균 분양가 추이 (최근 5년)</h5>
        <div className="space-y-3">
          {mockData.priceTrend.map((yearData, index) => (
            <div key={yearData.year} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">{yearData.year}년</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((yearData.average.replace(/[억,]/g, '') - 8) / 4) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{yearData.average}</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(yearData.change)}
                  <span className={`text-xs font-medium ${getTrendColor(yearData.change)}`}>
                    {yearData.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 자세히 보기 버튼 */}
      <div className="mt-auto">
        <button
          onClick={onViewDetail}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          자세히 보기
        </button>
      </div>
    </div>
  );
};
