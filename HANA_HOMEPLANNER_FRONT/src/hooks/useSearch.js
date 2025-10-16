import { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // 면적 파라미터를 API 요청에 맞게 매핑하는 함수
  const mapAreaToApiValue = (areaValue) => {
    const areaMapping = {
      "60미만": 30,        // 60㎡ 미만
      "60이상84미만": 75,  // 60㎡ 이상 84㎡ 미만
      "84": 84,            // 84㎡
      "85이상102미만": 95, // 85㎡ 이상 102㎡ 미만
      "102이상": 120       // 102㎡ 이상
    };
    return areaMapping[areaValue] || 84; // 기본값 84
  };

  // 새로운 API로 주택 가격 정보 검색
  const searchHousePriceInfo = async (selectedRegion) => {
    if (!selectedRegion.city || !selectedRegion.district || !selectedRegion.dong) {
      alert("지역을 모두 선택해주세요.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const areaValue = mapAreaToApiValue(selectedRegion.area);
      
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.SEARCH}?page=0&size=20&sido=${encodeURIComponent(selectedRegion.city)}&sigungu=${encodeURIComponent(selectedRegion.district)}&emd=${encodeURIComponent(selectedRegion.dong)}&area=${areaValue}`
      );

      if (!response.ok) {
        throw new Error("주택 가격 정보 검색 실패");
      }

      const result = await response.json();
      console.log("[주택 가격 정보 검색] API 응답:", result);

      if (result.success && result.data) {
        setSearchResults(result.data.content || []);
      } else {
        setSearchResults([]);
        setSearchError(result.message || "검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("주택 가격 정보 검색 실패:", error);
      setSearchResults([]);
      setSearchError("검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = (selectedRegion) => {
    if (!selectedRegion.city || !selectedRegion.district || !selectedRegion.dong) {
      alert("지역을 모두 선택해주세요.");
      return;
    }
    // 새로운 API로 주택 가격 정보 검색
    searchHousePriceInfo(selectedRegion);
  };

  return {
    searchResults,
    isSearching,
    searchError,
    handleSearch,
    searchHousePriceInfo,
  };
};
