package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MdCardRepository extends JpaRepository<MdBankAccount.MdCard, Long> {

    /**
     * 사용자 ID로 카드 조회
     */
    List<MdBankAccount.MdCard> findByUserId(Long userId);

}
