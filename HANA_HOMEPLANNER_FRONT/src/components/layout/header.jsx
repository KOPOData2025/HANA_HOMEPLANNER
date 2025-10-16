import { useState, useEffect } from "react"
import { ChevronDown, Search, Menu, X, MessageSquare, LogOut, User, Calendar } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { isLoggedIn, getUser, logout } from "@/lib/auth"

export function Header({ currentPage = "home" }) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = isLoggedIn()
      const user = getUser()
      setUserLoggedIn(loggedIn)
      setCurrentUser(user)
    }

    checkAuthStatus()
    
    // 인증 상태 변경 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시 즉시 반영)
    window.addEventListener('authStateChanged', checkAuthStatus)
    
    // localStorage 변경 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시 반영)
    window.addEventListener('storage', checkAuthStatus)
    
    return () => {
      window.removeEventListener('authStateChanged', checkAuthStatus)
      window.removeEventListener('storage', checkAuthStatus)
    }
  }, [])

  // 로그아웃 처리
  const handleLogout = () => {
    logout()
    toast.success("로그아웃되었습니다. 👋", {
      duration: 2000,
    })
    navigate("/")
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b-2 border-[#009071]">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center px-24 py-4 gap-12 w-full h-20">
        {/* 로고 좌측 배치 */}
        <Link
          to="/"
          className="flex items-center flex-shrink-0"
        >
          <img
            src="/logo/main-logo.png"
            alt="하나 홈 플래너 로고"
            className="h-24 object-contain"
          />
        </Link>

        {/* 메뉴 중앙 배치 */}
        <nav className="flex items-center gap-8 flex-1 justify-center">
          <Link
            to="/market-analysis"
            className={`font-medium text-base ${
              currentPage === "market-analysis"
                ? "text-teal-600"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            청약 지도
          </Link>
          <Link
            to="/loan-inquiry"
            className={`font-medium text-base ${
              currentPage === "loan-inquiry"
                ? "text-teal-600"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            맞춤 대출
          </Link>
          <Link
            to="/portfolio-recommendation"
            className={`font-medium text-base ${
              currentPage === "portfolio-recommendation"
                ? "text-teal-600"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            홈 플랜
          </Link>
          <Link
            to="/my-calendar"
            className={`font-medium text-base ${
              currentPage === "my-calendar"
                ? "text-teal-600"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            마이캘린더
          </Link>
          <Link
            to="/mypage"
            className={`font-medium text-base ${
              currentPage === "mypage"
                ? "text-teal-600"
                : "text-gray-700 hover:text-teal-600"
            }`}
          >
            마이페이지
          </Link>
        </nav>

        {/* 버튼들 우측 배치 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* 메시지와 검색 버튼 */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 로그인/로그아웃 버튼 */}
          <div className="flex items-center gap-2">
            {userLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {currentUser?.userNm}님
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm text-gray-700 hover:text-teal-600 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <img
            src="/logo/main-logo.png"
            alt="하나 홈 플래너 로고"
            className="h-8 object-contain"
          />
        </div>
        <button
          className="p-2 hover:bg-gray-100 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white w-full sm:w-80 h-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center">
                <img
                  src="/logo/main-logo.png"
                  alt="하나 홈 플래너 로고"
                  className="h-8 object-contain"
                />
              </div>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-4">
              <Link
                to="/market-analysis"
                className={`block w-full text-left py-3 font-medium text-base ${
                  currentPage === "market-analysis"
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                청약 지도
              </Link>
              <Link
                to="/loan-inquiry"
                className={`block w-full text-left py-3 font-medium text-base ${
                  currentPage === "loan-inquiry"
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                맞춤 대출
              </Link>
              <Link
                to="/portfolio-recommendation"
                className={`block w-full text-left py-3 font-medium text-base ${
                  currentPage === "portfolio-recommendation"
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                홈 플랜
              </Link>
              <Link
                to="/my-calendar"
                className={`block w-full text-left py-3 font-medium text-base ${
                  currentPage === "my-calendar"
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                마이캘린더
              </Link>
              <Link
                to="/mypage"
                className={`block w-full text-left py-3 font-medium text-base ${
                  currentPage === "mypage"
                    ? "text-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                마이페이지
              </Link> 
              <div className="border-t pt-4 mt-4">
                {userLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 py-2">
                      <User className="w-5 h-5 text-teal-600" />
                      <span className="font-semibold text-gray-800">{currentUser?.userNm}님</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`block w-full text-left py-3 font-medium text-base ${
                        currentPage === "login"
                          ? "text-teal-600"
                          : "text-gray-700 hover:text-teal-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-left py-3 bg-teal-600 text-white rounded-lg mt-2 text-center font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 