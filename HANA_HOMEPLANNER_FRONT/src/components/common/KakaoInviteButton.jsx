/**
 * 카카오톡 공유 버튼 컴포넌트
 * 배우자 초대 링크를 카카오톡으로 공유하는 기능
 */

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

const KakaoInviteButton = ({ inviteUrl, onGetInviteUrl, isGenerating = false }) => {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // 링크를 절대 URL로 변환하는 함수
  const ensureAbsoluteUrl = (url) => {
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
  };

  // 카카오 SDK 로드 및 초기화
  useEffect(() => {
    const loadKakaoSDK = () => {
      // 이미 로드된 경우
      if (window.Kakao) {
        initializeKakao();
        return;
      }

      // 스크립트가 이미 존재하는지 확인
      const existingScript = document.querySelector('script[src*="kakao"]');
      if (existingScript) {
        // 스크립트가 로드 중인 경우 이벤트 리스너 추가
        existingScript.addEventListener('load', initializeKakao);
        return;
      }

      // 카카오 SDK 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.async = true;
      script.onload = initializeKakao;
      script.onerror = () => {
        console.error('카카오 SDK 로드 실패');
      };
      
      document.head.appendChild(script);
    };

    const initializeKakao = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        try {
          // 카카오 JavaScript 키 (환경변수에서 가져오거나 기본값 사용)
          const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '244eb9b776fdd2dcefb98ce91e328b01';
          console.log('카카오 키 설정:', kakaoKey);
          window.Kakao.init(kakaoKey);
          setIsKakaoLoaded(true);
          console.log('카카오 SDK 초기화 완료');
          console.log('Kakao.Share 사용 가능:', !!window.Kakao.Share);
        } catch (error) {
          console.error('카카오 SDK 초기화 실패:', error);
        }
      } else if (window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoLoaded(true);
        console.log('카카오 SDK 이미 초기화됨');
        console.log('Kakao.Share 사용 가능:', !!window.Kakao.Share);
      }
    };

    loadKakaoSDK();

    // 컴포넌트 언마운트 시 정리
    return () => {
      const script = document.querySelector('script[src*="kakao"]');
      if (script) {
        script.removeEventListener('load', initializeKakao);
      }
    };
  }, []);

  // 카카오톡 공유 실행
  const handleKakaoShare = async () => {
    let link = inviteUrl;
    
    console.log('🔗 KakaoInviteButton - 초기 inviteUrl:', inviteUrl);
    
    // 링크가 없으면 onGetInviteUrl을 통해 가져오기
    if (!link && onGetInviteUrl) {
      try {
        console.log('🔗 링크가 없어서 onGetInviteUrl 호출');
        link = await onGetInviteUrl();
        console.log('🔗 onGetInviteUrl에서 받은 링크:', link);
      } catch (error) {
        console.error('초대 링크 생성 실패:', error);
        alert('초대 링크 생성에 실패했습니다.');
        return;
      }
    }
    
    // 링크를 절대 URL로 변환
    const absoluteLink = ensureAbsoluteUrl(link);
    
    console.log('🔗 최종 사용할 링크:', link);
    console.log('🔗 절대 URL로 변환된 링크:', absoluteLink);
    
    if (!absoluteLink) {
      alert('초대 링크가 없습니다.');
      return;
    }

    // 카카오 SDK가 로드되지 않은 경우 재초기화 시도
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      try {
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || 'YOUR_ACTUAL_KAKAO_JS_KEY';
        window.Kakao.init(kakaoKey);
      } catch (error) {
        console.error('카카오 SDK 재초기화 실패:', error);
        alert('카카오톡 공유를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
    }

    // Kakao.Share API 존재 여부 확인
    console.log('Kakao 객체 확인:', !!window.Kakao);
    console.log('Kakao.Share 확인:', !!window.Kakao.Share);
    console.log('Kakao.Share.sendDefault 확인:', !!window.Kakao.Share?.sendDefault);
    
    if (!window.Kakao.Share || !window.Kakao.Share.sendDefault) {
      console.error('Kakao.Share API를 사용할 수 없습니다.');
      console.error('Kakao 객체:', window.Kakao);
      alert('카카오톡 공유 기능을 사용할 수 없습니다. 카카오 앱 키를 확인해주세요.');
      return;
    }

    setIsSharing(true);

    try {
      console.log('🔗 카카오톡 공유에 사용할 링크:', absoluteLink);
      
      // 카카오톡 공유 API 호출 (SDK 2.7.2에서는 Share.sendDefault 사용)
      await window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: '배우자 초대 링크입니다! 눌러서 함께 내 집 마련 플랜을 시작해요.',
        link: {
          webUrl: absoluteLink,
          mobileWebUrl: absoluteLink,
        },
      });
      
      console.log('✅ 카카오톡 공유 성공');
    } catch (error) {
      console.error('❌ 카카오톡 공유 실패:', error);
      alert('카카오톡 공유에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleKakaoShare}
      disabled={!isKakaoLoaded || isSharing || isGenerating}
      className={`
        flex items-center justify-center px-4 py-3 
        bg-yellow-400 hover:bg-yellow-500 
        text-black font-bold 
        rounded-lg 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
        ${isSharing ? 'animate-pulse' : ''}
      `}
      title={!isKakaoLoaded ? '카카오 SDK 로딩 중...' : !inviteUrl ? '초대 링크가 없습니다' : '카카오톡으로 초대하기'}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      {isSharing ? '공유 중...' : isGenerating ? '링크 생성 중...' : '카카오톡으로 초대하기'}
    </button>
  );
};

export default KakaoInviteButton;
