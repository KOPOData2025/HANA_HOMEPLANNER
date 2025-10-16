import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const houseDetailsService = {
  // 전체 주택 상세 정보 조회 (좌표 포함)
  async getAllHouseDetails() {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.DETAILS}`;
      
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
      console.error('주택 상세 정보 조회 오류:', error);
      throw error;
    }
  }
};
