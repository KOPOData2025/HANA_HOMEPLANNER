import { useState, useEffect, useCallback } from 'react';
import { getMyCapitalPlanSelections, deleteCapitalPlanSelection } from '@/services/portfolioService';
import toast from 'react-hot-toast';
import { shouldShowErrorToUser, getUserFriendlyErrorMessage, logError } from '@/utils/errorHandler';

/**
 * 사용자의 포트폴리오 플랜 선택 목록을 관리하는 커스텀 훅
 */
export const useCapitalPlanSelections = () => {
  const [planSelections, setPlanSelections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 플랜 목록 조회
  const fetchPlanSelections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 로그인 상태 먼저 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🔇 [useCapitalPlanSelections] 토큰 없음 - API 호출 중단');
        setIsLoading(false);
        return;
      }
      
      const response = await getMyCapitalPlanSelections();
      
      if (response.success) {
        setPlanSelections(response.data || []);
      } else {
        throw new Error(response.message || '플랜 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      logError('플랜 목록 조회', err);
      setError(err.message);
      
      // 사용자에게 표시해야 하는 에러인지 확인
      if (shouldShowErrorToUser(err)) {
        const friendlyMessage = getUserFriendlyErrorMessage(err, '플랜 목록을 불러오는데 실패했습니다');
        toast.error(friendlyMessage, {
          duration: 4000,
          position: 'top-center'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 플랜 목록 조회
  useEffect(() => {
    fetchPlanSelections();
  }, [fetchPlanSelections]);

  // 플랜 목록 새로고침
  const refreshPlanSelections = useCallback(() => {
    fetchPlanSelections();
  }, [fetchPlanSelections]);

  // 플랜 삭제
  const deletePlanSelection = useCallback(async (selectionId, planName) => {
    try {
      console.log('🔍 훅 - 플랜 삭제 시작:', { selectionId, planName });
      setError(null);
      
      const response = await deleteCapitalPlanSelection(selectionId);
      console.log('🔍 훅 - API 응답 받음:', response);
      
      // API 응답이 { success: true, message: "...", data: null } 형태인지 확인
      if (response && response.success === true) {
        console.log('✅ 훅 - 삭제 성공, 로컬 상태 업데이트');
        
        // 로컬 상태에서 삭제된 플랜 제거
        setPlanSelections(prev => {
          const updated = prev.filter(plan => plan.selectionId !== selectionId);
          console.log('🔍 훅 - 업데이트된 플랜 목록:', updated);
          return updated;
        });
        
        toast.success(`"${planName}" 플랜이 성공적으로 삭제되었습니다! 🗑️`, {
          duration: 3000,
          position: 'top-center'
        });
        
        return { success: true };
      } else {
        console.error('❌ 훅 - API 응답 success가 false:', response);
        throw new Error(response?.message || '플랜 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 훅 - 플랜 삭제 오류:', err);
      setError(err.message);
      toast.error(`플랜 삭제 중 오류가 발생했습니다: ${err.message}`, {
        duration: 4000,
        position: 'top-center'
      });
      return { success: false, error: err.message };
    }
  }, []);

  // 플랜 타입별 색상 반환
  const getPlanTypeColor = useCallback((planType) => {
    switch (planType) {
      case '보수형':
        return 'blue';
      case '균형형':
        return 'green';
      case '공격형':
        return 'red';
      default:
        return 'gray';
    }
  }, []);

  // 플랜 타입별 아이콘 반환
  const getPlanTypeIcon = useCallback((planType) => {
    switch (planType) {
      case '보수형':
        return '🛡️';
      case '균형형':
        return '⚖️';
      case '공격형':
        return '🚀';
      default:
        return '📊';
    }
  }, []);

  // 상태별 색상 반환
  const getComparisonStatusColor = useCallback((status) => {
    switch (status) {
      case 'SUFFICIENT':
        return 'green';
      case 'INSUFFICIENT':
        return 'red';
      case 'OPTIMAL':
        return 'blue';
      default:
        return 'gray';
    }
  }, []);

  // 상태별 텍스트 반환
  const getComparisonStatusText = useCallback((status) => {
    switch (status) {
      case 'SUFFICIENT':
        return '충분';
      case 'INSUFFICIENT':
        return '부족';
      case 'OPTIMAL':
        return '최적';
      default:
        return '알 수 없음';
    }
  }, []);

  // 숫자 포맷팅 (천 단위 구분)
  const formatNumber = useCallback((number) => {
    if (!number) return '0';
    return new Intl.NumberFormat('ko-KR').format(number);
  }, []);

  // 금액 포맷팅 (억/만원 단위)
  const formatCurrency = useCallback((amount) => {
    if (!amount) return '0원';
    
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    
    if (eok > 0 && man > 0) {
      return `${eok}억 ${man}만원`;
    } else if (eok > 0) {
      return `${eok}억원`;
    } else if (man > 0) {
      return `${man}만원`;
    } else {
      return `${formatNumber(amount)}원`;
    }
  }, [formatNumber]);

  return {
    planSelections,
    isLoading,
    error,
    refreshPlanSelections,
    deletePlanSelection,
    getPlanTypeColor,
    getPlanTypeIcon,
    getComparisonStatusColor,
    getComparisonStatusText,
    formatNumber,
    formatCurrency
  };
};

export default useCapitalPlanSelections;
