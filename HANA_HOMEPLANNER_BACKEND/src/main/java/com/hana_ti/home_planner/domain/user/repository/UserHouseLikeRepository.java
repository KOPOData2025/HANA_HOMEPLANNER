package com.hana_ti.home_planner.domain.user.repository;

import com.hana_ti.home_planner.domain.user.entity.UserHouseLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserHouseLikeRepository extends JpaRepository<UserHouseLike, Long> {
    

    /**
     * 사용자 ID로 모든 찜한 주택 목록 조회
     */
    List<UserHouseLike> findByUserIdOrderByLikedAtDesc(String userId);
    
    /**
     * 사용자가 특정 주택을 찜했는지 확인
     */
    boolean existsByUserIdAndHouseManageNo(String userId, String houseManageNo);
    
    /**
     * 사용자 ID와 주택관리번호로 찜 삭제
     */
    void deleteByUserIdAndHouseManageNo(String userId, String houseManageNo);
}
