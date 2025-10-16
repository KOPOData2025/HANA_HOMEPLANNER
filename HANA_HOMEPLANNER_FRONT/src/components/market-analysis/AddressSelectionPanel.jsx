import { MapPin, Search } from 'lucide-react';
import { cities, getDistricts, getDongs } from '@/utils/regionUtils';

export const AddressSelectionPanel = ({ 
  selectedRegion, 
  handleRegionChange, 
  handleSearch, 
  isSearching,
  showNoResults
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-teal-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          지역 선택
        </h3>
      </div>

      {/* 검색 결과 없음 안내 */}
      {showNoResults && (
        <div className="mb-3 text-sm text-red-600 font-medium">검색결과가 없습니다.</div>
      )}

      {/* 시도 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시도
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white"
          value={selectedRegion.city}
          onChange={(e) => handleRegionChange('city', e.target.value)}
        >
          <option value="">시도를 선택하세요</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* 시군구 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          시군구
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white"
          value={selectedRegion.district}
          onChange={(e) => handleRegionChange('district', e.target.value)}
          disabled={!selectedRegion.city}
        >
          <option value="">시군구를 선택하세요</option>
          {getDistricts(selectedRegion.city).map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* 읍면동 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          읍면동
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white"
          value={selectedRegion.dong}
          onChange={(e) => handleRegionChange('dong', e.target.value)}
          disabled={!selectedRegion.district}
        >
          <option value="">읍면동을 선택하세요</option>
          {getDongs(selectedRegion.city, selectedRegion.district).map((dong) => (
            <option key={dong} value={dong}>
              {dong}
            </option>
          ))}
        </select>
      </div>

      {/* 면적 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공급면적
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 bg-white"
          value={selectedRegion.area || "84"}
          onChange={(e) =>
            handleRegionChange('area', e.target.value)
          }
        >
          <option value="60미만">60㎡ 미만</option>
          <option value="60이상84미만">60㎡ 이상 84㎡ 미만</option>
          <option value="84">84㎡</option>
          <option value="85이상102미만">85㎡ 이상 102㎡ 미만</option>
          <option value="102이상">102㎡ 이상</option>
        </select>
      </div>

      <button
        onClick={() => handleSearch(selectedRegion)}
        disabled={isSearching || !selectedRegion.city || !selectedRegion.district || !selectedRegion.dong}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isSearching ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {isSearching ? "검색 중..." : "로딩 중..."}
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            검색
          </>
        )}
      </button>
    </div>
  );
};
