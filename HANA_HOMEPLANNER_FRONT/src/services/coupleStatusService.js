/**
 * 커플 연동 상태 관련 API 서비스
 */

import { getAccessToken, logout } from '@/lib/auth';
import { API_BASE_URL } from '@/config/api';

/**
 * 커플 연동 상태 조회
 * @returns {Promise<Object>} 커플 연동 상태 정보
 */
export const getCoupleStatus = async () => {
  try {
    const token = getAccessToken();
    console.log('커플 상태 조회 - JWT 토큰 확인:', token ? '토큰 존재' : '토큰 없음');
    
    if (!token) {
      // 토큰이 없으면 조용히 기본값 반환 (토스터 알림 없음)
      return {
        hasCouple: false,
        coupleId: null,
        partnerUserId: null,
        status: null,
        createdAt: null,
        message: '로그인이 필요합니다.'
      };
    }

    const url = `${API_BASE_URL}/api/couple/status`;
    console.log('커플 상태 조회 API 요청 URL:', url);
    console.log('요청 헤더:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('커플 상태 조회 API 응답 상태:', response.status);
    console.log('커플 상태 조회 API 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // 응답 본문을 읽어서 에러 메시지 확인
      let errorMessage = `커플 상태 조회 실패: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('커플 상태 조회 API 에러 응답:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('커플 상태 조회 에러 응답 파싱 실패:', parseError);
      }

      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('커플 상태 조회 API 성공 응답:', data);
    return data.data || {};
  } catch (error) {
    console.error('커플 상태 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 파트너 정보 조회 (커플 연동된 경우)
 * @param {string} partnerUserId - 파트너 사용자 ID
 * @returns {Promise<Object>} 파트너 정보
 */
export const getPartnerInfo = async (partnerUserId) => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${API_BASE_URL}/api/couple/partner/${partnerUserId}`;
    console.log('파트너 정보 조회 API 요청 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`파트너 정보 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('파트너 정보 조회 API 성공 응답:', data);
    return data.data || {};
  } catch (error) {
    console.error('파트너 정보 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 파트너 상세 정보 조회 (새로운 API)
 * @returns {Promise<Object>} 파트너 상세 정보
 */
export const getPartnerDetail = async () => {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${API_BASE_URL}/api/couple/partner/detail`;
    console.log('파트너 상세 정보 조회 API 요청 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new Error(`파트너 상세 정보 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('파트너 상세 정보 조회 API 성공 응답:', data);
    return data.data || {};
  } catch (error) {
    console.error('파트너 상세 정보 조회 API 오류:', error);
    throw error;
  }
};

// 서비스 객체로 export
export const coupleStatusService = {
  getCoupleStatus,
  getPartnerInfo,
  getPartnerDetail
};
