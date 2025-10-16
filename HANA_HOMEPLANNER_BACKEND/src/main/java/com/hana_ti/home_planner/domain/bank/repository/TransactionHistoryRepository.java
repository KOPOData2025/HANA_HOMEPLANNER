package com.hana_ti.home_planner.domain.bank.repository;

import com.hana_ti.home_planner.domain.bank.entity.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, String> {

    /**
     * 계좌별 거래내역 조회 (최신순)
     */
    List<TransactionHistory> findByAccountIdOrderByTxnDateDesc(String accountId);

    /**
     * 계좌별 거래내역 조회 (기간별)
     */
    @Query("SELECT t FROM TransactionHistory t WHERE t.accountId = :accountId " +
           "AND t.txnDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.txnDate DESC")
    List<TransactionHistory> findByAccountIdAndTxnDateBetween(
            @Param("accountId") String accountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

}
