/**
 * 마이데이터 조회 API 서비스
 * CI 값을 통한 사용자 금융 정보 조회
 */

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const myDataService = {
  /**
   * CI 값으로 마이데이터 조회
   * @param {string} ci - SMS 인증을 통해 받은 CI 값
   * @returns {Promise<Object>} 마이데이터 조회 응답
   */
  async getMyDataByCi(ci) {
    try {
      console.log('🔍 마이데이터 조회 시작:', { ci });
      
      const response = await fetch(`${API_BASE_URL}/api/my-data/ci/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ci })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '마이데이터 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 마이데이터 조회 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '마이데이터 조회가 완료되었습니다.'
      };
    } catch (error) {
      console.error('❌ 마이데이터 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '마이데이터 조회 중 오류가 발생했습니다.'
      };
    }
  }
};
