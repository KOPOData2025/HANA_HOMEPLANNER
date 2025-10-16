// 가격 문자열을 숫자로 변환하는 함수
export const parsePrice = (priceStr) => {
  return parseFloat(priceStr.replace("억", ""));
};

// 10% 계산 함수
export const calculateTenPercent = (priceStr) => {
  const price = parsePrice(priceStr);
  const tenPercent = price * 0.1;
  return tenPercent.toFixed(1);
};

// 2025년 데이터를 지역별로 정리
export const getPriceMarkers = (priceData) => {
  const currentYearData = priceData.filter((item) => item.year === 2025);

  // 지역별 좌표 매핑
  const regionCoordinates = {
    서울: { lat: 37.5665, lng: 126.978 },
    경기: { lat: 37.4138, lng: 127.5183 },
    인천: { lat: 37.4563, lng: 126.7052 },
  };

  return currentYearData.map((item) => ({
    id: `region-${item.region}`,
    lat: regionCoordinates[item.region]?.lat || 37.5665,
    lng: regionCoordinates[item.region]?.lng || 126.978,
    region: item.region,
    averagePrice: `${(item.priceInfo.averagePrice / 100).toFixed(1)}억원`,
    type: "region-marker",
  }));
};
