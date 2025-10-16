/**
 * 커플 관련 API 서비스
 * 초대 링크 생성, 커플 연결 등 기능
 */

import { getAccessToken, logout } from '@/lib/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 커플 초대 링크 생성
 * @returns {Promise<Object>} 초대 링크 정보
 */
export const createCoupleInviteLink = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${BASE_URL}/api/couple/invite`, {
      method: 'POST',
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
    console.log('커플 초대 링크 생성 API 응답:', data);
    return data.data || {};
  } catch (error) {
    console.error('커플 초대 링크 생성 실패:', error);
    throw error;
  }
};

/**
 * 커플 초대 링크로 연결
 * @param {string} inviteCode - 초대 코드
 * @returns {Promise<Object>} 연결 결과
 */
export const connectCoupleByInviteCode = async (inviteCode) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${BASE_URL}/api/couple/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteCode }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.data || {};
  } catch (error) {
    console.error('커플 연결 실패:', error);
    throw error;
  }
};

/**
 * 커플 정보 조회
 * @returns {Promise<Object>} 커플 정보
 */
export const getCoupleInfo = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${BASE_URL}/api/couple/info`, {
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
    return data.data || {};
  } catch (error) {
    console.error('커플 정보 조회 실패:', error);
    throw error;
  }
};
