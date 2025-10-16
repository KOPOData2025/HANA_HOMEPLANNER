package com.hana_ti.home_planner.domain.couple.repository;

import com.hana_ti.home_planner.domain.couple.entity.CoupleInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CoupleInviteRepository extends JpaRepository<CoupleInvite, String> {

    /**
     * 토큰으로 초대 정보 조회
     * @param token 초대 토큰
     * @return 초대 정보
     */
    Optional<CoupleInvite> findByToken(String token);

    /**
     * 사용자 ID로 활성 초대 조회 (PENDING 상태)
     * @param userId 사용자 ID
     * @return 활성 초대 목록
     */
    List<CoupleInvite> findByUserIdAndStatus(String userId, CoupleInvite.InviteStatus status);


    /**
     * 만료된 초대 상태 업데이트
     * @param now 현재 시간
     * @return 업데이트된 행 수
     */
    @Modifying
    @Query("UPDATE CoupleInvite ci SET ci.status = 'EXPIRED' WHERE ci.expiredAt < :now AND ci.status = 'PENDING'")
    int updateExpiredInvites(@Param("now") LocalDateTime now);

    /**
     * 사용자의 활성 초대 개수 조회
     * @param userId 사용자 ID
     * @return 활성 초대 개수
     */
    long countByUserIdAndStatus(String userId, CoupleInvite.InviteStatus status);
}
