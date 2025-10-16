/**
 * 자산 세부 내역 카드 컴포넌트
 * 자산과 부채의 상세 정보를 표시
 */

import React, { useState } from 'react';
import { 
  Building, 
  PiggyBank, 
  CreditCard, 
  Home,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Banknote,
  Percent
} from 'lucide-react';

const AssetsBreakdownCard = ({ assetsDetails, liabilitiesDetails }) => {
  const [activeTab, setActiveTab] = useState('assets');
  const [expandedItems, setExpandedItems] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <Banknote className="w-5 h-5 text-blue-500" />;
      case 'SAVINGS':
        return <PiggyBank className="w-5 h-5 text-green-500" />;
      case 'LOAN':
        return <CreditCard className="w-5 h-5 text-red-500" />;
      case 'INVESTMENT':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'REAL_ESTATE':
        return <Home className="w-5 h-5 text-orange-500" />;
      default:
        return <Building className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLiabilityIcon = (type) => {
    switch (type) {
      case '은행대출':
        return <Building className="w-5 h-5 text-blue-500" />;
      case '카드대출':
        return <CreditCard className="w-5 h-5 text-red-500" />;
      case '할부대출':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      case '보험대출':
        return <PiggyBank className="w-5 h-5 text-purple-500" />;
      default:
        return <Building className="w-5 h-5 text-gray-500" />;
    }
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '정상':
      case '활성':
        return 'text-green-600 bg-green-100';
      case '비활성':
        return 'text-gray-600 bg-gray-100';
      case '만료':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'assets'
              ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            자산 내역 ({assetsDetails?.length || 0})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('liabilities')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'liabilities'
              ? 'text-red-600 bg-red-50 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <CreditCard className="w-4 h-4 mr-2" />
            부채 내역 ({liabilitiesDetails?.length || 0})
          </div>
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="p-6">
        {activeTab === 'assets' ? (
          <div className="space-y-4">
            {assetsDetails?.length > 0 ? (
              assetsDetails.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAssetIcon(asset.type)}
                      <div>
                        <h4 className="font-medium text-gray-800">{asset.name}</h4>
                        <p className="text-sm text-gray-500">{asset.bankName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${asset.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(asset.balance)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>자산 정보가 없습니다</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {liabilitiesDetails?.length > 0 ? (
              liabilitiesDetails.map((liability, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getLiabilityIcon(liability.type)}
                      <div>
                        <h4 className="font-medium text-gray-800">{liability.name}</h4>
                        <p className="text-sm text-gray-500">{liability.bankName}</p>
                        {liability.interestRate && (
                          <p className="text-xs text-gray-400">
                            금리: {liability.interestRate}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatCurrency(liability.balance)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(liability.status)}`}>
                        {liability.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>부채 정보가 없습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetsBreakdownCard;
