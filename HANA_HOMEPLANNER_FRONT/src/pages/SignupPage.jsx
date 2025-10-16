import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/layout"
import { useNavigate, useSearchParams } from "react-router-dom"
import toast from 'react-hot-toast'

// 커스텀 훅
import { useSignup } from "@/hooks/useSignup"

// 서비스
import { authService } from "@/services/authService"

// 컴포넌트
import SignupForm from "@/components/auth/SignupForm"
import MyDataConsentForm from "@/components/auth/MyDataConsentForm"
import FinancialConnectionForm from "@/components/auth/FinancialConnectionForm"
import SignupCompleteForm from "@/components/auth/SignupCompleteForm"

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState('signup') // 'signup' | 'consent' | 'financial' | 'complete'
  const [signupData, setSignupData] = useState({})
  const [inviteToken, setInviteToken] = useState(null)

  // URL에서 초대 토큰 추출
  useEffect(() => {
    const token = searchParams.get('invite_token');
    if (token) {
      setInviteToken(token);
      console.log('회원가입 페이지 - 초대 토큰:', token);
    }
  }, [searchParams]);


  // 회원가입 완료 후 마이데이터 동의 단계로 이동
  const handleSignupComplete = (userData) => {
    console.log('회원가입 완료 데이터:', userData)
    setSignupData(prev => ({ ...prev, ...userData }))
    setCurrentStep('consent')
  }
  
  // 커스텀 훅 사용
  const {
    formData,
    errors,
    isLoading,
    showPassword,
    showPasswordConfirm,
    handleInputChange,
    handleSubmit,
    openAddressSearch,
    togglePasswordVisibility,
    togglePasswordConfirmVisibility
  } = useSignup(handleSignupComplete)

  // 마이데이터 동의 완료
  const handleConsentComplete = (consentData) => {
    console.log('마이데이터 동의 완료:', consentData)
    setSignupData(consentData)
    setCurrentStep('financial')
  }

  // 금융사 연결 완료 - 최종 API 호출
  const handleFinancialComplete = async (finalData) => {
    console.log('전체 회원가입 데이터:', finalData)
    
    try {
      // 최종 회원가입 API 호출
      const result = await authService.signup(finalData)
      
      console.log("최종 회원가입 API 응답:", result)

      if (result.success) {
        toast.success("회원가입이 완료되었습니다! 🎉", {
          duration: 3000,
        })

        // 초대 토큰이 있으면 성공 화면을 건너뛰고 바로 로그인 화면으로 이동
        if (inviteToken) {
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
        } else {
          // 일반 회원가입인 경우 성공 화면 표시
          const completeData = {
            ...finalData,
            userId: result.data?.userId,
            addrId: result.data?.addrId
          }
          
          setSignupData(completeData)
          setCurrentStep('complete')
        }
      } else {
        throw new Error(result.message || "회원가입에 실패했습니다.")
      }
    } catch (error) {
      console.error("최종 회원가입 오류:", error)
      const errorMessage = error.message || "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
      toast.error(errorMessage)
    }
  }

  // 회원가입에서 뒤로가기 (로그인 페이지로)
  const handleSignupBack = () => {
    navigate('/login')
  }


  // 마이데이터 동의에서 뒤로가기 (회원가입으로)
  const handleConsentBack = () => {
    setCurrentStep('signup')
  }

  // 금융사 연결에서 뒤로가기
  const handleFinancialBack = () => {
    setCurrentStep('consent')
  }

  // 회원가입 완료에서 뒤로가기
  const handleCompleteBack = () => {
    setCurrentStep('financial')
  }


  // 마이데이터 동의 화면 렌더링
  if (currentStep === 'consent') {
    return (
      <MyDataConsentForm 
        initialData={signupData}
        onComplete={handleConsentComplete}
        onBack={handleConsentBack}
      />
    )
  }

  // 금융사 연결 화면 렌더링
  if (currentStep === 'financial') {
    return (
      <FinancialConnectionForm 
        initialData={signupData}
        onComplete={handleFinancialComplete}
        onBack={handleFinancialBack}
      />
    )
  }

  // 회원가입 완료 화면 렌더링
  if (currentStep === 'complete') {
    return (
      <SignupCompleteForm 
        userData={signupData}
        onBack={handleCompleteBack}
      />
    )
  }

  return (
    <Layout currentPage="signup" backgroundColor="bg-gray-50">
      {/* Signup Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
            <p className="text-gray-600">하나 홈 플래너에 가입하고 스마트한 내 집 마련 서비스를 이용해보세요</p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <SignupForm
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              showPassword={showPassword}
              showPasswordConfirm={showPasswordConfirm}
              inviteToken={inviteToken}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onAddressSearch={openAddressSearch}
              onTogglePassword={togglePasswordVisibility}
              onTogglePasswordConfirm={togglePasswordConfirmVisibility}
              onBack={handleSignupBack}
            />

            {/* 로그인 링크 */}
            <div className="text-center text-sm mt-6">
              <span className="text-gray-600">이미 계정이 있으신가요? </span>
              <button 
                type="button" 
                onClick={() => navigate("/login")}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}