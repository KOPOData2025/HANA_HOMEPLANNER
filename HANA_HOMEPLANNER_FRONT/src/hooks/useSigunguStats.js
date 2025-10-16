import { useState, useEffect, useCallback } from 'react';
import { sigunguStatsService } from '../services/sigunguStatsService';
import { getCache, setCache } from '@/utils/cacheUtils';

export const useSigunguStats = () => {
  const [sigunguStats, setSigunguStats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 시군구 통계 데이터 조회
  const fetchSigunguStats = useCallback(async () => {
    const cacheKey = 'sigungu-stats';
    
    // 캐시에서 데이터 조회
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      setSigunguStats(cachedData);
      console.log("[시군구 통계] 캐시에서 로드:", cachedData.length, "개 데이터");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[시군구 통계] API 호출 시작");
      const data = await sigunguStatsService.getAllSigunguStats();
      setSigunguStats(data);
      // 캐시에 저장
      setCache(cacheKey, data);
      console.log("[시군구 통계] API 로드 완료:", data.length, "개 데이터");
    } catch (err) {
      setError(err.message);
      console.error('시군구 통계 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchSigunguStats();
  }, [fetchSigunguStats]);

  // 시군구별 평균분양가 마커 데이터로 변환
  const getSigunguMarkers = useCallback(() => {
    return sigunguStats.map(stat => ({
      sigungu: stat.sigungu,
      regionLarge: stat.regionLarge,
      avgPrice: stat.avgPrice,
      minPrice: stat.minPrice,
      maxPrice: stat.maxPrice,
      weightedAvgPrice: stat.weightedAvgPrice,
      complexCount: stat.complexCount,
      // 좌표는 기존 coordinateUtils에서 가져와서 매핑
      lat: getSigunguCoordinates(stat.sigungu)?.lat || 37.5665,
      lng: getSigunguCoordinates(stat.sigungu)?.lng || 126.9780
    }));
  }, [sigunguStats]);

  // 시군구명으로 좌표 찾기 (기존 coordinateUtils 활용)
  const getSigunguCoordinates = (sigunguName) => {
    // 기존 coordinateUtils의 데이터를 활용하여 좌표 반환
    const coordinates = {
      '강남구': { lat: 37.5172, lng: 127.0473 },
      '강동구': { lat: 37.5301, lng: 127.1238 },
      '강북구': { lat: 37.5894, lng: 127.0167 },
      '강서구': { lat: 37.5509, lng: 126.8495 },
      '관악구': { lat: 37.4784, lng: 126.9516 },
      '광진구': { lat: 37.5384, lng: 127.0822 },
      '구로구': { lat: 37.4954, lng: 126.8874 },
      '금천구': { lat: 37.4601, lng: 126.9009 },
      '노원구': { lat: 37.6542, lng: 127.0568 },
      '도봉구': { lat: 37.6688, lng: 127.0471 },
      '동대문구': { lat: 37.5744, lng: 127.0395 },
      '동작구': { lat: 37.5124, lng: 126.9393 },
      '마포구': { lat: 37.5637, lng: 126.9085 },
      '서대문구': { lat: 37.5791, lng: 126.9368 },
      '서초구': { lat: 37.4837, lng: 127.0324 },
      '성동구': { lat: 37.5506, lng: 127.0409 },
      '성북구': { lat: 37.5894, lng: 127.0167 },
      '송파구': { lat: 37.5145, lng: 127.1059 },
      '양천구': { lat: 37.5270, lng: 126.8565 },
      '영등포구': { lat: 37.5264, lng: 126.8892 },
      '용산구': { lat: 37.5384, lng: 126.9654 },
      '은평구': { lat: 37.6027, lng: 126.9291 },
      '종로구': { lat: 37.5735, lng: 126.9788 },
      '중구': { lat: 37.5640, lng: 126.9979 },
      '중랑구': { lat: 37.6060, lng: 127.0926 },
      // 경기도 주요 시군구
      '수원시': { lat: 37.2636, lng: 127.0286 },
      '성남시': { lat: 37.4449, lng: 127.1389 },
      '의정부시': { lat: 37.7381, lng: 127.0338 },
      '안양시': { lat: 37.3922, lng: 126.9269 },
      '부천시': { lat: 37.5035, lng: 126.7660 },
      '광명시': { lat: 37.4792, lng: 126.8645 },
      '평택시': { lat: 36.9920, lng: 127.1128 },
      '동두천시': { lat: 37.9019, lng: 127.0607 },
      '안산시': { lat: 37.3219, lng: 126.8309 },
      '고양시': { lat: 37.6584, lng: 126.8320 },
      '과천시': { lat: 37.4290, lng: 126.9879 },
      '구리시': { lat: 37.5944, lng: 127.1296 },
      '남양주시': { lat: 37.6364, lng: 127.2161 },
      '오산시': { lat: 37.1498, lng: 127.0772 },
      '시흥시': { lat: 37.3796, lng: 126.8030 },
      '군포시': { lat: 37.3616, lng: 126.9352 },
      '의왕시': { lat: 37.3446, lng: 126.9482 },
      '하남시': { lat: 37.5392, lng: 127.2149 },
      '용인시': { lat: 37.2411, lng: 127.1776 },
      '파주시': { lat: 37.8154, lng: 126.7928 },
      '이천시': { lat: 37.2720, lng: 127.4350 },
      '안성시': { lat: 37.0080, lng: 127.2797 },
      '김포시': { lat: 37.6156, lng: 126.7158 },
      '화성시': { lat: 37.1995, lng: 126.8314 },
      '광주시': { lat: 37.4295, lng: 127.2551 },
      '여주시': { lat: 37.2984, lng: 127.6370 },
      '양평군': { lat: 37.4912, lng: 127.4874 },
      '연천군': { lat: 38.0966, lng: 127.0747 },
      '가평군': { lat: 37.8315, lng: 127.5102 },
      '양주시': { lat: 37.8324, lng: 127.0466 },
      '포천시': { lat: 37.8949, lng: 127.2002 },
      // 인천 주요 시군구
      '미추홀구': { lat: 37.4632, lng: 126.6500 },
      '연수구': { lat: 37.4100, lng: 126.6780 },
      '남동구': { lat: 37.4470, lng: 126.7310 },
      '부평구': { lat: 37.5070, lng: 126.7210 },
      '계양구': { lat: 37.5370, lng: 126.7370 },
      '서구': { lat: 37.4560, lng: 126.6750 },
      '강화군': { lat: 37.7460, lng: 126.4860 },
      '옹진군': { lat: 37.4460, lng: 126.6370 }
    };
    
    return coordinates[sigunguName];
  };

  return {
    sigunguStats,
    isLoading,
    error,
    fetchSigunguStats,
    getSigunguMarkers
  };
};
