import React, { useState, useEffect } from 'react';
import { 
  Heart,
  Users,
  Calendar,
  Share2,
  Copy,
  Check,
  Settings,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUser } from '@/lib/auth';

/**
 * 회원정보 카드 컴포넌트
 * 사용자의 기본 정보와 커플 연동 상태를 표시합니다.
 */
const UserInfoCard = ({ 
  isCoupleConnected, 
  partnerInfo, 
  getInviteLinkForShare 
}) => {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, []);

  // 카카오톡 SDK 로드 확인
  useEffect(() => {
    const checkKakaoSDK = () => {
      if (window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoLoaded(true);
      } else {
        // 이미 스크립트가 로드되어 있는지 확인
        const existingScript = document.querySelector('script[src*="kakao_js_sdk"]');
        if (existingScript) {
          // 스크립트가 이미 있으면 초기화만 시도
          if (window.Kakao && !window.Kakao.isInitialized()) {
            const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '244eb9b776fdd2dcefb98ce91e328b01';
            window.Kakao.init(kakaoKey);
          }
          setIsKakaoLoaded(true);
        } else {
          // 카카오톡 SDK가 로드되지 않은 경우 스크립트 로드 (integrity 제거)
          const script = document.createElement('script');
          script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js';
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
              const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '244eb9b776fdd2dcefb98ce91e328b01';
              window.Kakao.init(kakaoKey);
            }
            setIsKakaoLoaded(true);
          };
          script.onerror = () => {
            console.warn('카카오톡 SDK 로드 실패 - 링크 복사로 대체됩니다');
            setIsKakaoLoaded(false);
          };
          document.head.appendChild(script);
        }
      }
    };

    checkKakaoSDK();
  }, []);

  // 카카오톡 공유 함수
  const handleKakaoShare = async () => {
    setIsGeneratingLink(true);
    try {
      const shareLink = await getInviteLinkForShare();
      const absoluteLink = shareLink.startsWith('http') ? shareLink : `${window.location.origin}${shareLink}`;
      
      if (isKakaoLoaded && window.Kakao && window.Kakao.Share) {
        try {
          window.Kakao.Share.sendDefault({
            objectType: 'text',
            text: '배우자 초대 링크입니다! 🏠\n\n함께 내 집 마련 계획을 세워보세요!\n청약 정보를 공유하고, 가계부를 함께 관리하며\n맞춤형 대출 상품을 추천받아보세요! 💕',
            link: {
              webUrl: absoluteLink,
              mobileWebUrl: absoluteLink,
            },
          });
        } catch (error) {
          console.error('카카오톡 공유 실패:', error);
          toast.error('카카오톡 공유에 실패했습니다. 링크를 복사해서 전달해주세요.');
          handleCopyLink();
        }
      } else {
        // 카카오톡 SDK가 로드되지 않았거나 사용할 수 없는 경우 링크 복사로 대체
        console.warn('카카오톡 SDK를 사용할 수 없습니다. 링크 복사로 대체합니다.');
        toast.info('카카오톡 공유 대신 링크를 복사했습니다.');
        handleCopyLink();
      }
    } catch (error) {
      console.error('초대 링크 생성 실패:', error);
      toast.error('초대 링크 생성에 실패했습니다.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // 링크 복사 함수
  const handleCopyLink = async () => {
    setIsGeneratingLink(true);
    try {
      const shareLink = await getInviteLinkForShare();
      const absoluteLink = shareLink.startsWith('http') ? shareLink : `${window.location.origin}${shareLink}`;
      
      await navigator.clipboard.writeText(absoluteLink);
      setCopied(true);
      toast.success('초대 링크가 복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('링크 복사 실패:', error);
      toast.error('링크 복사에 실패했습니다.');
    } finally {
      setIsGeneratingLink(false);
    }
  };
  return (
    <div className="bg-white rounded-3xl px-6 py-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 h-[430px] flex flex-col justify-between">
      {/* 헤더 */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11  rounded-2xl flex items-center justify-center shadow-md">
            <UserCircle className="w-6 h-6 text-green-800" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {currentUser?.userNm ? `${currentUser.userNm}님` : "사용자님"}
            </h3>
            <p className="text-xs text-[#009071] font-medium">
              하나 홈 플래너 회원
            </p>
          </div>
        </div>

        {/* 커플 연동 상태 표시 - 우측에 배치 */}
        {isCoupleConnected && partnerInfo && (
          <div className="text-right">
            <p className="text-[#009071] text-xs mb-1">연동된 커플</p>
            <p className="text-gray-800 font-semibold text-sm">
              {partnerInfo.name || partnerInfo.userNm || "파트너"}님
            </p>
          </div>
        )}

        {!isCoupleConnected && (
          <div className="flex items-center space-x-2">
            {/* 카카오톡 공유 버튼 */}
            <p className="text-black text-s mb-1">커플 초대하기</p>
            <button
              onClick={handleKakaoShare}
              disabled={isGeneratingLink}
              className={`w-8 h-8 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center ${
                isGeneratingLink
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600"
              }`}
              title="카카오톡으로 초대하기"
            >
              {isGeneratingLink ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <img src="/logo/kakao.png" alt="카카오톡" className="w-4 h-4" />
              )}
            </button>

            {/* 링크 복사 버튼 */}
            <button
              onClick={handleCopyLink}
              disabled={isGeneratingLink}
              className={`w-8 h-8 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center ${
                isGeneratingLink
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : copied
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
              title="초대 링크 복사하기"
            >
              {isGeneratingLink ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 바디 - 사용자 정보 */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3">
          {/* 이메일 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-xs font-medium text-gray-600">이메일</p>
                {showEmail ? (
                  <p className="text-sm font-bold text-gray-800">
                    {currentUser?.email || "정보 없음"}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-gray-400">••••••••••</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={showEmail ? "숨기기" : "보기"}
            >
              {showEmail ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* 전화번호 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-xs font-medium text-gray-600">전화번호</p>
                {showPhone ? (
                  <p className="text-sm font-bold text-gray-800">
                    {currentUser?.phnNum || "정보 없음"}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-gray-400">••••••••••</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowPhone(!showPhone)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={showPhone ? "숨기기" : "보기"}
            >
              {showPhone ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* 가입일 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-xs font-medium text-gray-600">가입일</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt)
                        .toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        .replace(/\./g, ".")
                        .replace(/\s/g, "")
                    : "2024.01.15"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 - 개인정보 관리 */}
      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-br from-gray-500 to-gray-600 rounded-md flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            개인정보 관리
          </span>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 bg-[#009071] hover:bg-[#007a5f] text-white text-xs rounded-lg transition-colors">
            프로필 수정
          </button>
          <button className="px-3 py-1.5 bg-[#009071] hover:bg-[#007a5f] text-white text-xs rounded-lg transition-colors">
            비밀번호 변경
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
