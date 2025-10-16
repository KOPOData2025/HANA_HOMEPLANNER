import { useState, useEffect, useCallback } from 'react';
import { getCache, setCache, getIndividualHouseCache, setIndividualHouseCache, getPendingRequest, setPendingRequest, clearPendingRequest } from '@/utils/cacheUtils';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const useHouseDetails = () => {
  const [houseDetails, setHouseDetails] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 새로운 API에서 주택 상세 정보 조회
  const fetchHouseDetails = useCallback(async () => {
    const cacheKey = 'house-details';
    const jsonCacheKey = 'house-json-data';
    
    // 캐시에서 데이터 조회
    const cachedData = getCache(cacheKey);
    const cachedJsonData = getCache(jsonCacheKey);
    
    if (cachedData && cachedJsonData) {
      setHouseDetails(cachedData);
      setJsonData(cachedJsonData);
      console.log("[주택 상세 정보] 캐시에서 로드:", cachedData.length, "개 데이터");
      console.log("[JSON 데이터] 캐시에서 로드:", cachedJsonData.length, "개 데이터");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("[주택 상세 정보] 새로운 API 호출 시작");
      
      // 두 개의 API를 병렬로 호출 (주택 정보 + JSON 상세 데이터)
      const [houseResponse, jsonResponse] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.DETAILS}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.SUBSCRIPTION}`)
      ]);
      
      if (!houseResponse.ok) {
        throw new Error(`주택 정보 API 호출 실패: ${houseResponse.status}`);
      }
      
      if (!jsonResponse.ok) {
        throw new Error(`JSON 데이터 API 호출 실패: ${jsonResponse.status}`);
      }
      
      const houseResult = await houseResponse.json();
      const jsonResult = await jsonResponse.json();
      
      if (houseResult.success && houseResult.data && jsonResult.success && jsonResult.data) {
        // 첫 번째 데이터 구조 확인
        if (houseResult.data.length > 0) {
          const firstItem = houseResult.data[0];
          console.log('🔍 useHouseDetails - 주택 데이터 구조:', firstItem);
          console.log('🔍 useHouseDetails - 주택 데이터 필드들:', Object.keys(firstItem));
        }

        if (jsonResult.data.length > 0) {
          const firstJsonItem = jsonResult.data[0];
          console.log('🔍 useHouseDetails - JSON 데이터 구조:', firstJsonItem);
          console.log('🔍 useHouseDetails - JSON 데이터 필드들:', Object.keys(firstJsonItem));
        }

        // 주택 정보 데이터 변환 (새로운 API 구조에 맞게 직접 매핑)
        const transformedHouseData = houseResult.data
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            // 기본 정보
            houseManageNo: item.houseManageNo || 'UNKNOWN',
            houseName: item.houseName || '이름없음',
            supplyAddress: item.supplyAddress || '주소정보없음',
            subscriptionAreaName: item.subscriptionAreaName || '지역정보없음',
            
            // 좌표 정보
            latitude: item.latitude,
            longitude: item.longitude,
            
            // 주택 정보
            houseTypeName: item.houseTypeName || '',
            houseDetailName: item.houseDetailName || '',
            totalSupplyHouseholds: item.totalSupplyHouseholds || 0,
            
            // 날짜 정보
            recruitAnnouncementDate: item.recruitAnnouncementDate || '',
            receiptStartDate: item.receiptStartDate || '',
            receiptEndDate: item.receiptEndDate || '',
            winnerAnnouncementDate: item.winnerAnnouncementDate || '',
            moveInYearMonth: item.moveInYearMonth || '',
            
            // 사업자 정보
            businessEntityName: item.businessEntityName || '',
            constructorName: item.constructorName || '',
            contactNumber: item.contactNumber || '',
            homepageUrl: item.homepageUrl || '',
            announcementUrl: item.announcementUrl || '',
            
            // PDF 파일 정보
            s3PdfUrls: Array.isArray(item.s3PdfUrls) ? item.s3PdfUrls : []
          }));
        
        // JSON 데이터 변환 (새로운 API 구조 그대로 사용)
        const transformedJsonData = jsonResult.data
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            id: item.id,
            houseType: item.houseType,
            region: item.region,
            otherRegion: item.otherRegion,
            regulation: item.regulation,
            reWinningLimit: item.reWinningLimit,
            resaleLimit: item.resaleLimit,
            residencePeriod: item.residencePeriod,
            priceCap: item.priceCap,
            landType: item.landType,
            contractDate: item.contractDate,
            balanceDate: item.balanceDate,
            supplyPriceInfo: item.supplyPriceInfo || {},
            applyCondition: item.applyCondition || {},
            applyQualification: item.applyQualification || {},
            specialSupplyCount: item.specialSupplyCount || {},
            generalSupplyCount: item.generalSupplyCount || {}
          }));
        
        setHouseDetails(transformedHouseData);
        setJsonData(transformedJsonData);
        
        // 캐시에 저장
        setCache(cacheKey, transformedHouseData);
        setCache(jsonCacheKey, transformedJsonData);
        
        console.log("[주택 상세 정보] 새로운 API 로드 완료:", transformedHouseData.length, "개 데이터");
        console.log("[JSON 데이터] 새로운 API 로드 완료:", transformedJsonData.length, "개 데이터");
      } else {
        throw new Error('API 응답 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      setError(err.message);
      console.error('주택 상세 정보 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchHouseDetails();
  }, [fetchHouseDetails]);

  // 개별 주택 마커 데이터로 변환 (3단계 줌 레벨용)
  const getIndividualHouseMarkers = useCallback(() => {
    
    if (houseDetails.length > 0) {
      
      
      // 좌표 데이터 유효성 검사
      const validCoordCount = houseDetails.filter(house => house.latitude && house.longitude && !isNaN(house.latitude) && !isNaN(house.longitude)).length;
      
      
      if (validCoordCount === 0) {
        console.warn('[경고] API 데이터에 유효한 좌표가 없습니다. latitude/longitude 필드를 확인해주세요.');
      }
    }
    
    // API 데이터를 마커 형식으로 변환
    const validApiMarkers = houseDetails
      .filter(house => 
        house.latitude && house.longitude && 
        !isNaN(house.latitude) && !isNaN(house.longitude)
      )
      .map(house => ({
        houseManageNo: house.houseManageNo,
        houseName: house.houseName,
        regionName: house.subscriptionAreaName,
        sido: house.subscriptionAreaName?.split(' ')[0] || '',
        sigungu: house.subscriptionAreaName?.split(' ')[1] || '',
        addrRaw: house.supplyAddress,
        y: parseFloat(house.latitude),  // latitude -> y (위도)
        x: parseFloat(house.longitude), // longitude -> x (경도)
        avgPrice: 0, // 새로운 API에서는 가격 정보가 없으므로 0으로 설정
        generalSupplyHouseholds: house.totalSupplyHouseholds,
        specialSupplyHouseholds: 0, // 새로운 API에서는 구분이 없으므로 0으로 설정
        totalHouseholds: house.totalSupplyHouseholds,
        // 추가 정보
        houseTypeName: house.houseTypeName,
        houseDetailName: house.houseDetailName,
        businessEntityName: house.businessEntityName,
        constructorName: house.constructorName,
        contactNumber: house.contactNumber,
        homepageUrl: house.homepageUrl,
        announcementUrl: house.announcementUrl,
        s3PdfUrls: house.s3PdfUrls,
        recruitAnnouncementDate: house.recruitAnnouncementDate,
        receiptStartDate: house.receiptStartDate,
        receiptEndDate: house.receiptEndDate,
        winnerAnnouncementDate: house.winnerAnnouncementDate,
        moveInYearMonth: house.moveInYearMonth
      }));

    if (validApiMarkers.length === 0) {
      
      
      // 서울/경기 지역별 기본 좌표와 아파트명 패턴
      const baseLocations = [
        { name: '강남구', lat: 37.5665, lng: 127.0780, prefix: '강남' },
        { name: '서초구', lat: 37.4944, lng: 127.0306, prefix: '서초' },
        { name: '송파구', lat: 37.5133, lng: 127.1028, prefix: '잠실' },
        { name: '강서구', lat: 37.5509, lng: 126.8495, prefix: '강서' },
        { name: '마포구', lat: 37.5794, lng: 126.8895, prefix: '마포' },
        { name: '용산구', lat: 37.5326, lng: 126.9900, prefix: '용산' },
        { name: '성동구', lat: 37.5633, lng: 127.0371, prefix: '성수' },
        { name: '광진구', lat: 37.5384, lng: 127.0822, prefix: '광진' },
        { name: '동대문구', lat: 37.5744, lng: 127.0396, prefix: '동대문' },
        { name: '중랑구', lat: 37.6063, lng: 127.0925, prefix: '중랑' },
        { name: '성북구', lat: 37.5894, lng: 127.0167, prefix: '성북' },
        { name: '강북구', lat: 37.6398, lng: 127.0256, prefix: '강북' },
        { name: '도봉구', lat: 37.6688, lng: 127.0471, prefix: '도봉' },
        { name: '노원구', lat: 37.6541, lng: 127.0568, prefix: '노원' },
        { name: '은평구', lat: 37.6176, lng: 126.9227, prefix: '은평' },
        { name: '서대문구', lat: 37.5791, lng: 126.9368, prefix: '서대문' },
        { name: '종로구', lat: 37.5735, lng: 126.9788, prefix: '종로' },
        { name: '중구', lat: 37.5641, lng: 126.9979, prefix: '중구' },
        { name: '영등포구', lat: 37.5263, lng: 126.8963, prefix: '영등포' },
        { name: '동작구', lat: 37.5124, lng: 126.9393, prefix: '동작' },
        { name: '관악구', lat: 37.4784, lng: 126.9516, prefix: '관악' },
        { name: '금천구', lat: 37.4569, lng: 126.8954, prefix: '금천' },
        { name: '구로구', lat: 37.4955, lng: 126.8874, prefix: '구로' },
        { name: '양천구', lat: 37.5169, lng: 126.8664, prefix: '양천' },
        // 경기도 주요 지역
        { name: '성남시', lat: 37.4201, lng: 127.1262, prefix: '분당' },
        { name: '고양시', lat: 37.6584, lng: 126.8320, prefix: '일산' },
        { name: '수원시', lat: 37.2636, lng: 127.0286, prefix: '수원' },
        { name: '안양시', lat: 37.3943, lng: 126.9568, prefix: '안양' },
        { name: '부천시', lat: 37.5035, lng: 126.7660, prefix: '부천' },
        { name: '의정부시', lat: 37.7382, lng: 127.0338, prefix: '의정부' }
      ];
      
      const aptTypes = ['래미안', '힐스테이트', '자이', '아크로', '푸르지오', '롯데캐슬', '디에이치', '센트럴', '파크리오', '위브'];
      
      const testMarkers = [];
      
      // 각 지역마다 30개씩 아파트 생성 (총 900개)
      baseLocations.forEach((location, locIndex) => {
        for (let i = 0; i < 30; i++) {
          // 기본 좌표 주변에 랜덤하게 분산
          const latOffset = (Math.random() - 0.5) * 0.02; // ±0.01도 범위
          const lngOffset = (Math.random() - 0.5) * 0.02;
          
          const aptType = aptTypes[Math.floor(Math.random() * aptTypes.length)];
          const unitNumber = String(i + 1).padStart(2, '0');
          
          const generalSupply = Math.floor(Math.random() * 100 + 50);
          const specialSupply = Math.floor(Math.random() * 50 + 25);
          
          testMarkers.push({
            houseManageNo: `TEST${String(locIndex * 30 + i + 1).padStart(4, '0')}`,
            houseName: `${aptType} ${location.prefix}${unitNumber}`,
            regionName: location.name.includes('시') ? '경기도' : '서울특별시',
            sido: location.name.includes('시') ? '경기도' : '서울특별시',
            sigungu: location.name,
            addrRaw: `${location.name.includes('시') ? '경기도' : '서울특별시'} ${location.name}`,
            y: location.lat + latOffset, // 위도
            x: location.lng + lngOffset, // 경도
            avgPrice: Math.floor(Math.random() * 50000 + 40000), // 4억~9억 랜덤
            generalSupplyHouseholds: generalSupply,
            specialSupplyHouseholds: specialSupply,
            totalHouseholds: generalSupply + specialSupply
          });
        }
      });
      
      
      return testMarkers;
    }
    
    
    return validApiMarkers;
  }, [houseDetails]);

  // 특정 지역의 주택만 필터링
  const getHouseMarkersByRegion = useCallback((regionName) => {
    return houseDetails
      .filter(house => house.regionName === regionName)
      .map(house => ({
        houseManageNo: house.houseManageNo,
        houseName: house.houseName,
        regionName: house.regionName,
        sido: house.sido,
        sigungu: house.sigungu,
        addrRaw: house.addrRaw,
        y: house.y, // 위도
        x: house.x, // 경도
        avgPrice: house.avgPrice, // 새 API 구조에 맞게 변경
        generalSupplyHouseholds: house.generalSupplyHouseholds,
        specialSupplyHouseholds: house.specialSupplyHouseholds,
        totalHouseholds: house.totalHouseholds || (house.generalSupplyHouseholds + house.specialSupplyHouseholds)
      }));
  }, [houseDetails]);

  // JSON 데이터를 ID로 조회하는 함수
  const getJsonDataById = useCallback((id) => {
    return jsonData.find(item => item.id === id);
  }, [jsonData]);

  // houseManageNo로 개별 JSON 데이터 API 호출하는 함수 - 최적화된 버전
  const getJsonDataByHouseManageNo = useCallback(async (houseManageNo) => {
    // houseManageNo 유효성 검사
    if (!houseManageNo) {
      console.warn('⚠️ houseManageNo가 없습니다:', houseManageNo);
      return null;
    }
    
    console.log('🔍 useHouseDetails - 개별 JSON 데이터 API 호출:', houseManageNo);
    
    // 1. 캐시에서 먼저 확인
    const cachedData = getIndividualHouseCache(houseManageNo);
    if (cachedData) {
      console.log('✅ useHouseDetails - 캐시에서 데이터 조회 성공:', houseManageNo);
      return cachedData;
    }

    // 2. 진행 중인 요청이 있는지 확인 (중복 요청 방지)
    const requestKey = `individual-house-${houseManageNo}`;
    const pendingRequest = getPendingRequest(requestKey);
    if (pendingRequest) {
      console.log('✅ useHouseDetails - 진행 중인 요청 재사용:', houseManageNo);
      return await pendingRequest;
    }

    // 3. 새로운 API 요청 생성
    const apiId = `${houseManageNo}_${houseManageNo}_1`;
    const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.SUBSCRIPTION}/${apiId}`;
    
    console.log('🔍 useHouseDetails - 새로운 API 호출:', houseManageNo);
    
    const requestPromise = fetch(apiUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status} - ${apiId}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // 캐시에 저장
          setIndividualHouseCache(houseManageNo, result.data);
          console.log('✅ useHouseDetails - API 호출 성공 및 캐시 저장:', houseManageNo);
          return result.data;
        } else {
          throw new Error(`API 응답 데이터 형식 오류: ${apiId}`);
        }
      })
      .catch((error) => {
        console.error('❌ useHouseDetails - API 호출 실패:', houseManageNo, error);
        return null;
      })
      .finally(() => {
        // 요청 완료 처리
        clearPendingRequest(requestKey);
      });

    // 진행 중인 요청으로 등록
    setPendingRequest(requestKey, requestPromise);
    
    return await requestPromise;
  }, []);

  return {
    houseDetails,
    jsonData,
    isLoading,
    error,
    fetchHouseDetails,
    getIndividualHouseMarkers,
    getHouseMarkersByRegion,
    getJsonDataById,
    getJsonDataByHouseManageNo
  };
};
