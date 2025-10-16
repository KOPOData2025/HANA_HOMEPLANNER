import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const authService = {
  /**
   * 토큰 가져오기
   * @returns {string|null} 저장된 토큰
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * 토큰 저장하기
   * @param {string} token - 저장할 토큰
   */
  setToken(token) {
    localStorage.setItem('token', token);
  },

  /**
   * 로그아웃
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * 로그인 상태 확인
   * @returns {boolean} 로그인 여부
   */
  isLoggedIn() {
    return !!this.getToken();
  },
  /**
   * 회원가입 API 호출
   * @param {Object} signupData - 회원가입 데이터
   * @returns {Promise<Object>} 회원가입 결과
   */
  async signup(signupData) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupData.email,
          pwd: signupData.password,
          userNm: signupData.userNm || '사용자',
          resNum: signupData.resNum || '123456-1234567', // 테스트용 기본값
          phnNum: signupData.phnNum, // 마이데이터 동의에서 입력받은 전화번호
          ci: signupData.ci, // SMS 인증에서 받은 CI 값
          userTyp: signupData.userTyp || 'INDIVIDUAL',
          sido: signupData.sido,
          sigungu: signupData.sigungu,
          eupmyeondong: signupData.eupmyeondong,
          roadNm: signupData.roadNm,
          lat: signupData.lat,
          lon: signupData.lon
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '회원가입 중 오류가 발생했습니다.')
      }

      return result
    } catch (error) {
      console.error('회원가입 API 오류:', error)
      throw error
    }
  },

  /**
   * 로그인 API 호출
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 로그인 결과
   */
  async login(email, password) {
    try {
      console.log('authService.login 호출됨:', { email, password });
      console.log('API URL:', `${API_BASE_URL}/auth/login`);
      
      // 먼저 서버 연결 테스트
      try {
        console.log('서버 연결 테스트 시작...');
        const testResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
          method: 'OPTIONS',
          mode: 'cors',
          credentials: 'omit'
        });
        console.log('서버 연결 테스트 결과:', testResponse.status, testResponse.statusText);
      } catch (testError) {
        console.error('서버 연결 실패:', testError);
        console.error('서버 URL:', `${API_BASE_URL}/auth/login`);
      }
      
      const requestBody = JSON.stringify({ email, password });
      console.log('요청 본문:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: requestBody
      })

      console.log('응답 상태:', response.status, response.statusText);
      const result = await response.json()
      console.log('응답 데이터:', result);

      if (!response.ok) {
        throw new Error(result.message || '로그인에 실패했습니다.')
      }

      return result
    } catch (error) {
      console.error('로그인 API 오류:', error)
      throw error
    }
  },

  /**
   * 사용자 이름 조회 API 호출
   * @returns {Promise<Object>} 사용자 이름 조회 결과
   */
  async getUserName() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER.PROFILE}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '사용자 이름 조회에 실패했습니다.');
      }

      return result;
    } catch (error) {
      console.error('사용자 이름 조회 API 오류:', error);
      throw error;
    }
  }
}
