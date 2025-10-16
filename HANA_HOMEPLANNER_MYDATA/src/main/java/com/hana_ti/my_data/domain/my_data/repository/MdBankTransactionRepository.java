package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdBankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MdBankTransactionRepository extends JpaRepository<MdBankTransaction, Long> {

    /**
     * 사용자 ID로 모든 거래내역 조회
     */
    List<MdBankTransaction> findByUserIdOrderByTransactionDateDesc(Long userId);

}
