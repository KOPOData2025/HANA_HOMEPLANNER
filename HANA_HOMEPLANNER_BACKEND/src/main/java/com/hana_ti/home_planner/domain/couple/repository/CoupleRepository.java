package com.hana_ti.home_planner.domain.couple.repository;

import com.hana_ti.home_planner.domain.couple.entity.Couple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoupleRepository extends JpaRepository<Couple, String> {

    /**
     * 두 사용자 간의 커플 관계 조회
     * @param userId1 사용자 1 ID
     * @param userId2 사용자 2 ID
     * @return 커플 관계 (Optional)
     */
    @Query("SELECT c FROM Couple c WHERE (c.userId1 = :userId1 AND c.userId2 = :userId2) OR (c.userId1 = :userId2 AND c.userId2 = :userId1)")
    Optional<Couple> findByUserIds(@Param("userId1") String userId1, @Param("userId2") String userId2);

    /**
     * 사용자의 활성 커플 관계 조회
     * @param userId 사용자 ID
     * @return 활성 커플 관계 목록
     */
    @Query("SELECT c FROM Couple c WHERE (c.userId1 = :userId OR c.userId2 = :userId) AND c.status = 'ACTIVE'")
    List<Couple> findActiveByUserId(@Param("userId") String userId);

    /**
     * 두 사용자 간의 활성 커플 관계 존재 여부 확인
     * @param userId1 사용자 1 ID
     * @param userId2 사용자 2 ID
     * @return 존재 여부
     */
    @Query("SELECT COUNT(c) > 0 FROM Couple c WHERE ((c.userId1 = :userId1 AND c.userId2 = :userId2) OR (c.userId1 = :userId2 AND c.userId2 = :userId1)) AND c.status = 'ACTIVE'")
    boolean existsActiveCouple(@Param("userId1") String userId1, @Param("userId2") String userId2);
}
