import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

/**
 * 적금 가입 API 호출
 * @param {Object} signupData - 적금 가입 데이터
 * @param {string} signupData.productId - 상품 ID
 * @param {string} signupData.startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} signupData.endDate - 종료 날짜 (YYYY-MM-DD)
 * @param {number} signupData.monthlyAmount - 월 납입액
 * @param {number} signupData.initialDeposit - 초기 입금액
 * @param {string|null} signupData.autoDebitAccountId - 자동이체 계좌번호 (선택사항)
 * @param {string} signupData.autoDebitDate - 자동이체 날짜 (YYYY-MM-DD)
 * @returns {Promise<Object>} 적금 가입 응답 데이터
 */
export const createSavingsAccount = async (signupData) => {
  try {
    console.log('💰 적금 가입 API 요청:', {
      url: `${API_BASE_URL}/api/savings/accounts`,
      data: signupData
    });

    const response = await apiClient.post(`${API_BASE_URL}/api/savings/accounts`, signupData);

    console.log('💰 적금 가입 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💰 적금 가입 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('💰 적금 가입 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 적금 가입 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 사용자 입출금 계좌 목록 조회 API 호출 (마이데이터)
 * @returns {Promise<Object>} 입출금 계좌 목록 응답 데이터
 */
export const getDepositAccounts = async () => {
  try {
    console.log('🏦 입출금 계좌 목록 조회 API 요청:', {
      url: `${API_BASE_URL}/api/my-data/bank-accounts/my-accounts/type/DEPOSIT`
    });

    const response = await apiClient.get(`${API_BASE_URL}/api/my-data/bank-accounts/my-accounts/type/DEPOSIT`);

    console.log('🏦 입출금 계좌 목록 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🏦 입출금 계좌 목록 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🏦 입출금 계좌 목록 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 입출금 계좌 목록 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 사용자 요구불 계좌 목록 조회 API 호출
 * @returns {Promise<Object>} 요구불 계좌 목록 응답 데이터
 */
export const getDemandAccounts = async () => {
  try {
    console.log('💰 요구불 계좌 목록 조회 API 요청:', {
      url: `${API_BASE_URL}/api/accounts/my-accounts/type/DEMAND`
    });

    const response = await apiClient.get(`${API_BASE_URL}/api/accounts/my-accounts/type/DEMAND`);

    console.log('💰 요구불 계좌 목록 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💰 요구불 계좌 목록 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('💰 요구불 계좌 목록 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 요구불 계좌 목록 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 모든 계좌 목록 조회 (입출금 + 요구불)
 * @returns {Promise<Object>} 통합된 계좌 목록 응답 데이터
 */
export const getAllUserAccounts = async () => {
  try {
    console.log('🏦 모든 계좌 목록 조회 시작');

    // 두 API를 병렬로 호출
    const [depositResponse, demandResponse] = await Promise.all([
      getDepositAccounts(),
      getDemandAccounts()
    ]);

    // 데이터 통합
    const allAccounts = [];
    
    // 입출금 계좌 데이터 변환 및 추가
    if (depositResponse.success && depositResponse.data) {
      const depositAccounts = depositResponse.data.map(account => ({
        id: account.accountId.toString(),
        name: account.accountName,
        number: account.accountNum,
        balance: `${account.balanceAmt.toLocaleString()}원`,
        status: account.status,
        orgCode: account.orgCode,
        type: 'DEPOSIT'
      }));
      allAccounts.push(...depositAccounts);
    }

    // 요구불 계좌 데이터 변환 및 추가
    if (demandResponse.success && demandResponse.data) {
      const demandAccounts = demandResponse.data.map(account => ({
        id: account.accountId,
        name: `요구불계좌 (${account.productId})`,
        number: account.accountNum,
        balance: `${account.balance.toLocaleString()}원`,
        status: account.status,
        productId: account.productId,
        type: 'DEMAND'
      }));
      allAccounts.push(...demandAccounts);
    }

    console.log('🏦 통합된 계좌 목록:', allAccounts);

    return {
      success: true,
      message: '모든 계좌 목록 조회 성공',
      data: allAccounts
    };
  } catch (error) {
    console.error('❌ 모든 계좌 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 적금 만기금 수령받기 API 호출
 * @param {string} accountId - 적금 계좌 ID
 * @param {string} targetAccountNumber - 이체받을 계좌번호
 * @returns {Promise<Object>} 만기금 수령 응답 데이터
 */
export const claimMaturityAmount = async (accountId, targetAccountNumber) => {
  try {
    console.log('💰 적금 만기금 수령 API 요청:', {
      url: `${API_BASE_URL}/api/banks/savings/${accountId}/maturity-payout`,
      data: { targetAccountNumber }
    });

    const response = await apiClient.post(`${API_BASE_URL}/api/banks/savings/${accountId}/maturity-payout`, {
      targetAccountNumber
    });

    console.log('💰 적금 만기금 수령 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💰 적금 만기금 수령 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('💰 적금 만기금 수령 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 적금 만기금 수령 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 날짜 계산 유틸리티 함수들
 */
export const dateUtils = {
  /**
   * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
   * @returns {string} 오늘 날짜
   */
  getToday: () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },

  /**
   * 시작 날짜로부터 지정된 개월 수 후의 날짜를 계산
   * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
   * @param {number} months - 추가할 개월 수
   * @returns {string} 계산된 날짜 (YYYY-MM-DD)
   */
  addMonths: (startDate, months) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  },

  /**
   * 자동이체 희망일 기준으로 시작일과 종료일 계산
   * 달력에서 선택 가능한 날짜만 전달되므로 단순화된 로직
   * @param {number} preferredDay - 자동이체 희망일 (1-31)
   * @param {number} termMonths - 가입 기간 (개월)
   * @returns {Object} 시작일과 종료일
   */
  calculateSavingsPeriod: (preferredDay, termMonths) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    console.log('📅 날짜 계산 시작:', {
      preferredDay,
      termMonths,
      currentYear,
      currentMonth,
      currentDay
    });

    let startDate;

    // 선택된 날짜가 이번 달의 오늘 이후 날짜인 경우 (오늘 제외)
    if (preferredDay > currentDay) {
      // 이번 달의 선택된 날짜로 시작
      startDate = new Date(currentYear, currentMonth, preferredDay);
      console.log('📅 이번 달 오늘 이후 날짜 선택:', startDate.toISOString().split('T')[0]);
    } else {
      // 선택된 날짜가 다음 달의 과거 날짜인 경우 (오늘 포함)
      startDate = new Date(currentYear, currentMonth + 1, preferredDay);
      console.log('📅 다음 달 과거 날짜 선택:', startDate.toISOString().split('T')[0]);
      
      // 다음 달에 해당 날짜가 없는 경우 (예: 2월 30일, 31일)
      if (startDate.getDate() !== preferredDay) {
        // 해당 월의 마지막 날로 설정
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        console.log('📅 월말로 조정:', startDate.toISOString().split('T')[0]);
      }
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDate = dateUtils.addMonths(startDateStr, termMonths);
    
    console.log('📅 최종 계산 결과:', {
      startDate: startDateStr,
      endDate
    });
    
    return {
      startDate: startDateStr,
      endDate
    };
  },

  /**
   * 날짜 유효성 검사
   * @param {number} day - 검사할 일 (1-31)
   * @returns {Object} 검사 결과
   */
  validateDay: (day) => {
    const errors = {};
    const today = new Date();
    const currentDay = today.getDate();

    if (!day || day < 1 || day > 31) {
      errors.preferredDay = '자동이체 희망일은 1일부터 31일까지 입력 가능합니다.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
