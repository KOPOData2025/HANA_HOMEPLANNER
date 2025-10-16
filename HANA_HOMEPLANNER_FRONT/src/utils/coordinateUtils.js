// 시군구별 좌표 매핑 (실제 좌표로 업데이트 필요)
export const getRegionCoordinates = (sigungu) => {
  // 폴리곤 데이터가 있는 경우 해당 폴리곤의 중심점을 계산
  if (window.kakao && window.kakao.maps && window.sigPolygons) {
    // 지역명 매칭 로직 개선 (시군구명에서 시/구/군 제거하여 매칭)
    const cleanSigungu = sigungu.replace(/시$|구$|군$/, "");
    const polygonData = window.sigPolygons.find((p) => {
      const cleanAreaName = p.areaName.replace(/시$|구$|군$/, "");
      return cleanAreaName === cleanSigungu || p.areaName === sigungu;
    });

    if (polygonData && polygonData.path) {
      const center = calculatePolygonCenter(polygonData.path);
      if (center) {
        return center;
      }
    }
  }

  // 폴리곤 데이터가 없는 경우 하드코딩된 좌표 사용
  const coordinates = {
    // 경기도
    "경기도 가평군": { lat: 37.8315, lng: 127.5146 },
    "경기도 고양시": { lat: 37.6584, lng: 126.832 },
    "경기도 과천시": { lat: 37.4295, lng: 127.005 },
    "경기도 광명시": { lat: 37.4795, lng: 126.8646 },
    "경기도 광주시": { lat: 37.4295, lng: 127.255 },
    "경기도 구리시": { lat: 37.5944, lng: 127.1296 },
    "경기도 군포시": { lat: 37.3616, lng: 126.935 },
    "경기도 김포시": { lat: 37.6154, lng: 126.7158 },
    "경기도 남양주시": { lat: 37.6364, lng: 127.216 },
    "경기도 동두천시": { lat: 37.9036, lng: 127.06 },
    "경기도 부천시": { lat: 37.5035, lng: 126.706 },
    "경기도 성남시": { lat: 37.4449, lng: 127.1389 },
    "경기도 수원시": { lat: 37.2636, lng: 127.0286 },
    "경기도 시흥시": { lat: 37.3799, lng: 126.803 },
    "경기도 안산시": { lat: 37.3219, lng: 126.8309 },
    "경기도 안성시": { lat: 37.008, lng: 127.2797 },
    "경기도 안양시": { lat: 37.3942, lng: 126.9568 },
    "경기도 양주시": { lat: 37.785, lng: 127.045 },
    "경기도 양평군": { lat: 37.4914, lng: 127.487 },
    "경기도 여주시": { lat: 37.2984, lng: 127.637 },
    "경기도 연천군": { lat: 38.096, lng: 127.074 },
    "경기도 오산시": { lat: 37.1498, lng: 127.0772 },
    "경기도 용인시": { lat: 37.2411, lng: 127.1776 },
    "경기도 의왕시": { lat: 37.3446, lng: 126.948 },
    "경기도 의정부시": { lat: 37.7381, lng: 127.0337 },
    "경기도 이천시": { lat: 37.272, lng: 127.435 },
    "경기도 파주시": { lat: 37.815, lng: 126.793 },
    "경기도 평택시": { lat: 36.992, lng: 127.112 },
    "경기도 포천시": { lat: 37.894, lng: 127.2 },
    "경기도 하남시": { lat: 37.539, lng: 127.214 },
    "경기도 화성시": { lat: 37.1995, lng: 126.831 },

    // 인천광역시
    "인천광역시 중구": { lat: 37.4738, lng: 126.6249 },
    "인천광역시 동구": { lat: 37.4738, lng: 126.6249 },
    "인천광역시 미추홀구": { lat: 37.463, lng: 126.65 },
    "인천광역시 연수구": { lat: 37.41, lng: 126.68 },
    "인천광역시 남동구": { lat: 37.447, lng: 126.73 },
    "인천광역시 부평구": { lat: 37.507, lng: 126.72 },
    "인천광역시 계양구": { lat: 37.537, lng: 126.74 },
    "인천광역시 서구": { lat: 37.456, lng: 126.62 },
    "인천광역시 강화군": { lat: 37.456, lng: 126.62 },
    "인천광역시 옹진군": { lat: 37.446, lng: 126.639 },

    // 서울특별시 (주요 구)
    "서울특별시 강남구": { lat: 37.5172, lng: 127.0473 },
    "서울특별시 서초구": { lat: 37.4837, lng: 127.0324 },
    "서울특별시 송파구": { lat: 37.5145, lng: 127.1059 },
    "서울특별시 강동구": { lat: 37.5301, lng: 127.1238 },
    "서울특별시 강북구": { lat: 37.6396, lng: 127.0257 },
    "서울특별시 성동구": { lat: 37.5506, lng: 127.0409 },
    "서울특별시 중랑구": { lat: 37.6064, lng: 127.0926 },
    "서울특별시 은평구": { lat: 37.6026, lng: 126.9291 },
    "서울특별시 동작구": { lat: 37.5124, lng: 126.9393 },
    "서울특별시 성북구": { lat: 37.5894, lng: 127.0167 },
    "서울특별시 영등포구": { lat: 37.5264, lng: 126.8892 },
    "서울특별시 서대문구": { lat: 37.5791, lng: 126.9368 },
    "서울특별시 노원구": { lat: 37.6544, lng: 127.0568 },
    "서울특별시 동대문구": { lat: 37.5744, lng: 127.0395 },
    "서울특별시 도봉구": { lat: 37.6688, lng: 127.0471 },
    "서울특별시 양천구": { lat: 37.527, lng: 126.8565 },
    "서울특별시 광진구": { lat: 37.5384, lng: 127.0822 },
    "서울특별시 금천구": { lat: 37.46, lng: 126.9 },
    "서울특별시 강서구": { lat: 37.5509, lng: 126.8495 },
    "서울특별시 관악구": { lat: 37.4784, lng: 126.9516 },
    "서울특별시 마포구": { lat: 37.5637, lng: 126.908 },
    "서울특별시 구로구": { lat: 37.4954, lng: 126.8874 },
    "서울특별시 용산구": { lat: 37.5384, lng: 126.9654 },
    "서울특별시 종로구": { lat: 37.5735, lng: 126.9789 },
    "서울특별시 중구": { lat: 37.564, lng: 126.9979 },
  };

  // 좌표를 찾지 못한 경우 기본값 반환
  return coordinates[sigungu] || { lat: 37.5665, lng: 126.978 };
};

