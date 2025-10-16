import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { useProductDetail } from '@/hooks/useProductDetail';
import { 
  ArrowLeft, 
  Building2, 
  Percent, 
  DollarSign, 
  Calendar, 
  FileText, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  AlertTriangle,
  Download,
  Phone,
  MessageCircle,
  Users,
  Home,
  Target,
  Banknote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ProductDetailPage = () => {
  const { productId, productType } = useParams();
  const navigate = useNavigate();
  
  const {
    productDetail,
    isLoading,
    error,
    refreshProductDetail,
    isLoanProduct,
    isSavingsProduct,
    getInterestRateText,
    getAmountRangeText,
    getPeriodText,
    getProductIcon
  } = useProductDetail(productId, productType);

  // 접을 수 있는 섹션 상태 관리
  const [expandedSections, setExpandedSections] = useState({
    productInfo: false,
    basicRate: true,
    preferentialRate: false,
    productDescription: false,
    document: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 컴포넌트 마운트 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">상품 정보를 불러오는 중...</h3>
            <p className="text-gray-600">잠시만 기다려주세요</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !productDetail) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">상품 정보를 불러올 수 없습니다</h3>
            <p className="text-gray-600 mb-6">{error || '상품 정보가 존재하지 않습니다.'}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                이전으로
              </button>
              <button
                onClick={refreshProductDetail}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPageType = isLoanProduct ? 'loan-inquiry' : 'savings';

  return (
    <Layout currentPage={currentPageType}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 헤더 - 뒤로가기 */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              상품 목록으로 돌아가기
            </button>
          </div>

           {/* 상품 기본 정보 헤더 */}
           <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-4">
            <div className="p-8 bg-[#009071] text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-6xl">{getProductIcon()}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                        {productDetail.productTypeDescription}
                      </span>
                      {productDetail.productType === 'JOINT_LOAN' && (
                        <span className="px-3 py-1 bg-orange-500 bg-opacity-80 rounded-full text-sm font-medium">
                          공동대출 가능
                        </span>
                      )}
                      <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                        {productDetail.bank.bankName}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">{productDetail.productName}</h1>
                    <p className="text-white text-opacity-90 mb-6 text-lg">
                      {isSavingsProduct && productDetail.savingsProduct?.productDescription 
                        ? productDetail.savingsProduct.productDescription
                        : isLoanProduct && productDetail.loanProduct?.loanProductDescription
                        ? productDetail.loanProduct.loanProductDescription
                        : '안정적인 금융 상품으로 미래를 준비하세요'
                      }
                    </p>
                    
                    {/* 상품 정보 3행 표시 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Percent className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">금리</span>
                        </div>
                        <span className="text-white text-lg font-semibold">{getInterestRateText()}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">가입금액</span>
                        </div>
                        <span className="text-white text-lg font-semibold">{getAmountRangeText()}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">가입기간</span>
                        </div>
                        <span className="text-white text-lg font-semibold">{getPeriodText()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

           <div className="space-y-4">
             
             {/* 상세 정보 */}
             <div className="space-y-4">
              
              {/* 대출 상품 상세 정보 */}
              {isLoanProduct && productDetail.loanProduct && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  {/* 가입 전 확인 안내 */}
                  <div className="p-6 bg-gray-50 border-b border-gray-100 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">대출 신청 전 확인해 주세요!</h2>
                    <p className="text-base text-gray-600 leading-relaxed">
                      금융소비자보호법에 따른 금융상품 관련 중요사항입니다.
                    </p>
                  </div>

                  {/* 상품정보 */}
                  <div>
                    <button
                      onClick={() => toggleSection('productInfo')}
                      className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                    >
                      <h3 className="text-xl font-bold text-gray-900">상품정보</h3>
                      {expandedSections.productInfo ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    {expandedSections.productInfo && (
                      <div className="px-6 pb-6 border-b border-gray-100">
                        <div className="pt-5 space-y-4">
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">대출 유형</span>
                            <span className="text-lg font-bold text-gray-900">{productDetail.loanProduct.loanType}</span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">금리 유형</span>
                            <span className="text-lg font-bold text-gray-900">{productDetail.loanProduct.interestRateType}</span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">상환 방법</span>
                            <span className="text-lg font-bold text-gray-900">{productDetail.loanProduct.repaymentMethod}</span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">대상</span>
                            <span className="text-lg font-bold text-gray-900">{productDetail.loanProduct.targetType}</span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">최대 소득</span>
                            <span className="text-lg font-bold text-gray-900">
                              {(productDetail.loanProduct.maxIncome / 10000).toLocaleString()}만원
                            </span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">최대 주택가격</span>
                            <span className="text-lg font-bold text-gray-900">
                              {(productDetail.loanProduct.maxHousePrice / 100000000).toLocaleString()}억원
                            </span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">최대 자산</span>
                            <span className="text-lg font-bold text-gray-900">
                              {(productDetail.loanProduct.maxAssets / 100000000).toLocaleString()}억원
                            </span>
                          </div>
                          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                            <span className="text-base text-gray-700 font-medium">최대 면적</span>
                            <span className="text-lg font-bold text-gray-900">{productDetail.loanProduct.maxArea}㎡</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 기본금리 */}
                  <div>
                    <button
                      onClick={() => toggleSection('basicRate')}
                      className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                    >
                      <h3 className="text-xl font-bold text-gray-900">기본금리</h3>
                      {expandedSections.basicRate ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    {expandedSections.basicRate && (
                      <div className="px-6 pb-6 border-b border-gray-100">
                        <div className="pt-5">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-gray-900">기본금리</h4>
                            <a href="#" className="text-teal-600 text-base font-semibold hover:text-teal-700">
                              대출기본금리 조회
                            </a>
                          </div>
                          <p className="text-sm text-gray-500 mb-5">(2025-01-15 기준, 세전)</p>
                          
                          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-3 text-left text-base font-semibold text-gray-800 border-r border-gray-200">대출기간</th>
                                  <th className="px-4 py-3 text-left text-base font-semibold text-gray-800">금리 (연율,세전)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-gray-200">
                                  <td className="px-4 py-3 text-base text-gray-900 border-r border-gray-200">
                                    {productDetail.loanProduct.maxTermMonths}개월이하
                                  </td>
                                  <td className="px-4 py-3 text-lg font-bold text-gray-900">
                                    {productDetail.loanProduct.baseInterestRate}%
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                            ※ 대출 상품으로 상품가입일에 따라 가입자 별 계약기간이 상이함
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 우대금리 */}
                  <div>
                    <button
                      onClick={() => toggleSection('preferentialRate')}
                      className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                    >
                      <h3 className="text-lg font-bold text-gray-900">우대금리</h3>
                      {expandedSections.preferentialRate ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.preferentialRate && (
                      <div className="px-4 pb-4 border-b border-gray-100">
                        <div className="pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-semibold text-gray-900">우대금리</h4>
                            <a href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700">
                              우대금리 조회
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">(2025-01-15 기준, 세전)</p>
                          
                          <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-200">우대조건</th>
                                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">우대금리 (연율,세전)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-gray-200">
                                  <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">
                                    기본 우대
                                  </td>
                                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">
                                    {productDetail.loanProduct.preferentialInterestRate}%
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-3">
                            ※ 우대금리는 고객의 신용도와 상품 조건에 따라 달라질 수 있습니다.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 상품 설명 */}
                  {productDetail.loanProduct.loanProductDescription && (
                    <div>
                      <button
                        onClick={() => toggleSection('productDescription')}
                        className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                      >
                        <h3 className="text-lg font-bold text-gray-900">상품 설명</h3>
                        {expandedSections.productDescription ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.productDescription && (
                        <div className="px-4 pb-4 border-b border-gray-100">
                          <div className="pt-4">
                            <p className="text-gray-700 leading-relaxed">
                              {productDetail.loanProduct.loanProductDescription}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 상품 설명서 다운로드 */}
                  {productDetail.loanProduct.documentUrl && (
                    <div>
                      <button
                        onClick={() => toggleSection('document')}
                        className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                      >
                        <h3 className="text-lg font-bold text-gray-900">상품 설명서</h3>
                        {expandedSections.document ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.document && (
                        <div className="px-4 pb-4 border-b border-gray-100">
                          <div className="pt-4">
                            <p className="text-gray-600 mb-4">상품에 대한 자세한 정보를 확인하세요.</p>
                            <a
                              href={productDetail.loanProduct.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              상품설명서 다운로드
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 상담 및 신청 */}
                  <div className="p-6 rounded-b-2xl">
                    <div className="space-y-4">
                      <button 
                        onClick={() => {
                          navigate(`/loan-application/${productType}/${productId}`);
                          // 페이지 이동 후 스크롤을 최상단으로 이동
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 100);
                        }}
                        className="w-full bg-teal-600 text-white py-5 px-6 rounded-xl hover:bg-teal-700 transition-colors font-bold text-xl flex items-center justify-center shadow-md hover:shadow-lg"
                      >
                        대출 신청하기
                      </button>
                      
                      <button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 mr-3" />
                        대출 상담 예약
                      </button>
                      
                      <button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 mr-3" />
                        온라인 상담
                      </button>
                    </div>
                  </div>
                </div>
              )}

               {/* 적금 상품 상세 정보 */}
               {isSavingsProduct && productDetail.savingsProduct && (
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                   {/* 가입 전 확인 안내 */}
                   <div className="p-6 bg-gray-50 border-b border-gray-100 rounded-t-2xl">
                     <h2 className="text-2xl font-bold text-gray-900 mb-3">가입 전 확인해 주세요!</h2>
                     <p className="text-base text-gray-600 leading-relaxed">
                       금융소비자보호법에 따른 금융상품 관련 중요사항입니다.
                     </p>
                   </div>

                   {/* 상품정보 */}
                   <div>
                     <button
                       onClick={() => toggleSection('productInfo')}
                       className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                     >
                       <h3 className="text-xl font-bold text-gray-900">상품정보</h3>
                       {expandedSections.productInfo ? (
                         <ChevronUp className="w-6 h-6 text-gray-600" />
                       ) : (
                         <ChevronDown className="w-6 h-6 text-gray-600" />
                       )}
                     </button>
                     {expandedSections.productInfo && (
                       <div className="px-6 pb-6 border-b border-gray-100">
                         <div className="pt-5 space-y-4">
                           <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                             <span className="text-base text-gray-700 font-medium">납입 방법</span>
                             <span className="text-lg font-bold text-gray-900">{productDetail.savingsProduct.paymentMethod}</span>
                           </div>
                           <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                             <span className="text-base text-gray-700 font-medium">가입 기간</span>
                             <span className="text-lg font-bold text-gray-900">{productDetail.savingsProduct.termMonths}개월</span>
                           </div>
                           <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                             <span className="text-base text-gray-700 font-medium">복리 적용</span>
                             <span className="text-lg font-bold text-gray-900">
                               {productDetail.savingsProduct.isCompoundInterestApplied ? '적용' : '미적용'}
                             </span>
                           </div>
                           <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                             <span className="text-base text-gray-700 font-medium">세제혜택</span>
                             <span className="text-lg font-bold text-gray-900">
                               {productDetail.savingsProduct.isTaxPreferenceApplied ? '적용' : '미적용'}
                             </span>
                           </div>
                           <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                             <span className="text-base text-gray-700 font-medium">납입 유예</span>
                             <span className="text-lg font-bold text-gray-900">{productDetail.savingsProduct.paymentDelayPeriodMonths}개월</span>
                           </div>
                           <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                             <span className="text-base text-gray-700 font-medium">중도해지 수수료</span>
                             <span className="text-lg font-bold text-gray-900">{productDetail.savingsProduct.earlyWithdrawPenaltyRate}%</span>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* 기본금리 */}
                   <div>
                     <button
                       onClick={() => toggleSection('basicRate')}
                       className="w-full flex items-center justify-between p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                     >
                       <h3 className="text-xl font-bold text-gray-900">기본금리</h3>
                       {expandedSections.basicRate ? (
                         <ChevronUp className="w-6 h-6 text-gray-600" />
                       ) : (
                         <ChevronDown className="w-6 h-6 text-gray-600" />
                       )}
                     </button>
                     {expandedSections.basicRate && (
                       <div className="px-6 pb-6 border-b border-gray-100">
                         <div className="pt-5">
                           <div className="flex justify-between items-center mb-4">
                             <h4 className="text-lg font-bold text-gray-900">기본금리</h4>
                             <a href="#" className="text-teal-600 text-base font-semibold hover:text-teal-700">
                               예금기본금리 조회
                             </a>
                           </div>
                           <p className="text-sm text-gray-500 mb-5">(2025-01-15 기준, 세전)</p>
                           
                           <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                             <table className="w-full">
                               <thead className="bg-gray-100">
                                 <tr>
                                   <th className="px-4 py-3 text-left text-base font-semibold text-gray-800 border-r border-gray-200">가입기간</th>
                                   <th className="px-4 py-3 text-left text-base font-semibold text-gray-800">금리 (연율,세전)</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 <tr className="border-t border-gray-200">
                                   <td className="px-4 py-3 text-base text-gray-900 border-r border-gray-200">
                                     {productDetail.savingsProduct.termMonths}개월이상~{productDetail.savingsProduct.termMonths}개월이하
                                   </td>
                                   <td className="px-4 py-3 text-lg font-bold text-gray-900">
                                     {productDetail.savingsProduct.baseInterestRate}%
                                   </td>
                                 </tr>
                               </tbody>
                             </table>
                           </div>
                           
                           <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                             ※ 만기일 고정 상품으로 상품가입일에 따라 가입자 별 계약기간이 상이함
                           </p>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* 우대금리 */}
                   <div>
                     <button
                       onClick={() => toggleSection('preferentialRate')}
                       className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                     >
                       <h3 className="text-lg font-bold text-gray-900">우대금리</h3>
                       {expandedSections.preferentialRate ? (
                         <ChevronUp className="w-5 h-5 text-gray-500" />
                       ) : (
                         <ChevronDown className="w-5 h-5 text-gray-500" />
                       )}
                     </button>
                     {expandedSections.preferentialRate && (
                       <div className="px-4 pb-4 border-b border-gray-100">
                         <div className="pt-4">
                           <div className="flex justify-between items-center mb-3">
                             <h4 className="text-md font-semibold text-gray-900">우대금리</h4>
                             <a href="#" className="text-teal-600 text-sm font-medium hover:text-teal-700">
                               우대금리 조회
                             </a>
                           </div>
                           <p className="text-xs text-gray-500 mb-4">(2025-01-15 기준, 세전)</p>
                           
                           <div className="overflow-hidden border border-gray-200 rounded-lg">
                             <table className="w-full">
                               <thead className="bg-gray-50">
                                 <tr>
                                   <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-200">우대조건</th>
                                   <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">우대금리 (연율,세전)</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 <tr className="border-t border-gray-200">
                                   <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">
                                     기본 우대
                                   </td>
                                   <td className="px-3 py-2 text-sm font-semibold text-gray-900">
                                     {productDetail.savingsProduct.preferentialInterestRate}%
                                   </td>
                                 </tr>
                               </tbody>
                             </table>
                           </div>
                           
                           <p className="text-xs text-gray-500 mt-3">
                             ※ 우대금리는 고객의 신용도와 상품 조건에 따라 달라질 수 있습니다.
                           </p>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* 상품 설명 */}
                   {productDetail.savingsProduct.productDescription && (
                     <div>
                       <button
                         onClick={() => toggleSection('productDescription')}
                         className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                       >
                         <h3 className="text-lg font-bold text-gray-900">상품 설명</h3>
                         {expandedSections.productDescription ? (
                           <ChevronUp className="w-5 h-5 text-gray-500" />
                         ) : (
                           <ChevronDown className="w-5 h-5 text-gray-500" />
                         )}
                       </button>
                       {expandedSections.productDescription && (
                         <div className="px-4 pb-4 border-b border-gray-100">
                           <div className="pt-4">
                             <p className="text-gray-700 leading-relaxed">
                               {productDetail.savingsProduct.productDescription}
                             </p>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {/* 상품 설명서 다운로드 */}
                   {productDetail.savingsProduct.documentUrl && (
                     <div>
                       <button
                         onClick={() => toggleSection('document')}
                         className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
                       >
                         <h3 className="text-lg font-bold text-gray-900">상품 설명서</h3>
                         {expandedSections.document ? (
                           <ChevronUp className="w-5 h-5 text-gray-500" />
                         ) : (
                           <ChevronDown className="w-5 h-5 text-gray-500" />
                         )}
                       </button>
                       {expandedSections.document && (
                         <div className="px-4 pb-4 border-b border-gray-100">
                           <div className="pt-4">
                             <p className="text-gray-600 mb-4">상품에 대한 자세한 정보를 확인하세요.</p>
                             <a
                               href={productDetail.savingsProduct.documentUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                             >
                               <Download className="w-4 h-4 mr-2" />
                               상품설명서 다운로드
                             </a>
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {/* 상담 및 가입 */}
                   <div className="p-6 rounded-b-2xl">
                     <div className="space-y-4">
                       <button 
                         onClick={() => {
                           navigate(`/savings-signup/${productType}/${productId}`);
                           // 페이지 이동 후 스크롤을 최상단으로 이동
                           setTimeout(() => {
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                           }, 100);
                         }}
                         className="w-full bg-teal-600 text-white py-5 px-6 rounded-xl hover:bg-teal-700 transition-colors font-bold text-xl flex items-center justify-center shadow-md hover:shadow-lg"
                       >
                         적금 가입하기
                       </button>
                       
                       <button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg flex items-center justify-center">
                         <Phone className="w-5 h-5 mr-3" />
                         적금 상담 예약
                       </button>
                       
                       <button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg flex items-center justify-center">
                         <MessageCircle className="w-5 h-5 mr-3" />
                         온라인 상담
                       </button>
                     </div>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
