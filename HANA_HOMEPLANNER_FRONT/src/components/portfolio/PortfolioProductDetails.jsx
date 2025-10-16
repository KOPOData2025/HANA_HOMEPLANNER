import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Building, DollarSign, Percent, Calendar, Info, Clock } from 'lucide-react';

/**
 * 포트폴리오 플랜의 금융상품 상세정보를 표시하는 컴포넌트
 * 관심사 분리: UI 로직과 데이터 로직을 분리하여 재사용성과 테스트 용이성 향상
 */
const PortfolioProductDetails = ({
  plan,
  fetchProductDetails,
  getProductDetails,
  isProductDetailsLoading,
  getProductDetailsError
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [productDetails, setProductDetails] = useState(null);

  // 플랜에서 금융상품 ID 추출
  const savingsId = plan.savingsId;
  const loanId = plan.loanId;
  const planId = plan.selectionId;

  // 금융상품 상세정보 조회
  useEffect(() => {
    if (isExpanded && (savingsId || loanId)) {
      const existingDetails = getProductDetails(planId);
      
      if (!existingDetails && !isProductDetailsLoading(planId)) {
        console.log('🔄 금융상품 상세정보 조회 시작:', { savingsId, loanId, planId });
        fetchProductDetails(savingsId, loanId, planId)
          .then(details => {
            console.log('🔍 금융상품 상세정보 조회 성공:', details);
            setProductDetails(details);
          })
          .catch(error => {
            console.error('❌ 금융상품 상세정보 조회 실패:', error);
          });
      } else if (existingDetails) {
        setProductDetails(existingDetails);
      }
    }
  }, [isExpanded, savingsId, loanId, planId, fetchProductDetails, getProductDetails, isProductDetailsLoading]);

  // 금융상품이 없는 경우 표시하지 않음
  if (!savingsId && !loanId) {
    return null;
  }

  const isLoading = isProductDetailsLoading(planId);
  const error = getProductDetailsError(planId);

  return (
    <div className="mt-6">
      {/* 금융상품 상세정보 헤더 - 모던 디자인 */}
      <div 
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="bg-gradient-to-r from-teal-400 to-teal-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">💰</span>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    {savingsId && loanId ? '적금+대출' : savingsId ? '적금' : '대출'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              <svg className="w-5 h-5 text-yellow-300 fill-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
              </svg>
              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">추천 금융상품 상세정보</h3>
          <p className="text-sm opacity-90 line-clamp-2">추천받은 금융상품의 상세 정보를 확인하세요</p>
        </div>

        {/* 금융상품 상세정보 내용 */}
        {isExpanded && (
          <div className="p-6 space-y-4 animate-fadeIn">
          {isLoading ? (
            <div className="text-center py-8 bg-white rounded-xl border border-indigo-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-800 mb-2">금융상품 정보를 불러오는 중...</p>
              <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h6 className="text-lg font-semibold text-red-800">정보 조회 실패</h6>
              </div>
              <p className="text-red-700 leading-relaxed">{error}</p>
            </div>
          ) : productDetails ? (
            <div className="space-y-3">
              {/* 적금상품 정보 - 모던 카드 스타일 */}
              {productDetails.savings && (
                <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">📈</span>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">예금/적금</span>
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-yellow-300 fill-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{productDetails.savings.data?.productName || '추천 적금상품'}</h3>
                    <p className="text-sm opacity-90 line-clamp-2">안정적인 저축을 위한 적금 상품</p>
                  </div>
                  <div className="p-6">
                    {/* 은행 정보 */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{productDetails.savings.data?.bank?.bankName || '하나은행'}</p>
                        <p className="text-sm text-gray-500">은행코드: {productDetails.savings.data?.bank?.bankCode || '81'}</p>
                      </div>
                    </div>

                    {/* 상품 기본 정보 */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">상품 ID</span>
                        <span className="text-sm font-medium text-gray-800">{productDetails.savings.data?.productId || savingsId}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">상품 유형</span>
                        <span className="text-sm font-medium text-gray-800">{productDetails.savings.data?.productTypeDescription || 'SAVING'}</span>
                      </div>
                    </div>

                    {/* 금리 정보 */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <span className="text-sm text-green-600 font-medium">기본금리</span>
                        <p className="text-2xl font-bold text-green-800 mt-1">
                          {productDetails.savings.data?.savingsProduct?.baseInterestRate ? 
                            `${productDetails.savings.data.savingsProduct.baseInterestRate}%` : '정보 없음'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <span className="text-sm text-emerald-600 font-medium">우대금리</span>
                        <p className="text-2xl font-bold text-emerald-800 mt-1">
                          {productDetails.savings.data?.savingsProduct?.preferentialInterestRate ? 
                            `${productDetails.savings.data.savingsProduct.preferentialInterestRate}%` : '정보 없음'}
                        </p>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {productDetails.savings.data?.bank?.bankName || '하나은행'}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {productDetails.savings.data?.savingsProduct?.paymentMethod || '자유적립식'}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {productDetails.savings.data?.savingsProduct?.termMonths ? 
                          `${productDetails.savings.data.savingsProduct.termMonths}개월` : '60개월'}
                      </span>
                    </div>

             {/* 버튼 */}
             <div className="space-y-3">
               <button 
                 onClick={() => navigate(`/product/savings/${savingsId}`)}
                 className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium flex items-center justify-center group"
               >
                 상품 상세보기
                 <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M5 12h14"></path>
                   <path d="m12 5 7 7-7 7"></path>
                 </svg>
               </button>
                      <button className="w-full border-2 border-green-600 text-green-600 py-3 px-4 rounded-xl hover:bg-green-50 transition-colors font-medium flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2" />
                        가입 상담 예약
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 대출상품 정보 - 모던 카드 스타일 */}
              {productDetails.loan && (
                <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏦</span>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">대출</span>
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-yellow-300 fill-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{productDetails.loan.data?.productName || '추천 대출상품'}</h3>
                    <p className="text-sm opacity-90 line-clamp-2">주택구입을 위한 대출 상품</p>
                  </div>
                  <div className="p-6">
                    {/* 은행 정보 */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{productDetails.loan.data?.bank?.bankName || '하나은행'}</p>
                        <p className="text-sm text-gray-500">은행코드: {productDetails.loan.data?.bank?.bankCode || '81'}</p>
                      </div>
                    </div>

                    {/* 상품 기본 정보 */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">상품 ID</span>
                        <span className="text-sm font-medium text-gray-800">{productDetails.loan.data?.productId || loanId}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">상품 유형</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">{productDetails.loan.data?.productTypeDescription || 'LOAN'}</span>
                          {productDetails.loan.data?.productType === 'JOINT_LOAN' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              공동대출 가능
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 금리 정보 */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <span className="text-sm text-blue-600 font-medium">최소금리</span>
                        <p className="text-2xl font-bold text-blue-800 mt-1">
                          {productDetails.loan.data?.loanProduct?.minInterestRate ? 
                            `${productDetails.loan.data.loanProduct.minInterestRate}%` : '정보 없음'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <span className="text-sm text-indigo-600 font-medium">최대금리</span>
                        <p className="text-2xl font-bold text-indigo-800 mt-1">
                          {productDetails.loan.data?.loanProduct?.maxInterestRate ? 
                            `${productDetails.loan.data.loanProduct.maxInterestRate}%` : '정보 없음'}
                        </p>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {productDetails.loan.data?.bank?.bankName || '하나은행'}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {productDetails.loan.data?.loanProduct?.loanType || '보금자리론'}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {productDetails.loan.data?.loanProduct?.interestRateType || '고정금리'}
                      </span>
                    </div>

             {/* 버튼 */}
             <div className="space-y-3">
               <button 
                 onClick={() => {
                   navigate(`/product/loans/${loanId}`);
                   // 페이지 이동 후 스크롤을 최상단으로 이동
                   setTimeout(() => {
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }, 100);
                 }}
                 className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center group"
               >
                 상품 상세보기
                 <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M5 12h14"></path>
                   <path d="m12 5 7 7-7 7"></path>
                 </svg>
               </button>
                      <button className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors font-medium flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2" />
                        대출 상담 예약
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 에러 메시지 표시 - 개선된 디자인 */}
              {productDetails.errors && productDetails.errors.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <h6 className="text-lg font-semibold text-yellow-800">일부 정보 조회 실패</h6>
                  </div>
                  <ul className="space-y-2 text-yellow-700">
                    {productDetails.errors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span className="leading-relaxed">{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h6 className="text-lg font-medium text-gray-800 mb-2">금융상품 정보를 불러올 수 없습니다</h6>
              <p className="text-sm text-gray-600">잠시 후 다시 시도해주세요</p>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioProductDetails;
