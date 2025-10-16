/**
 * 공동 대출 초대 관련 API 서비스
 */

import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

export const jointLoanInviteService = {
  /**
   * 초대 정보 조회
   * @param {string} inviteId - 초대 ID
   * @returns {Promise<Object>} 초대 정보 응답
   */
  async getInviteInfo(inviteId) {
    try {
      console.log('🔍 [Service] 공동 대출 초대 정보 조회 시작:', inviteId);
      console.log('🌐 [Service] API URL:', `${API_BASE_URL}/api/loans/invitations/${inviteId}/detail`);
      
      const response = await apiClient.get(`${API_BASE_URL}/api/loans/invitations/${inviteId}/detail`);
      console.log('📡 [Service] HTTP Response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      if (!response.ok) {
        console.log('⚠️ [Service] HTTP 오류 응답');
        const errorData = await response.json();
        console.log('📄 [Service] 오류 데이터:', errorData);
        throw new Error(errorData.message || '초대 정보 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ [Service] 공동 대출 초대 정보 조회 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '초대 정보 조회 성공'
      };
    } catch (error) {
      console.error('❌ [Service] 공동 대출 초대 정보 조회 오류:', error);
      console.error('❌ [Service] 오류 스택:', error.stack);
      return {
        success: false,
        data: null,
        message: error.message || '초대 정보 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 휴대폰 인증번호 발송
   * @param {string} name - 이름
   * @param {string} residentNumber - 주민등록번호
   * @param {string} phoneNumber - 휴대폰번호
   * @returns {Promise<Object>} 인증번호 발송 응답
   */
  async sendVerificationCode(name, residentNumber, phoneNumber) {
    try {
      console.log('📱 인증번호 발송 시작:', { name, residentNumber, phoneNumber });
      
      const response = await apiClient.post(`${API_BASE_URL}/api/auth/sms/verification`, {
        name,
        residentNumber,
        phoneNumber
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '인증번호 발송에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 인증번호 발송 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '인증번호가 발송되었습니다.'
      };
    } catch (error) {
      console.error('❌ 인증번호 발송 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '인증번호 발송 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 휴대폰 인증번호 확인
   * @param {string} phoneNumber - 휴대폰번호
   * @param {string} verificationCode - 인증번호
   * @returns {Promise<Object>} 인증 확인 응답
   */
  async verifyCode(phoneNumber, verificationCode) {
    try {
      console.log('🔐 [Service] 인증번호 확인 시작:', { phoneNumber, verificationCode });
      
      const response = await apiClient.post(`${API_BASE_URL}/api/auth/sms/verification/confirm`, {
        phoneNumber,
        verificationCode
      });
      
      console.log('📡 [Service] 인증번호 확인 HTTP Response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('📄 [Service] 인증번호 확인 오류 데이터:', errorData);
        throw new Error(errorData.message || '인증번호 확인에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ [Service] 인증번호 확인 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '인증이 완료되었습니다.'
      };
    } catch (error) {
      console.error('❌ 인증번호 확인 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '인증번호 확인 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 공동 대출 초대 수락
   * @param {string} inviteId - 초대 ID
   * @param {Object} userData - 사용자 정보
   * @returns {Promise<Object>} 초대 수락 응답
   */
  async acceptInvite(inviteId, userData) {
    try {
      console.log('🤝 공동 대출 초대 수락 시작:', inviteId, userData);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/joint-loans/invites/${inviteId}/accept`, {
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        birthDate: userData.birthDate,
        verificationCode: userData.verificationCode
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '초대 수락에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 공동 대출 초대 수락 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '초대가 수락되었습니다.'
      };
    } catch (error) {
      console.error('❌ 공동 대출 초대 수락 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '초대 수락 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 초대 수락 (CI 값으로)
   * @param {string} inviteId - 초대 ID
   * @param {string} jointCi - 인증된 사용자의 CI 값
   * @returns {Promise<Object>} 초대 수락 응답
   */
  async acceptInviteWithCi(inviteId, jointCi) {
    try {
      console.log('🤝 [Service] CI를 통한 초대 수락 시작:', { inviteId, jointCi });
      
      const response = await apiClient.post(`${API_BASE_URL}/api/loans/invitations/${inviteId}/accept-with-ci`, {
        jointCi
      });
      
      console.log('📡 [Service] 초대 수락 HTTP Response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('📄 [Service] 초대 수락 오류 데이터:', errorData);
        throw new Error(errorData.message || '초대 수락에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ [Service] 초대 수락 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '초대가 수락되었습니다.'
      };
    } catch (error) {
      console.error('❌ [Service] 초대 수락 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '초대 수락 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 초대 상태 조회
   * @param {string} inviteId - 초대 ID
   * @returns {Promise<Object>} 초대 상태 응답
   */
  async getInviteStatus(inviteId) {
    try {
      console.log('📊 공동 대출 초대 상태 조회 시작:', inviteId);
      
      const response = await apiClient.get(`${API_BASE_URL}/api/joint-loans/invites/${inviteId}/status`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '초대 상태 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 공동 대출 초대 상태 조회 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '초대 상태 조회 성공'
      };
    } catch (error) {
      console.error('❌ 공동 대출 초대 상태 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '초대 상태 조회 중 오류가 발생했습니다.'
      };
    }
  }
};
