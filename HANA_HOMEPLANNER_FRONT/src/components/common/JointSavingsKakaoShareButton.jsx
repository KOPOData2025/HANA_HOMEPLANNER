/**
 * 공동적금 초대용 카카오톡 공유 버튼 컴포넌트
 * 공동적금 초대 링크를 카카오톡으로 공유하는 기능
 */

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

const JointSavingsKakaoShareButton = ({ 
  inviteUrl, 
  productName, 
  accountNumber,
  userName = "하나님", // 기본값 설정
  onGetInviteUrl, 
  isGenerating = false 
}) => {
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
      if (window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoLoaded(true);
        return;
      }

      // 스크립트가 이미 존재하는지 확인
      const existingScript = document.querySelector('script[src*="kakao_js_sdk"]');
      if (existingScript) {
        // 스크립트가 이미 있으면 초기화만 시도
        if (window.Kakao && !window.Kakao.isInitialized()) {
          const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '244eb9b776fdd2dcefb98ce91e328b01';
          try {
            window.Kakao.init(kakaoKey);
            setIsKakaoLoaded(true);
          } catch (error) {
            console.error('카카오 SDK 초기화 실패:', error);
          }
        } else {
          setIsKakaoLoaded(true);
        }
        return;
      }

      // 카카오 SDK 스크립트 동적 로드 (integrity 제거)
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '244eb9b776fdd2dcefb98ce91e328b01';
          try {
            window.Kakao.init(kakaoKey);
            setIsKakaoLoaded(true);
          } catch (error) {
            console.error('카카오 SDK 초기화 실패:', error);
          }
        } else {
          setIsKakaoLoaded(true);
        }
      };
      script.onerror = () => {
        console.warn('카카오 SDK 로드 실패 - 버튼이 비활성화됩니다');
        setIsKakaoLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    loadKakaoSDK();
  }, []);

  // 카카오톡 공유 실행
  const handleKakaoShare = async () => {
    let link = inviteUrl;
    
    console.log('🔗 JointSavingsKakaoShareButton - 초기 inviteUrl:', inviteUrl);
    
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
        const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '244eb9b776fdd2dcefb98ce91e328b01';
        window.Kakao.init(kakaoKey);
      } catch (error) {
        console.error('카카오 SDK 재초기화 실패:', error);
        alert('카카오톡 공유를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
    }

    // Kakao.Share API 존재 여부 확인
    if (!window.Kakao || !window.Kakao.Share || !window.Kakao.Share.sendDefault) {
      console.error('Kakao.Share API를 사용할 수 없습니다.');
      alert('카카오톡 공유 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSharing(true);

    try {
      console.log('🔗 카카오톡 공유에 사용할 링크:', absoluteLink);
      
      // 공동적금 초대용 메시지 템플릿
      const shareMessage = `${userName}님이 초대했어요! 🎉\n\n${productName} 공동적금에 함께 참여해보세요! 💰\n\n함께 목표를 향해 저축하고, 내 집 마련의 꿈을 이루어요! 🏠✨\n\n초대 링크를 클릭해서 가입해주세요! 👆`;
      
      // 카카오톡 공유 API 호출 (SDK 2.7.2에서는 Share.sendDefault 사용)
      await window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: shareMessage,
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
      disabled={isSharing || isGenerating}
      className={`
        flex items-center justify-center px-4 py-3 
        bg-yellow-400 hover:bg-yellow-500 
        text-black font-bold 
        rounded-lg 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
        ${isSharing ? 'animate-pulse' : ''}
        ${!isKakaoLoaded ? 'opacity-75' : ''}
      `}
      title={!isKakaoLoaded ? '카카오 SDK 로딩 중...' : !inviteUrl ? '초대 링크가 없습니다' : '카카오톡으로 공동적금 초대하기'}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      {isSharing ? '공유 중...' : isGenerating ? '링크 생성 중...' : !isKakaoLoaded ? '로딩 중...' : '카톡 초대'}
    </button>
  );
};

export default JointSavingsKakaoShareButton;
