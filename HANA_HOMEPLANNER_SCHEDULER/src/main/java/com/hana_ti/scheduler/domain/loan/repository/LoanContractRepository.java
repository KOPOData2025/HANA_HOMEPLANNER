package com.hana_ti.scheduler.domain.loan.repository;

import com.hana_ti.scheduler.domain.loan.entity.LoanContract;
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
     * 출금 계좌 ID로 대출 계약 목록 조회
     */
    List<LoanContract> findByDisburseAccountId(String disburseAccountId);
}
