package com.hana_ti.home_planner.domain.bank.repository;

import com.hana_ti.home_planner.domain.bank.entity.AccountInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface AccountInvitationRepository extends JpaRepository<AccountInvitation, String> {

    /**
     * 계좌별 초대 목록 조회
     */
    List<AccountInvitation> findByAccountIdOrderByCreatedAtDesc(String accountId);

       /**
     * 특정 상태의 초대 목록 조회
     */
    List<AccountInvitation> findByStatus(AccountInvitation.InvitationStatus status);


}
