package com.hana_ti.scheduler.domain.savings.repository;

import com.hana_ti.scheduler.domain.savings.entity.UserSavings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSavingsRepository extends JpaRepository<UserSavings, String> {

    /**
     * 계좌별 적금가입 조회 (단일)
     */
    Optional<UserSavings> findByAccountId(String accountId);


    /**
     * 계좌별 사용자별 적금가입 조회 (공동 적금용)
     */
    Optional<UserSavings> findByAccountIdAndUserId(String accountId, String userId);
}
