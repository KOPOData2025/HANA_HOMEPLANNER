package com.hana_ti.scheduler.domain.loan.repository;

import com.hana_ti.scheduler.domain.loan.entity.LoanRepaymentSchedule;
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
     * 대출 ID와 상태 목록과 만료일로 상환 스케줄 조회
     */
    @Query("SELECT lrs FROM LoanRepaymentSchedule lrs WHERE lrs.loanId = :loanId AND lrs.status IN :statuses AND lrs.dueDate <= :targetDate ORDER BY lrs.dueDate ASC")
    List<LoanRepaymentSchedule> findByLoanIdAndStatusInAndDueDateLessThanEqual(
            @Param("loanId") String loanId, 
            @Param("statuses") List<LoanRepaymentSchedule.RepaymentStatus> statuses,
            @Param("targetDate") LocalDate targetDate);

}
