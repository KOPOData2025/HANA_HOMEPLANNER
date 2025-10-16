/**
 * 금융기관 코드 매핑 유틸리티
 * orgCode를 실제 금융기관명으로 변환
 */

// 금융기관 코드 매핑
export const FINANCIAL_INSTITUTION_MAP = {
  // 은행
  "001": { name: "한국은행", type: "bank", logo: "KB" },
  "002": { name: "KB국민은행", type: "bank", logo: "KB" },
  "003": { name: "신한은행", type: "bank", logo: "SH" },
  "004": { name: "KB국민은행", type: "bank", logo: "KB" },
  "005": { name: "우리은행", type: "bank", logo: "WR" },
  "006": { name: "NH농협은행", type: "bank", logo: "NH" },
  "007": { name: "IBK기업은행", type: "bank", logo: "IBK" },
  "008": { name: "KEB하나은행", type: "bank", logo: "KEB" },
  "009": { name: "SC제일은행", type: "bank", logo: "SC" },
  "010": { name: "씨티은행", type: "bank", logo: "CITI" },
  "090": { name: "카카오뱅크", type: "bank", logo: "KAKAO" },
  "088": { name: "신한은행", type: "bank", logo: "/logos/SH.png" },
  "081": { name: "하나은행", type: "bank", logo: "/logos/HA.png" },
  "HNB": { name: "하나카드", type: "card", logo: "/logos/HA.png" },
  "KBC": { name: "국민은행", type: "card", logo: "/logos/KB.png" },
  // 카드사
  SHC: { name: "신한카드", type: "card", logo: "SHC" },
  "020": { name: "삼성카드", type: "card", logo: "SAMSUNG" },
  "021": { name: "현대카드", type: "card", logo: "HYUNDAI" },
  "022": { name: "롯데카드", type: "card", logo: "LOTTE" },
  "023": { name: "KB국민카드", type: "card", logo: "KB" },
  "024": { name: "신한카드", type: "card", logo: "SHC" },
  "025": { name: "하나카드", type: "card", logo: "HANA" },
  "026": { name: "BC카드", type: "card", logo: "BC" },
  "027": { name: "NH카드", type: "card", logo: "NH" },

  // 증권사
  "030": { name: "KB증권", type: "securities", logo: "/logos/KB.png" },
  "031": { name: "삼성증권", type: "securities", logo: "SAMSUNG" },
  "032": { name: "KB증권", type: "securities", logo: "KB" },
  "033": { name: "NH투자증권", type: "securities", logo: "NH" },
  "034": { name: "한화투자증권", type: "securities", logo: "HANWHA" },
  "035": { name: "대신증권", type: "securities", logo: "DAISHIN" },
  "036": { name: "키움증권", type: "securities", logo: "KIWOOM" },
  "037": { name: "SK증권", type: "securities", logo: "SK" },

  // 보험사
  "040": { name: "삼성생명", type: "insurance", logo: "SAMSUNG" },
  "041": { name: "교보생명", type: "insurance", logo: "KYOBO" },
  "042": { name: "한화생명", type: "insurance", logo: "HANWHA" },
  "043": { name: "메트라이프생명", type: "insurance", logo: "METLIFE" },
  "044": { name: "동양생명", type: "insurance", logo: "DONGYANG" },
  "045": { name: "롯데손해보험", type: "insurance", logo: "LOTTE" },
  "046": { name: "현대해상", type: "insurance", logo: "HYUNDAI" },
  "047": { name: "DB손해보험", type: "insurance", logo: "DB" },

  // 기타 금융기관
  HDC: { name: "현대캐피탈", type: "other", logo: "HDC" },
  "050": { name: "현대캐피탈", type: "other", logo: "HDC" },
  "051": { name: "신한캐피탈", type: "other", logo: "SHC" },
  "052": { name: "KB캐피탈", type: "other", logo: "KB" },
  "053": { name: "하나캐피탈", type: "other", logo: "HANA" },
  "054": { name: "우리캐피탈", type: "other", logo: "WR" },
  "055": { name: "NH캐피탈", type: "other", logo: "NH" },
};

/**
 * orgCode로 금융기관 정보 조회
 * @param {string} orgCode - 금융기관 코드
 * @returns {Object} 금융기관 정보
 */
export const getFinancialInstitution = (orgCode) => {
  return FINANCIAL_INSTITUTION_MAP[orgCode] || {
    name: '알 수 없는 금융기관',
    type: 'unknown',
    logo: '❓'
  };
};

/**
 * 금융기관 타입별 색상 매핑
 */
export const INSTITUTION_TYPE_COLORS = {
  bank: 'text-blue-600',
  card: 'text-purple-600',
  securities: 'text-green-600',
  insurance: 'text-orange-600',
  other: 'text-gray-600',
  unknown: 'text-gray-400'
};

/**
 * 금융기관 타입별 배경 색상 매핑
 */
export const INSTITUTION_TYPE_BG_COLORS = {
  bank: 'bg-blue-50 border-blue-200',
  card: 'bg-purple-50 border-purple-200',
  securities: 'bg-green-50 border-green-200',
  insurance: 'bg-orange-50 border-orange-200',
  other: 'bg-gray-50 border-gray-200',
  unknown: 'bg-gray-50 border-gray-200'
};
