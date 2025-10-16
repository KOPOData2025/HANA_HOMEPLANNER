package com.hana_ti.home_planner.domain.house.repository;

import com.hana_ti.home_planner.domain.house.entity.HouseSalesInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HouseSalesInfoRepository extends JpaRepository<HouseSalesInfo, Long> {

    /**
     * 주소 기반 검색 (정규식으로 시도, 시군구, 읍면동 파싱)
     */
    @Query(
        value = """
            WITH norm AS (
              SELECT
                t.*,
                REGEXP_REPLACE(TRIM(공급위치), '[[:space:]]+', ' ') AS 공급위치_norm
              FROM house_sales_info t
            ),
            addr AS (
              SELECT
                n.*,
                REGEXP_SUBSTR(공급위치_norm, '^[^ ]+') AS sido,                             -- 시/도
                REGEXP_SUBSTR(공급위치_norm, '^[^ ]+ ([^ ]+)', 1, 1, NULL, 1) AS sigungu,   -- 시/군/구
                REGEXP_SUBSTR(공급위치_norm, '^[^ ]+ [^ ]+ ([^ ]+)', 1, 1, NULL, 1) AS eupmyeondong -- 읍/면/동 (토큰 기준)
              FROM norm n
            )
            SELECT /*+ INDEX_FFS(addr) */ *
            FROM addr
            WHERE (:sido    IS NULL OR sido = :sido)
              AND (:sigungu IS NULL OR sigungu = :sigungu)
              AND (:emd     IS NULL OR 공급위치_norm LIKE :emdPrefix)
            ORDER BY 모집공고일 DESC
        """,
        countQuery = """
            WITH norm AS (
              SELECT
                t.*,
                REGEXP_REPLACE(TRIM(공급위치), '[[:space:]]+', ' ') AS 공급위치_norm
              FROM house_sales_info t
            ),
            addr AS (
              SELECT
                n.*,
                REGEXP_SUBSTR(공급위치_norm, '^[^ ]+') AS sido,                             -- 시/도
                REGEXP_SUBSTR(공급위치_norm, '^[^ ]+ ([^ ]+)', 1, 1, NULL, 1) AS sigungu,   -- 시/군/구
                REGEXP_SUBSTR(공급위치_norm, '^[^ ]+ [^ ]+ ([^ ]+)', 1, 1, NULL, 1) AS eupmyeondong -- 읍/면/동 (토큰 기준)
              FROM norm n
            )
            SELECT COUNT(*)
            FROM addr
            WHERE (:sido    IS NULL OR sido = :sido)
              AND (:sigungu IS NULL OR sigungu = :sigungu)
              AND (:emd     IS NULL OR 공급위치_norm LIKE :emdPrefix)
        """,
        nativeQuery = true
    )
    Page<HouseSalesInfo> searchByAddress(
            @Param("sido") String sido,
            @Param("sigungu") String sigungu,
            @Param("emd") String emd,
            @Param("emdPrefix") String emdPrefix,
            Pageable pageable
    );

    /**
     * 공급지역명으로 검색
     */
    List<HouseSalesInfo> findBySupplyAreaNameContaining(String supplyAreaName);

    /**
     * 공급규모 범위로 검색
     */
    List<HouseSalesInfo> findBySupplyScaleBetween(Long minScale, Long maxScale);

    /**
     * 모집공고일 범위로 검색
     */
    List<HouseSalesInfo> findByRecruitmentAnnouncementDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * 투기과열지구별 검색 (필드명 변경)
     */
    List<HouseSalesInfo> findBySpeculationOverheatedArea(String speculationOverheatedArea);

    /**
     * 입주예정월별 검색 (필드명 변경)
     */
    List<HouseSalesInfo> findByMoveInExpectedMonthContaining(String moveInExpectedMonth);

    /**
     * 주택구분코드명으로 검색
     */
    List<HouseSalesInfo> findByHouseTypeCodeName(String houseTypeCodeName);

    /**
     * 조정대상지역별 검색
     */
    List<HouseSalesInfo> findByAdjustmentTargetArea(String adjustmentTargetArea);


    /**
     * 전체 주택 상세 정보 조회 (좌표 및 가격 정보 포함)
     * 주택 판매 정보, 주소 좌표, 가격 정보 요약을 통합하여 조회합니다.
     */
    @Query(value = """
        SELECT 
            h.주택관리번호 as houseManagementNumber,
            h.주택명 as houseName,
            h.주택구분코드명 as houseTypeCodeName,
            h.주택상세구분코드명 as houseDetailTypeCodeName,
            h.공급지역명 as supplyAreaName,
            h.공급위치 as supplyLocation,
            h.공급규모 as supplyScale,
            TO_CHAR(h.모집공고일, 'YYYY-MM-DD') as recruitmentAnnouncementDate,
            h.홈페이지주소 as homepageUrl,
            h.입주예정월 as moveInExpectedMonth,
            h.투기과열지구 as speculationOverheatedArea,
            h.조정대상지역 as adjustmentTargetArea,
            h.분양가상한제 as salePriceCeilingSystem,
            h.정비사업 as improvementProject,
            h.공공주택지구 as publicHousingDistrict,
            h.대규모택지개발지구 as largeScaleLandDevelopmentDistrict,
            h.수도권내민영공공주택지구 as metropolitanPrivatePublicHousingDistrict,
            h.모집공고홈페이지주소 as recruitmentAnnouncementHomepageUrl,
            REGEXP_SUBSTR(REGEXP_REPLACE(TRIM(h.공급위치), '[[:space:]]+', ' '), '^[^ ]+') as sido,
            REGEXP_SUBSTR(REGEXP_REPLACE(TRIM(h.공급위치), '[[:space:]]+', ' '), '^[^ ]+ ([^ ]+)', 1, 1, NULL, 1) as sigungu,
            REGEXP_SUBSTR(REGEXP_REPLACE(TRIM(h.공급위치), '[[:space:]]+', ' '), '^[^ ]+ [^ ]+ ([^ ]+)', 1, 1, NULL, 1) as eupmyeondong,
            a.road_nm as roadNm,
            a.lat,
            a.lon,
            COALESCE(ps.total_house_types, 0) as totalHouseTypes,
            COALESCE(ps.min_supply_area, 0) as minSupplyArea,
            COALESCE(ps.max_supply_area, 0) as maxSupplyArea,
            COALESCE(ps.min_sale_price, 0) as minSalePrice,
            COALESCE(ps.max_sale_price, 0) as maxSalePrice,
            COALESCE(ps.total_general_supply_households, 0) as totalGeneralSupplyHouseholds,
            COALESCE(ps.total_special_supply_households, 0) as totalSpecialSupplyHouseholds
        FROM house_sales_info h
        LEFT JOIN address a ON (
            a.sido = REGEXP_SUBSTR(REGEXP_REPLACE(TRIM(h.공급위치), '[[:space:]]+', ' '), '^[^ ]+')
            AND a.sigungu = REGEXP_SUBSTR(REGEXP_REPLACE(TRIM(h.공급위치), '[[:space:]]+', ' '), '^[^ ]+ ([^ ]+)', 1, 1, NULL, 1)
            AND a.eupmyeondong = REGEXP_SUBSTR(REGEXP_REPLACE(TRIM(h.공급위치), '[[:space:]]+', ' '), '^[^ ]+ [^ ]+ ([^ ]+)', 1, 1, NULL, 1)
        )
        LEFT JOIN (
            SELECT 
                주택관리번호,
                COUNT(*) as total_house_types,
                MIN(주택공급면적) as min_supply_area,
                MAX(주택공급면적) as max_supply_area,
                MIN(공급금액_분양최고금액) as min_sale_price,
                MAX(공급금액_분양최고금액) as max_sale_price,
                SUM(일반공급세대수) as total_general_supply_households,
                SUM(특별공급세대수) as total_special_supply_households
            FROM house_prices_info
            GROUP BY 주택관리번호
        ) ps ON h.주택관리번호 = ps.주택관리번호
        ORDER BY h.모집공고일 DESC
        """, nativeQuery = true)
    List<Object[]> findAllHouseDetailsWithCoordinatesRaw();
}
