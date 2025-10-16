export const SearchResultsPanel = ({ 
  selectedRegion, 
  searchResults, 
  isSearching, 
  searchError,
  containerRef,
  onPropertyClick
}) => {
  return (
    <div ref={containerRef} className="bg-white rounded-lg shadow p-6 relative flex flex-col h-[28rem]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          주택 가격 정보 검색 결과
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {selectedRegion.city} {selectedRegion.district} {selectedRegion.dong}
            {selectedRegion.area && ` • ${selectedRegion.area}`}
          </span>
          {searchResults.length > 0 && (
            <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
              총 {searchResults.length}건
            </span>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">검색 중...</p>
          </div>
        </div>
      ) : searchError ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          <p className="text-center px-4">{searchError}</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {searchResults.map((item, index) => (
                         <div
               key={`${item.houseManagementNumber}-${item.houseType}-${index}`}
               className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-teal-300 transition-all duration-200 cursor-pointer group"
               onClick={() => onPropertyClick({
                 complex: item.supplyLocation,
                 price: `${(item.supplyAmountMaxSalePrice / 10000).toFixed(1)}억원`,
                 type: item.houseType,
                 size: `${item.houseSupplyArea}㎡`,
                 address: `${item.sido} ${item.sigungu} ${item.eupmyeondong}`,
                 households: item.generalSupplyHouseholds + item.specialSupplyHouseholds
               })}
             >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {item.houseType}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {item.houseSupplyArea}㎡
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {item.supplyLocation}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.sido} {item.sigungu} {item.eupmyeondong}
                  </p>
                </div>
                                 <div className="text-right">
                   <p className="text-lg font-bold text-teal-600">
                     {item.supplyAmountMaxSalePrice.toLocaleString()}만원
                   </p>
                   <p className="text-xs text-teal-500 mt-1 group-hover:text-teal-600 transition-colors">
                     클릭하여 지급 계획 보기
                   </p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs">일반공급</p>
                  <p className="font-semibold text-gray-800">
                    {item.generalSupplyHouseholds}세대
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-500 text-xs">특별공급</p>
                  <p className="font-semibold text-gray-800">
                    {item.specialSupplyHouseholds}세대
                  </p>
                </div>
              </div>

              

              {item.specialSupplyMultiChildHouseholds > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">다자녀</p>
                      <p className="font-medium">{item.specialSupplyMultiChildHouseholds}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">신혼부부</p>
                      <p className="font-medium">{item.specialSupplyNewlywedHouseholds}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">첫분양</p>
                      <p className="font-medium">{item.specialSupplyFirstTimeHouseholds}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <p>검색 결과가 없습니다.</p>
          <p className="text-xs mt-1">지역과 면적을 선택하고 검색해보세요.</p>
        </div>
      )}
    </div>
  );
};
