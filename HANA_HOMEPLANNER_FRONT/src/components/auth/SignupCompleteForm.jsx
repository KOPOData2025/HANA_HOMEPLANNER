import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle,
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  Home,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";

const SignupCompleteForm = ({ userData, onBack }) => {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // 애니메이션 시작
    setTimeout(() => setShowAnimation(true), 500);
    
    // 공동적금 초대 링크가 있으면 3초 후 자동으로 이동
    const pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
    if (pendingInviteUrl) {
      const timer = setTimeout(() => {
        if (pendingInviteUrl.includes('/joint-savings/accept/')) {
          // 공동적금 가입 페이지로 이동
          const inviteId = pendingInviteUrl.split('/joint-savings/accept/')[1];
          sessionStorage.removeItem('pendingInviteUrl');
          navigate(`/joint-savings/signup/${inviteId}`);
        } else {
          sessionStorage.removeItem('pendingInviteUrl');
          navigate(pendingInviteUrl);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      // 배우자 초대 토큰이 있으면 3초 후 자동으로 연동 수락 화면으로 이동
      const coupleInviteToken = sessionStorage.getItem('coupleInviteToken');
      if (coupleInviteToken) {
        const timer = setTimeout(() => {
          sessionStorage.removeItem('coupleInviteToken');
          navigate(`/invite/${coupleInviteToken}`);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [navigate]);

  const getCategoryIcon = (category) => {
    const icons = {
      banks: <Building2 className="w-4 h-4" />,
      cards: <CreditCard className="w-4 h-4" />,
      securities: <TrendingUp className="w-4 h-4" />,
      insurance: <Shield className="w-4 h-4" />
    };
    return icons[category] || <Building2 className="w-4 h-4" />;
  };

  const getCategoryName = (category) => {
    const names = {
      banks: '은행',
      cards: '카드사',
      securities: '증권사',
      insurance: '보험사'
    };
    return names[category] || category;
  };

  const handleGoToHome = () => {
    // 공동적금 초대 링크가 있으면 해당 페이지로 이동
    const pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
    if (pendingInviteUrl) {
      if (pendingInviteUrl.includes('/joint-savings/accept/')) {
        // 공동적금 가입 페이지로 이동
        const inviteId = pendingInviteUrl.split('/joint-savings/accept/')[1];
        sessionStorage.removeItem('pendingInviteUrl');
        navigate(`/joint-savings/signup/${inviteId}`);
      } else {
        sessionStorage.removeItem('pendingInviteUrl');
        navigate(pendingInviteUrl);
      }
    } else {
      // 배우자 초대 토큰이 있으면 연동 수락 화면으로 이동
      const coupleInviteToken = sessionStorage.getItem('coupleInviteToken');
      if (coupleInviteToken) {
        sessionStorage.removeItem('coupleInviteToken');
        navigate(`/invite/${coupleInviteToken}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleGoToLogin = () => {
    // 공동적금 초대 링크가 있으면 해당 페이지로 이동
    const pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
    if (pendingInviteUrl) {
      if (pendingInviteUrl.includes('/joint-savings/accept/')) {
        // 공동적금 가입 페이지로 이동
        const inviteId = pendingInviteUrl.split('/joint-savings/accept/')[1];
        sessionStorage.removeItem('pendingInviteUrl');
        navigate(`/joint-savings/signup/${inviteId}`);
      } else {
        sessionStorage.removeItem('pendingInviteUrl');
        navigate(pendingInviteUrl);
      }
    } else {
      // 배우자 초대 토큰이 있으면 연동 수락 화면으로 이동
      const coupleInviteToken = sessionStorage.getItem('coupleInviteToken');
      if (coupleInviteToken) {
        sessionStorage.removeItem('coupleInviteToken');
        navigate(`/invite/${coupleInviteToken}`);
      } else {
        navigate('/login');
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 flex items-center justify-center py-16">
      <div className="max-w-4xl mx-auto px-6 w-full">
        {/* 뒤로가기 버튼 */}
        {onBack && (
          <div className="mb-6">
            <button 
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </button>
          </div>
        )}
        
        <div className={`bg-white rounded-2xl shadow-xl p-12 transform transition-all duration-1000 ${
          showAnimation ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}>
          
          {/* 성공 아이콘과 환영 메시지 */}
          <div className="text-center mb-12">
            
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {userData?.userNm || '사용자'}님 안녕하세요! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              하나홈플래너 서비스 가입을 환영합니다.
            </p>
            
            {(sessionStorage.getItem('coupleInviteToken') || sessionStorage.getItem('pendingInviteUrl')) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <p className="text-blue-700 text-sm">
                  {sessionStorage.getItem('coupleInviteToken') 
                    ? '배우자 연동 수락 페이지로 자동 이동합니다... ⏰'
                    : sessionStorage.getItem('pendingInviteUrl')?.includes('/joint-savings/accept/')
                      ? '공동적금 가입 페이지로 자동 이동합니다... ⏰'
                      : '초대받은 공동적금 페이지로 자동 이동합니다... ⏰'
                  }
                </p>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoToHome}
              className="flex-1 max-w-xs bg-teal-600 hover:bg-teal-700 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>홈으로 이동</span>
            </button>
            
            <button
              onClick={handleGoToLogin}
              className="flex-1 max-w-xs border-2 border-teal-600 text-teal-600 hover:bg-teal-50 py-4 px-6 rounded-lg font-medium transition-colors"
            >
              로그인하기
            </button>
          </div>

          {/* 추가 정보 */}
          <div className="text-center mt-12 pt-8 border-t">
            <p className="text-lg text-gray-500 mb-3">
              가입해주셔서 감사합니다! 
            </p>
            <p className="text-sm text-gray-400">
              문의사항이 있으시면 고객센터(1588-0000)로 연락해주세요
            </p>
          </div>
        </div>
      </div>

      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SignupCompleteForm;