// 폴리곤의 정확한 중심점을 계산하는 함수
export const calculatePolygonCenter = (path) => {
  if (!path || path.length === 0) return null;

  // 폴리곤의 실제 중심점 계산 (경계 상자 중심 + 폴리곤 내부 중심점의 가중 평균)
  let minLat = path[0].getLat();
  let maxLat = path[0].getLat();
  let minLng = path[0].getLng();
  let maxLng = path[0].getLng();

  // 경계 상자(bounding box) 계산
  path.forEach((point) => {
    const lat = point.getLat();
    const lng = point.getLng();

    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  // 경계 상자의 중심점
  const boundingBoxCenter = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  // 폴리곤 내부의 중심점 (모든 좌표의 평균)
  let sumLat = 0,
    sumLng = 0;
  path.forEach((point) => {
    sumLat += point.getLat();
    sumLng += point.getLng();
  });

  const averageCenter = {
    lat: sumLat / path.length,
    lng: sumLng / path.length,
  };

  // 경계 상자 중심과 평균 중심의 가중 평균 (경계 상자 중심에 더 높은 가중치)
  const weightedCenter = {
    lat: boundingBoxCenter.lat * 0.7 + averageCenter.lat * 0.3,
    lng: boundingBoxCenter.lng * 0.7 + averageCenter.lng * 0.3,
  };

  return weightedCenter;
};

// 시군구별 평균분양가 마커 생성
export const getAreaPriceMarkers = (areaPriceData) => {
  if (!areaPriceData || areaPriceData.length === 0) return [];

  // 시군구별로 데이터 그룹화
  const groupedData = areaPriceData.reduce((acc, item) => {
    if (!acc[item.sigungu]) {
      acc[item.sigungu] = [];
    }
    acc[item.sigungu].push(item);
    return acc;
  }, {});

  // 마커 생성
  return Object.entries(groupedData).map(([sigungu, data]) => {
    // 하드코딩된 좌표 사용
    const coordinates = getRegionCoordinates(sigungu);
    console.log(`[좌표 사용] ${sigungu}:`, coordinates);

    // 전체 평균 가격 계산
    const totalHouseholds = data.reduce(
      (sum, item) => sum + item.totalHouseholds,
      0
    );
    const weightedAvgPrice = Math.floor(
      data.reduce(
        (sum, item) => sum + item.avgPrice * item.totalHouseholds,
        0
      ) / totalHouseholds
    );

    return {
      id: `area-price-${sigungu}`,
      lat: coordinates.lat,
      lng: coordinates.lng,
      sigungu: sigungu,
      avgPrice: weightedAvgPrice,
      totalHouseholds: totalHouseholds,
      typeCount: data.reduce((sum, item) => sum + item.typeCount, 0),
      areaRanges: data.map((item) => ({
        range: item.areaRange,
        avgPrice: Math.floor(item.avgPrice),
        typeCount: item.typeCount,
        totalHouseholds: item.totalHouseholds,
      })),
      type: "area-price-marker",
    };
  });
};
