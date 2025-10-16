import { useState, useEffect, useCallback } from 'react';
import { accountService } from '@/services';

/**
 * 계좌 조회 커스텀 훅
 * 사용자의 계좌 정보를 조회하고 관리하는 기능을 제공합니다.
 */
export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  /**
   * 계좌 데이터 새로고침
   */
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 로그인 상태 먼저 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🔇 [useAccounts] 토큰 없음 - API 호출 중단');
        setIsLoading(false);
        return;
      }

      console.log('🔄 계좌 데이터 새로고침 시작');
      const result = await accountService.getMyAccounts();
      
      if (result.success) {
        setAccounts(result.data);
        setLastFetchTime(new Date());
        console.log('✅ 계좌 데이터 새로고침 성공:', result.data);
      } else {
        setError(result.message);
        console.error('❌ 계좌 데이터 조회 실패:', result.message);
      }
    } catch (err) {
      const errorMessage = err.message || '계좌 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('❌ 계좌 데이터 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 초기 로딩 시 계좌 데이터 가져오기
   */
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  /**
   * 계좌 타입별 필터링
   */
  const getAccountsByType = useCallback((accountType) => {
    return accountService.filterAccountsByType(accounts, accountType);
  }, [accounts]);

  /**
   * 계좌 잔액 합계 계산
   */
  const getAccountBalances = useCallback(() => {
    return accountService.calculateAccountBalances(accounts);
  }, [accounts]);

  /**
   * 계좌 상태별 분류
   */
  const getAccountsByStatus = useCallback(() => {
    return accountService.categorizeAccountsByStatus(accounts);
  }, [accounts]);

  /**
   * 계좌 정보 포맷팅
   */
  const getFormattedAccounts = useCallback(() => {
    return accounts.map(account => accountService.formatAccountInfo(account));
  }, [accounts]);

  /**
   * 계좌 통계 정보
   */
  const getAccountStats = useCallback(() => {
    const balances = getAccountBalances();
    const statusGroups = getAccountsByStatus();
    
    return {
      totalAccounts: accounts.length,
      activeAccounts: statusGroups.active.length,
      totalBalance: balances.total,
      balances,
      statusGroups
    };
  }, [accounts, getAccountBalances, getAccountsByStatus]);

  /**
   * 특정 계좌 찾기
   */
  const findAccountById = useCallback((accountId) => {
    return accounts.find(account => account.accountId === accountId);
  }, [accounts]);

  /**
   * 계좌 검색
   */
  const searchAccounts = useCallback((searchTerm) => {
    if (!searchTerm) return accounts;
    
    const term = searchTerm.toLowerCase();
    return accounts.filter(account => 
      account.accountNum.toLowerCase().includes(term) ||
      account.accountTypeDescription.toLowerCase().includes(term) ||
      account.productId.toLowerCase().includes(term)
    );
  }, [accounts]);

  /**
   * 계좌 정렬
   */
  const sortAccounts = useCallback((sortBy = 'balance', order = 'desc') => {
    const sortedAccounts = [...accounts].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'accountType':
          aValue = a.accountType;
          bValue = b.accountType;
          break;
        default:
          aValue = a.balance || 0;
          bValue = b.balance || 0;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sortedAccounts;
  }, [accounts]);

  /**
   * 계좌 타입별 요약 정보
   */
  const getAccountTypeSummary = useCallback(() => {
    const typeSummary = {};
    
    accounts.forEach(account => {
      const type = account.accountType;
      if (!typeSummary[type]) {
        typeSummary[type] = {
          count: 0,
          totalBalance: 0,
          accounts: []
        };
      }
      
      typeSummary[type].count += 1;
      typeSummary[type].totalBalance += account.balance || 0;
      typeSummary[type].accounts.push(account);
    });
    
    return typeSummary;
  }, [accounts]);

  /**
   * 최근 생성된 계좌
   */
  const getRecentAccounts = useCallback((limit = 5) => {
    return sortAccounts('createdAt', 'desc').slice(0, limit);
  }, [sortAccounts]);

  /**
   * 잔액이 높은 계좌
   */
  const getTopBalanceAccounts = useCallback((limit = 5) => {
    return sortAccounts('balance', 'desc').slice(0, limit);
  }, [sortAccounts]);

  return {
    // 상태
    accounts,
    isLoading,
    error,
    lastFetchTime,
    
    // 액션
    fetchAccounts,
    
    // 계산된 값들
    getAccountsByType,
    getAccountBalances,
    getAccountsByStatus,
    getFormattedAccounts,
    getAccountStats,
    findAccountById,
    searchAccounts,
    sortAccounts,
    getAccountTypeSummary,
    getRecentAccounts,
    getTopBalanceAccounts,
    
    // 유틸리티 함수들
    formatCurrency: accountService.formatCurrency,
    formatAccountNumber: accountService.formatAccountNumber,
    formatDate: accountService.formatDate,
    getAccountTypeIcon: accountService.getAccountTypeIcon,
    getAccountTypeColor: accountService.getAccountTypeColor
  };
};

export default useAccounts;
