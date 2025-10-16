import React, { useState, useEffect } from 'react';
import { getUser, logout, isLoggedIn } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * 로그인/회원가입 섹션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.showLoginForm - 로그인 폼 표시 여부
 * @param {Function} props.setShowLoginForm - 로그인 폼 표시 상태 변경 함수
 * @param {Object} props.loginData - 로그인 데이터
 * @param {Function} props.handleInputChange - 입력값 변경 핸들러
 * @param {Function} props.handleLoginSubmit - 로그인 제출 핸들러
 * @param {Function} props.setLoginData - 로그인 데이터 설정 함수
 */
export const LoginSection = ({ 
  showLoginForm, 
  setShowLoginForm, 
  loginData, 
  handleInputChange, 
  handleLoginSubmit,
  setLoginData 
}) => {
  const [user, setUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedIn = isLoggedIn();
      const currentUser = getUser();
      
      // 로그인 상태가 변경된 경우 애니메이션 효과 적용
      if (loggedIn !== userLoggedIn) {
        setIsTransitioning(true);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setUserLoggedIn(loggedIn);
      setUser(currentUser);
      
      // 애니메이션 키 업데이트로 컴포넌트 리렌더링 트리거
      if (loggedIn !== userLoggedIn) {
        setAnimationKey(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsTransitioning(false);
      }
    };

    checkAuthStatus();
    
    // 인증 상태 변경 이벤트 리스너
    window.addEventListener('authStateChanged', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('authStateChanged', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [userLoggedIn]);

  const handleLogout = async () => {
    setIsTransitioning(true);
    
    // 페이드 아웃 애니메이션
    await new Promise(resolve => setTimeout(resolve, 300));
    
    logout();
    toast.success('로그아웃되었습니다. 👋');
    
    // 애니메이션 키 업데이트로 컴포넌트 리렌더링 트리거
    setAnimationKey(prev => prev + 1);
    
    // 페이드 인 애니메이션
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsTransitioning(false);
  };

  // 로그인된 사용자의 경우 간결한 프로필 표시
  if (userLoggedIn && user) {
    return (
      <div className="absolute bottom-24 left-3 right-3">
        {/* 사용자 프로필 카드 */}
        <div 
          key={animationKey}
          className={`mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 py-10 shadow-sm relative transition-all duration-500 ease-in-out ${
            isTransitioning 
              ? 'opacity-0 transform scale-95 translate-y-2' 
              : 'opacity-100 transform scale-100 translate-y-0'
          }`}
        >
          {/* 로그아웃 버튼 - 우측 상단 */}
          <button 
            onClick={handleLogout}
            className="absolute top-3 right-3 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 font-medium py-1.5 px-3 rounded-full transition-all duration-200 text-xs border border-gray-200 flex items-center justify-center gap-1 shadow-sm hover:shadow-md"
          >
            <LogOut className="w-3 h-3" />
            로그아웃
          </button>
          
          {/* 프로필 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* 아바타 */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md">
                {user.userNm ? user.userNm.charAt(0) : 'U'}
              </div>
              {/* 사용자 정보 */}
              <div>
                <h3 className="text-gray-800 font-semibold text-base">
                  {user.userNm}님
                </h3>
                <p className="text-[#009071] text-sm">
                  하나 홈 플래너 회원
                </p>
              </div>
            </div>
            {/* 상태 표시 */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-600 text-xs font-medium">온라인</span>
            </div>
          </div>
          
          {/* 간단한 환영 메시지 */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              모든 서비스를 자유롭게 이용하세요! ✨
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 사용자의 경우 기존 로그인 폼 표시
  return (
    <div 
      key={animationKey}
      className={`absolute bottom-24 left-3 right-3 transition-all duration-500 ease-in-out ${
        isTransitioning 
          ? 'opacity-0 transform scale-95 translate-y-2' 
          : 'opacity-100 transform scale-100 translate-y-0'
      }`}
    >
      {/* 로그인 안내 텍스트 */}
      {!showLoginForm && (
        <div className="mb-2 text-center">
          <p className="mb-8 text-gray-700 text-base font-semibold">
            하나 홈 플래너에 로그인하고 더 많은 서비스를 이용해보세요!
          </p>
        </div>
      )}
      
      {/* 로그인 버튼 또는 폼 */}
      <div className="mb-3">
        {!showLoginForm ? (
          <div className="relative">
            <button 
              onClick={() => setShowLoginForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm border border-green-600"
            >
              로그인
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* 뒤로가기 화살표 - 좌측 상단 고정 */}
            <button
              type="button"
              onClick={() => {
                setShowLoginForm(false);
                setLoginData({ username: '', password: '' });
              }}
              className="absolute top-0 left-0 text-gray-600 hover:text-gray-800 transition-colors z-20 -mt-8 -ml-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <form onSubmit={handleLoginSubmit} className="space-y-3" autoComplete="off">
              <input
                type="text"
                name="username"
                placeholder="아이디"
                value={loginData.username}
                onChange={handleInputChange}
                autoComplete="off"
                data-form-type="other"
                className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 font-sans"
              />
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={loginData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                data-form-type="other"
                className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 font-sans"
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm border border-green-600"
              >
                로그인
              </button>
            </form>
          </div>
        )}
      </div>
      
      {/* 회원가입 링크 */}
      <div className="text-right">
        <a 
          href="/signup"
          className="text-gray-600 hover:text-green-600 text-xs underline transition-all duration-200 relative -top-2"
        >
          회원가입
        </a>
      </div>
    </div>
  );
};
