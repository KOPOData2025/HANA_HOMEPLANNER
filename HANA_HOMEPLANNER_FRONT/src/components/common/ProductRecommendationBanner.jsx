
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

const ProductRecommendationBanner = ({ 
  productId, 
  productType = 'savings', // 'savings' 또는 'loan'
  products = [], // API에서 받아온 상품 목록
  onClose,
  onNavigateToDetail, // 상세 페이지 이동 함수
  className = ''
}) => {
  const [productInfo, setProductInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 상품 정보 조회 (API 데이터에서 찾기)
  useEffect(() => {
    if (!productId || !products.length) return;

    setIsLoading(true);
    setError(null);

    // API 데이터에서 해당 productId를 가진 상품 찾기
    const foundProduct = products.find(product => product.productId === productId);
    
    if (foundProduct) {
      // 상품 정보를 배너 형식에 맞게 변환
      const bannerProductInfo = {
        id: foundProduct.productId,
        name: foundProduct.productName,
        interestRate: foundProduct.interestRate ? `${foundProduct.interestRate}%` : '문의',
        period: foundProduct.termMonths ? `${foundProduct.termMonths}개월` : '문의',
        minAmount: foundProduct.minAmount ? `${foundProduct.minAmount.toLocaleString()}원` : '문의',
        maxAmount: foundProduct.maxAmount ? `${foundProduct.maxAmount.toLocaleString()}원` : '문의',
        features: getProductFeatures(foundProduct),
        description: getProductDescription(foundProduct),
        badge: getProductBadge(foundProduct),
        badgeColor: getProductBadgeColor(foundProduct)
      };
      
      setProductInfo(bannerProductInfo);
    } else {
      setError('선택한 상품을 찾을 수 없습니다.');
    }
    
    setIsLoading(false);
  }, [productId, products]);

  // 상품 특징 추출
  const getProductFeatures = (product) => {
    const features = [];
    
    if (product.productName.includes('청년')) {
      features.push('청년 우대');
    }
    if (product.productName.includes('목표')) {
      features.push('목표 설정');
    }
    if (product.productName.includes('정기')) {
      features.push('정기 적금');
    }
    if (product.productType === 'JOINT_SAVING') {
      features.push('공동 적금');
    }
    if (product.productName.includes('신생아') || product.productName.includes('특례')) {
      features.push('신생아 특례');
    }
    if (product.productName.includes('신혼부부')) {
      features.push('신혼부부 전용');
    }
    if (product.productName.includes('생애최초')) {
      features.push('생애최초');
    }
    
    return features.length > 0 ? features : ['하나은행 상품'];
  };

  // 상품 설명 생성
  const getProductDescription = (product) => {
    if (product.productType === 'JOINT_SAVING') {
      return '커플이나 가족이 함께하는 공동 적금 상품입니다.';
    }
    if (product.productName.includes('청년도약계좌')) {
      return '청년층을 위한 특별 우대 적금 상품입니다.';
    }
    if (product.productName.includes('신생아 특례')) {
      return '신생아가 있는 가정을 위한 특별 우대 대출입니다.';
    }
    if (product.productName.includes('신혼부부')) {
      return '신혼부부 전용 정책 대출 상품입니다.';
    }
    if (product.productName.includes('생애최초')) {
      return '생애 첫 주택 구입자를 위한 대출입니다.';
    }
    
    return productType === 'savings' 
      ? '내 집 마련을 위한 특별한 적금 상품입니다.'
      : '안정적인 주택 구매를 위한 대출 상품입니다.';
  };

  // 상품 배지 생성
  const getProductBadge = (product) => {
    if (product.productType === 'JOINT_SAVING') {
      return '공동적금';
    }
    if (product.productType === 'JOINT_LOAN') {
      return '공동대출';
    }
    if (product.productName.includes('청년')) {
      return '청년우대';
    }
    if (product.productName.includes('신생아') || product.productName.includes('특례')) {
      return '특례상품';
    }
    if (product.productName.includes('신혼부부')) {
      return '신혼부부';
    }
    
    return productType === 'savings' ? '인기상품' : '추천상품';
  };

  // 상품 배지 색상
  const getProductBadgeColor = (product) => {
    if (product.productType === 'JOINT_SAVING') {
      return 'bg-orange-500';
    }
    if (product.productType === 'JOINT_LOAN') {
      return 'bg-orange-500';
    }
    if (product.productName.includes('청년')) {
      return 'bg-blue-500';
    }
    if (product.productName.includes('신생아') || product.productName.includes('특례')) {
      return 'bg-pink-500';
    }
    if (product.productName.includes('신혼부부')) {
      return 'bg-red-500';
    }
    
    return productType === 'savings' ? 'bg-green-500' : 'bg-blue-500';
  };

  // 상품 타입별 스타일 설정
  const getProductTypeStyles = () => {
    if (productType === 'savings') {
      return {
        gradient: 'from-green-400 via-emerald-500 to-teal-600',
        bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        iconColor: 'text-green-600'
      };
    } else {
      return {
        gradient: 'from-blue-400 via-indigo-500 to-purple-600',
        bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        iconColor: 'text-blue-600'
      };
    }
  };

  const styles = getProductTypeStyles();

  if (!productId) return null;

  if (isLoading) {
    return (
      <div className={`${styles.bgColor} ${styles.borderColor} border-2 rounded-xl p-6 mb-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">상품 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !productInfo) {
    return null;
  }

  return (
    <div className={`${styles.bgColor} ${styles.borderColor} border-2 rounded-xl p-6 mb-8 relative overflow-hidden ${className}`}>
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${styles.gradient} rounded-full transform translate-x-16 -translate-y-16`}></div>
      </div>
      
      {/* 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          {/* 왼쪽: 상품 정보 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${styles.gradient} rounded-xl flex items-center justify-center`}>
                {productType === 'savings' ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <Shield className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 ${productInfo.badgeColor} text-white text-xs font-bold rounded-full`}>
                    {productInfo.badge}
                  </span>
                  
                </div>
                <h3 className={`text-xl font-bold ${styles.textColor}`}>
                  {productInfo.name}
                </h3>
              </div>
            </div>

            <p className={`text-sm ${styles.textColor} mb-4 opacity-90`}>
              {productInfo.description}
            </p>

            {/* 상품 특징 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {productInfo.features.map((feature, index) => (
                <div key={index} className={`flex items-center gap-1 px-2 py-1 bg-white bg-opacity-60 rounded-full`}>
                  <CheckCircle className={`w-3 h-3 ${styles.iconColor}`} />
                  <span className={`text-xs font-medium ${styles.textColor}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* 상품 조건 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`bg-white bg-opacity-40 rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={`w-4 h-4 ${styles.iconColor}`} />
                  <span className={`text-xs font-medium ${styles.textColor}`}>금리</span>
                </div>
                <span className={`text-lg font-bold ${styles.textColor}`}>
                  {productInfo.interestRate}
                </span>
              </div>
              <div className={`bg-white bg-opacity-40 rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`w-4 h-4 ${styles.iconColor}`} />
                  <span className={`text-xs font-medium ${styles.textColor}`}>
                    {productType === 'savings' ? '기간' : '상환기간'}
                  </span>
                </div>
                <span className={`text-lg font-bold ${styles.textColor}`}>
                  {productInfo.period}
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽: CTA 버튼 */}
          <div className="flex flex-col items-end gap-3 ml-6">
            <div className="text-right">
              <p className={`text-xs ${styles.textColor} opacity-75 mb-1`}>
                {productType === 'savings' ? '월 납입' : '대출'} 한도
              </p>
              <p className={`text-sm font-semibold ${styles.textColor}`}>
                {productInfo.minAmount} ~ {productInfo.maxAmount}
              </p>
            </div>
            
            <button
              onClick={() => onNavigateToDetail && onNavigateToDetail(productId, productType)}
              className={`${styles.buttonColor} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2`}
            >
              <span>상품 자세히 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendationBanner;
