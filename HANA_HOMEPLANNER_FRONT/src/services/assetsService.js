import { authenticatedGet } from '@/lib/authInterceptor';

/**
 * 자산 정보 조회 서비스
 */
export const assetsService = {
  /**
   * JWT 토큰으로 내 자산 정보 조회 (상세 정보 포함)
   * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
   * @returns {Promise<Object>} 자산 정보
   */
  async getMyTotalAssets(navigate = null) {
    try {
      console.log('🔍 내 자산 정보 조회 시작');
      const response = await authenticatedGet('/api/my-data/assets/my-assets', navigate);
      console.log('✅ 내 자산 정보 조회 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 내 자산 정보 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 사용자 ID로 자산 정보 조회 (상세 정보 포함)
   * @param {string} userId - 사용자 ID
   * @param {Function} navigate - React Router의 navigate 함수 (선택사항)
   * @returns {Promise<Object>} 자산 정보
   */
  async getTotalAssetsByUserId(userId, navigate = null) {
    try {
      console.log('🔍 사용자 자산 정보 조회 시작:', userId);
      const response = await authenticatedGet(`/api/my-data/assets/${userId}`, navigate);
      console.log('✅ 사용자 자산 정보 조회 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 사용자 자산 정보 조회 실패:', error);
      throw error;
    }
  }
};