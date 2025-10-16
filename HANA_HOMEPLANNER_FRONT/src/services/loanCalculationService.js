/**
 * 대출 계산 API 서비스
 * LTV, DSR, DTI 계산을 위한 API 호출 함수들
 */

import { logout } from '@/lib/auth';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

/**
 * 인증 토큰 가져오기
 */
const getAuthToken = () => {
  // auth.js의 방식에 맞게 개별 토큰 가져오기
  const accessToken = localStorage.getItem('accessToken');
  console.log('localStorage에서 가져온 accessToken:', accessToken);
  
  if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
    return accessToken;
  }
  
  console.log('accessToken이 없습니다.');
  return null;
};

/**
 * API 요청 공통 함수
 */
const apiRequest = async (endpoint, data) => {
  const token = getAuthToken();
  
  if (!token) {
    console.log('🔐 [loanCalculationService] 토큰 없음 - 로그아웃 처리');
    logout();
    throw new Error('인증 토큰이 없습니다. 로그인해주세요.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'mode': 'cors',
      'credentials': 'omit'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // 401 인증 오류인 경우 로그아웃 처리
    if (response.status === 401) {
      console.log('🔐 [loanCalculationService] 401 인증 오류 - 로그아웃 처리');
      logout();
    }
    
    throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
  }

  return response.json();
};

/**
 * DTI (총부채상환비율) 계산
 * @param {Object} params - DTI 계산 파라미터
 * @param {string} params.region - 지역 (예: "서울특별시 강남구")
 * @param {number} params.desiredInterestRate - 희망 금리 (%)
 * @param {number} params.desiredLoanPeriod - 희망 대출 기간 (년)
 * @param {number} params.desiredLoanAmount - 희망 대출 금액 (원)
 * @param {number} params.dtiLimit - DTI 한도 (%)
 */
export const calculateDTI = async (params) => {
  console.log('DTI 계산 요청:', params);
  
  const requestData = {
    region: params.region,
    desiredInterestRate: params.desiredInterestRate,
    desiredLoanPeriod: params.desiredLoanPeriod,
    desiredLoanAmount: params.desiredLoanAmount,
    repayMethod: params.repayMethod,
    dtiLimit: params.dtiLimit
  };

  try {
    const result = await apiRequest("/api/calculation/dti", requestData);
    console.log('DTI 계산 결과:', result);
    return result;
  } catch (error) {
    console.error('DTI 계산 오류:', error);
    throw error;
  }
};

/**
 * DSR (부채상환비율) 계산
 * @param {Object} params - DSR 계산 파라미터
 * @param {string} params.region - 지역 (예: "서울특별시 강남구")
 * @param {number} params.desiredLoanAmount - 희망 대출 금액 (원)
 * @param {number} params.desiredInterestRate - 희망 금리 (%)
 * @param {number} params.desiredLoanPeriod - 희망 대출 기간 (년)
 * @param {number} params.dsrLimit - DSR 한도 (%)
 */
export const calculateDSR = async (params) => {
  console.log('DSR 계산 요청:', params);
  
  const requestData = {
    region: params.region,
    desiredLoanAmount: params.desiredLoanAmount,
    desiredInterestRate: params.desiredInterestRate,
    desiredLoanPeriod: params.desiredLoanPeriod,
    repayMethod: params.repayMethod,
    dsrLimit: params.dsrLimit
  };

  try {
    const result = await apiRequest("/api/calculation/dsr", requestData);
    console.log('DSR 계산 결과:', result);
    return result;
  } catch (error) {
    console.error('DSR 계산 오류:', error);
    throw error;
  }
};

/**
 * LTV (주택담보대출비율) 계산
 * @param {Object} params - LTV 계산 파라미터
 * @param {number} params.housePrice - 주택 가격 (원)
 * @param {string} params.region - 지역 (예: "서울특별시 강남구")
 * @param {string} params.housingStatus - 주택 보유 상태 ("무주택자", "주택보유자")
 * @param {number} params.interestRate - 금리 (%)
 * @param {number} params.loanPeriod - 대출 기간 (년)
 */
export const calculateLTV = async (params) => {
  console.log('LTV 계산 요청:', params);
  
  const requestData = {
    housePrice: params.housePrice,
    region: params.region,
    housingStatus: params.housingStatus,
    interestRate: params.interestRate,
    loanPeriod: params.loanPeriod,
    repayMethod: params.repayMethod
  };

  try {
    const result = await apiRequest("/api/calculation/ltv", requestData);
    console.log('LTV 계산 결과:', result);
    return result;
  } catch (error) {
    console.error('LTV 계산 오류:', error);
    throw error;
  }
};

/**
 * 부부 공동 DTI (총부채상환비율) 계산
 * @param {Object} params - 부부 공동 DTI 계산 파라미터
 * @param {string} params.region - 지역 (예: "서울특별시 강남구")
 * @param {number} params.desiredInterestRate - 희망 금리 (%)
 * @param {number} params.desiredLoanPeriod - 희망 대출 기간 (년)
 * @param {number} params.desiredLoanAmount - 희망 대출 금액 (원)
 * @param {string} params.spouseUserId - 배우자 사용자 ID
 */
export const calculateCoupleDTI = async (params) => {
  console.log('부부 공동 DTI 계산 요청:', params);
  
  const requestData = {
    region: params.region,
    desiredInterestRate: params.desiredInterestRate,
    desiredLoanPeriod: params.desiredLoanPeriod,
    desiredLoanAmount: params.desiredLoanAmount,
    repayMethod: params.repayMethod,
    spouseUserId: params.spouseUserId
  };

  try {
    const result = await apiRequest("/api/calculation/couple/dti", requestData);
    console.log('부부 공동 DTI 계산 결과:', result);
    return result;
  } catch (error) {
    console.error('부부 공동 DTI 계산 오류:', error);
    throw error;
  }
};

/**
 * 부부 공동 DSR (부채상환비율) 계산
 * @param {Object} params - 부부 공동 DSR 계산 파라미터
 * @param {string} params.region - 지역 (예: "서울특별시 강남구")
 * @param {number} params.desiredLoanAmount - 희망 대출 금액 (원)
 * @param {number} params.desiredInterestRate - 희망 금리 (%)
 * @param {number} params.desiredLoanPeriod - 희망 대출 기간 (년)
 * @param {string} params.spouseUserId - 배우자 사용자 ID
 */
export const calculateCoupleDSR = async (params) => {
  console.log('부부 공동 DSR 계산 요청:', params);
  
  const requestData = {
    region: params.region,
    desiredLoanAmount: params.desiredLoanAmount,
    desiredInterestRate: params.desiredInterestRate,
    desiredLoanPeriod: params.desiredLoanPeriod,
    repayMethod: params.repayMethod,
    spouseUserId: params.spouseUserId
  };

  try {
    const result = await apiRequest("/api/calculation/couple/dsr", requestData);
    console.log('부부 공동 DSR 계산 결과:', result);
    return result;
  } catch (error) {
    console.error('부부 공동 DSR 계산 오류:', error);
    throw error;
  }
};

/**
 * 부부 공동 LTV (주택담보대출비율) 계산
 * @param {Object} params - 부부 공동 LTV 계산 파라미터
 * @param {number} params.housePrice - 주택 가격 (원)
 * @param {string} params.region - 지역 (예: "서울특별시 강남구")
 * @param {string} params.housingStatus - 주택 보유 상태 ("무주택자", "주택보유자")
 * @param {number} params.interestRate - 금리 (%)
 * @param {number} params.loanPeriod - 대출 기간 (년)
 * @param {string} params.spouseUserId - 배우자 사용자 ID
 */
export const calculateCoupleLTV = async (params) => {
  console.log('부부 공동 LTV 계산 요청:', params);
  
  const requestData = {
    housePrice: params.housePrice,
    region: params.region,
    housingStatus: params.housingStatus,
    interestRate: params.interestRate,
    loanPeriod: params.loanPeriod,
    repayMethod: params.repayMethod,
    spouseUserId: params.spouseUserId
  };

  try {
    const result = await apiRequest(
      "/api/calculation/couple/ltv",
      requestData
    );
    console.log('부부 공동 LTV 계산 결과:', result);
    return result;
  } catch (error) {
    console.error('부부 공동 LTV 계산 오류:', error);
    throw error;
  }
};

/**
 * 통합 대출 계산 (LTV, DSR, DTI 모두 계산)
 * @param {Object} params - 통합 계산 파라미터
 */
export const calculateAllLoanRatios = async (params) => {
  console.log('통합 대출 계산 요청:', params);
  
  try {
    const [ltvResult, dsrResult, dtiResult] = await Promise.all([
      calculateLTV({
        housePrice: params.housePrice,
        region: params.region,
        housingStatus: params.housingStatus,
        interestRate: params.desiredInterestRate,
        loanPeriod: params.desiredLoanPeriod
      }),
      calculateDSR({
        region: params.region,
        desiredInterestRate: params.desiredInterestRate,
        desiredLoanPeriod: params.desiredLoanPeriod,
        dsrLimit: params.dsrLimit
      }),
      calculateDTI({
        region: params.region,
        desiredInterestRate: params.desiredInterestRate,
        desiredLoanPeriod: params.desiredLoanPeriod,
        desiredLoanAmount: params.desiredLoanAmount,
        dtiLimit: params.dtiLimit
      })
    ]);

    return {
      ltv: ltvResult,
      dsr: dsrResult,
      dti: dtiResult
    };
  } catch (error) {
    console.error('통합 대출 계산 오류:', error);
    throw error;
  }
};

/**
 * 부부 공동 통합 대출 계산 (LTV, DSR, DTI 모두 계산)
 * @param {Object} params - 부부 공동 통합 계산 파라미터
 */
export const calculateCoupleAllLoanRatios = async (params) => {
  console.log('부부 공동 통합 대출 계산 요청:', params);
  
  try {
    const [ltvResult, dsrResult, dtiResult] = await Promise.all([
      calculateCoupleLTV({
        housePrice: params.housePrice,
        region: params.region,
        housingStatus: params.housingStatus,
        interestRate: params.desiredInterestRate,
        loanPeriod: params.desiredLoanPeriod,
        spouseUserId: params.spouseUserId
      }),
      calculateCoupleDSR({
        region: params.region,
        desiredInterestRate: params.desiredInterestRate,
        desiredLoanPeriod: params.desiredLoanPeriod,
        spouseUserId: params.spouseUserId
      }),
      calculateCoupleDTI({
        region: params.region,
        desiredInterestRate: params.desiredInterestRate,
        desiredLoanPeriod: params.desiredLoanPeriod,
        desiredLoanAmount: params.desiredLoanAmount,
        spouseUserId: params.spouseUserId
      })
    ]);

    return {
      ltv: ltvResult,
      dsr: dsrResult,
      dti: dtiResult
    };
  } catch (error) {
    console.error('부부 공동 통합 대출 계산 오류:', error);
    throw error;
  }
};

export default {
  calculateDTI,
  calculateDSR,
  calculateLTV,
  calculateAllLoanRatios,
  calculateCoupleDTI,
  calculateCoupleDSR,
  calculateCoupleLTV,
  calculateCoupleAllLoanRatios
};
