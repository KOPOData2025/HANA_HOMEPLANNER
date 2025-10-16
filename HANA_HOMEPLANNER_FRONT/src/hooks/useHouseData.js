import { useState, useEffect } from 'react';
import { getCache, setCache } from '@/utils/cacheUtils';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const useHouseData = () => {
  const [priceData, setPriceData] = useState([]);
  const [areaPriceData, setAreaPriceData] = useState([]);

  // API에서 가격 데이터 가져오기
  const fetchPriceData = async () => {
    const cacheKey = 'price-data';
    
    // 캐시에서 데이터 조회
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      setPriceData(cachedData);
      console.log("[가격 데이터] 캐시에서 로드:", cachedData.length, "개 데이터");
      return;
    }

    try {
      console.log("[가격 데이터] API 호출 시작");
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.STATS}`
      );
      const result = await response.json();

      if (result.success) {
        setPriceData(result.data);
        // 캐시에 저장
        setCache(cacheKey, result.data);
        console.log(
          "[가격 데이터] API 로드 완료:",
          result.data.length,
          "개 데이터"
        );
      }
    } catch (error) {
      console.error("[가격 데이터] API 로드 실패:", error);
    }
  };

  // 시군구별 평균분양가 데이터 가져오기
  const fetchAreaPriceData = async () => {
    const cacheKey = 'area-price-data';
    
    // 캐시에서 데이터 조회
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      setAreaPriceData(cachedData);
      console.log("[시군구별 평균분양가] 캐시에서 로드:", cachedData.length, "개 데이터");
      return;
    }

    try {
      console.log("[시군구별 평균분양가] API 호출 시작");
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.STATS.SIGUNGU}`
      );
      const result = await response.json();

      if (result.success) {
        setAreaPriceData(result.data);
        // 캐시에 저장
        setCache(cacheKey, result.data);
        console.log(
          "[시군구별 평균분양가] API 로드 완료:",
          result.data.length,
          "개 데이터"
        );
      }
    } catch (error) {
      console.error("[시군구별 평균분양가] API 로드 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPriceData();
    fetchAreaPriceData();
  }, []);

  return {
    priceData,
    areaPriceData,
    fetchPriceData,
    fetchAreaPriceData,
  };
};
