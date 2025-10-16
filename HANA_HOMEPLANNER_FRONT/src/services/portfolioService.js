/**
 * 포트폴리오 추천 관련 API 서비스
 */

import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

/**
 * 대출 상품 추천 API 호출
 * @param {Object} params - 요청 파라미터
 * @returns {Promise} API 응답
 */
export const getLoanRecommendations = async (params) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FINANCIAL.RECOMMENDATIONS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('대출 상품 추천 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 적금 상품 추천 API 호출
 * @param {Object} params - 요청 파라미터
 * @returns {Promise} API 응답
 */
export const getSavingsRecommendations = async (params) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/api/financial-products/recommend-savings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('적금 상품 추천 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 포트폴리오 추천 데이터 변환
 * @param {Object} formData - 폼 데이터
 * @returns {Object} API 요청 형식으로 변환된 데이터
 */
export const transformPortfolioData = (formData) => {
  // 자격 요건에 따른 플래그 설정
  const isFirstTimeBuyer = formData.qualification === 'firsttime';
  const isNewlywed = formData.qualification === 'newlywed';
  const hasNewbornInTwoYears = formData.qualification === 'newborn';
  
  // 자녀 수 계산 (다자녀인 경우 2명으로 설정)
  const numberOfChildren = formData.qualification === 'multichild' ? 2 : 0;

  return {
    annualIncome: parseInt(formData.annualIncome) || 0,
    housePrice: parseInt(formData.housePrice) || 0,
    exclusiveArea: parseFloat(formData.houseSize) || 0,
    netAssets: parseInt(formData.assets) || 0,
    isFirstTimeBuyer,
    isNewlywed,
    numberOfChildren,
    hasNewbornInTwoYears
  };
};

/**
 * 자본 포트폴리오 추천 API 호출
 * @param {Object} params - 요청 파라미터
 * @returns {Promise} API 응답
 */
export const getCapitalPortfolioRecommendations = async (params) => {
  try {
    const token = localStorage.getItem('accessToken');

    console.log('🔍 자본 포트폴리오 API 요청:', {
      url: `${API_BASE_URL}/api/portfolio/recommend-capital`,
      params: params,
      hasToken: !!token
    });

    const response = await fetch(`${API_BASE_URL}/api/portfolio/recommend-capital`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      // 에러 응답 내용도 확인
      const errorText = await response.text();
      console.error('🔍 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 자본 포트폴리오 API 응답:', data);
    return data;
  } catch (error) {
    console.error('자본 포트폴리오 추천 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 자본 플랜 선택 및 저장 API 호출
 * @param {Object} planData - 플랜 데이터
 * @returns {Promise} API 응답
 */
export const saveCapitalPlanSelection = async (planData) => {
  try {
    console.log('🔍 자본 플랜 선택 API 요청:', {
      url: `${API_BASE_URL}/api/user/capital-plan-selection`,
      planData: planData
    });

    const response = await apiClient.post(`${API_BASE_URL}/api/user/capital-plan-selection`, planData);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 자본 플랜 선택 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 자본 플랜 선택 API 응답:', data);
    return data;
  } catch (error) {
    console.error('자본 플랜 선택 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 사용자별 포트폴리오 선택 목록 조회 API 호출
 * @returns {Promise} API 응답
 */
export const getMyCapitalPlanSelections = async () => {
  try {
    console.log('🔍 내 포트폴리오 플랜 목록 조회 API 요청:', {
      url: `${API_BASE_URL}/api/user/capital-plan-selection/my-selections`
    });

    const response = await apiClient.get(`${API_BASE_URL}/api/user/capital-plan-selection/my-selections`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 내 포트폴리오 플랜 목록 조회 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      // 권한 관련 에러인 경우 더 명확한 메시지 제공
      if (response.status === 403) {
        throw new Error('권한이 없습니다. 로그인 후 다시 시도해주세요.');
      } else if (response.status === 401) {
        throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
      } else {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('🔍 내 포트폴리오 플랜 목록 조회 API 응답:', data);
    return data;
  } catch (error) {
    console.error('내 포트폴리오 플랜 목록 조회 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 포트폴리오 플랜 삭제 API 호출
 * @param {number} selectionId - 삭제할 플랜의 선택 ID
 * @returns {Promise} API 응답
 */
export const deleteCapitalPlanSelection = async (selectionId) => {
  try {
    console.log('🔍 API - 포트폴리오 플랜 삭제 요청 시작:', {
      url: `${API_BASE_URL}/api/user/capital-plan-selection/${selectionId}`,
      selectionId: selectionId
    });

    const response = await apiClient.delete(`${API_BASE_URL}/api/user/capital-plan-selection/${selectionId}`);

    console.log('🔍 API - HTTP 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 API - 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 API - 성공 응답 데이터:', data);
    
    // 응답 구조 검증
    if (typeof data === 'object' && data !== null) {
      console.log('✅ API - 응답 데이터 유효성 검사 통과');
      return data;
    } else {
      console.error('❌ API - 예상과 다른 응답 형태:', typeof data, data);
      return data;
    }
  } catch (error) {
    console.error('❌ API - 포트폴리오 플랜 삭제 호출 오류:', error);
    throw error;
  }
};

/**
 * 적금 추천 데이터 변환
 * @param {Object} formData - 폼 데이터
 * @returns {Object} 적금 API 요청 형식으로 변환된 데이터
 */
export const transformSavingsData = (formData) => {
  return {
    targetAmount: parseInt(formData.targetAmount) || 0,
    remainingMonths: parseInt(formData.targetMonths) || 0,
    monthlySaving: parseInt(formData.monthlyPayment) || 0
  };
};

/**
 * 자본 포트폴리오 추천 데이터 변환
 * @param {Object} formData - 폼 데이터
 * @param {Object} loanData - 대출 추천 결과 데이터
 * @param {Object} originalLoanData - 대출 시뮬레이션에서 받은 원본 데이터
 * @param {Object} houseData - 주택 데이터 (잔금처리일 포함)
 * @returns {Object} 자본 포트폴리오 API 요청 형식으로 변환된 데이터
 */
// 날짜 유효성 검증 함수
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const transformCapitalPortfolioData = (formData, loanData, originalLoanData, houseData) => {
  // 대출 가능 금액 계산 (대출 시뮬레이션에서 받은 maxLoanAmount를 천만원 단위로 반올림)
  const loanAvailable = originalLoanData?.maxLoanAmount 
    ? Math.round(originalLoanData.maxLoanAmount / 10000000) * 10000000 
    : 0;
  
  // 현재 현금 계산 (내 자산 + 배우자 자산)
  const myAssets = parseInt(formData.assets) || 0;
  const spouseAssets = parseInt(formData.spouseAssets) || 0;
  const currentCash = myAssets + spouseAssets;
  
  console.log('🔍 자본 포트폴리오 - 자산 계산:', {
    myAssets,
    spouseAssets,
    currentCash,
    includeSpouseAssets: !!formData.spouseAssets
  });
  
  // 입주 예정일 계산 (주택 데이터의 잔금처리일 사용, 없으면 목표 개월수로부터 계산)
  let moveInDateString;
  
  // 주택 데이터에서 잔금처리일 찾기 (우선순위: 전달받은 houseData > originalLoanData 내부)
  const targetHouseData = houseData || originalLoanData?.houseData || originalLoanData?.house || originalLoanData?.selectedHouse;
  
  if (targetHouseData?.잔금처리일) {
    // 주택 데이터에서 잔금처리일 가져오기
    const moveInDate = targetHouseData.잔금처리일;
    
    // 날짜 형식 검증 및 변환
    if (moveInDate.includes('-') && moveInDate.split('-').length === 3) {
      // 이미 완전한 날짜 형식인 경우 (예: "2026-01-15")
      if (isValidDate(moveInDate)) {
        moveInDateString = moveInDate;
      } else {
        console.warn('유효하지 않은 날짜 형식:', moveInDate);
        moveInDateString = null;
      }
    } else if (moveInDate.includes('-') && moveInDate.split('-').length === 2) {
      // 년-월 형식인 경우 (예: "2029-03" -> "2029-03-01")
      const fullDate = `${moveInDate}-01`;
      if (isValidDate(fullDate)) {
        moveInDateString = fullDate;
      } else {
        console.warn('유효하지 않은 년-월 형식:', moveInDate);
        moveInDateString = null;
      }
    } else {
      // 기타 형식인 경우
      console.warn('알 수 없는 날짜 형식:', moveInDate);
      moveInDateString = null;
    }
    
    // 날짜 변환에 실패한 경우 목표 개월수로부터 계산
    if (!moveInDateString) {
      const targetMonths = parseInt(formData.targetMonths) || 24;
      const fallbackDate = new Date();
      fallbackDate.setMonth(fallbackDate.getMonth() + targetMonths);
      moveInDateString = fallbackDate.toISOString().split('T')[0];
      console.log('날짜 변환 실패로 목표 개월수 기반 날짜 사용:', moveInDateString);
    }
  } else {
    // 주택 데이터가 없는 경우 목표 개월수로부터 계산
    const targetMonths = parseInt(formData.targetMonths) || 24;
    const moveInDate = new Date();
    moveInDate.setMonth(moveInDate.getMonth() + targetMonths);
    moveInDateString = moveInDate.toISOString().split('T')[0];
  }

  const requestData = {
    housePrice: parseInt(formData.housePrice) || 0,
    annualIncome: parseInt(formData.annualIncome) || 0,
    currentCash: currentCash,
    desiredMonthlySaving: parseInt(formData.monthlyPayment) || 0, // API에서 요구하는 필드명으로 변경
    moveInDate: moveInDateString,
    loanAvailable: loanAvailable
  };
  
  // API 요청 데이터 검증
  if (!requestData.moveInDate || !isValidDate(requestData.moveInDate)) {
    console.error('유효하지 않은 moveInDate:', requestData.moveInDate);
    // 기본값으로 현재 날짜 + 24개월 설정
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 24);
    requestData.moveInDate = defaultDate.toISOString().split('T')[0];
    console.log('기본 날짜로 설정:', requestData.moveInDate);
  }

  console.log('🔍 자본 포트폴리오 - 입주 예정일 계산:', {
    originalLoanData: originalLoanData,
    houseData: houseData,
    targetHouseData: targetHouseData,
    잔금처리일: targetHouseData?.잔금처리일,
    moveInDateString,
    targetMonths: parseInt(formData.targetMonths) || 24
  });
  
  console.log('🔍 자본 포트폴리오 API 요청 데이터:', requestData);
  return requestData;
};
