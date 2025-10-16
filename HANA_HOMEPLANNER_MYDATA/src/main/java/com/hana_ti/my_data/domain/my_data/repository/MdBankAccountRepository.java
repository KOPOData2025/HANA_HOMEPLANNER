package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MdBankAccountRepository extends JpaRepository<MdBankAccount, Long> {

    /**
     * 사용자 ID로 계좌 목록 조회
     * @param userId 사용자 ID
     * @return 계좌 목록
     */
    List<MdBankAccount> findByUserId(Long userId);

}
