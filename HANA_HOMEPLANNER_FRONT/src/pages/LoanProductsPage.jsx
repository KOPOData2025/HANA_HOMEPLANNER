import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { useLoanProducts } from '@/hooks/useLoanProducts';
import { useNavigate } from 'react-router-dom';
import ProductRecommendationBanner from '@/components/common/ProductRecommendationBanner';
import { 
  Calculator, 
  RefreshCw, 
  Building2, 
  ArrowRight, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  Target,
  ChevronRight,
  Home,
  CreditCard
} from 'lucide-react';

const LoanProductsPage = () => {
  const navigate = useNavigate();
  const { 
    loanProducts, 
    isLoading, 
    refreshLoanProducts,
    getProductIcon,
    getProductColor,
    getProductDescription,
    getProductTags
  } = useLoanProducts();

  // 상품 추천 배너 상태
  const [showRecommendationBanner, setShowRecommendationBanner] = useState(true);
  const [recommendedProductId, setRecommendedProductId] = useState(null); // 추천할 상품 ID

  // 상품 데이터가 로드되면 추천 상품 선택
  useEffect(() => {
    if (loanProducts.length > 0 && !recommendedProductId) {
      // 우선순위에 따라 추천 상품 선택
      let selectedProduct = null;
      
      // 1순위: 신생아 특례 상품
      selectedProduct = loanProducts.find(product => 
        product.productName.includes('신생아') || product.productName.includes('특례')
      );
      
      // 2순위: 신혼부부 상품
      if (!selectedProduct) {
        selectedProduct = loanProducts.find(product => 
          product.productName.includes('신혼부부')
        );
      }
      
      // 3순위: 생애최초 상품
      if (!selectedProduct) {
        selectedProduct = loanProducts.find(product => 
          product.productName.includes('생애최초')
        );
      }
      
      // 4순위: 첫 번째 상품
      if (!selectedProduct) {
        selectedProduct = loanProducts[0];
      }
      
      if (selectedProduct) {
        setRecommendedProductId(selectedProduct.productId);
        console.log('🎯 추천 대출 상품 선택:', selectedProduct.productName, selectedProduct.productId);
      }
    }
  }, [loanProducts, recommendedProductId]);

  // 상세 페이지 이동 함수
  const handleNavigateToDetail = (productId, productType) => {
    if (productType === 'savings') {
      navigate(`/product/savings/${productId}`);
    } else if (productType === 'loan') {
      navigate(`/product/loan/${productId}`);
    }
  };

  return (
    <Layout currentPage="loan-inquiry">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 헤더 섹션 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              하나 홈 플래너 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}대출 상품 목록
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              내 집 마련의 꿈을 실현할 수 있는 다양한 대출 상품을 만나보세요.
              <br />
              생애주기별 맞춤 대출로 합리적인 주택 구입을 지원합니다.
            </p>

            {/* 상품 추천 배너 */}
            {showRecommendationBanner && recommendedProductId && (
              <ProductRecommendationBanner
                productId={recommendedProductId}
                productType="loan"
                products={loanProducts}
                onClose={() => setShowRecommendationBanner(false)}
                onNavigateToDetail={handleNavigateToDetail}
                className="max-w-6xl mx-auto"
              />
            )}

            {/* 통계 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mx-auto">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{loanProducts.length}</h3>
                <p className="text-sm text-gray-600">대출 상품</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">정책</h3>
                <p className="text-sm text-gray-600">우대 대출</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">맞춤형</h3>
                <p className="text-sm text-gray-600">상품 추천</p>
              </div>
            </div>

            {/* 새로고침 버튼 */}
            <button
              onClick={refreshLoanProducts}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '상품 정보 업데이트 중...' : '상품 정보 새로고침'}
            </button>
          </div>

          {/* 대출 시뮬레이션 광고 섹션 */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 mb-6 md:mb-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">대출 시뮬레이션</h3>
                      <p className="text-blue-100">내 조건에 맞는 대출을 미리 계산해보세요</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2 text-blue-100">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">개인 맞춤 대출 한도 계산</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-100">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">월 상환액 및 이자 시뮬레이션</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-100">
                      <Home className="w-4 h-4" />
                      <span className="text-sm">내집마련 포트폴리오 추천</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <button
                    onClick={() => navigate('/loan-inquiry')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-lg"
                  >
                    <span>대출 시뮬레이션 시작</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="text-xs text-blue-100 mt-2 text-center">무료 · 간편 · 즉시 확인</p>
                </div>
              </div>
            </div>
          </div>

          {/* 상품 목록 */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">대출 상품을 불러오는 중...</h3>
              <p className="text-gray-600">잠시만 기다려주세요</p>
            </div>
          ) : loanProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">대출 상품이 없습니다</h3>
              <p className="text-gray-600 mb-6">현재 이용 가능한 대출 상품이 없습니다</p>
              <button
                onClick={refreshLoanProducts}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                다시 시도하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loanProducts.map((product) => (
                <div
                  key={product.productId}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
                >
                  {/* 카드 헤더 */}
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getProductIcon(product.productName)}</span>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                              {product.productTypeDescription}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-yellow-300 fill-current" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {product.productName}
                    </h3>
                    
                    <p className="text-sm opacity-90 line-clamp-2">
                      {getProductDescription(product)}
                    </p>
                  </div>

                  {/* 카드 본문 */}
                  <div className="p-6">
                    {/* 은행 정보 */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.bank.bankName}</p>
                        <p className="text-sm text-gray-500">은행코드: {product.bank.bankCode}</p>
                      </div>
                    </div>

                    {/* 상품 정보 */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">상품 ID</span>
                        <span className="text-sm font-medium text-gray-800">{product.productId}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">상품 유형</span>
                        <span className="text-sm font-medium text-gray-800">{product.productType}</span>
                      </div>
                    </div>

                    {/* 특징 태그 */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {/* 공동 대출 태그 */}
                      {product.productType === 'JOINT_LOAN' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          공동대출 가능
                        </span>
                      )}
                      
                      {getProductTags(product.productName, product.productType).map((tag, index) => (
                        <span 
                          key={index}
                          className={`px-3 py-1 bg-${tag.color}-100 text-${tag.color}-700 text-xs font-medium rounded-full`}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          navigate(`/product/loans/${product.productId}`);
                          // 페이지 이동 후 스크롤을 최상단으로 이동
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 100);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center group"
                      >
                        상품 상세보기
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <button className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors font-medium flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2" />
                        대출 상담 예약
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 하단 안내 */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6 mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                책임감 있는 대출, 하나은행과 함께
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                모든 대출 상품은 금융감독원 규정에 따라 엄격하게 관리됩니다.
                <br />
                개인의 상환 능력을 고려한 합리적인 대출을 제공합니다.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>금융감독원 인가</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>신용등급 A+</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>경쟁력 있는 금리</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanProductsPage;
