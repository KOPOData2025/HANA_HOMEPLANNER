/**
 * LTV 계산 API 서비스
 * 대출 플래너 기능을 위한 LTV 계산 API 연동
 */

import { authenticatedFetchWithRefresh } from '@/lib/auth';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

/**
 * LTV 계산 API 요청
 * @param {Object} params - API 요청 파라미터
 * @returns {Promise<Object>} API 응답 데이터
 */
export const calculateLTV = async (params) => {
  try {
    console.log('📊 LTV 계산 API 호출 시작:', { params, url: `${API_BASE_URL}${API_ENDPOINTS.CALCULATION.LTV}` });
    
    const response = await authenticatedFetchWithRefresh(`${API_BASE_URL}${API_ENDPOINTS.CALCULATION.LTV}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('📊 LTV 계산 API 응답:', { 
      status: response.status, 
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('📊 LTV 계산 API 오류 응답:', errorData);
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 LTV 계산 API 성공:', data);
    return data;
  } catch (error) {
    console.error('LTV 계산 API 오류:', error);
    throw error;
  }
};

/**
 * API 요청 파라미터 검증
 * @param {Object} params - 검증할 파라미터
 * @returns {Object} 검증된 파라미터
 */
export const validateLTVParams = (params) => {
  const required = ['housePrice', 'region', 'housingStatus', 'borrowerType', 'creditGrade'];
  const missing = required.filter(field => !params[field]);
  
  if (missing.length > 0) {
    throw new Error(`필수 입력값이 누락되었습니다: ${missing.join(', ')}`);
  }

  return params;
};

/**
 * 지역명 변환 (내부 형식 -> API 형식)
 * @param {string} region - 내부 지역 코드
 * @returns {string} API 형식 지역명
 */
export const convertRegionForAPI = (region) => {
  const regionMap = {
    'seoul': '서울특별시 강남구',
    'non-seoul': '경기도 성남시'
  };
  
  return regionMap[region] || '서울특별시 강남구';
};

/**
 * 주택 보유 상태 변환
 * @param {string} status - 내부 상태 코드
 * @returns {string} API 형식 상태
 */
export const convertHousingStatusForAPI = (status) => {
  const statusMap = {
    'none': '무주택자',
    'single': '1주택자',
    'multiple': '다주택자'
  };
  
  return statusMap[status] || '무주택자';
};

/**
 * 대출자 유형 변환
 * @param {string} type - 내부 유형 코드
 * @returns {string} API 형식 유형
 */
export const convertBorrowerTypeForAPI = (type) => {
  const typeMap = {
    'general': '일반',
    'first-time': '생애최초',
    'newlywed': '신혼부부',
    'youth': '청년층'
  };
  
  return typeMap[type] || '일반';
};

/**
 * 신용등급 변환 (숫자 -> 문자)
 * @param {string} grade - 숫자 등급
 * @returns {string} 문자 등급
 */
export const convertCreditGradeForAPI = (grade) => {
  const gradeMap = {
    '1': 'AAA',
    '2': 'AA',
    '3': 'A',
    '4': 'BBB',
    '5': 'BB',
    '6': 'B',
    '7': 'CCC',
    '8': 'CC',
    '9': 'C',
    '10': 'D'
  };
  
  return gradeMap[grade] || 'A';
};

/**
 * 완전한 LTV 계산 요청 (모든 변환 포함)
 * @param {Object} formData - 폼 데이터
 * @returns {Promise<Object>} API 응답 데이터
 */
export const calculateLTVComplete = async (formData) => {
  console.log('🔍 calculateLTVComplete - 입력 formData:', formData);
  
  const apiParams = {
    // 필수 필드
    housePrice: parseInt(formData.propertyPrice || 50000) * 10000, // 만원 -> 원
    region: convertRegionForAPI(formData.region || 'seoul'),
    housingStatus: convertHousingStatusForAPI(formData.housingStatus || 'none'),
    borrowerType: convertBorrowerTypeForAPI(formData.borrowerType || 'first-time'),
    creditGrade: convertCreditGradeForAPI(formData.creditGrade || '2'),
    
    // 선택 필드 (기본값 포함)
    desiredLoanAmount: parseInt(formData.desiredLoanAmount || 35000) * 10000,
    loanPeriod: parseInt(formData.loanTermYears || '30'),
    interestRate: parseFloat(formData.loanInterestRate || '4.2'),
    repaymentType: formData.repaymentType || 'equal-payment',
    houseType: formData.houseType || '아파트',
    houseSize: parseFloat(formData.houseSize || 84.5),
    downPaymentRatio: parseInt(formData.downPaymentRatio || '20'),
    collateralRatio: parseInt(formData.collateralRatio || '100'),
    dsrRatio: parseInt(formData.dsrRatio || '40'),
    existingLoanRepayment: parseInt(formData.existingLoanRepayment || 0) * 10000,
    annualIncome: parseInt(formData.annualIncome || 50000000),
  };

  console.log('🔍 calculateLTVComplete - 변환된 apiParams:', apiParams);
  console.log('🔍 calculateLTVComplete - interestRate 값:', apiParams.interestRate);
  console.log('🔍 calculateLTVComplete - loanInterestRate 원본:', formData.loanInterestRate);

  const validatedParams = validateLTVParams(apiParams);
  console.log('🔍 calculateLTVComplete - 검증된 params:', validatedParams);
  
  return await calculateLTV(validatedParams);
};
