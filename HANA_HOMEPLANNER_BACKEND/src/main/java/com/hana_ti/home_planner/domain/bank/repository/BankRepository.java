package com.hana_ti.home_planner.domain.bank.repository;

import com.hana_ti.home_planner.domain.bank.entity.Bank;
import com.hana_ti.home_planner.domain.bank.entity.BankStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankRepository extends JpaRepository<Bank, String> {

    /**
     * 은행 코드로 조회
     */
    Optional<Bank> findByBankCode(Integer bankCode);

    /**
     * 은행명으로 검색 (부분 일치)
     */
    List<Bank> findByBankNameContaining(String bankName);

    /**
     * 상태별 은행 조회
     */
    List<Bank> findByStatus(BankStatus status);

    /**
     * 활성 상태 은행만 조회
     */
    List<Bank> findByStatusOrderByBankNameAsc(BankStatus status);
}
