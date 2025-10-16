package com.hana_ti.home_planner.domain.loan.repository;

import com.hana_ti.home_planner.domain.loan.entity.LoanInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 대출 초대 리포지토리
 */
@Repository
public interface LoanInvitationRepository extends JpaRepository<LoanInvitation, String> {

    /**
     * 대출 신청별 초대 목록 조회
     */
    List<LoanInvitation> findByAppIdOrderByCreatedAtDesc(String appId);

    /**
     * 초대자별 초대 목록 조회
     */
    List<LoanInvitation> findByInviterIdOrderByCreatedAtDesc(String inviterId);

    }
