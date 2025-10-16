import { useState, useMemo, useEffect } from 'react';

// 실시간 청약 데이터 필터링을 위한 커스텀 훅
export const useRealTimeFilter = (realTimeData = [], filters = {}) => {
  const [filteredData, setFilteredData] = useState([]);

  // 필터링 로직
  const applyFilters = useMemo(() => {
    if (!realTimeData || realTimeData.length === 0) {
      return [];
    }

    let filtered = [...realTimeData];

    // 지역 필터 (subscrptAreaCodeNm 기준)
    if (filters.region && filters.region !== '전체 지역') {
      filtered = filtered.filter(item => 
        item.district === filters.region
      );
    }

    // 주택구분 필터 (houseSecdNm 기준)
    if (filters.housingType && filters.housingType !== '전체') {
      filtered = filtered.filter(item => 
        item.houseSecdNm === filters.housingType
      );
    }

    // 주택상세구분 필터 (houseDtlSecdNm 기준)
    if (filters.housingDetail && filters.housingDetail !== '전체') {
      filtered = filtered.filter(item => 
        item.houseDtlSecdNm === filters.housingDetail
      );
    }

    // 청약상태 필터 (날짜 비교를 통한 상태 판별)
    if (filters.subscriptionStatus && filters.subscriptionStatus !== '전체') {
      filtered = filtered.filter(item => {
        const today = new Date();
        const rceptBgnde = new Date(item.rceptBgnde);
        const rceptEndde = new Date(item.rceptEndde);
        const przwnerPresnatnDe = new Date(item.przwnerPresnatnDe);
        
        let status = '';
        if (today < rceptBgnde) {
          status = '접수예정';
        } else if (today >= rceptBgnde && today <= rceptEndde) {
          status = '접수중';
        } else if (today > rceptEndde && today < przwnerPresnatnDe) {
          status = '접수종료';
        } else {
          status = '당첨자발표완료';
        }
        
        return status === filters.subscriptionStatus;
      });
    }

    // 공급세대수 범위 필터 (totSuplyHshldco 기준)
    if (filters.supplyCountRange && Array.isArray(filters.supplyCountRange)) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(item => {
        const supplyCount = item.supplyCount || 0;
        return supplyCount >= filters.supplyCountRange[0] && supplyCount <= filters.supplyCountRange[1];
      });
      
      console.log(`[공급세대수 필터] 범위 ${filters.supplyCountRange[0]}~${filters.supplyCountRange[1]}세대: ${beforeFilter}개 → ${filtered.length}개`);
    }

    // 규제 및 단지 정보 필터들
    // 투기과열지구 필터 (specltRdnEarthAt 기준)
    if (filters.speculationArea) {
      filtered = filtered.filter(item => 
        item.specltRdnEarthAt === 'Y'
      );
    }

    // 조정대상지역 필터 (mdatTrgetAreaSecd 기준)
    if (filters.adjustmentArea) {
      filtered = filtered.filter(item => 
        item.mdatTrgetAreaSecd === 'Y'
      );
    }

    // 정비사업 필터 (imprmnBsnsAt 기준)
    if (filters.redevelopment) {
      filtered = filtered.filter(item => 
        item.imprmnBsnsAt === 'Y'
      );
    }

    // 공공주택지구 필터 (publicHouseEarthAt 기준)
    if (filters.publicHousing) {
      filtered = filtered.filter(item => 
        item.publicHouseEarthAt === 'Y'
      );
    }

    // 대규모택지 필터 (parcprcUlsAt 기준)
    if (filters.largeScale) {
      filtered = filtered.filter(item => 
        item.parcprcUlsAt === 'Y'
      );
    }

    // 수도권민영공공 필터 (nplnPrvoprPublicHouseAt 기준)
    if (filters.metropolitanPublic) {
      filtered = filtered.filter(item => 
        item.nplnPrvoprPublicHouseAt === 'Y'
      );
    }

    // 분양가상한제 필터 (가격 정보가 있는 경우에만 적용)
    if (filters.priceLimit) {
      // 가격 정보가 있는 데이터만 필터링
      filtered = filtered.filter(item => 
        item.hssplyPc || item.minSalePrice || item.maxSalePrice
      );
    }

    // 가격 범위 필터는 현재 API에서 가격 정보가 제공되지 않으므로 비활성화
    // if (filters.priceRange && Array.isArray(filters.priceRange)) {
    //   filtered = filtered.filter(item => {
    //     const price = item.hssplyPc || item.minSalePrice || item.maxSalePrice || 0;
    //     return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    //   });
    // }

    return filtered;
  }, [realTimeData, filters]);

  // 필터링된 데이터 업데이트
  useEffect(() => {
    const newFilteredData = applyFilters;
    
    // 데이터가 실제로 변경된 경우에만 업데이트
    if (JSON.stringify(newFilteredData) !== JSON.stringify(filteredData)) {
      console.log('[필터링 최적화] 기존 마커 정리 후 새 마커 생성');
      console.log(`[필터링 결과] 원본: ${realTimeData.length}개 → 필터링 후: ${newFilteredData.length}개`);
      
      // 중복 방지를 위한 추가 체크
      if (newFilteredData && Array.isArray(newFilteredData)) {
        setFilteredData(newFilteredData);
      } else {
        console.warn('[필터링 경고] 필터링된 데이터가 유효하지 않습니다:', newFilteredData);
        setFilteredData([]);
      }
    }
  }, [applyFilters, filteredData, realTimeData.length]);

  // 필터 통계 계산
  const filterStats = useMemo(() => {
    const total = realTimeData.length;
    const filtered = applyFilters.length;
    
    return {
      total,
      filtered,
      filteredPercentage: total > 0 ? Math.round((filtered / total) * 100) : 0
    };
  }, [realTimeData.length, applyFilters.length]);

  // 필터 옵션 추출
  const filterOptions = useMemo(() => {
    if (!realTimeData || realTimeData.length === 0) {
      return {
        regions: [],
        houseTypes: [],
        housingDetails: [],
        subscriptionStatuses: []
      };
    }

    return {
      regions: [...new Set(realTimeData.map(item => item.district).filter(Boolean))].sort(),
      houseTypes: [...new Set(realTimeData.map(item => item.houseSecdNm).filter(Boolean))].sort(),
      housingDetails: [...new Set(realTimeData.map(item => item.houseDtlSecdNm).filter(Boolean))].sort(),
      subscriptionStatuses: ['접수예정', '접수중', '접수종료', '당첨자발표완료']
    };
  }, [realTimeData]);

  return {
    filteredData: applyFilters,
    filterStats,
    filterOptions
  };
};
