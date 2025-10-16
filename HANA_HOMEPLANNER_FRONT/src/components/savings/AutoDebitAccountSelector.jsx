import React, { useState, useEffect } from 'react';
import { CreditCard, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

/**
 * 자동이체 계좌 선택 컴포넌트 (입출금 계좌용)
 * 관심사 분리: 계좌 선택 UI 로직만 담당
 * 재사용성: 다른 곳에서도 계좌 선택이 필요할 때 재사용 가능
 */
const AutoDebitAccountSelector = ({ 
  accounts = [], 
  selectedAccountNum, 
  onAccountSelect, 
  isLoading = false,
  error = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 계좌 선택 핸들러
  const handleAccountSelect = (accountNum) => {
    console.log('🏦 계좌 선택:', {
      selectedAccountNum: accountNum,
      accountType: typeof accountNum,
      isNull: accountNum === null,
      isUndefined: accountNum === undefined
    });
    
    onAccountSelect(accountNum);
    setIsOpen(false);
  };

  // 선택된 계좌 정보
  const selectedAccount = accounts.find(account => account.number === selectedAccountNum);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {selectedAccountNum ? '입금 계좌' : '입금 계좌 (선택사항)'}
      </label>
      
      {/* 드롭다운 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-left flex items-center justify-between ${
          isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
      >
        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <div>
            {selectedAccount ? (
              <div>
                <p className="font-medium text-gray-800">{selectedAccount.name}</p>
                <p className="text-sm text-gray-500">{selectedAccount.number}</p>
                {selectedAccount.balance && (
                  <p className="text-xs text-gray-400">잔액: {selectedAccount.balance}</p>
                )}
              </div>
              ) : (
                <p className="text-gray-500">입금 계좌를 선택해주세요</p>
              )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
        ) : (
          isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 드롭다운 메뉴 */}
      {isOpen && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {/* 자동이체 없음 옵션 */}
          <button
            type="button"
            onClick={() => handleAccountSelect(null)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
              selectedAccountNum === null ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">입금 계좌 없음</p>
              <p className="text-sm text-gray-500">직접 입력</p>
            </div>
          </button>

          {/* 계좌 목록 */}
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => handleAccountSelect(account.number)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-t border-gray-100 ${
                  selectedAccountNum === account.number ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.number}</p>
                  {account.balance && (
                    <p className="text-xs text-gray-400">잔액: {account.balance}</p>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              <p className="text-sm">등록된 계좌가 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AutoDebitAccountSelector;
