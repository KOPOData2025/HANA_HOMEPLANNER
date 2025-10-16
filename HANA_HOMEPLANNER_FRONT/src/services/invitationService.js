import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

/**
 * 공동적금 초대 링크 생성 API 호출
 * @param {string} accountNumber - 계좌번호
 * @returns {Promise<Object>} 초대 생성 결과
 */
export const createJointSavingsInvitation = async (accountNumber) => {
  try {
    console.log('🔍 공동적금 초대 링크 생성 API 요청:', { accountNumber });

    const response = await fetch(`${API_BASE_URL}/api/bank/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        accountNumber: accountNumber
      })
    });

    console.log('🔍 공동적금 초대 생성 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 공동적금 초대 생성 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 공동적금 초대 생성 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 공동적금 초대 생성 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 초대 링크 조회 API 호출
 * @param {string} inviteId - 초대 ID
 * @returns {Promise<Object>} 초대 정보
 */
export const getInvitationDetail = async (inviteId) => {
  try {
    console.log('🔍 초대 링크 조회 API 요청:', { inviteId });

    const response = await fetch(`${API_BASE_URL}/api/banks/invitations/${inviteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });

    console.log('🔍 초대 링크 조회 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 초대 링크 조회 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      try {
        const errorData = JSON.parse(errorText);
        
        // 토큰 만료 에러인지 확인
        if (response.status === 401 && errorData.message && errorData.message.includes('토큰이 만료되었습니다')) {
          throw new Error('TOKEN_EXPIRED');
        }
        
        // 404 에러인 경우 (API가 구현되지 않음)
        if (response.status === 404) {
          throw new Error('API_NOT_IMPLEMENTED');
        }
        
        // 서버 에러 메시지가 있으면 사용
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 에러 텍스트 사용
        console.warn('에러 응답 JSON 파싱 실패:', parseError);
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 초대 링크 조회 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 초대 링크 조회 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 초대 링크 삭제 API 호출
 * @param {string} inviteId - 초대 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteInvitation = async (inviteId) => {
  try {
    console.log('🔍 초대 링크 삭제 API 요청:', { inviteId });

    const response = await fetch(`${API_BASE_URL}/api/bank/invitations/${inviteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });

    console.log('🔍 초대 링크 삭제 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 초대 링크 삭제 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 초대 링크 삭제 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 초대 링크 삭제 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 초대 수락 API 호출 (PUT 방식)
 * @param {string} inviteId - 초대 ID
 * @returns {Promise<Object>} 초대 수락 결과
 */
export const acceptInvitation = async (inviteId) => {
  try {
    console.log('🔍 초대 수락 API 요청 (PUT):', { inviteId });

    const response = await fetch(`${API_BASE_URL}/api/bank/invitations/${inviteId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });

    console.log('🔍 초대 수락 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 초대 수락 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      // 에러 응답을 JSON으로 파싱 시도
      try {
        const errorData = JSON.parse(errorText);
        if (response.status === 401 && errorData.message && errorData.message.includes('토큰이 만료되었습니다')) {
          throw new Error('TOKEN_EXPIRED');
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      } catch (parseError) {
        console.warn('에러 응답 JSON 파싱 실패:', parseError);
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 초대 수락 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 초대 수락 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 초대 기반 계좌 정보 조회 API 호출
 * @param {string} inviteId - 초대 ID
 * @returns {Promise<Object>} 계좌 정보 응답
 */
export const getInvitationAccountInfo = async (inviteId) => {
  try {
    console.log('🔍 초대 기반 계좌 정보 조회 API 요청:', { inviteId });
    
    const response = await fetch(`${API_BASE_URL}/api/banks/invitations/${inviteId}/account-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });

    console.log('🔍 초대 기반 계좌 정보 조회 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 초대 기반 계좌 정보 조회 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      // 에러 응답을 JSON으로 파싱 시도
      try {
        const errorData = JSON.parse(errorText);
        if (response.status === 401 && errorData.message && errorData.message.includes('토큰이 만료되었습니다')) {
          throw new Error('TOKEN_EXPIRED');
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      } catch (parseError) {
        console.warn('에러 응답 JSON 파싱 실패:', parseError);
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 초대 기반 계좌 정보 조회 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 초대 기반 계좌 정보 조회 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 계좌 정보 연동 API 호출 (제거됨 - 불필요한 API)
 * 이 함수는 더 이상 사용되지 않습니다.
 * 공동적금 가입 시 계좌 정보가 함께 전송됩니다.
 */

/**
 * 초대 기반 공동적금 가입 API 호출
 * @param {Object} signupData - 가입 데이터
 * @returns {Promise<Object>} 가입 결과
 */
export const signupJointSavingsByInvite = async (signupData) => {
  try {
    console.log('🔍 초대 기반 공동적금 가입 API 요청:', signupData);
    
    const response = await fetch(`${API_BASE_URL}/api/banks/joint-savings/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(signupData)
    });

    console.log('🔍 초대 기반 공동적금 가입 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 초대 기반 공동적금 가입 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      // 에러 응답을 JSON으로 파싱 시도
      try {
        const errorData = JSON.parse(errorText);
        if (response.status === 401 && errorData.message && errorData.message.includes('토큰이 만료되었습니다')) {
          throw new Error('TOKEN_EXPIRED');
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      } catch (parseError) {
        console.warn('에러 응답 JSON 파싱 실패:', parseError);
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 초대 기반 공동적금 가입 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 초대 기반 공동적금 가입 API 호출 오류:', error);
    throw error;
  }
};
