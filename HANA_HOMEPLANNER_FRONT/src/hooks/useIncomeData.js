import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incomeService } from '../services/incomeService';
import useErrorNotification from './useErrorNotification';

/**
 * 연소득 데이터 조회 커스텀 훅
 */
export const useIncomeData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [incomeData, setIncomeData] = useState(null);
  const { showError } = useErrorNotification();
  const navigate = useNavigate();

  /**
   * 내 연소득 정보 조회
   */
  const fetchMyIncome = async () => {
    setIsLoading(true);
    try {
      const response = await incomeService.getMyIncome(navigate);
      if (response.success) {
        setIncomeData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || '연소득 조회에 실패했습니다.');
      }
    } catch (error) {
      // 인증 에러는 authInterceptor에서 이미 처리됨
      // 다른 에러만 사용자에게 표시
      const errorMessage = error.response?.data?.message || error.message || '연소득 조회 중 오류가 발생했습니다.';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 사용자 ID로 연소득 정보 조회
   * @param {string} userId - 사용자 ID
   */
  const fetchIncomeByUserId = async (userId) => {
    setIsLoading(true);
    try {
      const response = await incomeService.getIncomeByUserId(userId, navigate);
      if (response.success) {
        setIncomeData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || '연소득 조회에 실패했습니다.');
      }
    } catch (error) {
      // 인증 에러는 authInterceptor에서 이미 처리됨
      // 다른 에러만 사용자에게 표시
      const errorMessage = error.response?.data?.message || error.message || '연소득 조회 중 오류가 발생했습니다.';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 연소득 데이터 초기화
   */
  const clearIncomeData = () => {
    setIncomeData(null);
  };

  return {
    isLoading,
    incomeData,
    fetchMyIncome,
    fetchIncomeByUserId,
    clearIncomeData
  };
};
