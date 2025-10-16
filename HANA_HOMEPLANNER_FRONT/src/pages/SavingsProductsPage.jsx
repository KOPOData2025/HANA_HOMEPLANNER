import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { useSavingsProducts } from '@/hooks/useSavingsProducts';
import ProductRecommendationBanner from '@/components/common/ProductRecommendationBanner';
import { 
  Sparkles, 
  RefreshCw, 
  Building2, 
  ArrowRight, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Search,
  Filter,
  Target,
  PiggyBank,
  Users,
  Heart,
  Zap,
  ChevronDown,
  CheckCircle,
  Award,
  Percent
} from 'lucide-react';

const SavingsProductsPage = () => {
  const navigate = useNavigate();
  const { 
    savingsProducts, 
    isLoading, 
    refreshSavingsProducts,
    getProductIcon,
    getProductColor,
    getProductDescription
  } = useSavingsProducts();

  // 상품 추천 배너 상태
  const [showRecommendationBanner, setShowRecommendationBanner] = useState(true);
  const [recommendedProductId, setRecommendedProductId] = useState('PROD064'); // 추천할 상품 ID

  // 필터링 및 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  // 카테고리 정의 (뱅크샐러드 스타일)
  const categories = [
    { id: 'all', name: '전체', icon: Sparkles, count: savingsProducts.length },
    { id: 'joint', name: '공동적금', icon: Users, count: savingsProducts.filter(p => p.productType === 'JOINT_SAVING').length },
    { id: 'youth', name: '청년우대', icon: Heart, count: savingsProducts.filter(p => p.productName.includes('청년')).length },
    { id: 'goal', name: '목표형', icon: Target, count: savingsProducts.filter(p => p.productName.includes('목표')).length },
    { id: 'regular', name: '정기적금', icon: PiggyBank, count: savingsProducts.filter(p => p.productName.includes('정기')).length }
  ];

  // 필터링된 상품 목록
  const filteredProducts = savingsProducts.filter(product => {
    // 검색어 필터
    const matchesSearch = searchTerm === '' || 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 카테고리 필터
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'joint':
          matchesCategory = product.productType === 'JOINT_SAVING';
          break;
        case 'youth':
          matchesCategory = product.productName.includes('청년');
          break;
        case 'goal':
          matchesCategory = product.productName.includes('목표');
          break;
        case 'regular':
          matchesCategory = product.productName.includes('정기');
          break;
        default:
          matchesCategory = true;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  // 상품 데이터가 로드되면 추천 상품 선택
  useEffect(() => {
    if (savingsProducts.length > 0 && !recommendedProductId) {
      // 우선순위에 따라 추천 상품 선택
      let selectedProduct = null;
      
      // 1순위: 공동 적금 상품
      selectedProduct = savingsProducts.find(product => product.productType === 'JOINT_SAVING');
      
      // 2순위: 청년 상품
      if (!selectedProduct) {
        selectedProduct = savingsProducts.find(product => 
          product.productName.includes('청년')
        );
      }
      
      // 3순위: 목표형 상품
      if (!selectedProduct) {
        selectedProduct = savingsProducts.find(product => 
          product.productName.includes('목표')
        );
      }
      
      // 4순위: 첫 번째 상품
      if (!selectedProduct) {
        selectedProduct = savingsProducts[0];
      }
      
      if (selectedProduct) {
        setRecommendedProductId(selectedProduct.productId);
        console.log('🎯 추천 상품 선택:', selectedProduct.productName, selectedProduct.productId);
      }
    }
  }, [savingsProducts, recommendedProductId]);

  // 상세 페이지 이동 함수
  const handleNavigateToDetail = (productId, productType) => {
    // 실제 상품 데이터에서 productType 확인
    const actualProduct = savingsProducts.find(p => p.productId === productId);
    const actualProductType = actualProduct?.productType;
    
    console.log('🔍 상세 페이지 이동:', { productId, productType, actualProductType });
    
    if (productType === 'savings') {
      navigate(`/product/savings/${productId}`);
    } else if (productType === 'loan') {
      navigate(`/product/loan/${productId}`);
    }
  };

  return (
    <Layout currentPage="savings">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* 뱅크샐러드 스타일 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  적금 상품
                </h1>
                <p className="text-gray-600">
                  목표 달성을 위한 맞춤형 적금 상품을 찾아보세요
                </p>
              </div>
              <button
                onClick={refreshSavingsProducts}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>

            {/* 상품 추천 배너 */}
            {showRecommendationBanner && recommendedProductId && (
              <ProductRecommendationBanner
                productId={recommendedProductId}
                productType="savings"
                products={savingsProducts}
                onClose={() => setShowRecommendationBanner(false)}
                onNavigateToDetail={handleNavigateToDetail}
                className="mb-6"
              />
            )}
          </div>

          {/* 검색 및 필터 섹션 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 검색바 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="적금 상품명으로 검색하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* 필터 버튼 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                필터
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 카테고리 탭 */}
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                      <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 고급 필터 (접을 수 있는 섹션) */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="recommended">추천순</option>
                      <option value="name">상품명순</option>
                      <option value="rate">금리순</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">최소 금리</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">전체</option>
                      <option value="1">1% 이상</option>
                      <option value="2">2% 이상</option>
                      <option value="3">3% 이상</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가입 기간</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">전체</option>
                      <option value="12">12개월</option>
                      <option value="24">24개월</option>
                      <option value="36">36개월</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 상품 목록 */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">적금 상품을 불러오는 중...</h3>
              <p className="text-gray-600">잠시만 기다려주세요</p>
            </div>
          ) : savingsProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-6">다른 검색어나 필터를 시도해보세요</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 결과 개수 표시 */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  총 <span className="font-semibold text-gray-900">{filteredProducts.length}</span>개의 상품
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recommended">추천순</option>
                    <option value="name">상품명순</option>
                    <option value="rate">금리순</option>
                  </select>
                </div>
              </div>

              {/* 뱅크샐러드 스타일 상품 카드 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.productId}
                    className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* 카드 헤더 */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">{getProductIcon(product.productName)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {product.productTypeDescription}
                              </span>
                              {product.productType === 'JOINT_SAVING' && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  공동적금
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {product.productName}
                            </h3>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {getProductDescription(product)}
                      </p>
                    </div>

                    {/* 카드 본문 */}
                    <div className="p-6">
                      {/* 주요 정보 */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-2 mx-auto">
                            <Percent className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-xs text-gray-600 mb-1">기본 금리</p>
                          <p className="text-lg font-bold text-gray-900">
                            {product.baseInterestRate || '2.6'}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-2 mx-auto">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-xs text-gray-600 mb-1">가입 기간</p>
                          <p className="text-lg font-bold text-gray-900">
                            {product.termMonths || '36'}개월
                          </p>
                        </div>
                      </div>

                      {/* 특징 태그 */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {product.productName.includes('청년') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            청년 우대
                          </span>
                        )}
                        {product.productName.includes('목표') && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            목표 설정
                          </span>
                        )}
                        {product.productName.includes('정기') && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            정기적금
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          하나은행
                        </span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            navigate(`/product/savings/${product.productId}`);
                            // 페이지 이동 후 스크롤을 최상단으로 이동
                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                          }}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                        >
                          상세보기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                        <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 하단 안내 - 뱅크샐러드 스타일 */}
          <div className="mt-12">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  안전하고 믿을 수 있는 하나은행
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  모든 적금 상품은 예금자보호법에 따라 예금보험공사에서 보호받습니다.
                  내 집 마련의 꿈을 하나은행과 함께 시작하세요.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">예금자보호</h4>
                  <p className="text-sm text-gray-600">최대 5천만원까지 보호</p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4 mx-auto">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">우수한 신용등급</h4>
                  <p className="text-sm text-gray-600">안정적인 금융기관</p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">경쟁력 있는 금리</h4>
                  <p className="text-sm text-gray-600">최고의 수익률 제공</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SavingsProductsPage;
