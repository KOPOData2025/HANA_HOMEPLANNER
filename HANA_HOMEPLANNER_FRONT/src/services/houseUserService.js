/**
 * 사용자 주택 관련 API 서비스
 * 찜한 주택, 신청한 주택 조회 기능
 */

import { getAccessToken, logout } from '@/lib/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 찜한 주택 목록 조회
 * @returns {Promise<Array>} 찜한 주택 목록
 */
export const getHouseLikes = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      // 토큰이 없으면 조용히 빈 배열 반환 (토스터 알림 없음)
      return [];
    }

    const response = await fetch(`${BASE_URL}/api/user/house-like`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('찜한 주택 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 신청한 주택 목록 조회
 * @returns {Promise<Array>} 신청한 주택 목록
 */
export const getHouseApplies = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      // 토큰이 없으면 조용히 빈 배열 반환 (토스터 알림 없음)
      return [];
    }

    const response = await fetch(`${BASE_URL}/api/user/house-apply`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('신청한 주택 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 찜한 주택 삭제
 * @param {string|number} houseId - 주택 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const removeHouseLike = async (houseId) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${BASE_URL}/api/user/house-like/${houseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('찜한 주택 삭제 실패:', error);
    throw error;
  }
};

/**
 * 찜한 주택 추가
 * @param {string|number} houseId - 주택 ID
 * @returns {Promise<boolean>} 추가 성공 여부
 */
export const addHouseLike = async (houseId) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${BASE_URL}/api/user/house-like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ houseManageNo: houseId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('찜한 주택 추가 실패:', error);
    throw error;
  }
};
