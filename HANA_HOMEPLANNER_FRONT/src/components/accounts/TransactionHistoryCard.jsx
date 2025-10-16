import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp,
  Filter,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

/**
 * 거래 내역 카드 컴포넌트
 * 계좌의 거래 내역을 표시합니다.
 */
const TransactionHistoryCard = ({ 
  transactionHistories, 
  formatCurrency, 
  formatDate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEPOSIT, WITHDRAWAL

  if (!transactionHistories || transactionHistories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">거래 내역 없음</h3>
          <p className="text-gray-600">등록된 거래 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 필터링된 거래 내역
  const filteredTransactions = transactionHistories.filter(transaction => {
    if (filterType === 'ALL') return true;
    return transaction.txnType === filterType;
  });

  // 통계 계산
  const stats = {
    total: transactionHistories.length,
    deposits: transactionHistories.filter(t => t.txnType === 'DEPOSIT').length,
    withdrawals: transactionHistories.filter(t => t.txnType === 'WITHDRAWAL').length,
    totalDeposits: transactionHistories.filter(t => t.txnType === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawals: transactionHistories.filter(t => t.txnType === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0)
  };

  const getTransactionIcon = (txnType) => {
    switch (txnType) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (txnType) => {
    switch (txnType) {
      case 'DEPOSIT':
        return 'text-green-600 bg-green-100';
      case 'WITHDRAWAL':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAmountColor = (txnType) => {
    switch (txnType) {
      case 'DEPOSIT':
        return 'text-green-600';
      case 'WITHDRAWAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">거래 내역</h3>
            <p className="text-sm text-gray-500">총 {stats.total}건의 거래</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 필터 버튼 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === 'ALL' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('DEPOSIT')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === 'DEPOSIT' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              입금
            </button>
            <button
              onClick={() => setFilterType('WITHDRAWAL')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filterType === 'WITHDRAWAL' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              출금
            </button>
          </div>
          
          {/* 확장/축소 버튼 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 mb-1">총 거래</p>
          <p className="text-lg font-bold text-blue-800">{stats.total}건</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600 mb-1">입금</p>
          <p className="text-lg font-bold text-green-800">
            {formatCurrency(stats.totalDeposits)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
          <p className="text-sm text-red-600 mb-1">출금</p>
          <p className="text-lg font-bold text-red-800">
            {formatCurrency(stats.totalWithdrawals)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-600 mb-1">순 거래액</p>
          <p className={`text-lg font-bold ${
            stats.totalDeposits - stats.totalWithdrawals >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(stats.totalDeposits - stats.totalWithdrawals)}
          </p>
        </div>
      </div>

      {/* 거래 내역 목록 */}
      {isExpanded && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            거래 내역 상세 ({filteredTransactions.length}건)
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredTransactions.map((transaction, index) => (
              <div 
                key={transaction.txnId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.txnType)}
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.txnTypeDescription}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(transaction.txnDate)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${getAmountColor(transaction.txnType)}`}>
                    {transaction.txnType === 'DEPOSIT' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    잔액: {formatCurrency(transaction.balanceAfter)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryCard;
