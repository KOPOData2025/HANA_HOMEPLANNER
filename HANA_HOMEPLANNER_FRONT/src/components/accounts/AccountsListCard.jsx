import React, { useState } from 'react';
import { 
  CreditCard, 
  PiggyBank, 
  TrendingDown, 
  Wallet,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { claimMaturityAmount } from '@/services/savingsAccountService';

/**
 * 계좌 목록 카드 컴포넌트
 * 계좌 목록을 표시합니다.
 */
const AccountsListCard = ({ 
  accounts, 
  isLoading, 
  formatCurrency,
  formatAccountNumber,
  formatDate,
  getAccountTypeIcon,
  getAccountTypeColor,
  onAccountClick
}) => {
  const [showDetails, setShowDetails] = useState({});
  const [showMaturityModal, setShowMaturityModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  // 적금/공동적금 계좌의 만기 상태 확인
  const isSavingsMatured = (account) => {
    return (account.accountType === 'SAVING' || account.accountType === 'JOINT_SAVING') && 
           account.status === 'MATURITY';
  };

  // 만기금 수령받기 모달 열기
  const handleOpenMaturityModal = (account) => {
    setSelectedAccount(account);
    setTargetAccountNumber('');
    setShowMaturityModal(true);
  };

  // 만기금 수령받기 모달 닫기
  const handleCloseMaturityModal = () => {
    setShowMaturityModal(false);
    setSelectedAccount(null);
    setTargetAccountNumber('');
    setIsClaiming(false);
  };

  // 만기금 수령받기 처리
  const handleClaimMaturity = async () => {
    if (!selectedAccount || !targetAccountNumber) {
      alert('이체받을 계좌를 선택해주세요.');
      return;
    }

    setIsClaiming(true);
    try {
      const result = await claimMaturityAmount(selectedAccount.accountId, targetAccountNumber);
      
      if (result.success) {
        alert(`만기금이 성공적으로 수령되었습니다.\n\n원금: ${result.data.principalAmount.toLocaleString()}원\n이자: ${result.data.interestAmount.toLocaleString()}원\n총 수령액: ${result.data.totalPayoutAmount.toLocaleString()}원`);
        handleCloseMaturityModal();
        // 계좌 목록 새로고침을 위해 부모 컴포넌트에 알림
        if (onAccountClick) {
          onAccountClick(selectedAccount.accountId);
        }
      } else {
        alert(result.message || '만기금 수령에 실패했습니다.');
      }
    } catch (error) {
      console.error('만기금 수령 오류:', error);
      alert('만기금 수령 중 오류가 발생했습니다.');
    } finally {
      setIsClaiming(false);
    }
  };

  // 계좌 상태 아이콘
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'INACTIVE':
        return { icon: XCircle, color: 'text-red-600' };
      case 'SUSPENDED':
        return { icon: Clock, color: 'text-yellow-600' };
      case 'MATURITY':
        return { icon: Gift, color: 'text-purple-600' };
      default:
        return { icon: Clock, color: 'text-gray-600' };
    }
  };

  // 계좌 타입 아이콘
  const getAccountIcon = (accountType) => {
    switch (accountType) {
      case 'DEMAND':
        return CreditCard;
      case 'SAVING':
        return PiggyBank;
      case 'LOAN':
        return TrendingDown;
      default:
        return Wallet;
    }
  };

  // 상세 정보 토글
  const toggleDetails = (accountId) => {
    setShowDetails(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">계좌 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            
            <div>
              <h3 className="text-lg font-bold text-gray-800">계좌 목록</h3>
              <p className="text-sm text-gray-500">총 {accounts.length}개의 계좌</p>
            </div>
          </div>
        </div>

      </div>

      {/* 계좌 목록 */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="p-6">
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">계좌가 없습니다</h3>
                <p className="text-gray-600">
                  등록된 계좌가 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => {
                  const AccountIcon = getAccountIcon(account.accountType);
                  const statusInfo = getStatusIcon(account.status);
                  const StatusIcon = statusInfo.icon;
                  const isExpanded = showDetails[account.accountId];

                  return (
                    <div
                      key={account.accountId}
                      className="border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() =>
                        onAccountClick && onAccountClick(account.accountId)
                      }
                    >
                      {/* 계좌 기본 정보 */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-800">
                                  {account.accountTypeDescription}
                                </h4>
                                <StatusIcon
                                  className={`w-4 h-4 ${statusInfo.color}`}
                                />
                              </div>
                              <p className="text-sm text-gray-500">
                                계좌번호 :
                                {formatAccountNumber(account.accountNum)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                account.balance >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(account.balance)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {account.statusDescription}
                            </p>
                          </div>
                        </div>

                        {/* 만기 상태 표시 및 만기금 수령받기 버튼 */}
                        {isSavingsMatured(account) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Gift className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-700">만기 완료</span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                  만기금 수령 가능
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMaturityModal(account);
                                }}
                                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                              >
                                <Gift className="w-3 h-3" />
                                <span>만기금 수령받기</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 상세 정보 토글 버튼 */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>상세 정보 보기</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 만기금 수령받기 모달 */}
      {showMaturityModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">만기금 수령받기</h3>
                  <p className="text-sm text-gray-500">만기금을 다른 계좌로 이체받으세요</p>
                </div>
              </div>
              <button
                onClick={handleCloseMaturityModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* 선택된 적금 계좌 정보 */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">
                    {selectedAccount.accountTypeDescription}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatAccountNumber(selectedAccount.accountNum)}
                  </div>
                  <div className="text-sm font-semibold text-purple-700">
                    만기금: {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>
              </div>
            </div>

            {/* 이체받을 계좌 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이체받을 계좌 선택 *
              </label>
              <select
                value={targetAccountNumber}
                onChange={(e) => setTargetAccountNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">계좌를 선택하세요</option>
                {accounts
                  .filter(account => 
                    account.accountType === 'DEMAND' && 
                    account.accountId !== selectedAccount.accountId
                  )
                  .map(account => (
                    <option key={account.accountId} value={account.accountNum}>
                      {account.accountTypeDescription} - {formatAccountNumber(account.accountNum)} ({formatCurrency(account.balance)})
                    </option>
                  ))}
              </select>
              
              {/* 선택된 계좌 미리보기 */}
              {targetAccountNumber && (
                <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {(() => {
                    const selectedDemandAccount = accounts.find(acc => 
                      acc.accountType === 'DEMAND' && acc.accountNum === targetAccountNumber
                    );
                    if (!selectedDemandAccount) return null;
                    
                    return (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {selectedDemandAccount.accountTypeDescription}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatAccountNumber(selectedDemandAccount.accountNum)}
                          </div>
                          <div className="text-sm font-semibold text-blue-700">
                            현재 잔액: {formatCurrency(selectedDemandAccount.balance)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 p-3 rounded-lg mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">만기금 수령 안내</p>
                  <ul className="space-y-1">
                    <li>• 만기금(원금 + 이자)이 선택한 입출금 계좌로 즉시 이체됩니다</li>
                    <li>• 이체 후 적금 계좌는 자동으로 해지됩니다</li>
                    <li>• 이체 수수료는 없습니다</li>
                    <li>• 이체 완료 후 거래 내역에서 확인할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseMaturityModal}
                disabled={isClaiming}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleClaimMaturity}
                disabled={isClaiming || !targetAccountNumber}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isClaiming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>처리 중...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>만기금 수령받기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsListCard;
