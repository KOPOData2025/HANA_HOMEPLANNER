package com.hana_ti.home_planner.domain.house.repository;

import com.hana_ti.home_planner.domain.house.entity.HousePricesInfo;
import com.hana_ti.home_planner.domain.house.entity.HousePricesInfoId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface HousePriceInfoRepository extends JpaRepository<HousePricesInfo, HousePricesInfoId> {

    /**
     * 복합키로 특정 주택 가격 정보 조회
     */
    Optional<HousePricesInfo> findByHouseManagementNumberAndHouseType(BigDecimal houseManagementNumber, String houseType);

    /**
     * 주택관리번호로 검색
     */
    List<HousePricesInfo> findByHouseManagementNumber(BigDecimal houseManagementNumber);

    /**
     * 주택형으로 검색
     */
    List<HousePricesInfo> findByHouseType(String houseType);

    /**
     * 페이징 처리가 포함된 모든 주택 가격 정보 조회
     */
    Page<HousePricesInfo> findAll(Pageable pageable);

    /**
     * 복합 검색 조건으로 페이징 처리된 결과 조회 (공급위치 조건 제거)
     */
    @Query("SELECT h FROM HousePricesInfo h WHERE " +
           "(:houseType IS NULL OR h.houseType LIKE CONCAT('%', :houseType, '%')) AND " +
           "(:minPrice IS NULL OR h.supplyAmountMaxSalePrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.supplyAmountMaxSalePrice <= :maxPrice) AND " +
           "(:minArea IS NULL OR h.houseSupplyArea >= :minArea) AND " +
           "(:maxArea IS NULL OR h.houseSupplyArea <= :maxArea) AND " +
           "(:minHouseholds IS NULL OR h.generalSupplyHouseholds >= :minHouseholds)")
    Page<HousePricesInfo> findByComplexSearch(
            @Param("houseType") String houseType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minArea") BigDecimal minArea,
            @Param("maxArea") BigDecimal maxArea,
            @Param("minHouseholds") BigDecimal minHouseholds,
            Pageable pageable);

    // 기존 메서드들 (페이징 없는 버전)
    
    /**
     * 분양최고금액 범위별 검색
     */
    @Query("SELECT h FROM HousePricesInfo h WHERE h.supplyAmountMaxSalePrice BETWEEN :minPrice AND :maxPrice")
    List<HousePricesInfo> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);

    /**
     * 분양최고금액 이하 검색
     */
    @Query("SELECT h FROM HousePricesInfo h WHERE h.supplyAmountMaxSalePrice <= :maxPrice ORDER BY h.supplyAmountMaxSalePrice ASC")
    List<HousePricesInfo> findByMaxPriceLessThanEqual(@Param("maxPrice") BigDecimal maxPrice);

    /**
     * 주택공급면적 범위별 검색
     */
    @Query("SELECT h FROM HousePricesInfo h WHERE h.houseSupplyArea BETWEEN :minArea AND :maxArea")
    List<HousePricesInfo> findBySupplyAreaRange(@Param("minArea") BigDecimal minArea, @Param("maxArea") BigDecimal maxArea);

    /**
     * 일반공급세대수 기준 검색
     */
    @Query("SELECT h FROM HousePricesInfo h WHERE h.generalSupplyHouseholds >= :minHouseholds ORDER BY h.generalSupplyHouseholds DESC")
    List<HousePricesInfo> findByMinGeneralSupplyHouseholds(@Param("minHouseholds") BigDecimal minHouseholds);

    /**
     * 특별공급세대수 기준 검색
     */
    @Query("SELECT h FROM HousePricesInfo h WHERE h.specialSupplyHouseholds >= :minHouseholds ORDER BY h.specialSupplyHouseholds DESC")
    List<HousePricesInfo> findByMinSpecialSupplyHouseholds(@Param("minHouseholds") BigDecimal minHouseholds);

    /**
     * 주택형별 평균 분양최고금액 조회
     */
    @Query("SELECT h.houseType, AVG(h.supplyAmountMaxSalePrice) FROM HousePricesInfo h GROUP BY h.houseType ORDER BY AVG(h.supplyAmountMaxSalePrice) DESC")
    List<Object[]> findAverageMaxSalePriceByHouseType();

    /**
     * 주택공급면적별 평균 분양최고금액 조회
     */
    @Query("SELECT h.houseSupplyArea, AVG(h.supplyAmountMaxSalePrice) FROM HousePricesInfo h GROUP BY h.houseSupplyArea ORDER BY h.houseSupplyArea ASC")
    List<Object[]> findAverageMaxSalePriceBySupplyArea();
}