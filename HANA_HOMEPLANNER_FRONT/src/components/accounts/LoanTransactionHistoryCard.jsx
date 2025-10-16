import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Receipt, Calendar } from 'lucide-react';

/**
 * 대출 거래 내역 카드 컴포넌트
 * 대출 계좌의 거래 내역을 표시합니다.
 */
const LoanTransactionHistoryCard = ({ 
  transactionHistories = [], 
  isLoading = false, 
  formatCurrency,
  formatDate 
}) => {
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    let filtered = transactionHistories;

    // 거래 유형별 필터링
    if (filter !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.txnType === filter);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.txnDate) - new Date(a.txnDate);
        case 'amount':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'type':
          return a.txnType.localeCompare(b.txnType);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactionHistories, filter, sortBy]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = transactionHistories.length;
    const withdrawals = transactionHistories.filter(t => t.txnType === 'WITHDRAWAL');
    const deposits = transactionHistories.filter(t => t.txnType === 'DEPOSIT');
    
    const totalWithdrawalAmount = withdrawals.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const totalDepositAmount = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const netAmount = totalDepositAmount - totalWithdrawalAmount;

    return {
      total,
      withdrawalCount: withdrawals.length,
      depositCount: deposits.length,
      totalWithdrawalAmount,
      totalDepositAmount,
      netAmount
    };
  }, [transactionHistories]);

  // 거래 유형별 아이콘 반환
  const getTransactionIcon = (txnType) => {
    switch (txnType) {
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'DEPOSIT':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  // 거래 유형별 색상 반환
  const getTransactionColor = (txnType) => {
    switch (txnType) {
      case 'WITHDRAWAL':
        return 'text-red-600 bg-red-50';
      case 'DEPOSIT':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 금액 표시 포맷
  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const formatted = formatCurrency(absAmount);
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">거래 내역</h3>
            <p className="text-sm text-gray-500">대출 계좌의 모든 거래 기록</p>
          </div>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">총 거래 건수</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.withdrawalCount}</div>
          <div className="text-sm text-gray-500">출금 건수</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.depositCount}</div>
          <div className="text-sm text-gray-500">입금 건수</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(stats.netAmount))}
          </div>
          <div className="text-sm text-gray-500">순 거래액</div>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'ALL' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체 ({stats.total})
          </button>
          <button
            onClick={() => setFilter('WITHDRAWAL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'WITHDRAWAL' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            출금 ({stats.withdrawalCount})
          </button>
          <button
            onClick={() => setFilter('DEPOSIT')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'DEPOSIT' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            입금 ({stats.depositCount})
          </button>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="date">날짜 순</option>
          <option value="amount">금액 순</option>
          <option value="type">유형 순</option>
        </select>
      </div>

      {/* 거래 내역 목록 */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>거래 내역이 없습니다.</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.txnId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTransactionColor(transaction.txnType)}`}>
                    {getTransactionIcon(transaction.txnType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {transaction.txnTypeDescription}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(transaction.txnType)}`}>
                        {transaction.txnType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      거래일: {formatDate(transaction.txnDate)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    transaction.txnType === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    잔액: {formatCurrency(transaction.balanceAfter)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 금액 요약 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(stats.totalWithdrawalAmount)}
            </div>
            <div className="text-sm text-gray-500">총 출금액</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(stats.totalDepositAmount)}
            </div>
            <div className="text-sm text-gray-500">총 입금액</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(stats.netAmount))}
            </div>
            <div className="text-sm text-gray-500">순 거래액</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanTransactionHistoryCard;
