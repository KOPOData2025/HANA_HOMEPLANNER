/**
 * 계좌 상세 정보 관리 커스텀 훅
 * 데이터 로직과 UI 로직을 분리하여 재사용성 향상
 */

import { useState, useCallback } from 'react';
import { accountService } from '@/services/accountService';
import useErrorNotification from './useErrorNotification';

export const useAccountDetail = () => {
  const [accountDetail, setAccountDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useErrorNotification();

  /**
   * 계좌 상세 정보 조회
   * @param {string} accountId - 계좌 ID
   */
  const fetchAccountDetail = useCallback(async (accountId) => {
    if (!accountId) {
      setError('계좌 ID가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await accountService.getAccountDetail(accountId);
      
      if (response.success) {
        setAccountDetail(response.data);
      } else {
        setError(response.message);
        showNotification('계좌 상세 정보 조회 실패', response.message, 'error');
      }
    } catch (err) {
      const errorMessage = err.message || '계좌 상세 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      showNotification('계좌 상세 정보 조회 실패', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  /**
   * 계좌 상세 정보 초기화
   */
  const clearAccountDetail = useCallback(() => {
    setAccountDetail(null);
    setError(null);
  }, []);

  /**
   * 납입 일정 요약 정보
   */
  const getPaymentSummary = useCallback(() => {
    if (!accountDetail?.paymentSchedules) return null;

    const schedules = accountDetail.paymentSchedules;
    const paidCount = schedules.filter(schedule => schedule.status === 'PAID').length;
    const pendingCount = schedules.filter(schedule => schedule.status === 'PENDING').length;
    const totalAmount = schedules.reduce((sum, schedule) => sum + schedule.amount, 0);
    const paidAmount = schedules
      .filter(schedule => schedule.status === 'PAID')
      .reduce((sum, schedule) => sum + schedule.amount, 0);

    return {
      totalCount: schedules.length,
      paidCount,
      pendingCount,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      progressPercentage: schedules.length > 0 ? (paidCount / schedules.length) * 100 : 0
    };
  }, [accountDetail]);

  /**
   * 거래 내역 요약 정보
   */
  const getTransactionSummary = useCallback(() => {
    if (!accountDetail?.transactionHistories) return null;

    const transactions = accountDetail.transactionHistories;
    const deposits = transactions.filter(txn => txn.txnType === 'DEPOSIT');
    const withdrawals = transactions.filter(txn => txn.txnType === 'WITHDRAWAL');
    
    const totalDeposits = deposits.reduce((sum, txn) => sum + txn.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, txn) => sum + txn.amount, 0);

    return {
      totalTransactions: transactions.length,
      depositCount: deposits.length,
      withdrawalCount: withdrawals.length,
      totalDeposits,
      totalWithdrawals,
      netAmount: totalDeposits - totalWithdrawals
    };
  }, [accountDetail]);

  /**
   * 적금 정보 요약
   */
  const getSavingsSummary = useCallback(() => {
    if (!accountDetail?.userSavings) return null;

    const savings = accountDetail.userSavings;
    const startDate = new Date(savings.startDate);
    const endDate = new Date(savings.endDate);
    const today = new Date();
    
    const totalMonths = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    const elapsedMonths = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30));
    const remainingMonths = Math.max(0, totalMonths - elapsedMonths);

    return {
      monthlyAmount: savings.monthlyAmount,
      totalMonths,
      elapsedMonths,
      remainingMonths,
      totalTargetAmount: savings.monthlyAmount * totalMonths,
      isActive: savings.status === 'ACTIVE',
      autoDebitAccount: savings.autoDebitAccountId
    };
  }, [accountDetail]);

  /**
   * 날짜 포맷팅
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  }, []);

  /**
   * 통화 포맷팅
   */
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  /**
   * 계좌번호 포맷팅
   */
  const formatAccountNumber = useCallback((accountNum) => {
    if (!accountNum) return '';
    
    // 계좌번호가 13자리인 경우 (예: 0018170903960)
    if (accountNum.length === 13) {
      return `${accountNum.slice(0, 3)}-${accountNum.slice(3, 6)}-${accountNum.slice(6, 9)}-${accountNum.slice(9)}`;
    }
    
    // 이미 하이픈이 포함된 경우 (예: 110-123-111211)
    if (accountNum.includes('-')) {
      return accountNum;
    }
    
    // 기타 경우는 그대로 반환
    return accountNum;
  }, []);

  return {
    accountDetail,
    isLoading,
    error,
    fetchAccountDetail,
    clearAccountDetail,
    getPaymentSummary,
    getTransactionSummary,
    getSavingsSummary,
    formatDate,
    formatCurrency,
    formatAccountNumber,
  };
};

export default useAccountDetail;
