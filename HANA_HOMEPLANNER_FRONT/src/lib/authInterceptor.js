/**
 * 인증이 필요한 API 호출을 위한 통합 인터셉터
 * 토큰 만료, 로그인 필요 등의 인증 관련 에러를 중앙에서 처리
 */

import { getAccessToken, logout } from './auth';
import { handleTokenExpiredError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 인증이 필요한 API 호출을 위한 통합 함수
 * @param {string} url - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {Promise<Response>} API 응답
 */
export const authenticatedRequest = async (url, options = {}, navigate = null) => {
  try {
    const token = getAccessToken();
    
    // 토큰이 없는 경우
    if (!token) {
      const error = new Error('로그인이 필요합니다.');
      handleAuthError(error, navigate);
      throw error;
    }

    // 인증 헤더 추가
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const requestOptions = {
      ...options,
      headers: authHeaders
    };

    console.log('🔐 인증된 API 요청:', {
      url: `${BASE_URL}${url}`,
      hasToken: !!token,
      method: options.method || 'GET'
    });

    const response = await fetch(`${BASE_URL}${url}`, requestOptions);

    // 응답이 성공적이지 않은 경우 에러 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      
      const error = new Error(errorMessage);
      
      // 인증 관련 에러인지 확인하고 처리
      if (handleAuthError(error, navigate)) {
        throw error;
      }
      
      // 기타 에러는 그대로 throw
      throw error;
    }

    return response;
  } catch (error) {
    console.error('❌ 인증된 API 요청 실패:', error);
    
    // 네트워크 에러나 기타 에러도 인증 에러 처리 함수로 확인
    if (handleAuthError(error, navigate)) {
      throw error;
    }
    
    throw error;
  }
};

/**
 * 인증 관련 에러 처리
 * @param {Error} error - 에러 객체
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {boolean} 인증 에러 처리 여부
 */
const handleAuthError = (error, navigate) => {
  const errorMessage = error.message || '';
  
  // 토큰 만료 에러 처리
  if (handleTokenExpiredError(error, navigate)) {
    return true;
  }
  
  // 로그인 필요 에러 처리
  if (isLoginRequiredError(errorMessage)) {
    handleLoginRequiredError(navigate);
    return true;
  }
  
  // 권한 없음 에러 처리
  if (isUnauthorizedError(errorMessage)) {
    handleUnauthorizedError(navigate);
    return true;
  }
  
  return false;
};

/**
 * 로그인 필요 에러인지 확인
 * @param {string} errorMessage - 에러 메시지
 * @returns {boolean} 로그인 필요 에러 여부
 */
const isLoginRequiredError = (errorMessage) => {
  const loginRequiredPatterns = [
    '로그인이 필요합니다',
    '로그인 후 다시 시도해주세요',
    '인증이 필요합니다',
    '로그인',
    'UNAUTHORIZED',
    '401'
  ];
  
  return loginRequiredPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * 권한 없음 에러인지 확인
 * @param {string} errorMessage - 에러 메시지
 * @returns {boolean} 권한 없음 에러 여부
 */
const isUnauthorizedError = (errorMessage) => {
  const unauthorizedPatterns = [
    '권한이 없습니다',
    '권한',
    'FORBIDDEN',
    '403'
  ];
  
  return unauthorizedPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * 로그인 필요 에러 처리 (토스트 중복 방지)
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 */
const handleLoginRequiredError = (navigate) => {
  // 토큰 및 사용자 정보 삭제
  logout();
  
  // 마이페이지에서는 토스트 표시하지 않음 (이미 리다이렉트 처리됨)
  if (window.location.pathname === '/mypage') {
    console.log('🔇 [authInterceptor] 마이페이지에서 호출 - 토스트 생략');
    return;
  }
  
  // 이미 로그인 페이지에 있다면 추가 리다이렉트 하지 않음
  if (window.location.pathname === '/login') {
    console.log('🔍 이미 로그인 페이지에 있음 - 리다이렉트 생략');
    return;
  }
  
  // 알림 표시 (마이페이지가 아닌 경우만)
  toast.error('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.', {
    duration: 3000,
    position: 'top-center'
  });
  
  // 로그인 페이지로 이동
  setTimeout(() => {
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
  }, 1500);
};

/**
 * 권한 없음 에러 처리
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 */
const handleUnauthorizedError = (navigate) => {
  // 알림 표시
  toast.error('이 서비스에 접근할 권한이 없습니다.', {
    duration: 3000,
    position: 'top-center'
  });
  
  // 홈 페이지로 이동
  setTimeout(() => {
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  }, 1500);
};

/**
 * GET 요청을 위한 헬퍼 함수
 * @param {string} url - API 엔드포인트
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {Promise<Object>} JSON 응답 데이터
 */
export const authenticatedGet = async (url, navigate = null) => {
  const response = await authenticatedRequest(url, { method: 'GET' }, navigate);
  return await response.json();
};

/**
 * POST 요청을 위한 헬퍼 함수
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {Promise<Object>} JSON 응답 데이터
 */
export const authenticatedPost = async (url, data, navigate = null) => {
  const response = await authenticatedRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }, navigate);
  return await response.json();
};

/**
 * PUT 요청을 위한 헬퍼 함수
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {Promise<Object>} JSON 응답 데이터
 */
export const authenticatedPut = async (url, data, navigate = null) => {
  const response = await authenticatedRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, navigate);
  return await response.json();
};

/**
 * DELETE 요청을 위한 헬퍼 함수
 * @param {string} url - API 엔드포인트
 * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
 * @returns {Promise<Object>} JSON 응답 데이터
 */
export const authenticatedDelete = async (url, navigate = null) => {
  const response = await authenticatedRequest(url, { method: 'DELETE' }, navigate);
  return await response.json();
};

export default {
  authenticatedRequest,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete
};
