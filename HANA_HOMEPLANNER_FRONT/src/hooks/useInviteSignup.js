/**
 * 초대를 통한 회원가입과 커플 연결을 처리하는 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { coupleAcceptService } from '@/services/coupleAcceptService';

export const useInviteSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupResult, setSignupResult] = useState(null);
  const [coupleResult, setCoupleResult] = useState(null);

  /**
   * 초대를 통한 회원가입 처리
   * @param {Object} signupData - 회원가입 데이터
   * @returns {Promise<Object>} 회원가입 결과
   */
  const processInviteSignup = useCallback(async (signupData) => {
    setIsLoading(true);
    
    try {
      console.log('초대를 통한 회원가입 시작:', signupData);
      
      // 1단계: 회원가입 API 호출
      toast.loading('회원가입을 진행하고 있습니다...', { id: 'signup-process' });
      
      const signupResponse = await authService.signup(signupData);
      console.log('회원가입 API 응답:', signupResponse);
      
      setSignupResult(signupResponse);
      
      // 회원가입 성공 메시지
      toast.success('회원가입이 완료되었습니다! 🎉', { 
        id: 'signup-process',
        duration: 2000 
      });

      // JWT 토큰이 있으면 localStorage에 저장 (자동 로그인)
      if (signupResponse.data && signupResponse.data.accessToken) {
        localStorage.setItem('accessToken', signupResponse.data.accessToken);
        console.log('JWT 토큰 저장 완료:', signupResponse.data.accessToken);
      }

      // 2단계: 초대 토큰이 있으면 커플 연결 처리
      if (signupData.inviteToken && signupResponse.data && signupResponse.data.userId) {
        await processCoupleConnection(signupData.inviteToken, signupResponse.data.userId);
      }

      return signupResponse;
      
    } catch (error) {
      console.error('초대 회원가입 오류:', error);
      toast.error(error.message || '회원가입 중 오류가 발생했습니다.', { 
        id: 'signup-process' 
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 커플 연결 처리
   * @param {string} inviteToken - 초대 토큰
   * @param {string} acceptorId - 수락자 사용자 ID
   */
  const processCoupleConnection = useCallback(async (inviteToken, acceptorId) => {
    try {
      console.log('커플 연결 시작:', { inviteToken, acceptorId });
      
      toast.loading('커플 연결을 진행하고 있습니다...', { id: 'couple-connect' });
      
      const coupleResponse = await coupleAcceptService.acceptInvite(inviteToken, acceptorId);
      console.log('커플 연결 API 응답:', coupleResponse);
      
      setCoupleResult(coupleResponse);
      
      // 커플 연결 성공 메시지 (중복 방지)
      toast.dismiss('couple-connect'); // 기존 토스트 제거
      toast.success('커플 연결이 완료되었습니다! 💕', { 
        duration: 2000 
      });

      // 성공 후 마이페이지로 리다이렉트 (2초 후)
      setTimeout(() => {
        navigate('/mypage');
      }, 2000);
      
    } catch (error) {
      console.error('커플 연결 오류:', error);
      toast.dismiss('couple-connect'); // 기존 토스트 제거
      toast.error('커플 연결 중 오류가 발생했습니다. 나중에 다시 시도해주세요.', { 
        duration: 3000 
      });
      
      // 커플 연결 실패해도 회원가입은 성공했으므로 마이페이지로 (이미 로그인됨)
      setTimeout(() => {
        navigate('/mypage');
      }, 2000);
    }
  }, [navigate]);

  /**
   * 초대 정보 조회
   * @param {string} inviteToken - 초대 토큰
   * @returns {Promise<Object>} 초대 정보
   */
  const getInviteInfo = useCallback(async (inviteToken) => {
    try {
      const inviteInfo = await coupleAcceptService.getInviteInfo(inviteToken);
      console.log('초대 정보:', inviteInfo);
      return inviteInfo;
    } catch (error) {
      console.error('초대 정보 조회 오류:', error);
      // 오류 발생 시 기본값 반환
      return {
        inviterName: '김홈',
        message: '함께 내 집 마련 계획을 세워보아요!'
      };
    }
  }, []);

  return {
    isLoading,
    signupResult,
    coupleResult,
    processInviteSignup,
    processCoupleConnection,
    getInviteInfo
  };
};
