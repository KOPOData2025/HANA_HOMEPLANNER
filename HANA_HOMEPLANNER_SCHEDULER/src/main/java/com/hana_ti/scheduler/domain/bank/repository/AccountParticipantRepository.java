package com.hana_ti.scheduler.domain.bank.repository;

import com.hana_ti.scheduler.domain.bank.entity.AccountParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountParticipantRepository extends JpaRepository<AccountParticipant, String> {

    /**
     * 계좌 ID로 참여자 목록 조회
     */
    List<AccountParticipant> findByAccountIdOrderByCreatedAtAsc(String accountId);

}
