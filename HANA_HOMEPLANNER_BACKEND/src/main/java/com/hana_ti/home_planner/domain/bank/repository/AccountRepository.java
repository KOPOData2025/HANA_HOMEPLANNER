package com.hana_ti.home_planner.domain.bank.repository;

import com.hana_ti.home_planner.domain.bank.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    /**
     * 사용자별 계좌 목록 조회
     */
    List<Account> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 사용자별 계좌 타입별 목록 조회
     */
    List<Account> findByUserIdAndAccountTypeOrderByCreatedAtDesc(String userId, Account.AccountType accountType);

    /**
     * 계좌번호로 계좌 조회
     */
    Optional<Account> findByAccountNum(String accountNum);

    /**
     * 사용자별 활성 계좌 목록 조회
     */
    List<Account> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, Account.AccountStatus status);


    /**
     * 계좌번호 중복 확인
     */
    boolean existsByAccountNum(String accountNum);

}
