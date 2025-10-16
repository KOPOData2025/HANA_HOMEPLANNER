package com.hana_ti.home_planner.domain.house.repository;

import com.hana_ti.home_planner.domain.house.entity.HouseSalesInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface SigunguStatsRepository extends JpaRepository<HouseSalesInfo, Long> {

    /**
     * 시군구별 분양가 집계 쿼리
     * 복잡한 WITH절과 집계 쿼리를 사용하여 지역별 분양가 통계를 조회합니다.
     */
    @Query(value = """
            /* 시군구별 분양가 집계 (필터 포함) */
            WITH pattern_src AS (  -- ① 지역별 키워드 정의
              SELECT '경기' region, '가평,고양,과천,광명,광주,구리,군포,김포,남양주,동두천,부천,성남,수원,시흥,안산,안성,안양,양주,양평,여주,연천,오산,용인,의왕,의정부,이천,파주,평택,포천,하남,화성' list FROM dual
              UNION ALL SELECT '인천','중구,동구,미추홀,연수,남동,부평,계양,서구,강화,옹진' FROM dual
              UNION ALL SELECT '서울','강남,서초,송파,강동,강북,성동,중랑,은평,동작,성북,영등포,서대문,노원,동대문,도봉,양천,광진,금천,강서,관악,마포,구로,용산,종로,중구' FROM dual
            ),
            patterns AS (          -- ② 콤마 분해 → (region, kw)
              SELECT region,
                     REGEXP_SUBSTR(REPLACE(list,' ',''), '[^,]+', 1, LEVEL) kw
              FROM pattern_src
              CONNECT BY REGEXP_SUBSTR(REPLACE(list,' ',''), '[^,]+', 1, LEVEL) IS NOT NULL
                 AND PRIOR list   = list
                 AND PRIOR region = region
                 AND PRIOR SYS_GUID() IS NOT NULL
            ),
            sales AS (             -- ③ sales 필터 + 주소 정규화 + 대분류 지역 표준화
              SELECT
                s.주택관리번호                                   AS house_manage_no,
                CASE WHEN s.공급지역명 IN ('서울','서울특별시') THEN '서울'
                     WHEN s.공급지역명 IN ('경기','경기도')     THEN '경기'
                     WHEN s.공급지역명 IN ('인천','인천광역시') THEN '인천'
                     ELSE NULL END                                 AS region_large,
                UPPER(REGEXP_REPLACE(TRIM(s.공급위치), '\\s+', ' ')) AS addr
              FROM house_sales_info s
              WHERE s.공급지역명 IN ('서울','서울특별시','경기','경기도','인천','인천광역시')
                AND (:p_house_div_nm         IS NULL OR s.주택구분코드명        = :p_house_div_nm)
                AND (:p_house_detail_div_nm  IS NULL OR s.주택상세구분코드명    = :p_house_detail_div_nm)
                AND (:p_overheat             IS NULL OR NVL(s.투기과열지구,'N')       = :p_overheat)
                AND (:p_adjust               IS NULL OR NVL(s.조정대상지역,'N')       = :p_adjust)
                AND (:p_pricecap             IS NULL OR NVL(s.분양가상한제,'N')       = :p_pricecap)
                AND (:p_redev                IS NULL OR NVL(s.정비사업,'N')           = :p_redev)
                AND (:p_public               IS NULL OR NVL(s.공공주택지구,'N')       = :p_public)
                AND (:p_large                IS NULL OR NVL(s.대규모택지개발지구,'N') = :p_large)
                AND (:p_capital              IS NULL OR NVL(s.수도권내민영공공주택지구,'N') = :p_capital)
            ),
            matched AS (           -- ④ 시군구 키워드 매칭 (한 단지당 다중 매칭 방지: DISTINCT)
              SELECT DISTINCT
                p.region,
                p.kw,
                x.house_manage_no
              FROM sales x
              JOIN patterns p
                ON p.region = x.region_large
               AND x.addr LIKE '%' || UPPER(p.kw) || '%'
            ),
            sigungu_named AS (     -- ⑤ 시군구명 생성 (고양→고양시, 강남→강남구, 강화→강화군 …)
              SELECT
                m.region,
                m.house_manage_no,
                CASE
                  WHEN m.region = '경기'
                    THEN CASE WHEN m.kw IN ('가평','양평','연천') THEN m.kw || '군' ELSE m.kw || '시' END
                  WHEN m.region = '인천'
                    THEN CASE WHEN m.kw IN ('강화','옹진') THEN m.kw || '군'
                              WHEN SUBSTR(m.kw, -1) = '구' THEN m.kw ELSE m.kw || '구' END
                  WHEN m.region = '서울'
                    THEN CASE WHEN SUBSTR(m.kw, -1) = '구' THEN m.kw ELSE m.kw || '구' END
                  ELSE m.kw
                END AS sigungu_name
              FROM matched m
            ),
            price AS (             -- ⑥ 가격/세대수
              SELECT
                p.주택관리번호                                 AS house_manage_no,
                p.공급금액_분양최고금액                         AS price,
                NVL(p.일반공급세대수,0) + NVL(p.특별공급세대수,0) AS hh_cnt
              FROM house_prices_info p
            )
            -- ⑦ 최종: 시군구별 집계
            SELECT
              s.region                         AS region_large,     -- 서울/경기/인천
              s.sigungu_name                   AS sigungu,          -- 예: 고양시, 강남구, 강화군
              COUNT(DISTINCT s.house_manage_no) AS complex_cnt,     -- 단지수
              MIN(pr.price)                    AS min_price,
              ROUND(AVG(pr.price))             AS avg_price,
              MAX(pr.price)                    AS max_price,
              ROUND(
                CASE WHEN SUM(CASE WHEN pr.price IS NOT NULL THEN pr.hh_cnt END) = 0 THEN NULL
                     ELSE SUM(CASE WHEN pr.price IS NOT NULL THEN pr.price*pr.hh_cnt END)
                          / SUM(CASE WHEN pr.price IS NOT NULL THEN pr.hh_cnt END)
                END
              )                                 AS wavg_price       -- 세대수 가중평균
            FROM sigungu_named s
            JOIN price pr
              ON pr.house_manage_no = s.house_manage_no
            GROUP BY s.region, s.sigungu_name
            ORDER BY s.region, s.sigungu_name
            """, nativeQuery = true)
    List<Object[]> getSigunguStats(
            @Param("p_house_div_nm") String houseDivisionName,
            @Param("p_house_detail_div_nm") String houseDetailDivisionName,
            @Param("p_overheat") String speculationOverheated,
            @Param("p_adjust") String adjustmentTargetArea,
            @Param("p_pricecap") String salePriceCeiling,
            @Param("p_redev") String improvementProject,
            @Param("p_public") String publicHousingDistrict,
            @Param("p_large") String largeScaleLandDevelopment,
            @Param("p_capital") String metropolitanPrivatePublicHousing
    );
}
