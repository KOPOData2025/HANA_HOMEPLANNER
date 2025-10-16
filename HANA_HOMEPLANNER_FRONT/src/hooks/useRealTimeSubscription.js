import { useState, useEffect, useCallback } from 'react';
import { getRealtimeCache, setCache } from '@/utils/cacheUtils';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// 실시간 청약 데이터를 관리하는 커스텀 훅
export const useRealTimeSubscription = () => {
  const [realTimeData, setRealTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 실시간 청약 데이터를 가져오는 함수
    const fetchRealTimeData = useCallback(async () => {
    const cacheKey = 'real-time-data';
    
    // 캐시에서 데이터 조회 (실시간 데이터는 5분 캐시)
    const cachedData = getRealtimeCache(cacheKey);
    if (cachedData) {
      setRealTimeData(cachedData);
      console.log("[실시간 청약 데이터] 캐시에서 로드:", cachedData.length, "개 데이터");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[실시간 청약 데이터] API 호출 시작');
      
      // 새로운 청약홈 API 호출 (페이징 없음)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.DETAILS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const apiData = await response.json();
      console.log('[실시간 청약 데이터] API 응답:', apiData);
      
      if (!apiData.success || !apiData.data) {
        throw new Error('API 응답 데이터 형식이 올바르지 않습니다.');
      }
      
      console.log('[실시간 청약 데이터] 원본 데이터 개수:', apiData.data.length, '개');
      
      // 첫 번째 데이터의 실제 필드 구조 확인
      if (apiData.data.length > 0) {
        const firstItem = apiData.data[0];
        console.log('🔍 실시간 청약 API - 첫 번째 데이터 전체 구조:', firstItem);
        console.log('🔍 실시간 청약 API - 사용 가능한 필드들:', Object.keys(firstItem));
        
        // 가능한 필드명들 확인
        const possibleFields = {
          houseManageNo: ['houseManageNo', 'house_manage_no', 'manageNo', 'id'],
          houseName: ['houseName', 'house_name', 'name', 'title'],
          longitude: ['longitude', 'lng', 'x', 'lon'],
          latitude: ['latitude', 'lat', 'y'],
          supplyAddress: ['supplyAddress', 'supply_address', 'address', 'addr']
        };
        
        Object.entries(possibleFields).forEach(([key, candidates]) => {
          const found = candidates.find(field => firstItem[field] !== undefined);
          if (found) {
            console.log(`✅ ${key} 필드 발견: ${found} = ${firstItem[found]}`);
          } else {
            console.log(`❌ ${key} 필드를 찾을 수 없음. 후보: ${candidates.join(', ')}`);
          }
        });
      }
      
      // 좌표 유효성 검사 전후 비교를 위한 로깅
      const invalidCoordItems = apiData.data.filter(item => !item.longitude || !item.latitude || isNaN(item.longitude) || isNaN(item.latitude));
      if (invalidCoordItems.length > 0) {
        console.log('[실시간 청약 데이터] 유효하지 않은 좌표를 가진 데이터:', invalidCoordItems.length, '개');
        invalidCoordItems.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.houseName}: longitude=${item.longitude}, latitude=${item.latitude}`);
        });
      }
      
      // 좌표가 없는 데이터에 대한 기본 좌표 설정 (지역별)
      const getDefaultCoordinates = (subscriptionAreaName) => {
        const defaultCoords = {
          '서울': { longitude: 126.9780, latitude: 37.5665 }, // 서울 중심
          '경기': { longitude: 127.1262, latitude: 37.4201 }, // 경기 중심 (성남)
          '인천': { longitude: 126.7052, latitude: 37.4563 }, // 인천 중심
          '부산': { longitude: 129.0756, latitude: 35.1796 }, // 부산 중심
          '충남': { longitude: 126.8000, latitude: 36.5000 }, // 충남 중심
          '경남': { longitude: 128.6900, latitude: 35.2400 }  // 경남 중심
        };
        return defaultCoords[subscriptionAreaName] || { longitude: 127.0, latitude: 37.5 }; // 기본값: 서울 근처
      };

      // 동적 필드 매핑 함수
      const getFieldValue = (item, fieldCandidates) => {
        for (const candidate of fieldCandidates) {
          if (item[candidate] !== undefined && item[candidate] !== null) {
            return item[candidate];
          }
        }
        return undefined;
      };

      // API 데이터를 지도 마커 형식으로 변환 (좌표 없는 데이터도 포함)
      const transformedData = apiData.data
        .filter(item => item && typeof item === 'object') // null/undefined 체크
        .map(item => {
          // 새로운 API 구조에 맞게 직접 매핑 (필드명이 정확함)
          const safeItem = {
            houseManageNo: item.houseManageNo || 'UNKNOWN',
            houseName: item.houseName || '이름없음',
            supplyAddress: item.supplyAddress || '주소정보없음',
            subscriptionAreaName: item.subscriptionAreaName || '지역정보없음',
            longitude: item.longitude,
            latitude: item.latitude,
            totalSupplyHouseholds: item.totalSupplyHouseholds || 0,
            recruitAnnouncementDate: item.recruitAnnouncementDate || '',
            receiptStartDate: item.receiptStartDate || '',
            receiptEndDate: item.receiptEndDate || '',
            winnerAnnouncementDate: item.winnerAnnouncementDate || '',
            moveInYearMonth: item.moveInYearMonth || '',
            houseTypeName: item.houseTypeName || '',
            houseDetailName: item.houseDetailName || '',
            largeScaleBuildingAt: item.largeScaleBuildingAt || 'N',
            improvementBusinessAt: item.improvementBusinessAt || 'N',
            publicHouseEarthAt: item.publicHouseEarthAt || 'N',
            unplannedPublicHouseAt: item.unplannedPublicHouseAt || 'N',
            businessEntityName: item.businessEntityName || '',
            constructorName: item.constructorName || '',
            contactNumber: item.contactNumber || '',
            homepageUrl: item.homepageUrl || '',
            announcementUrl: item.announcementUrl || '',
            s3PdfUrls: Array.isArray(item.s3PdfUrls) ? item.s3PdfUrls : []
          };

          let finalLongitude = safeItem.longitude;
          let finalLatitude = safeItem.latitude;
          
          // 좌표가 없는 경우 지역별 기본 좌표 사용
          if (!safeItem.longitude || !safeItem.latitude || isNaN(safeItem.longitude) || isNaN(safeItem.latitude)) {
            const defaultCoords = getDefaultCoordinates(safeItem.subscriptionAreaName);
            finalLongitude = defaultCoords.longitude;
            finalLatitude = defaultCoords.latitude;
            console.log(`[좌표 보정] ${safeItem.houseName}: 기본 좌표 적용 (${safeItem.subscriptionAreaName} 지역)`);
          }
          
          const markerData = {
            id: safeItem.houseManageNo,
            lat: parseFloat(finalLatitude),
            lng: parseFloat(finalLongitude),
            houseName: safeItem.houseName,
            address: safeItem.supplyAddress,
            district: safeItem.subscriptionAreaName,
            price: '청약중', // 새로운 API에서는 가격 정보가 없으므로 기본값 설정
            houseManageNo: safeItem.houseManageNo,
            subscriptionDate: safeItem.recruitAnnouncementDate,
            supplyCount: safeItem.totalSupplyHouseholds,
            applyCount: null,
            competitionRate: null,
            isRealTime: true,
            hasOriginalCoords: !!(safeItem.longitude && safeItem.latitude && !isNaN(safeItem.longitude) && !isNaN(safeItem.latitude)), // 원본 좌표 여부 표시
            announcementUrl: safeItem.announcementUrl,
            receiptStartDate: safeItem.receiptStartDate,
            receiptEndDate: safeItem.receiptEndDate,
            winnerAnnouncementDate: safeItem.winnerAnnouncementDate,
            moveInYearMonth: safeItem.moveInYearMonth,
            // 주택 정보
            houseTypeName: safeItem.houseTypeName, // 주택구분 (APT 등)
            houseDetailName: safeItem.houseDetailName, // 주택상세구분 (국민, 민영 등)
            // 규제 및 단지 정보
            largeScaleBuildingAt: safeItem.largeScaleBuildingAt, // 대규모택지
            improvementBusinessAt: safeItem.improvementBusinessAt, // 정비사업
            publicHouseEarthAt: safeItem.publicHouseEarthAt, // 공공주택지구
            unplannedPublicHouseAt: safeItem.unplannedPublicHouseAt, // 수도권민영공공
            // 추가 정보
            businessEntityName: safeItem.businessEntityName,
            constructorName: safeItem.constructorName,
            contactNumber: safeItem.contactNumber,
            homepageUrl: safeItem.homepageUrl,
            s3PdfUrls: safeItem.s3PdfUrls
          };
          
          // 첫 번째 마커 데이터 로그 (디버깅용)
          if (item === apiData.data[0]) {
            console.log('🔍 실시간 청약 - 첫 번째 마커 데이터 변환 결과:', {
              original_houseManageNo: safeItem.houseManageNo,
              marker_id: markerData.id,
              marker_houseManageNo: markerData.houseManageNo,
              marker_houseName: markerData.houseName
            });
          }
          
          return markerData;
        });
      
      console.log('[실시간 청약 데이터] 필터링 후 변환 완료:', transformedData.length, '개 (원본:', apiData.data.length, '개)');
      
      // 공급세대수 데이터 확인 (간단한 통계만)
      const supplyCounts = transformedData.map(item => item.supplyCount || 0).filter(count => count > 0);
      if (supplyCounts.length > 0) {
        const min = Math.min(...supplyCounts);
        const max = Math.max(...supplyCounts);
        console.log(`[공급세대수 통계] ${supplyCounts.length}개 단지, 범위: ${min}~${max}세대`);
      }
      
      setRealTimeData(transformedData);
      setLastUpdated(new Date());
      
      // 캐시에 저장 (실시간 데이터는 5분 캐시)
      setCache(cacheKey, transformedData);
      
    } catch (err) {
      console.error('[실시간 청약 데이터] API 호출 실패:', err);
      setError(err.message);
      
      // API 실패 시 백업 목업 데이터 사용
      const fallbackData = [
        {
          id: 'FALLBACK001',
          lat: 37.5665,
          lng: 126.9780,
          houseName: '강남 신축 아파트',
          address: '서울특별시 강남구 테헤란로 123',
          district: '강남구',
          price: '청약중',
          houseManageNo: 'FALLBACK001',
          subscriptionDate: '2025-01-15',
          supplyCount: 100,
          isRealTime: true
        },
        {
          id: 'FALLBACK002',
          lat: 37.5172,
          lng: 127.0473,
          houseName: '마포 현대 아파트',
          address: '서울특별시 마포구 월드컵로 456',
          district: '마포구',
          price: '청약중',
          houseManageNo: 'FALLBACK002',
          subscriptionDate: '2025-01-16',
          supplyCount: 80,
          isRealTime: true
        }
      ];
      
      console.log('[실시간 청약 데이터] API 실패로 백업 데이터 사용:', fallbackData.length, '개');
      setRealTimeData(fallbackData);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드 (한 번만 실행)
  useEffect(() => {
    fetchRealTimeData();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 주기적 데이터 갱신 비활성화 (필터링은 프론트엔드에서 처리)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchRealTimeData();
  //   }, 5 * 60 * 1000); // 5분

  //   return () => clearInterval(interval);
  // }, [fetchRealTimeData]);

  return {
    realTimeData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchRealTimeData
  };
};
