import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp, DollarSign, TrendingUp, Building, CheckCircle, Target, Calendar, AlertCircle, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PortfolioProductDetails from './PortfolioProductDetails';

const PortfolioPlanCard = ({
  plan,
  getPlanTypeColor,
  getPlanTypeIcon,
  formatPlanCurrency,
  getComparisonStatusColor,
  getComparisonStatusText,
  handleDeletePlan,
  fetchProductDetails,
  getProductDetails,
  isProductDetailsLoading,
  getProductDetailsError
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState({
    savings: null,
    loan: null,
    loading: false,
    error: null
  });

  // 상품 정보를 가져오는 함수
  const fetchProductDetailsFromAPI = async () => {
    if (!plan.savingsId && !plan.loanId) return;
    
    setProductDetails(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const promises = [];
      
      // 적금 상품 조회
      if (plan.savingsId) {
        promises.push(
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/financial-products/${plan.savingsId}`)
            .then(res => res.json())
            .then(data => ({ type: 'savings', data }))
        );
      }
      
      // 대출 상품 조회
      if (plan.loanId) {
        promises.push(
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/financial-products/${plan.loanId}`)
            .then(res => res.json())
            .then(data => ({ type: 'loan', data }))
        );
      }
      
      const results = await Promise.all(promises);
      
      const newProductDetails = {
        savings: null,
        loan: null,
        loading: false,
        error: null
      };
      
      results.forEach(result => {
        if (result.type === 'savings') {
          newProductDetails.savings = result.data;
        } else if (result.type === 'loan') {
          newProductDetails.loan = result.data;
        }
      });
      
      setProductDetails(newProductDetails);
    } catch (error) {
      console.error('상품 정보 조회 오류:', error);
      setProductDetails(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  // 확장될 때 상품 정보 가져오기
  useEffect(() => {
    if (isExpanded && (!productDetails.savings && !productDetails.loan) && !productDetails.loading) {
      fetchProductDetailsFromAPI();
    }
  }, [isExpanded]);

  // 가입신청 버튼 클릭 핸들러
  const handleApplyProduct = (productType, productId) => {
    if (productType === 'SAVING') {
      navigate(`/product/savings/${productId}`);
    } else if (productType === 'LOAN') {
      navigate(`/product/loans/${productId}`);
    }
  };

  // createdAt 배열을 날짜 문자열로 변환하는 함수
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "날짜 없음";
    
    // 배열 형태인 경우
    if (Array.isArray(createdAt) && createdAt.length >= 6) {
      const [year, month, day, hour, minute, second] = createdAt;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '.').replace(/\s/g, '');
    }
    
    // 문자열이나 다른 형태인 경우
    try {
      const date = new Date(createdAt);
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

  return (
    <div className="group bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 overflow-hidden mx-auto">
      {/* 플랜 헤더 - 컴팩트한 디자인 */}
      <div
        className={`bg-gradient-to-r from-${getPlanTypeColor(
          plan.planType
        )}-400 to-${getPlanTypeColor(
          plan.planType
        )}-600 p-4 text-white cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPlanTypeIcon(plan.planType)}</span>
            <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    {plan.planType}
                  </span>
                </div>
              <h3 className="text-lg font-bold line-clamp-1">
                {plan.planName || `주택관리번호: ${plan.houseMngNo}`}
              </h3>
              <p className="text-xs opacity-90">
                저장일: {formatCreatedAt(plan.createdAt)} | 주택번호:{" "}
                {plan.houseMngNo}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePlan(plan);
              }}
              className="p-2 text-white hover:text-red-200 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="플랜 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div
              className={`transform transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 확장된 내용 - 컴팩트 버전 */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-fadeIn bg-gradient-to-br from-gray-50 to-white">
          {/* 핵심 정보만 간단히 표시 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-[gray-600] font-medium">
                  대출금액
                </span>
              </div>
              <p className="text-sm font-bold text-[#009071]">
                {formatPlanCurrency(plan.loanAmount)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-600 font-medium">
                  월적금액
                </span>
              </div>
              <p className="text-sm font-bold text-[#009071]">
                {formatPlanCurrency(plan.requiredMonthlySaving)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-800 font-medium">
                  입주시적금
                </span>
              </div>
              <p className="text-sm font-bold text-[#009071]">
                {formatPlanCurrency(plan.totalSavingAtMoveIn)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-[gray-600] font-medium">
                  충당가능액
                </span>
              </div>
              <p className="text-sm font-bold text-[#009071]">
                {formatPlanCurrency(plan.shortfallCovered)}
              </p>
            </div>
          </div>

          {/* 상태*/}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 bg-${getComparisonStatusColor(
                  plan.comparisonStatus
                )}-100 text-${getComparisonStatusColor(
                  plan.comparisonStatus
                )}-700 text-xs font-medium rounded-full`}
              >
                {getComparisonStatusText(plan.comparisonStatus)}
              </span>
              <span className="text-xs text-gray-500">
                희망 월적금: {formatPlanCurrency(plan.desiredMonthlySaving)}
              </span>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">추천 상품</h4>
              <span className="text-xs text-gray-500">상품 유형</span>
            </div>
            <div className="space-y-2">
              {productDetails.loading ? (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#009071] mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-1">
                    상품 정보 로딩 중...
                  </p>
                </div>
              ) : productDetails.error ? (
                <div className="text-xs text-red-500 text-center py-2">
                  상품 정보 조회 실패
                </div>
              ) : (
                <>
                  {/* 적금 상품 */}
                  {productDetails.savings && productDetails.savings.success && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-700 truncate flex-1 mr-2">
                        {productDetails.savings.data?.productName ||
                          "적금 상품"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#009071]">
                          {productDetails.savings.data
                            ?.productTypeDescription || "적금"}
                        </span>
                        <button
                          onClick={() =>
                            handleApplyProduct(
                              "SAVING",
                              productDetails.savings.data.productId
                            )
                          }
                          className="px-2 py-1 bg-[#009071] hover:bg-[#007a5f] text-white text-xs rounded-md transition-colors"
                        >
                          가입신청
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 대출 상품 */}
                  {productDetails.loan && productDetails.loan.success && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-700 truncate flex-1 mr-2">
                        {productDetails.loan.data?.productName || "대출 상품"}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#009071]">
                          {productDetails.loan.data?.productTypeDescription ||
                            "대출"}
                        </span>
                        <button
                          onClick={() =>
                            handleApplyProduct(
                              "LOAN",
                              productDetails.loan.data.productId
                            )
                          }
                          className="px-2 py-1 bg-[#009071] hover:bg-[#007a5f] text-white text-xs rounded-md transition-colors"
                        >
                          가입신청
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 상품이 없는 경우 */}
                  {(!productDetails.savings ||
                    !productDetails.savings.success) &&
                    (!productDetails.loan || !productDetails.loan.success) && (
                      <div className="text-xs text-gray-500 text-center py-2">
                        상품 정보 없음
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPlanCard;
