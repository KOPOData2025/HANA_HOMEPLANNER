/**
 * 커플 연동 상태 관리 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { coupleStatusService } from '@/services/coupleStatusService';
import useErrorNotification from './useErrorNotification';

export const useCoupleStatus = () => {
  const [coupleStatus, setCoupleStatus] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useErrorNotification();

  // 커플 연동 상태 조회
  const fetchCoupleStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 로그인 상태 먼저 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🔇 [useCoupleStatus] 토큰 없음 - API 호출 중단');
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 useCoupleStatus - 커플 상태 조회 시작');
      
      const status = await coupleStatusService.getCoupleStatus();
      setCoupleStatus(status);
      
      console.log('🔍 useCoupleStatus - 커플 상태:', status);
      
      // 커플이 연동된 경우 파트너 정보 조회
      if (status.hasCouple && status.partnerUserId) {
        try {
          // 새로운 파트너 상세 정보 API 사용
          const partner = await coupleStatusService.getPartnerDetail();
          setPartnerInfo(partner);
          console.log('🔍 useCoupleStatus - 파트너 상세 정보:', partner);
        } catch (partnerError) {
          console.warn('파트너 상세 정보 조회 실패, 기존 API로 재시도:', partnerError);
          // 새로운 API 실패 시 기존 API로 fallback
          try {
            const partner = await coupleStatusService.getPartnerInfo(status.partnerUserId);
            setPartnerInfo(partner);
            console.log('🔍 useCoupleStatus - 파트너 정보 (fallback):', partner);
          } catch (fallbackError) {
            console.warn('파트너 정보 조회 실패:', fallbackError);
            // 파트너 정보 조회 실패해도 커플 상태는 유지
          }
        }
      } else {
        setPartnerInfo(null);
      }
      
    } catch (err) {
      console.error('🔍 useCoupleStatus - 에러 발생:', err);
      const errorMessage = err.message || '커플 상태를 불러오는데 실패했습니다.';
      setError(errorMessage);
      
      // 토큰 만료나 인증 오류인 경우 조용히 처리 (토스트 없음)
      if (errorMessage.includes('인증이 만료되었습니다') || 
          errorMessage.includes('로그인이 필요합니다') ||
          errorMessage.includes('토큰이 만료되었습니다')) {
        console.log('🔇 [useCoupleStatus] 인증 오류 - 토스트 알림 생략');
        return;
      }
      
      // 기타 오류는 토스트로 표시
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // 컴포넌트 마운트 시 커플 상태 조회
  useEffect(() => {
    fetchCoupleStatus();
  }, [fetchCoupleStatus]);

  // 커플 상태 새로고침
  const refreshCoupleStatus = useCallback(() => {
    fetchCoupleStatus();
  }, [fetchCoupleStatus]);

  // 커플 연동 여부 확인
  const isCoupleConnected = coupleStatus?.hasCouple === true;
  const isCoupleActive = coupleStatus?.status === 'ACTIVE';

  return {
    coupleStatus,
    partnerInfo,
    isLoading,
    error,
    isCoupleConnected,
    isCoupleActive,
    refreshCoupleStatus,
    fetchCoupleStatus
  };
};
