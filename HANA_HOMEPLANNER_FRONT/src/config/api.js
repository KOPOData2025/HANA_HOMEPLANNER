/**
 * API 설정 중앙 관리
 * 모든 API 엔드포인트와 설정을 한 곳에서 관리
 */

// 환경별 API 기본 URL 설정
const API_CONFIG = {
  // 개발 환경
  development: 'http://localhost:8080',
  // 프로덕션 환경
  production: 'http://34.64.169.208:8080',
  // 테스트 환경
  test: 'http://localhost:8080'
};

// 현재 환경 감지
const getCurrentEnvironment = () => {
  if (import.meta.env.DEV) {
    return 'development';
  }
  if (import.meta.env.PROD) {
    return 'production';
  }
  return 'development';
};

// 환경변수에서 API URL 가져오기 (우선순위 높음)
const getApiBaseUrl = () => {
  // 환경변수가 설정되어 있으면 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 환경변수가 없으면 환경별 기본값 사용
  const environment = getCurrentEnvironment();
  return API_CONFIG[environment];
};

// API 기본 URL
export const API_BASE_URL = getApiBaseUrl();

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    REGISTER: '/api/auth/signup',
    VERIFY: '/api/auth/verify'
  },
  
  // 사용자 관련
  USER: {
    PROFILE: '/api/users/my-name',
    UPDATE_PROFILE: '/api/user/profile',
    DELETE_ACCOUNT: '/api/user/delete'
  },
  
  // 부동산 관련
  REAL_ESTATE: {
    SEARCH: '/api/house/price-info/search/address-area',
    DETAILS: '/api/applyhome/data/all',
    STATS: '/api/house/avg-price/map-markers',
    SUBSCRIPTION: '/api/applyhome/json/all',
    INDIVIDUAL_JSON: '/api/applyhome/json'
  },
  
  // 금융 상품 관련
  FINANCIAL: {
    LOANS: '/api/financial-products/loans',
    SAVINGS: '/api/financial-products/savings',
    RECOMMENDATIONS: '/api/financial-products/recommend-loans'
  },
  
  // 계산 관련
  CALCULATION: {
    LTV: '/api/calculation/ltv',
    DTI: '/api/calculation/dti',
    LOAN: '/api/calculation/loan'
  },
  
  // 커플 관련
  COUPLE: {
    INVITE: '/api/couple/invite',
    ACCEPT: '/api/couple/accept',
    STATUS: '/api/couple/status',
    PARTNER: '/api/couple/partner'
  },
  
  // 통계 관련
  STATS: {
    SIGUNGU: '/api/house/sigungu-stats/all',
    MARKET: '/api/stats/market'
  }
};

// 전체 API URL 생성 헬퍼 함수
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// API 설정 정보 출력 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('🔧 API 설정:', {
    baseUrl: API_BASE_URL,
    environment: getCurrentEnvironment(),
    endpoints: Object.keys(API_ENDPOINTS)
  });
}
