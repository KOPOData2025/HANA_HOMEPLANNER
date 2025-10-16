import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MarketAnalysisPage from './pages/MarketAnalysisPage'
import LoanInquiryPage from './pages/LoanInquiryPage'
import PortfolioRecommendationPage from './pages/PortfolioRecommendationPage'
import MyCalendarPage from './pages/MyCalendarPage'
import MyPage from './pages/MyPage'
import SavingsRecommendationPage from './pages/SavingsRecommendationPage'
import SavingsProductsPage from './pages/SavingsProductsPage'
import LoanProductsPage from './pages/LoanProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoanApplicationPage from './pages/LoanApplicationPage'
import SavingsSignupPage from './pages/SavingsSignupPage'
import InvitePage from './pages/InvitePage'
import JointSavingsInvitePage from './pages/JointSavingsInvitePage'
import JointSavingsInviteAcceptPage from './pages/JointSavingsInviteAcceptPage'
import JointSavingsSignupPage from './pages/JointSavingsSignupPage'
import JointLoanInvitePage from './pages/JointLoanInvitePage'

import SavingsAddressPage from './pages/SavingsAddressPage'
import { cleanupInvalidStorage } from './lib/auth'

import './globals.css'

function App() {
  // 앱 시작 시 잘못된 localStorage 값 정리
  useEffect(() => {
    cleanupInvalidStorage()
  }, [])

  // 토큰 만료 이벤트 리스너 등록
  useEffect(() => {
    const handleTokenExpired = (event) => {
      const { message } = event.detail
      toast.error(message, {
        duration: 5000,
        position: 'top-center',
      })
    }

    window.addEventListener('tokenExpired', handleTokenExpired)
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/market-analysis" element={<MarketAnalysisPage />} />
        <Route path="/loan-inquiry" element={<LoanInquiryPage />} />
        <Route
          path="/portfolio-recommendation"
          element={<PortfolioRecommendationPage />}
        />
        <Route path="/my-calendar" element={<MyCalendarPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route
          path="/savings-recommendation"
          element={<SavingsRecommendationPage />}
        />
        <Route path="/savings-products" element={<SavingsProductsPage />} />
        <Route path="/loan-products" element={<LoanProductsPage />} />
        <Route
          path="/product/:productType/:productId"
          element={<ProductDetailPage />}
        />
        <Route
          path="/loan-application/:productType/:productId"
          element={<LoanApplicationPage />}
        />
        <Route
          path="/savings-signup/:productType/:productId"
          element={<SavingsSignupPage />}
        />

        {/* 공동적금 초대 페이지 */}
        <Route
          path="/joint-savings-invite"
          element={<JointSavingsInvitePage />}
        />

        {/* 공동 대출 초대 페이지 */}
        <Route
          path="/register/invite/joint-loan"
          element={<JointLoanInvitePage />}
        />

        {/* 커플 초대 라우트 */}
        <Route path="/couple/invite/:inviteToken" element={<InvitePage />} />
        <Route path="/invite/:inviteToken" element={<InvitePage />} />
        <Route path="/invite" element={<InvitePage />} />

        {/* 공동적금 초대 수락 페이지 (별도 경로 사용) */}
        <Route
          path="/joint-savings/accept/:inviteId"
          element={<JointSavingsInviteAcceptPage />}
        />

        {/* 공동적금 가입 페이지 (새로운 가입 프로세스) */}
        <Route
          path="/joint-savings/signup/:inviteId"
          element={<JointSavingsSignupPage />}
        />

        <Route
          path="/savings-address/:savingsId"
          element={<SavingsAddressPage />}
        />
        <Route
          path="/savings-signup/:savingsId"
          element={<SavingsSignupPage />}
        />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            fontSize: "16px",
            fontWeight: "500",
            padding: "16px 20px",
            minWidth: "300px",
            maxWidth: "500px",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </Router>
  );
}

export default App 