package com.hana_ti.home_planner.domain.loan.repository;

import com.hana_ti.home_planner.domain.loan.entity.LoanRepaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepaymentScheduleRepository extends JpaRepository<LoanRepaymentSchedule, String> {

    /**
     * 대출 계약별 상환 스케줄 목록 조회
     */
    List<LoanRepaymentSchedule> findByLoanIdOrderByDueDateAsc(String loanId);
}
