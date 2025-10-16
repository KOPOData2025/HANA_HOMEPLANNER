/**
 * 커플 초대 링크 관리 커스텀 훅
 * 초대 링크 생성, 복사, 공유 기능
 */

import { useState, useCallback } from 'react';
import { createCoupleInviteLink } from '@/services/coupleService';
import useErrorNotification from './useErrorNotification';
import toast from 'react-hot-toast';

export const useCoupleInvite = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const { showError } = useErrorNotification();

  // 링크를 절대 URL로 변환하는 함수
  const ensureAbsoluteUrl = useCallback((url) => {
    if (!url) return url;
    
    // 이미 프로토콜이 있는 경우
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // localhost로 시작하는 경우 http:// 추가
    if (url.startsWith('localhost')) {
      return `http://${url}`;
    }
    
    // 상대 경로인 경우 현재 origin 추가
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // 기타 경우 http:// 추가
    return `http://${url}`;
  }, []);

  // 초대 링크 생성
  const generateInviteLink = useCallback(async () => {
    try {
      setIsGenerating(true);
      const data = await createCoupleInviteLink();
      
      console.log('API 응답 데이터:', data);
      
      // API 응답에서 링크 추출 (다양한 필드명 지원)
      const link = data.inviteUrl || data.link || data.url || data.inviteLink || data.invite_url;
      
      console.log('🔍 API 응답에서 추출한 링크:', link);
      console.log('🔍 링크 타입:', typeof link);
      console.log('🔍 링크 길이:', link?.length);
      
      if (!link) {
        console.error('API 응답에서 링크를 찾을 수 없습니다:', data);
        throw new Error('API 응답에 링크 정보가 없습니다.');
      }
      
      // localhost:3000이 포함된 경우 경고
      if (link.includes('localhost:3000')) {
        console.warn('⚠️ API에서 localhost:3000 링크를 반환했습니다:', link);
      }
      
      // 링크를 절대 URL로 변환
      const absoluteLink = ensureAbsoluteUrl(link);
      
      // 생성된 링크를 상태에 저장
      setInviteLink(absoluteLink);
      
      console.log('생성된 초대 링크:', link);
      console.log('절대 URL로 변환된 링크:', absoluteLink);
      
      toast.success('초대 링크가 생성되었습니다!', {
        duration: 3000,
        position: 'top-center',
      });
      
      return absoluteLink;
    } catch (err) {
      const errorMessage = err.message || '초대 링크 생성에 실패했습니다.';
      showError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [showError, ensureAbsoluteUrl]);

  // 링크 복사
  const copyInviteLink = useCallback(async () => {
    try {
      let link = inviteLink;
      
      // 링크가 없으면 새로 생성
      if (!link) {
        link = await generateInviteLink();
      }
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(link);
      
      toast.success('초대 링크가 클립보드에 복사되었습니다!', {
        duration: 3000,
        position: 'top-center',
      });
      
      return link;
    } catch (err) {
      console.error('링크 복사 실패:', err);
      toast.error('링크 복사에 실패했습니다.', {
        duration: 3000,
        position: 'top-center',
      });
      throw err;
    }
  }, [inviteLink, generateInviteLink]);

  // 카카오톡 공유용 링크 가져오기
  const getInviteLinkForShare = useCallback(async () => {
    try {
      let link = inviteLink;
      
      // 링크가 없으면 새로 생성
      if (!link) {
        link = await generateInviteLink();
      }
      
      return link;
    } catch (err) {
      console.error('공유용 링크 생성 실패:', err);
      throw err;
    }
  }, [inviteLink, generateInviteLink]);

  return {
    isGenerating,
    inviteLink,
    generateInviteLink,
    copyInviteLink,
    getInviteLinkForShare,
  };
};
