import { useState, useEffect, useCallback } from 'react';
import { getProductDetail } from '@/services/savingsProductService';
import toast from 'react-hot-toast';
import { shouldShowErrorToUser, getUserFriendlyErrorMessage, logError } from '@/utils/errorHandler';

/**
 * 상품 상세 정보를 관리하는 커스텀 훅
 */
export const useProductDetail = (productId, productType = null) => {
  const [productDetail, setProductDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 상품 상세 정보 조회
  const fetchProductDetail = useCallback(async (id, type) => {
    if (!id) {
      setError('상품 ID가 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getProductDetail(id, type);
      
      if (response.success) {
        setProductDetail(response.data);
        console.log('✅ 상품 상세 정보 조회 성공:', response.data);
      } else {
        throw new Error(response.message || '상품 상세 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      logError('상품 상세 정보 조회', err);
      setError(err.message);
      
      // 사용자에게 표시해야 하는 에러인지 확인
      if (shouldShowErrorToUser(err)) {
        const friendlyMessage = getUserFriendlyErrorMessage(err, '상품 정보를 불러오는데 실패했습니다');
        toast.error(friendlyMessage, {
          duration: 4000,
          position: 'top-center'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // productId나 productType이 변경될 때마다 상품 정보 조회
  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId, productType);
    }
  }, [productId, productType, fetchProductDetail]);

  // 상품 정보 새로고침
  const refreshProductDetail = useCallback(() => {
    if (productId) {
      fetchProductDetail(productId, productType);
    }
  }, [productId, productType, fetchProductDetail]);

  // 상품 타입 확인
  const isLoanProduct = productDetail?.productType === 'LOAN' || productDetail?.productType === 'JOINT_LOAN';
  const isSavingsProduct = productDetail?.productType === 'SAVING' || productDetail?.productType === 'JOINT_SAVING';

  // 금리 정보 포맷팅
  const getInterestRateText = useCallback(() => {
    if (!productDetail) return '';
    
    if (isLoanProduct && productDetail.loanProduct) {
      const { minInterestRate, maxInterestRate, interestRateType } = productDetail.loanProduct;
      if (minInterestRate === maxInterestRate) {
        return `${interestRateType} ${minInterestRate}%`;
      }
      return `${interestRateType} ${minInterestRate}% ~ ${maxInterestRate}%`;
    }
    
    if (isSavingsProduct && productDetail.savingsProduct) {
      const { baseInterestRate, preferentialInterestRate } = productDetail.savingsProduct;
      if (preferentialInterestRate && preferentialInterestRate > baseInterestRate) {
        return `기본 ${baseInterestRate}% + 우대 최대 ${preferentialInterestRate}%`;
      }
      return `${baseInterestRate}%`;
    }
    
    return '';
  }, [productDetail, isLoanProduct, isSavingsProduct]);

  // 금액 범위 포맷팅
  const getAmountRangeText = useCallback(() => {
    if (!productDetail) return '';
    
    if (isLoanProduct && productDetail.loanProduct) {
      const { minLoanAmount, maxLoanAmount } = productDetail.loanProduct;
      if (minLoanAmount === 0 && !maxLoanAmount) {
        return '담보 가능액 범위 내';
      }
      if (minLoanAmount === 0) {
        return `~ ${(maxLoanAmount / 100000000).toLocaleString()}억원`;
      }
      if (!maxLoanAmount) {
        return `${(minLoanAmount / 10000).toLocaleString()}만원 이상`;
      }
      return `${(minLoanAmount / 10000).toLocaleString()}만원 ~ ${(maxLoanAmount / 100000000).toLocaleString()}억원`;
    }
    
    if (isSavingsProduct && productDetail.savingsProduct) {
      const { minDepositAmount, maxDepositAmount } = productDetail.savingsProduct;
      return `${minDepositAmount?.toLocaleString()}원 ~ ${maxDepositAmount?.toLocaleString()}원`;
    }
    
    return '';
  }, [productDetail, isLoanProduct, isSavingsProduct]);

  // 기간 정보 포맷팅
  const getPeriodText = useCallback(() => {
    if (!productDetail) return '';
    
    if (isLoanProduct && productDetail.loanProduct) {
      const { maxLoanPeriodMonths } = productDetail.loanProduct;
      const years = Math.floor(maxLoanPeriodMonths / 12);
      const months = maxLoanPeriodMonths % 12;
      
      if (months === 0) {
        return `최대 ${years}년`;
      }
      return `최대 ${years}년 ${months}개월`;
    }
    
    if (isSavingsProduct && productDetail.savingsProduct) {
      const { termMonths } = productDetail.savingsProduct;
      if (termMonths >= 12) {
        const years = Math.floor(termMonths / 12);
        const remainingMonths = termMonths % 12;
        if (remainingMonths === 0) {
          return `${years}년`;
        }
        return `${years}년 ${remainingMonths}개월`;
      }
      return `${termMonths}개월`;
    }
    
    return '';
  }, [productDetail, isLoanProduct, isSavingsProduct]);

  // 상품 아이콘 반환
  const getProductIcon = useCallback(() => {
    if (!productDetail) return '📄';
    
    if (isLoanProduct) {
      const productName = productDetail.productName;
      if (productName.includes('신생아') || productName.includes('특례')) {
        return '👶';
      } else if (productName.includes('신혼부부')) {
        return '💕';
      } else if (productName.includes('다자녀')) {
        return '👨‍👩‍👧‍👦';
      } else if (productName.includes('생애최초')) {
        return '🏠';
      } else if (productName.includes('디딤돌')) {
        return '🌉';
      } else if (productName.includes('보금자리')) {
        return '🏡';
      } else if (productName.includes('원큐') || productName.includes('아파트')) {
        return '🏢';
      } else {
        return '💰';
      }
    }
    
    if (isSavingsProduct) {
      const productName = productDetail.productName;
      if (productName.includes('청년도약')) {
        return '🌟';
      } else if (productName.includes('목표형')) {
        return '🎯';
      } else if (productName.includes('정기적금')) {
        return '📅';
      } else {
        return '🚀';
      }
    }
    
    return '📄';
  }, [productDetail, isLoanProduct, isSavingsProduct]);

  return {
    productDetail,
    isLoading,
    error,
    refreshProductDetail,
    isLoanProduct,
    isSavingsProduct,
    getInterestRateText,
    getAmountRangeText,
    getPeriodText,
    getProductIcon
  };
};

export default useProductDetail;
