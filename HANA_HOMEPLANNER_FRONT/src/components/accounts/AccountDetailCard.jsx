import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PiggyBank,
  ArrowLeft,
  TrendingDown,
  Wallet,
  DollarSign,
  Target,
  Percent,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

/**
 * 계좌 상세 정보 카드 컴포넌트
 * 계좌 기본 정보, 적금 정보, 납입 일정, 거래 내역을 표시합니다.
 */
const AccountDetailCard = ({ 
  accountDetail, 
  isLoading, 
  error, 
  onClose,
  formatCurrency, 
  formatDate, 
  formatAccountNumber,
  getPaymentSummary,
  getTransactionSummary,
  getSavingsSummary
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">계좌 상세 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (!accountDetail) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">계좌 정보 없음</h3>
          <p className="text-gray-600">계좌 상세 정보를 불러오지 못했습니다.</p>
        </div>
      </div>
    );
  }

  const { account, userSavings, paymentSchedules, transactionHistories } = accountDetail;
  const paymentSummary = getPaymentSummary();
  const transactionSummary = getTransactionSummary();
  const savingsSummary = getSavingsSummary();

  // 납입 일정 상세 토글 상태
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PAID, PENDING
  
  // 거래내역 상세 토글 상태
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEPOSIT, WITHDRAWAL

  // 계좌 타입별 설정 - 강조된 색상 시스템
  const getAccountTypeConfig = (accountType) => {
    switch (accountType) {
      case 'SAVING':
        return {
          icon: PiggyBank,
          bgColor: 'from-[#009071] to-[#007a5f]',
          textColor: 'text-[#009071]',
          bgCardColor: 'from-white to-gray-50',
          labelColor: 'text-gray-600',
          valueColor: 'text-black',
          borderColor: 'border-[#009071]',
          accentColor: 'text-[#009071]'
        };
      case 'LOAN':
        return {
          icon: TrendingDown,
          bgColor: 'from-[#009071] to-[#007a5f]',
          textColor: 'text-[#009071]',
          bgCardColor: 'from-white to-gray-50',
          labelColor: 'text-gray-600',
          valueColor: 'text-black',
          borderColor: 'border-[#009071]',
          accentColor: 'text-[#009071]'
        };
      case 'DEMAND':
        return {
          icon: CreditCard,
          bgColor: 'from-[#009071] to-[#007a5f]',
          textColor: 'text-[#009071]',
          bgCardColor: 'from-white to-gray-50',
          labelColor: 'text-gray-600',
          valueColor: 'text-black',
          borderColor: 'border-[#009071]',
          accentColor: 'text-[#009071]'
        };
      default:
        return {
          icon: Wallet,
          bgColor: 'from-[#009071] to-[#007a5f]',
          textColor: 'text-[#009071]',
          bgCardColor: 'from-white to-gray-50',
          labelColor: 'text-gray-600',
          valueColor: 'text-black',
          borderColor: 'border-[#009071]',
          accentColor: 'text-[#009071]'
        };
    }
  };

  const accountConfig = getAccountTypeConfig(account.accountType);
  const AccountIcon = accountConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* 컴팩트 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${accountConfig.bgColor} rounded-xl flex items-center justify-center`}>
            <AccountIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{account.accountTypeDescription}</h2>
            <p className="text-sm text-gray-500">{formatAccountNumber(account.accountNum)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="닫기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        {/* 컴팩트 계좌 기본 정보 - 강조된 디자인 */}
        <div className={`bg-gradient-to-br ${accountConfig.bgCardColor} rounded-xl p-4 mb-4 border-2 ${accountConfig.borderColor} shadow-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-8">
              <div className="text-left">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>현재 잔액</p>
                <p className={`text-2xl font-black ${accountConfig.valueColor}`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className="w-px h-16 bg-gray-300"></div>
              <div className="text-left">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>계좌 상태</p>
                <p className={`text-xl font-bold ${accountConfig.accentColor}`}>
                  {account.statusDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 적금 정보 - 강조된 디자인 */}
        {userSavings && (
          <div className={`bg-gradient-to-br ${accountConfig.bgCardColor} rounded-xl p-4 mb-4 border-2 ${accountConfig.borderColor} shadow-lg`}>
            <div className="flex items-center justify-start mb-4">
              <h3 className={`text-xl font-black ${accountConfig.accentColor} flex items-center`}>
                <Target className="w-6 h-6 mr-2" />
                적금 정보
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>월 납입액</p>
                <p className={`text-xl font-black ${accountConfig.valueColor}`}>
                  {formatCurrency(userSavings.monthlyAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>시작일</p>
                <p className={`text-sm font-bold ${accountConfig.valueColor}`}>
                  {formatDate(userSavings.startDate)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>만료일</p>
                <p className={`text-sm font-bold ${accountConfig.valueColor}`}>
                  {formatDate(userSavings.endDate)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>목표 금액</p>
                <p className={`text-xl font-black ${accountConfig.accentColor}`}>
                  {formatCurrency(savingsSummary?.totalTargetAmount || 0)}
                </p>
              </div>
            </div>
            {savingsSummary && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className={`text-sm font-medium ${accountConfig.labelColor}`}>경과</p>
                    <p className={`text-xl font-black ${accountConfig.valueColor}`}>{savingsSummary.elapsedMonths}개월</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${accountConfig.labelColor}`}>남은 기간</p>
                    <p className={`text-xl font-black ${accountConfig.valueColor}`}>{savingsSummary.remainingMonths}개월</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${accountConfig.labelColor}`}>진행률</p>
                    <p className={`text-xl font-black ${accountConfig.accentColor}`}>
                      {((savingsSummary.elapsedMonths / savingsSummary.totalMonths) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 납입 일정 요약 - 강조된 디자인 (입출금 계좌 제외) */}
        {paymentSummary && account.accountType !== 'DEMAND' && (
          <div className={`bg-gradient-to-br ${accountConfig.bgCardColor} rounded-xl p-4 mb-4 border-2 ${accountConfig.borderColor} shadow-lg`}>
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
            >
              <h3 className={`text-xl font-black ${accountConfig.accentColor} flex items-center`}>
                <Calendar className="w-6 h-6 mr-2" />
                납입 일정 현황
              </h3>
              <div className={`transform transition-transform duration-200 ${showPaymentDetails ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* 횟수 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>총 납입</p>
                <p className={`text-xl font-black ${accountConfig.valueColor}`}>{paymentSummary.totalCount}회</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>완료</p>
                <p className={`text-xl font-black text-green-600`}>{paymentSummary.paidCount}회</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>대기</p>
                <p className={`text-xl font-black text-orange-600`}>{paymentSummary.pendingCount}회</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>진행률</p>
                <p className={`text-xl font-black ${accountConfig.accentColor}`}>
                  {paymentSummary.progressPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>총 납입액</p>
                <p className={`text-xl font-black ${accountConfig.valueColor}`}>
                  {formatCurrency(paymentSummary.totalAmount || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>납입완료</p>
                <p className={`text-xl font-black text-green-600`}>
                  {formatCurrency(paymentSummary.paidAmount || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>잔여 납입액</p>
                <p className={`text-xl font-black text-orange-600`}>
                  {formatCurrency(paymentSummary.remainingAmount || 0)}
                </p>
              </div>
            </div>
            
            {/* 강조된 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
              <div 
                className={`bg-gradient-to-r ${accountConfig.bgColor} h-3 rounded-full transition-all duration-500 shadow-sm`}
                style={{ width: `${paymentSummary.progressPercentage}%` }}
              ></div>
            </div>

            {/* 토글된 납입 일정 상세 */}
            {showPaymentDetails && paymentSchedules && paymentSchedules.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                {/* 필터 버튼 */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFilterStatus('ALL')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        filterStatus === 'ALL' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setFilterStatus('PAID')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        filterStatus === 'PAID' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      완료
                    </button>
                    <button
                      onClick={() => setFilterStatus('PENDING')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        filterStatus === 'PENDING' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      대기
                    </button>
                  </div>
                </div>

                {/* 납입 일정 목록 */}
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    납입 일정 상세 ({paymentSchedules.filter(schedule => {
                      if (filterStatus === 'ALL') return true;
                      return schedule.status === filterStatus;
                    }).length}건)
                  </h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {paymentSchedules
                      .filter(schedule => {
                        if (filterStatus === 'ALL') return true;
                        return schedule.status === filterStatus;
                      })
                      .map((schedule, index) => (
                        <div 
                          key={schedule.paymentId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {schedule.status === 'PAID' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-orange-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-800">
                                {formatDate(schedule.dueDate)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {schedule.statusDescription}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              {formatCurrency(schedule.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 거래 내역 요약 - 강조된 디자인 */}
        {transactionSummary && (
          <div className={`bg-gradient-to-br ${accountConfig.bgCardColor} rounded-xl p-4 mb-4 border-2 ${accountConfig.borderColor} shadow-lg`}>
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => setShowTransactionDetails(!showTransactionDetails)}
            >
              <h3 className={`text-xl font-black ${accountConfig.accentColor} flex items-center`}>
                <TrendingUp className="w-6 h-6 mr-2" />
                거래 내역 요약
              </h3>
              <div className={`transform transition-transform duration-200 ${showTransactionDetails ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>총 거래</p>
                <p className={`text-xl font-black ${accountConfig.valueColor}`}>{transactionSummary.totalTransactions}건</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>입금</p>
                <p className={`text-xl font-black text-green-600`}>
                  {formatCurrency(transactionSummary.totalDeposits)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>출금</p>
                <p className={`text-xl font-black text-red-600`}>
                  {formatCurrency(transactionSummary.totalWithdrawals)}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${accountConfig.labelColor} mb-1`}>순 거래액</p>
                <p className={`text-xl font-black ${
                  transactionSummary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(transactionSummary.netAmount)}
                </p>
              </div>
            </div>

            {/* 토글된 거래내역 상세 */}
            {showTransactionDetails && transactionHistories && transactionHistories.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                {/* 필터 버튼 */}
                <div className="flex items-center space-x-2 mb-4">
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
                </div>

                {/* 거래내역 목록 */}
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    거래 내역 상세 ({transactionHistories.filter(transaction => {
                      if (filterType === 'ALL') return true;
                      return transaction.txnType === filterType;
                    }).length}건)
                  </h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {transactionHistories
                      .filter(transaction => {
                        if (filterType === 'ALL') return true;
                        return transaction.txnType === filterType;
                      })
                      .map((transaction, index) => (
                        <div 
                          key={transaction.txnId}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {transaction.txnType === 'DEPOSIT' ? (
                              <ArrowUpRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-red-500" />
                            )}
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
                            <p className={`font-semibold ${
                              transaction.txnType === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.txnType === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              잔액: {formatCurrency(transaction.balanceAfter)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default AccountDetailCard;
