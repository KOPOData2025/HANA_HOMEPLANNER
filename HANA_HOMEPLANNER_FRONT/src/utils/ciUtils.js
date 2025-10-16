/**
 * CI 값 관리 유틸리티 함수들
 * SMS 인증을 통해 받은 CI 값을 로컬에서 관리
 */

/**
 * CI 값을 로컬스토리지에 저장
 * @param {string} ci - 저장할 CI 값
 */
export const saveCiToLocal = (ci) => {
  if (ci) {
    localStorage.setItem('tempCi', ci);
    console.log('🔐 CI 값 저장:', ci);
    return true;
  }
  return false;
};

/**
 * 로컬스토리지에서 CI 값을 가져오기
 * @returns {string|null} 저장된 CI 값 또는 null
 */
export const getCiFromLocal = () => {
  const ci = localStorage.getItem('tempCi');
  if (ci) {
    console.log('🔍 저장된 CI 값 조회:', ci);
    return ci;
  }
  console.log('⚠️ 저장된 CI 값이 없습니다.');
  return null;
};

/**
 * CI 값을 로컬스토리지에서 삭제
 */
export const removeCiFromLocal = () => {
  localStorage.removeItem('tempCi');
  console.log('🗑️ CI 값 삭제 완료');
};

/**
 * CI 값이 유효한지 확인
 * @param {string} ci - 확인할 CI 값
 * @returns {boolean} 유효한 CI 값인지 여부
 */
export const isValidCi = (ci) => {
  if (!ci || typeof ci !== 'string') {
    return false;
  }
  
  // CI 값은 보통 Base64 인코딩된 문자열이므로 길이와 형식 확인
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return ci.length > 10 && base64Regex.test(ci);
};

/**
 * 현재 저장된 CI 값 정보 출력 (개발용)
 */
export const logCiInfo = () => {
  const ci = getCiFromLocal();
  if (ci) {
    console.log('📋 현재 CI 정보:', {
      ci: ci,
      isValid: isValidCi(ci),
      length: ci.length,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('📋 CI 정보: 저장된 CI 값이 없습니다.');
  }
};
