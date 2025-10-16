/**
 * 공동 대출 초대 관련 커스텀 훅
 * 관심사 분리: 데이터 로직과 UI 로직을 분리하여 재사용성과 테스트 용이성 향상
 */

import { useState, useCallback } from 'react';
import { jointLoanInviteService } from '@/services/jointLoanInviteService';

export const useJointLoanInvite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 초대 정보 조회
   */
  const getInviteInfo = useCallback(async (inviteId) => {
    console.log('🔍 [useJointLoanInvite] getInviteInfo 시작:', inviteId);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📞 [useJointLoanInvite] jointLoanInviteService.getInviteInfo 호출');
      const response = await jointLoanInviteService.getInviteInfo(inviteId);
      console.log('📨 [useJointLoanInvite] API 응답:', response);
      
      if (response && response.success) {
        console.log('✅ [useJointLoanInvite] 성공적으로 데이터 반환:', response.data);
        return response.data;
      } else {
        console.log('❌ [useJointLoanInvite] API 호출 실패:', response?.message || 'response is null/undefined');
        const errorMsg = response?.message || 'API 응답이 null 또는 undefined입니다.';
        setError(errorMsg);
        return null;
      }
    } catch (err) {
      console.error('💥 [useJointLoanInvite] 예외 발생:', err);
      const errorMessage = err.message || '초대 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 인증번호 발송
   */
  const sendVerificationCode = useCallback(async (name, residentNumber, phoneNumber) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await jointLoanInviteService.sendVerificationCode(name, residentNumber, phoneNumber);
      
      if (response.success) {
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || '인증번호 발송에 실패했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 인증번호 확인
   */
  const verifyCode = useCallback(async (phoneNumber, verificationCode) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await jointLoanInviteService.verifyCode(phoneNumber, verificationCode);
      
      if (response.success) {
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || '인증번호 확인에 실패했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 초대 수락 (CI 값으로)
   */
  const acceptInviteWithCi = useCallback(async (inviteId, jointCi) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🤝 [Hook] CI를 통한 초대 수락 시작:', { inviteId, jointCi });
      const response = await jointLoanInviteService.acceptInviteWithCi(inviteId, jointCi);
      
      if (response.success) {
        console.log('✅ [Hook] 초대 수락 성공:', response.data);
        return { success: true, message: response.message, data: response.data };
      } else {
        console.log('❌ [Hook] 초대 수락 실패:', response.message);
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('💥 [Hook] 초대 수락 예외:', err);
      const errorMessage = err.message || '초대 수락에 실패했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 초대 수락 (기존 방식)
   */
  const acceptInvite = useCallback(async (inviteId, userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await jointLoanInviteService.acceptInvite(inviteId, userData);
      
      if (response.success) {
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || '초대 수락에 실패했습니다.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 초대 상태 조회
   */
  const checkInviteStatus = useCallback(async (inviteId) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await jointLoanInviteService.getInviteStatus(inviteId);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || '초대 상태 조회에 실패했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    getInviteInfo,
    sendVerificationCode,
    verifyCode,
    acceptInvite,
    acceptInviteWithCi,
    checkInviteStatus,
    clearError
  };
};
