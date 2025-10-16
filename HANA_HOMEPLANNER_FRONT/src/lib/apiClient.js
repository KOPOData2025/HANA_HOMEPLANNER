import { 
  getAccessToken, 
  getRefreshToken, 
  setAuthTokens, 
  logout, 
  redirectToLogin,
  showTokenExpiredNotification
} from './auth';
import { API_BASE_URL } from '@/config/api';

// API_BASE_URL을 중앙화된 설정에서 가져오기

/**
 * 토큰 갱신 API 호출
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('❌ Refresh token이 없습니다. 로그인 페이지로 이동합니다.');
    logout();
    redirectToLogin();
    return null;
  }

  try {
    console.log('🔄 토큰 갱신 시도 중...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    const data = await response.json();
    console.log('🔄 토큰 갱신 응답:', { status: response.status, success: data.success });
    
    // Refresh Token이 만료된 경우
    if (!response.ok) {
      if (data.message && data.message.includes('만료')) {
        console.warn('❌ Refresh Token이 만료되었습니다. 로그인 페이지로 이동합니다.');
        showTokenExpiredNotification();
        logout();
        redirectToLogin();
        return null;
      }
      throw new Error(data.message || '토큰 갱신에 실패했습니다.');
    }
    
    if (data.success && data.data) {
      // 새로운 토큰 정보 저장
      setAuthTokens(data.data);
      console.log('✅ 토큰 갱신 성공');
      return data.data.accessToken;
    } else {
      throw new Error(data.message || '토큰 갱신에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ 토큰 갱신 오류:', error);
    
    // 네트워크 오류나 기타 오류의 경우에도 로그아웃 후 로그인 페이지로 이동
    showTokenExpiredNotification();
    logout();
    redirectToLogin();
    return null;
  }
};

/**
 * 토큰 만료 감지 및 처리
 */
const isTokenExpiredError = (error, responseData) => {
  // 다양한 토큰 만료 에러 메시지 패턴 감지
  const expiredPatterns = [
    '토큰이 만료되었습니다',
    'Token이 만료되었습니다', 
    'TOKEN_EXPIRED',
    'token expired',
    'jwt expired',
    'Refresh Token으로 갱신해주세요'
  ];

  const errorMessage = error.message || '';
  const responseMessage = responseData?.message || '';
  
  return expiredPatterns.some(pattern => 
    errorMessage.includes(pattern) || responseMessage.includes(pattern)
  );
};

/**
 * 전역 API 클라이언트
 * 자동 토큰 갱신 및 만료 처리 포함
 */
export const apiClient = {
  /**
   * GET 요청
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },

  /**
   * POST 요청
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT 요청
   */
  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE 요청
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },

  /**
   * 기본 HTTP 요청 메서드 (자동 토큰 갱신 포함)
   */
  async request(url, options = {}) {
    // 첫 번째 요청 시도
    let response = await this.makeRequest(url, options);
    
    // 토큰 만료 에러인지 확인
    if (!response.ok && response.status === 401) {
      try {
        const responseData = await response.clone().json();
        
        if (this.isTokenExpiredResponse(responseData)) {
          console.log('🔄 토큰 만료 감지, 갱신 시도 중...');
          
          // 토큰 갱신 시도
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            console.log('✅ 토큰 갱신 성공, 요청 재시도');
            // 토큰 갱신 성공 시 원래 요청 재시도
            response = await this.makeRequest(url, options);
          }
        }
      } catch (parseError) {
        console.error('❌ 응답 파싱 오류:', parseError);
      }
    }

    return response;
  },

  /**
   * 실제 HTTP 요청 실행
   */
  async makeRequest(url, options = {}) {
    const token = getAccessToken();
    
    // 기본 헤더 설정
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    // 최종 옵션 구성
    const finalOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    console.log('🌐 API 요청:', { 
      url, 
      method: finalOptions.method || 'GET',
      hasAuth: !!defaultHeaders.Authorization
    });

    try {
      const response = await fetch(url, finalOptions);
      
      console.log('📡 API 응답:', { 
        url, 
        status: response.status, 
        ok: response.ok 
      });

      return response;
    } catch (error) {
      console.error('❌ API 요청 오류:', error);
      throw error;
    }
  },

  /**
   * 토큰 만료 응답인지 확인
   */
  isTokenExpiredResponse(responseData) {
    const expiredPatterns = [
      '토큰이 만료되었습니다',
      'Token이 만료되었습니다', 
      'TOKEN_EXPIRED',
      'token expired',
      'jwt expired',
      'Refresh Token으로 갱신해주세요'
    ];

    const message = responseData?.message || '';
    const code = responseData?.data?.code || responseData?.code || '';
    
    return expiredPatterns.some(pattern => 
      message.includes(pattern) || code.includes(pattern)
    );
  }
};

/**
 * 편의 함수들
 */
export const get = (url, options) => apiClient.get(url, options);
export const post = (url, data, options) => apiClient.post(url, data, options);
export const put = (url, data, options) => apiClient.put(url, data, options);
export const del = (url, options) => apiClient.delete(url, options);

export default apiClient;
