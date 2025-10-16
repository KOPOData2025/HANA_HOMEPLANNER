import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import {
  Home,
  Edit3,
  FileText,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  MapPin,
  Building,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar as CalendarIcon,
  Heart,
  Trash2,
  RefreshCw,
  MessageCircle,
  Target,
  PiggyBank,
} from "lucide-react";
import {
  useHouseLikes,
  useAssets,
  useCoupleInvite,
  useCoupleStatus,
  useAccounts,
  useAccountDetail,
  useLoanApplications,
  useLoanAccountDetail,
} from "@/hooks";
import { useCapitalPlanSelections } from "@/hooks/useCapitalPlanSelections";
import { usePortfolioProductDetails } from "@/hooks/usePortfolioProductDetails";
import DeleteConfirmModal from "@/components/portfolio/DeleteConfirmModal";
import PortfolioProductDetails from "@/components/portfolio/PortfolioProductDetails";
import PortfolioPlanCard from "@/components/portfolio/PortfolioPlanCard";
import {
  AssetsSummaryCard,
  AssetsBreakdownCard,
  AssetsChartCard,
  KakaoInviteButton,
  PartnerInfoCard,
  CoupleInviteCard,
  AccountsSummaryCard,
  AccountsListCard,
  AccountDetailCard,
  PaymentScheduleCard,
  TransactionHistoryCard,
  LoanRepaymentScheduleCard,
  LoanTransactionHistoryCard,
  LoanApplicationsSummaryCard,
  LoanApplicationsListCard,
} from "@/components";
import {
  UserInfoCard,
  AssetsOverviewCard,
  MyPageMenuGrid,
} from "@/components/mypage";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MyPage = () => {
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // 날짜 변환 함수
  const formatDate = (dateArray) => {
    if (!dateArray) return "알 수 없음";
    
    // 배열 형태인 경우
    if (Array.isArray(dateArray) && dateArray.length >= 6) {
      const [year, month, day, hour, minute, second] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '.').replace(/\s/g, '');
    }
    
    // 문자열이나 다른 형태인 경우
    try {
      const date = new Date(dateArray);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '.').replace(/\s/g, '');
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return "날짜 오류";
    }
  };


  // Section display state management
  const [activeSection, setActiveSection] = useState(null); // 'portfolio', 'housing', 'accounts', 'financial'

  // Account detail state
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [showAccountDetail, setShowAccountDetail] = useState(false);

  // JWT 토큰 확인 및 리다이렉트 (토스트 중복 방지)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("JWT 토큰이 없습니다. 로그인 페이지로 이동합니다.");
      // 마이페이지에서는 returnUrl을 설정하지 않음 (로그인 후 홈으로 이동)
      navigate("/login");
      return;
    }
  }, [navigate]);

  // 찜한 주택과 신청한 주택 훅 사용
  const {
    houseLikes,
    isLoading: likesLoading,
    removeLike,
    fetchHouseLikes,
  } = useHouseLikes();

  // 자산 정보 훅 사용
  const {
    assetsData,
    isLoading: assetsLoading,
    error: assetsError,
    getSummary,
    getAssetsDetails,
    getLiabilitiesDetails,
    getAnalysis,
    fetchAssetsData,
  } = useAssets();

  // 커플 초대 훅 사용
  const {
    isGenerating,
    inviteLink,
    generateInviteLink,
    copyInviteLink,
    getInviteLinkForShare,
  } = useCoupleInvite();

  // 커플 연동 상태 훅 사용
  const {
    coupleStatus,
    partnerInfo,
    isLoading: coupleLoading,
    isCoupleConnected,
    isCoupleActive,
    refreshCoupleStatus,
  } = useCoupleStatus();

  // 계좌 정보 훅 사용
  const {
    accounts,
    isLoading: accountsLoading,
    error: accountsError,
    fetchAccounts,
    getAccountStats,
    formatCurrency: formatAccountCurrency,
    formatAccountNumber,
    formatDate: formatAccountDate,
    getAccountTypeIcon,
    getAccountTypeColor,
  } = useAccounts();

  // 계좌 상세 정보 훅 사용
  const {
    accountDetail,
    isLoading: accountDetailLoading,
    error: accountDetailError,
    fetchAccountDetail,
    clearAccountDetail,
    getPaymentSummary,
    getTransactionSummary,
    getSavingsSummary,
  } = useAccountDetail();

  // 대출 신청 목록 훅 사용
  const {
    applications: loanApplications,
    isLoading: loanApplicationsLoading,
    error: loanApplicationsError,
    fetchLoanApplications,
    getApplicationStats,
    formatCurrency: formatLoanCurrency,
    formatDate: formatLoanDate,
    formatTerm,
    getStatusBadgeColor,
  } = useLoanApplications();

  // 대출 계좌 상세 정보 훅 사용
  const {
    loanAccountDetail,
    isLoading: loanAccountDetailLoading,
    error: loanAccountDetailError,
    fetchLoanAccountDetail,
    clearLoanAccountDetail,
    getRepaymentSummary,
    getTransactionSummary: getLoanTransactionSummary,
    getNextRepayment,
  } = useLoanAccountDetail();

  // 포트폴리오 플랜 선택 훅
  const {
    planSelections,
    isLoading: planSelectionsLoading,
    refreshPlanSelections,
    deletePlanSelection,
    getPlanTypeColor,
    getPlanTypeIcon,
    getComparisonStatusColor,
    getComparisonStatusText,
    formatNumber,
    formatCurrency: formatPlanCurrency,
  } = useCapitalPlanSelections();

  // 포트폴리오 금융상품 상세정보 훅
  const {
    fetchProductDetails,
    getProductDetails,
    isProductDetailsLoading,
    getProductDetailsError,
  } = usePortfolioProductDetails();

  // 초대 링크 상태 디버깅
  useEffect(() => {
    console.log("🔗 마이페이지 - inviteLink 상태:", inviteLink);
  }, [inviteLink]);

  // 저장된 플랜 데이터 로딩 (임시 데이터)
  useEffect(() => {
    const mockPlans = [
      {
        id: 1,
        houseName: "강남구 ○○ 아파트",
        houseType: "84㎡",
        region: "서울특별시 강남구",
        monthlyPayment: 1120000,
        dsr: 32.0,
        ltv: 46.4,
        interestRate: 4.1,
        planType: "BALANCED",
        planTypeName: "균형형",
        savedDate: "2025-01-09",
        isWon: false,
      },
      {
        id: 2,
        houseName: "송파구 △△ 아파트",
        houseType: "59㎡",
        region: "서울특별시 송파구",
        monthlyPayment: 890000,
        dsr: 28.5,
        ltv: 42.1,
        interestRate: 4.1,
        planType: "EASY",
        planTypeName: "여유형",
        savedDate: "2025-01-08",
        isWon: true,
      },
    ];

    setTimeout(() => {
      setSavedPlans(mockPlans);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 플랜 삭제 버튼 클릭 핸들러
  const handleDeletePlan = (plan) => {
    console.log("🔍 삭제 버튼 클릭됨 - 플랜:", plan);
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // 계좌 클릭 핸들러
  const handleAccountClick = (accountId) => {
    console.log("🔍 계좌 클릭됨 - 계좌 ID:", accountId);
    setSelectedAccountId(accountId);
    setShowAccountDetail(true);

    const clickedAccount = accounts.find(
      (account) => account.accountId === accountId
    );

    if (clickedAccount && clickedAccount.accountType === "LOAN") {
      console.log("🏦 대출 계좌 클릭됨 - 대출 상세 정보 조회");
      fetchLoanAccountDetail(accountId);
    } else {
      console.log("🏦 일반 계좌 클릭됨 - 일반 상세 정보 조회");
      fetchAccountDetail(accountId);
    }
  };

  // 계좌 상세 정보 닫기 핸들러
  const handleCloseAccountDetail = () => {
    setShowAccountDetail(false);
    setSelectedAccountId(null);
    clearAccountDetail();
    clearLoanAccountDetail();
  };

  // 삭제 확인 핸들러
  const handleConfirmDelete = async () => {
    console.log("🔍 삭제 확인 핸들러 호출됨");
    if (!planToDelete) {
      console.error("❌ 삭제할 플랜이 없습니다");
      return;
    }

    setIsDeletingPlan(true);

    try {
      console.log("🔍 삭제 API 호출 시작");
      const result = await deletePlanSelection(
        planToDelete.selectionId,
        planToDelete.planName || `주택번호: ${planToDelete.houseMngNo}`
      );

      console.log("🔍 삭제 API 응답:", result);

      if (result.success) {
        console.log("✅ 삭제 성공 - 모달 닫기");
        setIsDeleteModalOpen(false);
        setPlanToDelete(null);
      } else {
        console.error("❌ 삭제 실패:", result);
      }
    } catch (error) {
      console.error("❌ 플랜 삭제 처리 오류:", error);
    } finally {
      setIsDeletingPlan(false);
    }
  };

  // 삭제 모달 닫기 핸들러
  const handleCloseDeleteModal = () => {
    if (!isDeletingPlan) {
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  // 청약 상태별 아이콘과 색상 반환
  const getStatusInfo = (applyStatus) => {
    switch (applyStatus) {
      case "APPLY":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      case "REJECTED":
        return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" };
      case "PENDING":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
    }
  };

  const handleEdit = (planId) => {
    console.log("플랜 수정:", planId);
  };

  const handleDownloadPDF = (planId) => {
    console.log("PDF 다운로드:", planId);
  };

  const handleViewProducts = (planId) => {
    console.log("실제 상품 보기:", planId);
  };

  // 찜한 주택 삭제 핸들러
  const handleRemoveLike = async (houseId) => {
    const success = await removeLike(houseId);
    if (success) {
      console.log("찜한 주택이 삭제되었습니다.");
    }
  };

  // 찜한 주택 목록 새로고침
  const handleRefreshLikes = () => {
    fetchHouseLikes();
  };


  // 섹션 토글 함수들
  const handleTogglePortfolio = () => {
    setActiveSection(activeSection === "portfolio" ? null : "portfolio");
  };

  const handleToggleHousing = () => {
    setActiveSection(activeSection === "housing" ? null : "housing");
  };

  const handleToggleAccounts = () => {
    console.log("🏦 계좌 관리 버튼 클릭됨");
    setActiveSection(activeSection === "accounts" ? null : "accounts");
  };

  const handleToggleFinancial = () => {
    console.log("💰 금융 상품 버튼 클릭됨");
    const newSection = activeSection === "financial" ? null : "financial";
    setActiveSection(newSection);
    if (newSection === "financial" && loanApplications.length === 0) {
      fetchLoanApplications();
    }
  };

  if (isLoading) {
    return (
      <Layout currentPage="mypage">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">마이페이지를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="mypage">
      <div className="bg-gray-50 py-8">
        <div className="w-full px-80">
          {/* 상단 레이아웃 - 회원정보와 자산현황 */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
            {/* 좌측: 회원정보 (3/10) */}
            <div className="lg:col-span-3">
              <UserInfoCard
                isCoupleConnected={isCoupleConnected}
                partnerInfo={partnerInfo}
                getInviteLinkForShare={getInviteLinkForShare}
              />
            </div>

            {/* 우측: 자산현황 (7/10) */}
            <div className="lg:col-span-7">
              <AssetsOverviewCard
                assetsData={assetsData}
                isLoading={assetsLoading}
                error={assetsError}
                onRefresh={fetchAssetsData}
                getSummary={getSummary}
                getAnalysis={getAnalysis}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          {/* 하단 메뉴 그리드 */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                주요 기능
              </h2>
              <p className="text-gray-500 text-sm">
                빠르게 접근할 수 있는 주요 기능들입니다
              </p>
            </div>

            <MyPageMenuGrid
              planSelectionsCount={planSelections.length}
              houseLikesCount={houseLikes.length}
              accountsCount={accounts.length}
              onTogglePortfolio={handleTogglePortfolio}
              onToggleHousing={handleToggleHousing}
              onToggleAccounts={handleToggleAccounts}
              onToggleFinancial={handleToggleFinancial}
            />
          </div>

          {/* 포트폴리오 섹션 */}
          {activeSection === "portfolio" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="/mypage/portfolio.png"
                      alt="포트폴리오"
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      저장된 포트폴리오 플랜
                    </h2>
                    <p className="text-gray-500 text-sm">
                      나만의 맞춤 포트폴리오 플랜을 관리하세요
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    {planSelections.length}개
                  </span>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="닫기"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {planSelectionsLoading ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    포트폴리오 플랜을 불러오는 중...
                  </p>
                </div>
              ) : planSelections.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    저장된 포트폴리오 플랜이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm">
                    포트폴리오 추천을 받고 플랜을 저장해보세요
                  </p>
                  <button
                    onClick={() => navigate("/portfolio-recommendation")}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    포트폴리오 추천받기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                  {planSelections.map((plan) => (
                    <div key={plan.selectionId} className="flex justify-center">
                      <div className="w-full max-w-md">
                        <PortfolioPlanCard
                          plan={plan}
                          getPlanTypeColor={getPlanTypeColor}
                          getPlanTypeIcon={getPlanTypeIcon}
                          formatPlanCurrency={formatPlanCurrency}
                          getComparisonStatusColor={getComparisonStatusColor}
                          getComparisonStatusText={getComparisonStatusText}
                          handleDeletePlan={handleDeletePlan}
                          fetchProductDetails={fetchProductDetails}
                          getProductDetails={getProductDetails}
                          isProductDetailsLoading={isProductDetailsLoading}
                          getProductDetailsError={getProductDetailsError}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 청약 관리 섹션 */}
          {activeSection === "housing" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="/mypage/apply-home.png"
                      alt="청약 관리"
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      청약 관리
                    </h2>
                    <p className="text-gray-500 text-sm">
                      관심 청약을 관리하세요
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    관심 청약: {houseLikes.length}개
                  </span>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="닫기"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        관심 청약 목록
                      </h3>
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                        {houseLikes.length}개
                      </span>
                    </div>
                    <button
                      onClick={handleRefreshLikes}
                      disabled={likesLoading}
                      className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors disabled:opacity-50"
                      title="새로고침"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          likesLoading ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {likesLoading ? (
                    <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">
                        관심 청약 목록을 불러오는 중...
                      </p>
                    </div>
                  ) : houseLikes.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-800 mb-1">
                        관심 청약이 없습니다
                      </h4>
                      <p className="text-gray-600 text-xs mb-3">
                        관심 있는 청약을 등록해보세요
                      </p>
                      <button
                        onClick={() => navigate("/market-analysis")}
                        className="inline-flex items-center px-3 py-1.5 bg-[#009071] text-white text-xs rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        청약 둘러보기
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {houseLikes.slice(0, 4).map((house) => {
                        const houseInfo = house.houseInfo || {};
                        return (
                          <div
                            key={house.likeId}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                                    {houseInfo.houseName || "주택명 정보 없음"}
                                  </h4>
                                  <p className="text-xs text-gray-600 line-clamp-1">
                                    {houseInfo.supplyAddress ||
                                      "주소 정보 없음"}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveLike(house.houseManageNo)
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="찜하기 취소"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800">
                                    {houseInfo.houseTypeName || "APT"}
                                  </span>
                                  {houseInfo.totalSupplyHouseholds && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                      {houseInfo.totalSupplyHouseholds}세대
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(house.likedAt)}
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center space-x-3">
                                    {houseInfo.contractStartDate &&
                                      houseInfo.contractEndDate && (
                                        <span>
                                          계약:{" "}
                                          {new Date(
                                            houseInfo.contractStartDate
                                          ).toLocaleDateString("ko-KR")}{" "}
                                          ~{" "}
                                          {new Date(
                                            houseInfo.contractEndDate
                                          ).toLocaleDateString("ko-KR")}
                                        </span>
                                      )}
                                  </div>
                                  {houseInfo.moveInYearMonth && (
                                    <span>
                                      입주:{" "}
                                      {houseInfo.moveInYearMonth.substring(
                                        0,
                                        4
                                      )}
                                      년{" "}
                                      {houseInfo.moveInYearMonth.substring(
                                        4,
                                        6
                                      )}
                                      월
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 계좌 관리 섹션 */}
          {activeSection === "accounts" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="/mypage/bank-book.png"
                      alt="계좌 관리"
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      계좌 내역
                    </h2>
                    <p className="text-gray-500 text-sm">
                      나의 계좌 정보를 확인하고 관리하세요
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                    {accounts.length}개
                  </span>
                  <button
                    onClick={fetchAccounts}
                    disabled={accountsLoading}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                    title="새로고침"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        accountsLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="닫기"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {accountsLoading ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">계좌 정보를 불러오는 중...</p>
                </div>
              ) : accountsError ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    계좌 정보 조회 실패
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm">{accountsError}</p>
                  <button
                    onClick={fetchAccounts}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </button>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    등록된 계좌가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm">
                    아직 등록된 계좌가 없습니다
                  </p>
                  <button
                    onClick={fetchAccounts}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                  {/* 좌측: 계좌 현황 (5/10) */}
                  <div className="lg:col-span-1 h-full">
                    <AccountsSummaryCard
                      accountStats={getAccountStats()}
                      isLoading={accountsLoading}
                      onRefresh={fetchAccounts}
                      formatCurrency={formatAccountCurrency}
                    />
                  </div>
                  
                  {/* 우측: 계좌 목록 (5/10) */}
                  <div className="lg:col-span-1 h-full">
                    <AccountsListCard
                      accounts={accounts}
                      isLoading={accountsLoading}
                      formatCurrency={formatAccountCurrency}
                      formatAccountNumber={formatAccountNumber}
                      formatDate={formatAccountDate}
                      getAccountTypeIcon={getAccountTypeIcon}
                      getAccountTypeColor={getAccountTypeColor}
                      onAccountClick={handleAccountClick}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 금융 상품 섹션 */}
          {activeSection === "financial" && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src="/mypage/progress.png"
                      alt="금융 상품"
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      금융 상품 현황
                    </h2>
                    <p className="text-gray-500 text-sm">
                      적금과 대출 상품 현황을 확인하세요
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    적금 & 대출 상품
                  </span>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="닫기"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 대출 신청 현황 (좌측) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      대출 신청 현황
                    </h3>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                      대출 상품
                    </span>
                  </div>
                  
                  {loanApplications && loanApplications.length > 0 ? (
                    <div className="space-y-3">
                      {/* 대출 신청 목록 (최대 2개 표시, 스크롤 가능) */}
                      <div className="max-h-32 overflow-y-auto space-y-3 pr-2">
                        {loanApplications.map((application) => (
                          <div key={application.appId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">
                                  {formatLoanCurrency(application.requestAmount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTerm(application.requestTerm)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(application.status)}`}>
                                {application.statusDescription}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 승인된 대출 총 금액 요약 */}
                      {(() => {
                        const approvedLoans = loanApplications.filter(app => app.status === 'APPROVED');
                        const totalApprovedAmount = approvedLoans.reduce((sum, app) => sum + (app.requestAmount || 0), 0);
                        
                        return approvedLoans.length > 0 ? (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-800">승인된 대출 총액</span>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-red-600">
                                  {formatLoanCurrency(totalApprovedAmount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {approvedLoans.length}건 승인
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800 mb-2">대출 신청 내역이 없습니다</h4>
                      <p className="text-xs text-gray-500">아직 대출 신청 내역이 없습니다.</p>
                    </div>
                  )}
                </div>

                {/* 적금 현황 (우측) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      적금 현황
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      적금 상품
                    </span>
                  </div>
                  
                  {(() => {
                    // SAVING, JOINT_SAVING 계좌 필터링 및 잔액 합산
                    const savingsAccounts = accounts.filter(account => 
                      account.accountType === 'SAVING' || account.accountType === 'JOINT_SAVING'
                    );
                    const totalSavingsAmount = savingsAccounts.reduce((sum, account) => 
                      sum + (account.balance || 0), 0
                    );

                    return savingsAccounts.length > 0 ? (
                      <div className="space-y-3">
                        {/* 적금 계좌 목록 (최대 2개 표시, 스크롤 가능) */}
                        <div className="max-h-32 overflow-y-auto space-y-3 pr-2">
                          {savingsAccounts.map((account) => (
                            <div key={account.accountId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  account.status === 'MATURITY' ? 'bg-purple-500' : 'bg-green-500'
                                }`}></div>
                                <div>
                                  <p className="text-sm font-bold text-gray-800">
                                    {formatAccountCurrency(account.balance)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {account.accountTypeDescription}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                  account.status === 'MATURITY' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {account.status === 'MATURITY' ? '만기 완료' : account.statusDescription}
                                </span>
                                {account.status === 'MATURITY' && (
                                  <div className="mt-1">
                                    <span className="text-xs text-purple-600 font-medium">
                                      만기금 수령 가능
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* 총 적금액 요약 */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-800">총 적금액</span>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {formatAccountCurrency(totalSavingsAmount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {savingsAccounts.length}개 계좌
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-medium text-gray-800 mb-2">적금 계좌가 없습니다</h4>
                        <p className="text-xs text-gray-500">아직 적금 계좌가 없습니다.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 계좌 상세 정보 모달 */}
      {showAccountDetail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseAccountDetail}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">계좌 상세 정보</h2>
                <button
                  onClick={handleCloseAccountDetail}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* 일반 계좌 상세 정보 */}
              {accountDetail && !loanAccountDetail && (
                <AccountDetailCard
                  accountDetail={accountDetail}
                  isLoading={accountDetailLoading}
                  error={accountDetailError}
                  onClose={handleCloseAccountDetail}
                  formatCurrency={formatAccountCurrency}
                  formatDate={formatAccountDate}
                  formatAccountNumber={formatAccountNumber}
                  getPaymentSummary={getPaymentSummary}
                  getTransactionSummary={getTransactionSummary}
                  getSavingsSummary={getSavingsSummary}
                />
              )}
              
              {/* 대출 계좌 상세 정보 */}
              {loanAccountDetail && (
                <div className="space-y-6">
                  <LoanRepaymentScheduleCard
                    loanAccountDetail={loanAccountDetail}
                    isLoading={loanAccountDetailLoading}
                    error={loanAccountDetailError}
                    formatCurrency={formatAccountCurrency}
                    formatDate={formatAccountDate}
                    getRepaymentSummary={getRepaymentSummary}
                    getNextRepayment={getNextRepayment}
                  />
                  <LoanTransactionHistoryCard
                    loanAccountDetail={loanAccountDetail}
                    isLoading={loanAccountDetailLoading}
                    error={loanAccountDetailError}
                    formatCurrency={formatAccountCurrency}
                    formatDate={formatAccountDate}
                    getTransactionSummary={getLoanTransactionSummary}
                  />
                </div>
              )}
              
              {/* 로딩 상태 */}
              {(accountDetailLoading || loanAccountDetailLoading) && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">계좌 상세 정보를 불러오는 중...</p>
                </div>
              )}
              
              {/* 에러 상태 */}
              {(accountDetailError || loanAccountDetailError) && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">오류 발생</h3>
                  <p className="text-gray-600 mb-4">
                    {accountDetailError || loanAccountDetailError}
                  </p>
                  <button
                    onClick={handleCloseAccountDetail}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyPage;
