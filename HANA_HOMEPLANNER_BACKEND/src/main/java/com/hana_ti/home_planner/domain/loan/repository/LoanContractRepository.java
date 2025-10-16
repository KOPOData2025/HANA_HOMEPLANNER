package com.hana_ti.home_planner.domain.loan.repository;

import com.hana_ti.home_planner.domain.loan.entity.LoanContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanContractRepository extends JpaRepository<LoanContract, String> {


    /**
     * 대출 신청 ID로 대출 계약 조회
     */
    Optional<LoanContract> findByAppId(String appId);

    /**
     * 대출 계좌 ID로 대출 계약 조회
     */
    Optional<LoanContract> findByLoanAccountId(String loanAccountId);

        /**
     * 계좌 ID로 대출 계약 조회
     */
    Optional<LoanContract> findByAccountId(String accountId);

}
