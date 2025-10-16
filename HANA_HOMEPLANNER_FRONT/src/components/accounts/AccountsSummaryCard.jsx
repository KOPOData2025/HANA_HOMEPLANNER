import React from 'react';
import { 
  CreditCard, 
  PiggyBank, 
  TrendingDown, 
  Wallet,
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react';

/**
 * 계좌 요약 카드 컴포넌트
 * 계좌 타입별 요약 정보를 표시합니다.
 */
const AccountsSummaryCard = ({ 
  accountStats, 
  isLoading, 
  onRefresh,
  formatCurrency 
}) => {
  const { totalAccounts, activeAccounts, balances } = accountStats;

  // 계좌 타입별 아이콘과 색상
  const accountTypeConfig = {
    demand: {
      icon: CreditCard,
      label: '입출금',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    saving: {
      icon: PiggyBank,
      label: '적금',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    loan: {
      icon: TrendingDown,
      label: '대출',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    other: {
      icon: Wallet,
      label: '기타',
      color: 'gray',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    }
  };

  const getAccountTypeInfo = (type) => {
    return accountTypeConfig[type] || accountTypeConfig.other;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
            <div>
              <h3 className="text-lg font-bold text-gray-800">계좌 현황</h3>
              <p className="text-sm text-gray-500">나의 계좌 정보를 한눈에 확인하세요</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 전체 요약 */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-500 font-medium">전체 계좌</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalAccounts}개</p>
            <p className="text-xs text-gray-400">활성: {activeAccounts}개</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-xs text-gray-500 font-medium">총 잔액</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(balances.total)}
            </p>
            <p className={`text-xs font-medium ${
              balances.total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {balances.total >= 0 ? '자산' : '부채'}
            </p>
          </div>
        </div>

        {/* 계좌 타입별 상세 정보 */}
        <div className="space-y-3">
          {Object.entries(balances).map(([type, balance]) => {
            if (type === 'total') return null;
            
            const config = getAccountTypeInfo(type);
            const IconComponent = config.icon;
            
            return (
              <div 
                key={type}
                className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 ${config.textColor}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${config.textColor}`}>
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {type === 'demand' && '입출금 계좌'}
                        {type === 'saving' && '적금 계좌'}
                        {type === 'loan' && '대출 계좌'}
                        {type === 'other' && '기타 계좌'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${config.textColor}`}>
                      {formatCurrency(balance)}
                    </p>
                    <p className={`text-xs font-medium ${
                      balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 자산/부채 요약 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">순자산</span>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${
                balances.total >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(balances.total)}
              </p>
              
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsSummaryCard;
