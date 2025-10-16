// 계약금과 중도상환금 계산을 위한 유틸리티 함수들

/**
 * 매매가 기준으로 계약금을 계산합니다
 * @param {number} price - 매매가 (억원)
 * @returns {number} 계약금 (억원)
 */
export const calculateContractMoney = (price) => {
  // 계약금은 일반적으로 매매가의 10%
  return Math.round(price * 0.1 * 100) / 100;
};

/**
 * 매매가 기준으로 중도상환금을 계산합니다
 * @param {number} price - 매매가 (억원)
 * @returns {number} 중도상환금 (억원)
 */
export const calculateInterimPayment = (price) => {
  // 중도상환금은 일반적으로 매매가의 20%
  return Math.round(price * 0.2 * 100) / 100;
};

/**
 * 매매가 기준으로 잔금을 계산합니다
 * @param {number} price - 매매가 (억원)
 * @returns {number} 잔금 (억원)
 */
export const calculateBalancePayment = (price) => {
  // 잔금 = 매매가 - 계약금 - 중도상환금
  const contractMoney = calculateContractMoney(price);
  const interimPayment = calculateInterimPayment(price);
  return Math.round((price - contractMoney - interimPayment) * 100) / 100;
};

/**
 * 지급 일정을 생성합니다
 * @param {string} contractDate - 계약일
 * @returns {Array} 지급 일정 배열
 */
export const generatePaymentSchedule = (contractDate = new Date()) => {
  const baseDate = new Date(contractDate);
  
  return [
    {
      type: '계약금',
      amount: '계약 시',
      percentage: '10%',
      description: '계약 체결 시 지급'
    },
    {
      type: '중도상환금',
      amount: '계약 후 1개월',
      percentage: '20%',
      description: '계약 후 1개월 이내 지급'
    },
    {
      type: '잔금',
      amount: '입주 시',
      percentage: '70%',
      description: '입주 시 최종 지급'
    }
  ];
};

/**
 * 매매가를 원화 형식으로 포맷팅합니다
 * @param {number} price - 매매가 (억원)
 * @returns {string} 포맷팅된 가격
 */
export const formatPrice = (price) => {
  if (price >= 1) {
    return `${price}억원`;
  } else {
    return `${Math.round(price * 10000)}만원`;
  }
};
