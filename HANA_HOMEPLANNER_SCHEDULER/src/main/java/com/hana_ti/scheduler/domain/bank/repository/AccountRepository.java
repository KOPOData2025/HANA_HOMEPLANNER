package com.hana_ti.scheduler.domain.bank.repository;

import com.hana_ti.scheduler.domain.bank.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    /**
     * 계좌번호로 계좌 조회
     */
    Optional<Account> findByAccountNum(String accountNum);

    /**
     * 계좌 타입별 계좌 목록 조회
     */
    List<Account> findByAccountType(Account.AccountType accountType);
}
