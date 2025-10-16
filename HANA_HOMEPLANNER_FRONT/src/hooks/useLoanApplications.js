/**
 * 대출 신청 목록 관리 커스텀 훅
 * 데이터 로직과 UI 로직을 분리하여 재사용성 향상
 */

import { useState, useEffect, useCallback } from 'react';
import { loanApplicationService } from '@/services/loanApplicationService';
import useErrorNotification from './useErrorNotification';

export const useLoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useErrorNotification();

  /**
   * 대출 신청 목록 조회
   */
  const fetchLoanApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 로그인 상태 먼저 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🔇 [useLoanApplications] 토큰 없음 - API 호출 중단');
        setIsLoading(false);
        return;
      }

      const response = await loanApplicationService.getMyLoanApplications();
      
      if (response.success) {
        setApplications(response.data);
      } else {
        setError(response.message);
        // showNotification('대출 신청 목록 조회 실패', response.message, 'error');
      }
    } catch (err) {
      const errorMessage = err.message || '대출 신청 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      // showNotification('대출 신청 목록 조회 실패', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 대출 신청 통계 계산
   */
  const getApplicationStats = useCallback(() => {
    return loanApplicationService.calculateApplicationStats(applications);
  }, [applications]);

  /**
   * 상태별 대출 신청 필터링
   */
  const getApplicationsByStatus = useCallback((status) => {
    return loanApplicationService.filterApplicationsByStatus(applications, status);
  }, [applications]);

  /**
   * 통화 포맷팅
   */
  const formatCurrency = useCallback((amount) => {
    return loanApplicationService.formatCurrency(amount);
  }, []);

  /**
   * 날짜 포맷팅
   */
  const formatDate = useCallback((dateString) => {
    return loanApplicationService.formatDate(dateString);
  }, []);

  /**
   * 대출 기간 포맷팅
   */
  const formatTerm = useCallback((term) => {
    return loanApplicationService.formatTerm(term);
  }, []);

  /**
   * 상태별 색상 반환
   */
  const getStatusBadgeColor = useCallback((status) => {
    return loanApplicationService.getStatusBadgeColor(status);
  }, []);

  /**
   * 상태별 아이콘 반환
   */
  const getStatusIcon = useCallback((status) => {
    return loanApplicationService.getStatusIcon(status);
  }, []);

  /**
   * 대출 신청 정보 포맷팅
   */
  const formatApplicationInfo = useCallback((application) => {
    return loanApplicationService.formatApplicationInfo(application);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchLoanApplications();
  }, [fetchLoanApplications]);

  return {
    applications,
    isLoading,
    error,
    fetchLoanApplications,
    getApplicationStats,
    getApplicationsByStatus,
    formatCurrency,
    formatDate,
    formatTerm,
    getStatusBadgeColor,
    getStatusIcon,
    formatApplicationInfo,
  };
};

export default useLoanApplications;
