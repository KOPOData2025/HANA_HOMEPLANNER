package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdCardLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MdCardLoanRepository extends JpaRepository<MdCardLoan, Long> {

    /**
     * 카드 ID로 카드 대출 조회
     * @param cardId 카드 ID
     * @return 카드 대출 목록
     */
    List<MdCardLoan> findByCardId(Long cardId);

    /**
     * 기관 코드로 카드 대출 조회
     * @param orgCode 기관 코드
     * @return 카드 대출 목록
     */
    List<MdCardLoan> findByOrgCode(String orgCode);

}
