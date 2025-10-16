import { useState, useEffect, useCallback } from 'react';
import { getLoanProducts } from '@/services/savingsProductService';
import toast from 'react-hot-toast';
import { shouldShowErrorToUser, getUserFriendlyErrorMessage, logError } from '@/utils/errorHandler';

/**
 * 대출 상품 목록을 관리하는 커스텀 훅
 */
export const useLoanProducts = () => {
  const [loanProducts, setLoanProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 대출 상품 목록 조회
  const fetchLoanProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getLoanProducts();
      
      if (response.success) {
        setLoanProducts(response.data || []);
        console.log('✅ 대출 상품 목록 조회 성공:', response.data?.length, '개');
      } else {
        throw new Error(response.message || '대출 상품 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      logError('대출 상품 목록 조회', err);
      setError(err.message);
      
      // 사용자에게 표시해야 하는 에러인지 확인
      if (shouldShowErrorToUser(err)) {
        const friendlyMessage = getUserFriendlyErrorMessage(err, '대출 상품 목록을 불러오는데 실패했습니다');
        toast.error(friendlyMessage, {
          duration: 4000,
          position: 'top-center'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 대출 상품 목록 조회
  useEffect(() => {
    fetchLoanProducts();
  }, [fetchLoanProducts]);

  // 대출 상품 목록 새로고침
  const refreshLoanProducts = useCallback(() => {
    fetchLoanProducts();
  }, [fetchLoanProducts]);

  // 상품 타입별 아이콘 반환
  const getProductIcon = useCallback((productName, productType) => {
    // 공동 대출 상품인 경우
    if (productType === 'JOINT_LOAN') {
      return '👥';
    }
    
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
  }, []);

  // 상품 타입별 색상 반환
  const getProductColor = useCallback((productName, productType) => {
    // 공동 대출 상품인 경우
    if (productType === 'JOINT_LOAN') {
      return 'orange';
    }
    
    if (productName.includes('신생아') || productName.includes('특례')) {
      return 'pink';
    } else if (productName.includes('신혼부부')) {
      return 'red';
    } else if (productName.includes('다자녀')) {
      return 'orange';
    } else if (productName.includes('생애최초')) {
      return 'green';
    } else if (productName.includes('디딤돌')) {
      return 'blue';
    } else if (productName.includes('보금자리')) {
      return 'teal';
    } else if (productName.includes('원큐') || productName.includes('아파트')) {
      return 'purple';
    } else {
      return 'gray';
    }
  }, []);

  // 상품 설명 생성
  const getProductDescription = useCallback((product) => {
    const { productName, productType } = product;
    
    // 공동 대출 상품인 경우
    if (productType === 'JOINT_LOAN') {
      return '부부 공동명의로 신청하는 대출 상품';
    }
    
    if (productName.includes('신생아 특례')) {
      return '신생아가 있는 가정을 위한 특별 우대 대출';
    } else if (productName.includes('신혼부부')) {
      return '신혼부부 전용 정책 대출 상품';
    } else if (productName.includes('다자녀가구')) {
      return '다자녀 가구를 위한 우대 대출';
    } else if (productName.includes('생애최초')) {
      return '생애 첫 주택 구입자를 위한 대출';
    } else if (productName.includes('일반 내집마련')) {
      return '일반 가정을 위한 내집마련 대출';
    } else if (productName.includes('보금자리')) {
      return '안정적인 내집마련을 위한 대출';
    } else if (productName.includes('하나원큐 아파트론')) {
      return '아파트 구입 전용 대출 상품';
    } else {
      return '하나은행의 믿을 수 있는 대출 상품';
    }
  }, []);

  // 상품별 특징 태그 생성
  const getProductTags = useCallback((productName, productType) => {
    const tags = [];
    
    // 공동 대출 상품인 경우
    if (productType === 'JOINT_LOAN') {
      tags.push({ text: '공동 대출', color: 'orange' });
    }
    
    if (productName.includes('신생아') || productName.includes('특례')) {
      tags.push({ text: '신생아 특례', color: 'pink' });
    }
    if (productName.includes('신혼부부')) {
      tags.push({ text: '신혼부부 전용', color: 'red' });
    }
    if (productName.includes('다자녀')) {
      tags.push({ text: '다자녀 우대', color: 'orange' });
    }
    if (productName.includes('생애최초')) {
      tags.push({ text: '생애최초', color: 'green' });
    }
    if (productName.includes('디딤돌')) {
      tags.push({ text: '정책대출', color: 'blue' });
    }
    if (productName.includes('보금자리')) {
      tags.push({ text: '안정형', color: 'teal' });
    }
    if (productName.includes('원큐')) {
      tags.push({ text: '원스톱', color: 'purple' });
    }
    
    // 기본 태그
    tags.push({ text: '하나은행', color: 'teal' });
    
    return tags;
  }, []);

  return {
    loanProducts,
    isLoading,
    error,
    refreshLoanProducts,
    getProductIcon,
    getProductColor,
    getProductDescription,
    getProductTags
  };
};

export default useLoanProducts;
