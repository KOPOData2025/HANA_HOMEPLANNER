import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetsService } from '../services/assetsService';
import useErrorNotification from './useErrorNotification';

/**
 * 자산 데이터 조회 커스텀 훅
 */
export const useAssetsData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [assetsData, setAssetsData] = useState(null);
  const { showError } = useErrorNotification();
  const navigate = useNavigate();

  /**
   * 내 총 자산 정보 조회
   */
  const fetchMyTotalAssets = async () => {
    setIsLoading(true);
    try {
      const response = await assetsService.getMyTotalAssets(navigate);
      if (response.success) {
        setAssetsData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || '총 자산 조회에 실패했습니다.');
      }
    } catch (error) {
      // 인증 에러는 authInterceptor에서 이미 처리됨
      // 다른 에러만 사용자에게 표시
      const errorMessage = error.response?.data?.message || error.message || '총 자산 조회 중 오류가 발생했습니다.';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 사용자 ID로 총 자산 정보 조회
   * @param {string} userId - 사용자 ID
   */
  const fetchTotalAssetsByUserId = async (userId) => {
    setIsLoading(true);
    try {
      const response = await assetsService.getTotalAssetsByUserId(userId, navigate);
      if (response.success) {
        setAssetsData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || '총 자산 조회에 실패했습니다.');
      }
    } catch (error) {
      // 인증 에러는 authInterceptor에서 이미 처리됨
      // 다른 에러만 사용자에게 표시
      const errorMessage = error.response?.data?.message || error.message || '총 자산 조회 중 오류가 발생했습니다.';
      showError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 자산 데이터 초기화
   */
  const clearAssetsData = () => {
    setAssetsData(null);
  };

  return {
    isLoading,
    assetsData,
    fetchMyTotalAssets,
    fetchTotalAssetsByUserId,
    clearAssetsData
  };
};
