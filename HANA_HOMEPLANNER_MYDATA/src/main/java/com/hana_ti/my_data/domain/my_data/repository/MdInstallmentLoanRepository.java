package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdInstallmentLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MdInstallmentLoanRepository extends JpaRepository<MdInstallmentLoan, Long> {

    /**
     * 사용자 ID로 할부 대출 조회
     */
    List<MdInstallmentLoan> findByUserId(Long userId);

}
