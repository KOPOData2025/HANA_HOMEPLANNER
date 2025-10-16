package com.hana_ti.home_planner.domain.loan.repository;

import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, String> {

    /**
     * 은행 ID로 조회 (FinancialProduct와 별도 조회 필요)
     */
    @Query("SELECT lp FROM LoanProduct lp")
    List<LoanProduct> findByBankId(@Param("bankId") String bankId);

    /**
     * 최대 대출 금액 기준으로 조회
     */
    @Query("SELECT lp FROM LoanProduct lp WHERE lp.maxLoanAmount >= :minAmount")
    List<LoanProduct> findByMaxLoanAmountGreaterThanEqual(@Param("minAmount") BigDecimal minAmount);

    /**
     * 상품명으로 검색 (부분 일치) - FinancialProduct와 별도 조회 필요
     */
    @Query("SELECT lp FROM LoanProduct lp")
    List<LoanProduct> findByProductNameContaining(@Param("productName") String productName);

}