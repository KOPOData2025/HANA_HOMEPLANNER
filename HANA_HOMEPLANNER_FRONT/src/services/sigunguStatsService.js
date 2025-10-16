import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const sigunguStatsService = {
  // 전체 시군구별 분양가 통계 조회
  async getAllSigunguStats() {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.STATS.SIGUNGU}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'API 호출 실패');
      }
    } catch (error) {
      console.error('시군구 통계 조회 오류:', error);
      throw error;
    }
  }
};
