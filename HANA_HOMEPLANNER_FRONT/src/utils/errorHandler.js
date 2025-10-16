/**
 * 에러 처리 유틸리티 함수들
 * 사용자 친화적인 에러 메시지 및 권한 에러 처리
 */

/**
 * 권한 관련 에러인지 확인
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @returns {boolean} 권한 관련 에러 여부
 */
export const isAuthError = (error) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  const authErrorPatterns = [
    '403',
    '401', 
    '권한이 없습니다',
    '권한',
    '인증이 필요합니다',
    '인증',
    '로그인이 필요합니다',
    '로그인 후 다시 시도해주세요',
    '토큰이 만료되었습니다',
    'TOKEN_EXPIRED',
    'Unauthorized',
    'Forbidden'
  ];
  
  return authErrorPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * 네트워크 관련 에러인지 확인
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @returns {boolean} 네트워크 관련 에러 여부
 */
export const isNetworkError = (error) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  const networkErrorPatterns = [
    'network',
    'fetch',
    'connection',
    'timeout',
    'offline',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED'
  ];
  
  return networkErrorPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * 사용자에게 표시해야 하는 에러인지 확인
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @returns {boolean} 사용자에게 표시할 에러 여부
 */
export const shouldShowErrorToUser = (error) => {
  // 권한 관련 에러는 사용자에게 토스트로 표시하지 않음
  if (isAuthError(error)) {
    return false;
  }
  
  // 기타 실제 서비스 에러만 사용자에게 표시
  return true;
};

/**
 * 사용자 친화적인 에러 메시지로 변환
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 사용자 친화적인 에러 메시지
 */
export const getUserFriendlyErrorMessage = (error, defaultMessage = '오류가 발생했습니다') => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  // 네트워크 에러
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요';
  }
  
  // 권한 에러 (보통 조용히 처리되지만 필요한 경우)
  if (isAuthError(error)) {
    return '로그인이 필요한 서비스입니다';
  }
  
  // 서버 에러
  if (errorMessage.includes('500')) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요';
  }
  
  // 기본 메시지 또는 원본 메시지 반환
  return errorMessage || defaultMessage;
};

/**
 * HTTP 상태 코드 기반 에러 메시지 생성
 * @param {number} statusCode - HTTP 상태 코드
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 상태 코드별 에러 메시지
 */
export const getErrorMessageByStatusCode = (statusCode, defaultMessage = '오류가 발생했습니다') => {
  switch (statusCode) {
    case 400:
      return '잘못된 요청입니다. 입력 정보를 확인해주세요';
    case 401:
      return '인증이 필요합니다';
    case 403:
      return '권한이 없습니다';
    case 404:
      return '요청한 정보를 찾을 수 없습니다';
    case 429:
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요';
    case 500:
      return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요';
    case 502:
    case 503:
    case 504:
      return '서버가 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요';
    default:
      return defaultMessage;
  }
};

/**
 * 토큰 만료 에러인지 확인
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @returns {boolean} 토큰 만료 에러 여부
 */
export const isTokenExpiredError = (error) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  const tokenExpiredPatterns = [
    '토큰이 만료되었습니다',
    'Refresh Token으로 갱신해주세요',
    'TOKEN_EXPIRED',
    '토큰 만료',
    '세션이 만료되었습니다',
    '세션 만료',
    '인증 토큰이 만료되었습니다'
  ];
  
  return tokenExpiredPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );
};

/**
 * 토큰 만료 에러 처리 (세션 만료 알림 + 로그인 페이지 이동)
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @param {Function} navigate - React Router의 navigate 함수
 */
export const handleTokenExpiredError = (error, navigate) => {
  if (isTokenExpiredError(error)) {
    // 토큰 및 사용자 정보 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenTimestamp");
    
    // 세션 만료 알림 표시
    if (window.showToast) {
      window.showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'warning');
    } else {
      // toast 라이브러리가 없는 경우 기본 알림
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    // 로그인 페이지로 이동
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
    
    return true; // 토큰 만료 에러 처리됨
  }
  
  return false; // 토큰 만료 에러가 아님
};

/**
 * 에러 로깅 (개발 환경에서만)
 * @param {string} context - 에러 발생 컨텍스트
 * @param {Error} error - 에러 객체
 * @param {Object} additionalInfo - 추가 정보
 */
export const logError = (context, error, additionalInfo = {}) => {
  if (import.meta.env.DEV) {
    console.error(`❌ [${context}] 에러 발생:`, {
      error: error.message || error,
      stack: error.stack,
      ...additionalInfo
    });
  }
};

export default {
  isAuthError,
  isNetworkError,
  shouldShowErrorToUser,
  getUserFriendlyErrorMessage,
  getErrorMessageByStatusCode,
  isTokenExpiredError,
  handleTokenExpiredError,
  logError
};
