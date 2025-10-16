package com.hana_ti.home_planner.domain.bank.repository;

import com.hana_ti.home_planner.domain.bank.entity.AccountParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AccountParticipantRepository extends JpaRepository<AccountParticipant, String> {

    /**
     * 계좌에 참여자 존재 여부 확인
     */
    boolean existsByAccountIdAndUserId(String accountId, String userId);

}
