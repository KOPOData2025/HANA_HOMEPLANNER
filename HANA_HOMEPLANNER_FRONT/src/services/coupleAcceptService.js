/**
 * 커플 초대 수락 관련 API 서비스
 */

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const coupleAcceptService = {
  /**
   * 커플 초대 수락 API 호출
   * @param {string} inviteToken - 초대 토큰
   * @param {string} acceptorId - 수락자 사용자 ID
   * @returns {Promise<Object>} 커플 연결 결과
   */
  async acceptInvite(inviteToken, acceptorId) {
    try {
      console.log('커플 초대 수락 API 호출:', { inviteToken, acceptorId });
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUPLE.ACCEPT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          inviteToken,
          acceptorId
        })
      });

      console.log('커플 연결 응답 상태:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('커플 연결 응답 데이터:', result);

      if (!response.ok) {
        throw new Error(result.message || '커플 연결 중 오류가 발생했습니다.');
      }

      return result;
    } catch (error) {
      console.error('커플 연결 API 오류:', error);
      throw error;
    }
  },

  /**
   * 초대자 정보 조회 API 호출
   * @param {string} inviterId - 초대자 ID
   * @returns {Promise<Object>} 초대자 정보
   */
  async getInviterInfo(inviterId) {
    try {
      console.log('초대자 정보 조회 API 호출:', { inviterId });
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER.PROFILE}/${inviterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('초대자 정보 조회 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        console.warn('초대자 정보 조회 실패, 기본값 사용');
        return {
          userNm: '배우자',
          userId: inviterId
        };
      }

      const result = await response.json();
      console.log('초대자 정보 조회 응답 데이터:', result);

      return {
        userNm: result.data?.userNm || result.userNm || '배우자',
        userId: inviterId
      };
    } catch (error) {
      console.error('초대자 정보 조회 API 오류:', error);
      return {
        userNm: '배우자',
        userId: inviterId
      };
    }
  },

  /**
   * 초대 정보 조회 API 호출 (선택사항)
   * @param {string} inviteToken - 초대 토큰
   * @returns {Promise<Object>} 초대 정보
   */
  async getInviteInfo(inviteToken) {
    try {
      console.log('초대 정보 조회 API 호출:', { inviteToken });
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUPLE.INVITE}/${inviteToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('초대 정보 조회 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        // 404나 다른 오류의 경우 기본값 반환
        console.warn('초대 정보 조회 실패, 기본값 사용');
        return {
          inviterName: '배우자',
          inviterId: null,
          message: '함께 내 집 마련 계획을 세워보세요!'
        };
      }

      const result = await response.json();
      console.log('초대 정보 조회 응답 데이터:', result);

      // 응답에서 초대자 정보 추출
      return {
        inviterName: result.inviterName || result.inviter?.name || '배우자',
        inviterId: result.inviterId || result.inviter?.id || null,
        inviterEmail: result.inviterEmail || result.inviter?.email || '',
        message: result.message || '함께 내 집 마련 계획을 세워보세요!'
      };
    } catch (error) {
      console.error('초대 정보 조회 API 오류:', error);
      // 오류 발생 시 기본값 반환
      return {
        inviterName: '배우자',
        inviterId: null,
        message: '함께 내 집 마련 계획을 세워보세요!'
      };
    }
  }
};
