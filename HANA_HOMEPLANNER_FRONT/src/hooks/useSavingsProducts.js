import { useState, useEffect, useCallback } from 'react';
import { getSavingsProducts } from '@/services/savingsProductService';
import { shouldShowErrorToUser, getUserFriendlyErrorMessage, logError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

/**
 * 적금 상품 목록을 관리하는 커스텀 훅
 */
export const useSavingsProducts = () => {
  const [savingsProducts, setSavingsProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 적금 상품 목록 조회
  const fetchSavingsProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getSavingsProducts();
      
      if (response.success) {
        setSavingsProducts(response.data || []);
        console.log('✅ 적금 상품 목록 조회 성공:', response.data?.length, '개');
      } else {
        throw new Error(response.message || '적금 상품 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      logError('적금 상품 목록 조회', err);
      setError(err.message);
      
      // 사용자에게 표시해야 하는 에러인지 확인
      if (shouldShowErrorToUser(err)) {
        const friendlyMessage = getUserFriendlyErrorMessage(err, '적금 상품 목록을 불러오는데 실패했습니다');
        toast.error(friendlyMessage, {
          duration: 4000,
          position: 'top-center'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 적금 상품 목록 조회
  useEffect(() => {
    fetchSavingsProducts();
  }, [fetchSavingsProducts]);

  // 적금 상품 목록 새로고침
  const refreshSavingsProducts = useCallback(() => {
    fetchSavingsProducts();
  }, [fetchSavingsProducts]);

  // 상품 타입별 아이콘 반환
  const getProductIcon = useCallback((productName, productType) => {
    // 공동 적금 상품인 경우
    if (productType === 'JOINT_SAVING') {
      return '👥';
    }
    
    if (productName.includes('청년')) {
      return '🌟';
    } else if (productName.includes('목표')) {
      return '🎯';
    } else if (productName.includes('정기')) {
      return '📅';
    } else if (productName.includes('오늘부터')) {
      return '🚀';
    } else {
      return '💰';
    }
  }, []);

  // 상품 타입별 색상 반환
  const getProductColor = useCallback((productName, productType) => {
    // 공동 적금 상품인 경우
    if (productType === 'JOINT_SAVING') {
      return 'orange';
    }
    
    if (productName.includes('청년')) {
      return 'blue';
    } else if (productName.includes('목표')) {
      return 'green';
    } else if (productName.includes('정기')) {
      return 'purple';
    } else if (productName.includes('오늘부터')) {
      return 'teal';
    } else {
      return 'gray';
    }
  }, []);

  // 상품 설명 생성
  const getProductDescription = useCallback((product) => {
    const { productName, productType } = product;
    
    // 공동 적금 상품인 경우
    if (productType === 'JOINT_SAVING') {
      return '커플이나 가족이 함께하는 공동 적금 상품';
    }
    
    if (productName.includes('청년도약계좌')) {
      return '청년층을 위한 특별 우대 적금 상품';
    } else if (productName.includes('목표형')) {
      return '개인 맞춤형 목표 설정 적금';
    } else if (productName.includes('정기적금 24개월')) {
      return '2년 만기 안정적인 정기적금';
    } else if (productName.includes('정기적금 36개월')) {
      return '3년 만기 장기 정기적금';
    } else if (productName.includes('오늘부터')) {
      return '언제든 시작할 수 있는 자유적금';
    } else {
      return '하나은행의 믿을 수 있는 적금 상품';
    }
  }, []);

  return {
    savingsProducts,
    isLoading,
    error,
    refreshSavingsProducts,
    getProductIcon,
    getProductColor,
    getProductDescription
  };
};

export default useSavingsProducts;
