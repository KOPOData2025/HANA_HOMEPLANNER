package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdBankLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MdBankLoanRepository extends JpaRepository<MdBankLoan, Long> {

    /**
     * 사용자 ID로 대출 정보 조회
     * @param userId 사용자 ID
     * @return 대출 정보 목록
     */
    List<MdBankLoan> findByUserId(Long userId);
}
