import { useState, useCallback } from 'react';
import { accountService } from '@/services/accountService';
import useErrorNotification from './useErrorNotification';

/**
 * 대출 계좌 상세 정보 훅
 * 대출 계좌의 상환 일정과 거래 내역을 관리합니다.
 */
export const useLoanAccountDetail = () => {
  const [loanAccountDetail, setLoanAccountDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useErrorNotification();

  /**
   * 대출 계좌 상세 정보 조회
   * @param {string} accountId - 대출 계좌 ID
   */
  const fetchLoanAccountDetail = useCallback(async (accountId) => {
    if (!accountId) {
      setError('계좌 ID가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await accountService.getLoanAccountDetail(accountId);
      
      if (response.success) {
        setLoanAccountDetail(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message);
      showError('대출 계좌 상세 정보 조회 실패', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  /**
   * 대출 계좌 상세 정보 초기화
   */
  const clearLoanAccountDetail = useCallback(() => {
    setLoanAccountDetail(null);
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * 상환 일정 요약 정보 계산
   */
  const getRepaymentSummary = useCallback(() => {
    if (!loanAccountDetail?.repaymentSchedules) return null;

    const schedules = loanAccountDetail.repaymentSchedules;
    const totalSchedules = schedules.length;
    const paidSchedules = schedules.filter(s => s.status === 'PAID').length;
    const pendingSchedules = schedules.filter(s => s.status === 'PENDING').length;
    
    const totalPrincipal = schedules.reduce((sum, s) => sum + (s.principalDue || 0), 0);
    const totalInterest = schedules.reduce((sum, s) => sum + (s.interestDue || 0), 0);
    const totalAmount = schedules.reduce((sum, s) => sum + (s.totalDue || 0), 0);
    
    const paidPrincipal = schedules.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.principalDue || 0), 0);
    const paidInterest = schedules.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.interestDue || 0), 0);
    const paidAmount = schedules.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.totalDue || 0), 0);
    
    const remainingPrincipal = totalPrincipal - paidPrincipal;
    const remainingInterest = totalInterest - paidInterest;
    const remainingAmount = totalAmount - paidAmount;
    
    const progress = totalSchedules > 0 ? (paidSchedules / totalSchedules) * 100 : 0;

    return {
      totalSchedules,
      paidSchedules,
      pendingSchedules,
      totalPrincipal,
      totalInterest,
      totalAmount,
      paidPrincipal,
      paidInterest,
      paidAmount,
      remainingPrincipal,
      remainingInterest,
      remainingAmount,
      progress: progress.toFixed(1)
    };
  }, [loanAccountDetail]);

  /**
   * 거래 내역 요약 정보 계산
   */
  const getTransactionSummary = useCallback(() => {
    if (!loanAccountDetail?.transactionHistories) return null;

    const transactions = loanAccountDetail.transactionHistories;
    const totalTransactions = transactions.length;
    const withdrawals = transactions.filter(t => t.txnType === 'WITHDRAWAL');
    const deposits = transactions.filter(t => t.txnType === 'DEPOSIT');
    
    const totalWithdrawalAmount = withdrawals.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const totalDepositAmount = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const netAmount = totalDepositAmount - totalWithdrawalAmount;

    return {
      totalTransactions,
      withdrawalCount: withdrawals.length,
      depositCount: deposits.length,
      totalWithdrawalAmount,
      totalDepositAmount,
      netAmount
    };
  }, [loanAccountDetail]);

  /**
   * 다음 상환 일정 조회
   */
  const getNextRepayment = useCallback(() => {
    if (!loanAccountDetail?.repaymentSchedules) return null;

    const pendingSchedules = loanAccountDetail.repaymentSchedules
      .filter(s => s.status === 'PENDING')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return pendingSchedules.length > 0 ? pendingSchedules[0] : null;
  }, [loanAccountDetail]);

  /**
   * 상환 일정 필터링
   */
  const getFilteredRepaymentSchedules = useCallback((status = 'ALL') => {
    if (!loanAccountDetail?.repaymentSchedules) return [];

    if (status === 'ALL') {
      return loanAccountDetail.repaymentSchedules;
    }

    return loanAccountDetail.repaymentSchedules.filter(schedule => schedule.status === status);
  }, [loanAccountDetail]);

  /**
   * 거래 내역 필터링
   */
  const getFilteredTransactionHistories = useCallback((type = 'ALL') => {
    if (!loanAccountDetail?.transactionHistories) return [];

    if (type === 'ALL') {
      return loanAccountDetail.transactionHistories;
    }

    return loanAccountDetail.transactionHistories.filter(transaction => transaction.txnType === type);
  }, [loanAccountDetail]);

  return {
    loanAccountDetail,
    isLoading,
    error,
    fetchLoanAccountDetail,
    clearLoanAccountDetail,
    getRepaymentSummary,
    getTransactionSummary,
    getNextRepayment,
    getFilteredRepaymentSchedules,
    getFilteredTransactionHistories,
  };
};
