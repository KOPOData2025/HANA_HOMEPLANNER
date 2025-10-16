/**
 * 마커 데이터 캐시 관리 유틸리티
 */

// 캐시 저장소
const markerCache = new Map();
const individualHouseCache = new Map();
const pendingRequests = new Map();

// 캐시 만료 시간 (밀리초) - 30분
const CACHE_EXPIRY_TIME = 30 * 60 * 1000;
// 실시간 데이터 캐시 만료 시간 (밀리초) - 5분
const REALTIME_CACHE_EXPIRY_TIME = 5 * 60 * 1000;
// 개별 주택 정보 캐시 만료 시간 (밀리초) - 1시간
const INDIVIDUAL_HOUSE_CACHE_EXPIRY_TIME = 60 * 60 * 1000;

/**
 * 캐시에 데이터 저장
 * @param {string} key - 캐시 키
 * @param {any} data - 저장할 데이터
 */
export const setCache = (key, data) => {
  const cacheItem = {
    data,
    timestamp: Date.now()
  };
  markerCache.set(key, cacheItem);
  console.log(`[캐시] 데이터 저장: ${key}`);
};

/**
 * 캐시에서 데이터 조회
 * @param {string} key - 캐시 키
 * @returns {any|null} - 캐시된 데이터 또는 null
 */
export const getCache = (key) => {
  const cacheItem = markerCache.get(key);
  
  if (!cacheItem) {
    console.log(`[캐시] 데이터 없음: ${key}`);
    return null;
  }
  
  // 만료 시간 체크
  const now = Date.now();
  const isExpired = (now - cacheItem.timestamp) > CACHE_EXPIRY_TIME;
  
  if (isExpired) {
    console.log(`[캐시] 데이터 만료: ${key}`);
    markerCache.delete(key);
    return null;
  }
  
  console.log(`[캐시] 데이터 조회 성공: ${key}`);
  return cacheItem.data;
};

/**
 * 실시간 데이터 캐시에서 데이터 조회 (5분 캐시)
 * @param {string} key - 캐시 키
 * @returns {any|null} - 캐시된 데이터 또는 null
 */
export const getRealtimeCache = (key) => {
  const cacheItem = markerCache.get(key);
  
  if (!cacheItem) {
    console.log(`[실시간 캐시] 데이터 없음: ${key}`);
    return null;
  }
  
  // 실시간 데이터 만료 시간 체크 (5분)
  const now = Date.now();
  const isExpired = (now - cacheItem.timestamp) > REALTIME_CACHE_EXPIRY_TIME;
  
  if (isExpired) {
    console.log(`[실시간 캐시] 데이터 만료: ${key}`);
    markerCache.delete(key);
    return null;
  }
  
  console.log(`[실시간 캐시] 데이터 조회 성공: ${key}`);
  return cacheItem.data;
};

/**
 * 특정 키의 캐시 삭제
 * @param {string} key - 캐시 키
 */
export const clearCache = (key) => {
  if (key) {
    markerCache.delete(key);
    console.log(`[캐시] 특정 데이터 삭제: ${key}`);
  } else {
    markerCache.clear();
    console.log(`[캐시] 전체 데이터 삭제`);
  }
};

/**
 * 캐시 상태 조회
 * @returns {object} - 캐시 상태 정보
 */
export const getCacheStatus = () => {
  const now = Date.now();
  const status = {
    totalItems: markerCache.size,
    items: []
  };
  
  for (const [key, item] of markerCache.entries()) {
    const isExpired = (now - item.timestamp) > CACHE_EXPIRY_TIME;
    status.items.push({
      key,
      timestamp: item.timestamp,
      isExpired,
      age: now - item.timestamp
    });
  }
  
  return status;
};

/**
 * 만료된 캐시 정리
 */
export const cleanupExpiredCache = () => {
  const now = Date.now();
  let cleanedCount = 0;
  
  // 일반 캐시 정리
  for (const [key, item] of markerCache.entries()) {
    if ((now - item.timestamp) > CACHE_EXPIRY_TIME) {
      markerCache.delete(key);
      cleanedCount++;
    }
  }
  
  // 개별 주택 캐시 정리
  for (const [key, item] of individualHouseCache.entries()) {
    if ((now - item.timestamp) > INDIVIDUAL_HOUSE_CACHE_EXPIRY_TIME) {
      individualHouseCache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`[캐시] 만료된 데이터 정리: ${cleanedCount}개`);
  }
  
  return cleanedCount;
};

/**
 * 개별 주택 정보 캐시 저장
 * @param {string} houseManageNo - 주택 관리 번호
 * @param {any} data - 저장할 데이터
 */
export const setIndividualHouseCache = (houseManageNo, data) => {
  const cacheItem = {
    data,
    timestamp: Date.now()
  };
  individualHouseCache.set(houseManageNo, cacheItem);
  console.log(`[개별 주택 캐시] 데이터 저장: ${houseManageNo}`);
};

/**
 * 개별 주택 정보 캐시 조회
 * @param {string} houseManageNo - 주택 관리 번호
 * @returns {any|null} - 캐시된 데이터 또는 null
 */
export const getIndividualHouseCache = (houseManageNo) => {
  const cacheItem = individualHouseCache.get(houseManageNo);
  
  if (!cacheItem) {
    return null;
  }
  
  // 만료 시간 체크
  const now = Date.now();
  const isExpired = (now - cacheItem.timestamp) > INDIVIDUAL_HOUSE_CACHE_EXPIRY_TIME;
  
  if (isExpired) {
    console.log(`[개별 주택 캐시] 데이터 만료: ${houseManageNo}`);
    individualHouseCache.delete(houseManageNo);
    return null;
  }
  
  return cacheItem.data;
};

/**
 * 진행 중인 요청 저장
 * @param {string} key - 요청 키
 * @param {Promise} promise - 요청 Promise
 */
export const setPendingRequest = (key, promise) => {
  pendingRequests.set(key, promise);
  console.log(`[진행 중인 요청] 저장: ${key}`);
};

/**
 * 진행 중인 요청 조회
 * @param {string} key - 요청 키
 * @returns {Promise|null} - 진행 중인 Promise 또는 null
 */
export const getPendingRequest = (key) => {
  return pendingRequests.get(key) || null;
};

/**
 * 진행 중인 요청 제거
 * @param {string} key - 요청 키
 */
export const clearPendingRequest = (key) => {
  pendingRequests.delete(key);
  console.log(`[진행 중인 요청] 제거: ${key}`);
};

/**
 * 개별 주택 캐시 삭제
 * @param {string} houseManageNo - 주택 관리 번호
 */
export const clearIndividualHouseCache = (houseManageNo) => {
  if (houseManageNo) {
    individualHouseCache.delete(houseManageNo);
    console.log(`[개별 주택 캐시] 특정 데이터 삭제: ${houseManageNo}`);
  } else {
    individualHouseCache.clear();
    console.log(`[개별 주택 캐시] 전체 데이터 삭제`);
  }
};
