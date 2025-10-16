package com.hana_ti.home_planner.domain.loan.repository;

import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, String> {

    /**
     * 사용자별 대출 신청 목록 조회
     */
    List<LoanApplication> findByUserIdOrderBySubmittedAtDesc(String userId);

}
