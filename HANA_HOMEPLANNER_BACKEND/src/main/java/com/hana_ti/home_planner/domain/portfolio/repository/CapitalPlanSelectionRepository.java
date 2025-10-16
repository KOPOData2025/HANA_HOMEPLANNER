package com.hana_ti.home_planner.domain.portfolio.repository;

import com.hana_ti.home_planner.domain.portfolio.entity.CapitalPlanSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CapitalPlanSelectionRepository extends JpaRepository<CapitalPlanSelection, Long> {

    /**
     * 사용자별 포트폴리오 선택 목록 조회 (최신순)
     */
    List<CapitalPlanSelection> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 사용자의 최신 포트폴리오 선택 조회
     */
    @Query("SELECT c FROM CapitalPlanSelection c WHERE c.userId = :userId ORDER BY c.createdAt DESC")
    Optional<CapitalPlanSelection> findLatestByUserId(@Param("userId") String userId);

    /**
     * 사용자별 포트폴리오 선택 개수 조회
     */
    long countByUserId(String userId);

    /**
     * 특정 플랜 타입별 선택 횟수 조회
     */
    @Query("SELECT c.planType, COUNT(c) FROM CapitalPlanSelection c WHERE c.userId = :userId GROUP BY c.planType")
    List<Object[]> countByUserIdAndPlanType(@Param("userId") String userId);

    /**
     * 주택관리번호별 포트폴리오 선택 목록 조회
     */
    List<CapitalPlanSelection> findByHouseMngNoOrderByCreatedAtDesc(Long houseMngNo);

    /**
     * 사용자와 주택관리번호로 포트폴리오 선택 목록 조회
     */
    List<CapitalPlanSelection> findByUserIdAndHouseMngNoOrderByCreatedAtDesc(String userId, Long houseMngNo);

    /**
     * 주택관리번호별 선택 개수 조회
     */
    long countByHouseMngNo(Long houseMngNo);
}
