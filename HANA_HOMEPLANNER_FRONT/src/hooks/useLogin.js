import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setAuthTokens, isLoggedIn } from '@/lib/auth';
import { validateLoginForm, formatErrorMessage } from '@/utils/authUtils';
import { authService } from '@/services/authService';

export const useLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "test2@test.com", // 테스트용 기본값
    password: "qwer1234", // 테스트용 기본값
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 이미 로그인된 사용자는 홈페이지로 리다이렉트 (단, 초대 링크가 있으면 해당 페이지로 이동)
  useEffect(() => {
    console.log('🚀 [useLogin] useEffect 실행됨');
    // 약간의 지연을 두어 sessionStorage가 설정될 시간을 확보
    const timer = setTimeout(() => {
      if (isLoggedIn()) {
        let pendingInviteUrl = null;
        let coupleInviteToken = null;
        let backupInviteId = null;
        
        // sessionStorage 접근 가능 여부 확인 (시크릿 모드 대응)
        try {
          pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
          coupleInviteToken = sessionStorage.getItem('coupleInviteToken');
          backupInviteId = sessionStorage.getItem('JOINT_SAVINGS_INVITE_ID');
        } catch (e) {
          console.warn('🚨 sessionStorage 접근 실패 (시크릿 모드일 수 있음)');
        }
        
        console.log('🚀 [useLogin] 이미 로그인된 사용자 리다이렉트 확인');
        console.log('🚀 pendingInviteUrl:', pendingInviteUrl);
        console.log('🚀 coupleInviteToken:', coupleInviteToken);
        console.log('🚀 isLoggedIn:', isLoggedIn());
        console.log('🚀 백업 JOINT_SAVINGS_INVITE_ID:', backupInviteId);
        
        console.log('🚀 전체 sessionStorage:', {
          returnUrl: sessionStorage.getItem('returnUrl'),
          pendingInviteUrl: sessionStorage.getItem('pendingInviteUrl'),
          coupleInviteToken: sessionStorage.getItem('coupleInviteToken'),
          JOINT_SAVINGS_INVITE_ID: sessionStorage.getItem('JOINT_SAVINGS_INVITE_ID')
        });
        
        if (pendingInviteUrl) {
          // 공동적금 초대 링크인지 확인
          if (pendingInviteUrl.includes('/joint-savings/accept/')) {
            // 공동적금 가입 페이지로 이동
            const inviteId = pendingInviteUrl.split('/joint-savings/accept/')[1];
            console.log('🚀 [useLogin-이미로그인] 공동적금 가입 페이지로 이동:', inviteId);
            console.log('🚀 이동할 경로:', `/joint-savings/signup/${inviteId}`);
            sessionStorage.removeItem('pendingInviteUrl');
            console.log('🚀 pendingInviteUrl 제거 완료');
            navigate(`/joint-savings/signup/${inviteId}`, { replace: true });
            return;
          } else {
            // 초대 링크가 있으면 해당 페이지로 이동
            console.log('🔍 이미 로그인된 사용자 - 일반 초대 링크로 이동:', pendingInviteUrl);
            sessionStorage.removeItem('pendingInviteUrl');
            navigate(pendingInviteUrl, { replace: true });
            return;
          }
        } else if (backupInviteId) {
          // 백업 inviteId가 있으면 공동적금 가입 페이지로 이동
          console.log('🚀 [useLogin-이미로그인] 백업 inviteId로 공동적금 가입 페이지로 이동:', backupInviteId);
          console.log('🚀 이동할 경로:', `/joint-savings/signup/${backupInviteId}`);
          sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
          navigate(`/joint-savings/signup/${backupInviteId}`, { replace: true });
          return;
        } else if (coupleInviteToken) {
          // 배우자 초대 토큰이 있으면 연동 수락 화면으로 이동
          console.log('🔍 이미 로그인된 사용자 - 배우자 초대 화면으로 이동:', coupleInviteToken);
          sessionStorage.removeItem('coupleInviteToken');
          navigate(`/invite/${coupleInviteToken}`, { replace: true });
          return;
        } else {
          // 마지막 수단: URL 파라미터 체크
          const currentUrl = window.location.href;
          const urlParams = new URLSearchParams(window.location.search);
          const urlInviteId = urlParams.get('inviteId');
          const urlType = urlParams.get('type');
          
          console.log('🚀 [useLogin-이미로그인] 최종 체크');
          console.log('🚀 현재 URL:', currentUrl);
          console.log('🚀 URL 파라미터 inviteId:', urlInviteId);
          console.log('🚀 URL 파라미터 type:', urlType);
          
          // URL 파라미터에 공동적금 초대 정보가 있다면
          if (urlInviteId && urlType === 'joint-savings') {
            console.log('🚀 [useLogin-이미로그인] URL 파라미터 기반 공동적금 가입 페이지로 이동');
            navigate(`/joint-savings/signup/${urlInviteId}`, { replace: true });
            return;
          }
          
          console.log('🚀 [useLogin-이미로그인] 홈페이지로 이동 (기본값)');
          console.log('🚀 pendingInviteUrl 없음, coupleInviteToken 없음, 백업 inviteId 없음');
          navigate("/", { replace: true });
        }
      }
    }, 100); // 100ms 지연

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // 에러 메시지 초기화
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔥 로그인 폼 제출됨');
    console.log('🔥 현재 formData:', formData);
    
    // formData가 존재하는지 확인
    if (!formData) {
      console.error('❌ formData가 undefined입니다!');
      setError('폼 데이터가 없습니다.');
      return;
    }

    // 폼 유효성 검사
    const validation = validateLoginForm(formData.email, formData.password);
    if (!validation.isValid) {
      console.log('❌ 폼 유효성 검사 실패:', validation.error);
      setError(validation.error);
      return;
    }

    console.log('✅ 폼 유효성 검사 통과, API 호출 시작');
    setIsLoading(true);
    setError("");

    try {
      // API 호출
      console.log('로그인 API 호출 시작:', { email: formData.email, password: formData.password });
      const responseData = await authService.login(formData.email, formData.password);
      console.log('로그인 API 응답:', responseData);

      if (responseData.success) {
        console.log('🚀 [useLogin] 로그인 API 성공');
        
        // JWT 토큰과 사용자 정보를 저장
        setAuthTokens(responseData.data);
        console.log('🚀 토큰 저장 완료');

        // 로그인 성공 메시지 및 이전 페이지 또는 홈페이지로 이동
        toast.success(`${responseData.data.user.userNm}님, 환영합니다! 🎉`, {
          duration: 3000,
        });
        
        console.log('🚀 토스트 메시지 표시 완료');
        
        // 세션에 저장된 returnUrl이 있으면 해당 페이지로, 없으면 홈페이지로 이동
        let returnUrl = null;
        let pendingInviteUrl = null;
        let coupleInviteToken = null;
        let backupInviteId = null;
        
        // sessionStorage 접근 가능 여부 확인 (시크릿 모드 대응)
        try {
          returnUrl = sessionStorage.getItem('returnUrl');
          pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
          coupleInviteToken = sessionStorage.getItem('coupleInviteToken');
          backupInviteId = sessionStorage.getItem('JOINT_SAVINGS_INVITE_ID');
        } catch (e) {
          console.warn('🚨 sessionStorage 접근 실패 (시크릿 모드일 수 있음)');
        }
        
        console.log('🚀 [useLogin] 로그인 성공 후 리다이렉트 확인');
        console.log('🚀 returnUrl:', returnUrl);
        console.log('🚀 pendingInviteUrl:', pendingInviteUrl);
        console.log('🚀 coupleInviteToken:', coupleInviteToken);
        console.log('🚀 백업 JOINT_SAVINGS_INVITE_ID:', backupInviteId);
        
        console.log('🚀 전체 sessionStorage:', {
          returnUrl: sessionStorage.getItem('returnUrl'),
          pendingInviteUrl: sessionStorage.getItem('pendingInviteUrl'),
          coupleInviteToken: sessionStorage.getItem('coupleInviteToken'),
          JOINT_SAVINGS_INVITE_ID: sessionStorage.getItem('JOINT_SAVINGS_INVITE_ID')
        });
        
        if (pendingInviteUrl) {
          // 공동적금 초대 링크인지 확인
          if (pendingInviteUrl.includes('/joint-savings/accept/')) {
            // 공동적금 가입 페이지로 이동
            const inviteId = pendingInviteUrl.split('/joint-savings/accept/')[1];
            console.log('🚀 [useLogin] 공동적금 가입 페이지로 이동:', inviteId);
            console.log('🚀 이동할 경로:', `/joint-savings/signup/${inviteId}`);
            sessionStorage.removeItem('pendingInviteUrl');
            sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
            console.log('🚀 pendingInviteUrl 제거 완료');
            // 약간의 지연을 두어 확실한 이동 보장
            setTimeout(() => {
              console.log('🚀 navigate 실행:', `/joint-savings/signup/${inviteId}`);
              navigate(`/joint-savings/signup/${inviteId}`, { replace: true });
            }, 100);
          } else {
            // 초대 링크가 있으면 해당 페이지로 이동
            console.log('🔍 일반 초대 링크로 이동:', pendingInviteUrl);
            sessionStorage.removeItem('pendingInviteUrl');
            setTimeout(() => {
              navigate(pendingInviteUrl, { replace: true });
            }, 100);
          }
        } else if (backupInviteId) {
          // 백업 inviteId가 있으면 공동적금 가입 페이지로 이동
          console.log('🚀 [useLogin] 백업 inviteId로 공동적금 가입 페이지로 이동:', backupInviteId);
          console.log('🚀 이동할 경로:', `/joint-savings/signup/${backupInviteId}`);
          sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
          setTimeout(() => {
            console.log('🚀 navigate 실행 (백업):', `/joint-savings/signup/${backupInviteId}`);
            navigate(`/joint-savings/signup/${backupInviteId}`, { replace: true });
          }, 100);
        } else if (coupleInviteToken) {
          // 배우자 초대 토큰이 있으면 연동 수락 화면으로 이동
          console.log('🔍 배우자 초대 화면으로 이동:', coupleInviteToken);
          sessionStorage.removeItem('coupleInviteToken');
          setTimeout(() => {
            navigate(`/invite/${coupleInviteToken}`, { replace: true });
          }, 100);
        } else if (returnUrl && returnUrl !== '/mypage') {
          console.log('🔍 returnUrl로 이동:', returnUrl);
          sessionStorage.removeItem('returnUrl');
          setTimeout(() => {
            navigate(returnUrl, { replace: true });
          }, 100);
        } else {
          // 마지막 수단: URL 파라미터 체크 + localStorage 기반 체크
          const currentUrl = window.location.href;
          const urlParams = new URLSearchParams(window.location.search);
          const urlInviteId = urlParams.get('inviteId');
          const urlType = urlParams.get('type');
          
          console.log('🚀 [useLogin] 최종 체크');
          console.log('🚀 현재 URL:', currentUrl);
          console.log('🚀 URL 파라미터 inviteId:', urlInviteId);
          console.log('🚀 URL 파라미터 type:', urlType);
          
          // URL 파라미터에 공동적금 초대 정보가 있다면
          if (urlInviteId && urlType === 'joint-savings') {
            console.log('🚀 [useLogin] URL 파라미터 기반 공동적금 가입 페이지로 이동');
            setTimeout(() => {
              navigate(`/joint-savings/signup/${urlInviteId}`, { replace: true });
            }, 100);
            return;
          }
          
          // 추가 백업: localStorage에서 최근 접속한 초대 링크 확인
          try {
            const recentInviteUrl = localStorage.getItem('recentJointSavingsInvite');
            if (recentInviteUrl && recentInviteUrl.includes('/joint-savings/accept/')) {
              const inviteId = recentInviteUrl.split('/joint-savings/accept/')[1].split('?')[0].split('#')[0];
              console.log('🚀 [useLogin] localStorage 기반 공동적금 가입 페이지로 이동:', inviteId);
              localStorage.removeItem('recentJointSavingsInvite');
              setTimeout(() => {
                navigate(`/joint-savings/signup/${inviteId}`, { replace: true });
              }, 100);
              return;
            }
          } catch (e) {
            console.warn('localStorage 접근 실패');
          }
          
          console.log('🚀 [useLogin] 홈페이지로 이동 (기본값)');
          console.log('🚀 pendingInviteUrl 없음, coupleInviteToken 없음, returnUrl 없음');
          setTimeout(() => {
            console.log('🚀 navigate 실행: 홈페이지 (/)');
            navigate("/", { replace: true });
          }, 100);
        }
      } else {
        throw new Error(responseData.message || "로그인에 실패했습니다.");
      }

    } catch (error) {
      console.error("로그인 오류:", error);
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotId = () => {
    // 아이디 찾기 로직
    toast.info("아이디 찾기 기능은 준비 중입니다.");
  };

  const handleForgotPassword = () => {
    // 비밀번호 찾기 로직
    toast.info("비밀번호 찾기 기능은 준비 중입니다.");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return {
    formData,
    showPassword,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
    handleForgotId,
    handleForgotPassword,
    handleSignup
  };
};
