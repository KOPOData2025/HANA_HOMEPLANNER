import { useState, useCallback } from 'react';
import { loanApplicationService, loanApplicationUtils } from '@/services/loanApplicationService';

/**
 * 대출 신청 관련 커스텀 훅
 * 관심사 분리: 데이터 로직과 UI 로직을 분리하여 재사용성과 테스트 용이성 향상
 */
export const useLoanApplication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 대출 신청 처리
   * @param {Object} applicationData - 신청 데이터
   * @param {string} applicationData.productId - 상품 ID
   * @param {number} applicationData.loanAmount - 대출 금액 (년 단위)
   * @param {number} applicationData.loanPeriod - 대출 기간 (년 단위)
   * @param {string} applicationData.disburseAccountNumber - 입금 계좌번호
   * @returns {Promise<Object>} 신청 결과
   */
  const submitLoanApplication = useCallback(async (applicationData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 대출 신청 데이터 변환 시작:', {
        원본데이터: applicationData,
        loanAmount: applicationData.loanAmount,
        loanPeriod: applicationData.loanPeriod,
        disburseAccountNumber: applicationData.disburseAccountNumber
      });

      // 데이터 변환
      const requestAmount = loanApplicationUtils.parseAmount(applicationData.loanAmount);
      // loanPeriod는 이미 개월 단위로 전달되므로 그대로 사용
      const requestTerm = parseInt(applicationData.loanPeriod) || 0;
      
      // disburseAccountNumber 처리 - autoDebitAccountNumber 또는 disburseAccountNumber에서 가져오기
      console.log('🔍 계좌번호 매핑 전:', {
        disburseAccountNumber: applicationData.disburseAccountNumber,
        autoDebitAccountNumber: applicationData.autoDebitAccountNumber,
        hasDisburseAccountNumber: !!applicationData.disburseAccountNumber,
        hasAutoDebitAccountNumber: !!applicationData.autoDebitAccountNumber
      });
      
      let disburseAccountNumber = applicationData.disburseAccountNumber || applicationData.autoDebitAccountNumber;
      if (disburseAccountNumber === null || disburseAccountNumber === undefined) {
        disburseAccountNumber = '';
      }
      
      console.log('🔍 계좌번호 매핑 후:', {
        disburseAccountNumber,
        type: typeof disburseAccountNumber,
        length: disburseAccountNumber?.length
      });

      console.log('🔄 데이터 변환 결과:', {
        원본_loanPeriod: applicationData.loanPeriod,
        변환된_requestTerm: requestTerm,
        requestAmount,
        disburseAccountNumber,
        requestAmountType: typeof requestAmount,
        requestTermType: typeof requestTerm,
        disburseAccountNumberType: typeof disburseAccountNumber,
        autoDebitAccountNumber: applicationData.autoDebitAccountNumber,
        전체_applicationData: applicationData
      });

      // API 요청 데이터 구성
      const apiData = {
        productId: applicationData.productId,
        requestAmount,
        requestTerm,
        disburseAccountNumber,
        disburseDate: applicationData.disburseDate || '', // 상환날짜
        isJoint: applicationData.isJoint || "N" // 공동 차주 여부 (기본값: N)
      };

      // 공동 대출인 경우 배우자 정보 추가
      if (applicationData.isJoint === "Y") {
        apiData.jointName = applicationData.jointName || '';
        apiData.jointPhone = applicationData.jointPhone || '';
      }

      console.log('📤 최종 API 요청 데이터:', apiData);

      // 유효성 검사 제거 - 바로 API 호출
      const response = await loanApplicationService.createLoanApplication(apiData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '대출 신청에 실패했습니다.');
      }
    } catch (err) {
      console.error('대출 신청 오류:', err);
      setError(err.message || '대출 신청 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
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
    isLoading,
    error,
    
    // 액션
    submitLoanApplication,
    clearError
  };
};
