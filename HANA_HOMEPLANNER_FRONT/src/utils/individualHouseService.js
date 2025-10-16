/**
 * 개별 주택 정보 서비스
 * 캐싱과 중복 요청 방지를 통한 최적화된 API 호출
 */

import { 
  getIndividualHouseCache, 
  setIndividualHouseCache, 
  getPendingRequest, 
  setPendingRequest, 
  clearPendingRequest 
} from './cacheUtils';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

/**
 * 개별 주택 정보를 가져오는 최적화된 함수
 * @param {string} houseManageNo - 주택 관리 번호
 * @returns {Promise<Object|null>} - 주택 정보 또는 null
 */
export const getIndividualHouseData = async (houseManageNo) => {
  if (!houseManageNo) {
    console.warn('⚠️ houseManageNo가 없습니다:', houseManageNo);
    return null;
  }

  // 1. 캐시에서 먼저 확인
  const cachedData = getIndividualHouseCache(houseManageNo);
  if (cachedData) {
    return cachedData;
  }

  // 2. 진행 중인 요청이 있는지 확인 (중복 요청 방지)
  const requestKey = `individual-house-${houseManageNo}`;
  const pendingRequest = getPendingRequest(requestKey);
  if (pendingRequest) {
    console.log(`[개별 주택 서비스] 진행 중인 요청 재사용: ${houseManageNo}`);
    return await pendingRequest;
  }

  // 3. 새로운 API 요청 생성
  const apiId = `${houseManageNo}_${houseManageNo}_1`;
  const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.INDIVIDUAL_JSON}/${apiId}`;
  
  console.log(`[개별 주택 서비스] 새로운 API 호출: ${houseManageNo}`);
  
  const requestPromise = fetch(apiUrl)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} - ${apiId}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 캐시에 저장
        setIndividualHouseCache(houseManageNo, result.data);
        console.log(`[개별 주택 서비스] API 호출 성공 및 캐시 저장: ${houseManageNo}`);
        return result.data;
      } else {
        throw new Error(`API 응답 데이터 형식 오류: ${apiId}`);
      }
    })
    .catch((error) => {
      console.error(`[개별 주택 서비스] API 호출 실패: ${houseManageNo}`, error);
      return null;
    })
    .finally(() => {
      // 요청 완료 처리
      clearPendingRequest(requestKey);
    });

  // 진행 중인 요청으로 등록
  setPendingRequest(requestKey, requestPromise);
  
  return await requestPromise;
};
