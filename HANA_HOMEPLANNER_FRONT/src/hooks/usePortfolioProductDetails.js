import { useState, useCallback } from 'react';
import { getPortfolioProductDetails } from '@/services/financialProductService';

/**
 * 포트폴리오 플랜의 금융상품 상세정보를 관리하는 커스텀 훅
 * 관심사 분리: 데이터 로직과 UI 로직을 분리하여 재사용성과 테스트 용이성 향상
 */
export const usePortfolioProductDetails = () => {
  const [productDetails, setProductDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 포트폴리오 플랜의 금융상품 상세정보 조회
   * @param {string} savingsId - 적금 상품 ID
   * @param {string} loanId - 대출 상품 ID
   * @param {string} planId - 플랜 ID (캐시 키로 사용)
   * @returns {Promise<Object>} 금융상품 상세정보
   */
  const fetchProductDetails = useCallback(async (savingsId, loanId, planId) => {
    if (!savingsId && !loanId) {
      console.log('🔍 금융상품 ID가 없어서 조회를 건너뜁니다.');
      return null;
    }

    // 이미 로딩 중이면 기존 요청을 기다림
    if (isLoading) {
      console.log('🔍 이미 금융상품 상세정보를 조회 중입니다.');
      return productDetails[planId] || null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 포트폴리오 금융상품 상세정보 조회 시작:', { savingsId, loanId, planId });
      
      const details = await getPortfolioProductDetails(savingsId, loanId);
      
      // 플랜별로 캐시에 저장
      setProductDetails(prev => ({
        ...prev,
        [planId]: details
      }));

      console.log('✅ 포트폴리오 금융상품 상세정보 조회 성공:', details);
      return details;
    } catch (err) {
      console.error('❌ 포트폴리오 금융상품 상세정보 조회 실패:', err);
      setError(err.message || '금융상품 상세정보를 불러오는 중 오류가 발생했습니다.');
      
      // 에러 상태도 캐시에 저장
      setProductDetails(prev => ({
        ...prev,
        [planId]: { error: err.message }
      }));
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, productDetails]);

  /**
   * 특정 플랜의 금융상품 상세정보 조회 (캐시 우선)
   * @param {string} planId - 플랜 ID
   * @returns {Object|null} 금융상품 상세정보
   */
  const getProductDetails = useCallback((planId) => {
    return productDetails[planId] || null;
  }, [productDetails]);

  /**
   * 특정 플랜의 금융상품 상세정보가 로딩 중인지 확인
   * @param {string} planId - 플랜 ID
   * @returns {boolean} 로딩 상태
   */
  const isProductDetailsLoading = useCallback((planId) => {
    return isLoading && !productDetails[planId];
  }, [isLoading, productDetails]);

  /**
   * 특정 플랜의 금융상품 상세정보 에러 확인
   * @param {string} planId - 플랜 ID
   * @returns {string|null} 에러 메시지
   */
  const getProductDetailsError = useCallback((planId) => {
    const details = productDetails[planId];
    if (details && details.error) {
      return details.error;
    }
    return null;
  }, [productDetails]);

  /**
   * 캐시된 상세정보 초기화
   * @param {string} planId - 플랜 ID (선택사항, 없으면 전체 초기화)
   */
  const clearProductDetails = useCallback((planId = null) => {
    if (planId) {
      setProductDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[planId];
        return newDetails;
      });
    } else {
      setProductDetails({});
    }
  }, []);

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    productDetails,
    isLoading,
    error,

    // 액션
    fetchProductDetails,
    getProductDetails,
    isProductDetailsLoading,
    getProductDetailsError,
    clearProductDetails,
    clearError
  };
};
