package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdInsuranceLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MdInsuranceLoanRepository extends JpaRepository<MdInsuranceLoan, Long> {

    /**
     * 사용자 ID로 보험 대출 조회
     */
    List<MdInsuranceLoan> findByUserId(Long userId);


    /**
     * 상환 방법으로 보험 대출 조회
     */
    List<MdInsuranceLoan> findByRepayMethod(String repayMethod);


}
