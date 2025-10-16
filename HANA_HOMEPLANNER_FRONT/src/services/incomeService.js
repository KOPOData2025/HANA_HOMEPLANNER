import { authenticatedGet } from '@/lib/authInterceptor';

/**
 * 연소득 정보 조회 서비스
 */
export const incomeService = {
  /**
   * JWT 토큰으로 내 연소득 정보 조회
   * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
   * @returns {Promise<Object>} 연소득 정보
   */
  async getMyIncome(navigate = null) {
    try {
      console.log('🔍 내 연소득 정보 조회 시작');
      const response = await authenticatedGet('/api/my-data/income/my-income', navigate);
      console.log('✅ 내 연소득 정보 조회 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 내 연소득 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 사용자 ID로 연소득 정보 조회
   * @param {string} userId - 사용자 ID
   * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
   * @returns {Promise<Object>} 연소득 정보
   */
  async getIncomeByUserId(userId, navigate = null) {
    try {
      console.log('🔍 사용자 연소득 정보 조회 시작:', userId);
      const response = await authenticatedGet(`/api/my-data/income/${userId}`, navigate);
      console.log('✅ 사용자 연소득 정보 조회 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 사용자 연소득 조회 실패:', error);
      throw error;
    }
  }
};
