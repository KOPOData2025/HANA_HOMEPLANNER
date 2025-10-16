package com.hana_ti.home_planner.domain.user.repository;

import com.hana_ti.home_planner.domain.user.entity.UserHouseApply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserHouseApplyRepository extends JpaRepository<UserHouseApply, Long> {
    

    /**
     * 사용자 ID로 모든 신청 목록 조회 (최신순)
     */
    List<UserHouseApply> findByUserIdOrderByAppliedAtDesc(String userId);
    
    /**
     * 사용자가 특정 주택에 신청했는지 확인
     */
    boolean existsByUserIdAndHouseManageNo(String userId, String houseManageNo);
    

}
