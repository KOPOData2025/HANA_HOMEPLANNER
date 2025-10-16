package com.hana_ti.home_planner.domain.savings.repository;

import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SavingsProductRepository extends JpaRepository<SavingsProduct, String> {
    /**
     * 은행별 예금/적금상품 조회
     */
    @Query("SELECT sp FROM SavingsProduct sp JOIN sp.financialProduct fp WHERE fp.bank.bankId = :bankId")
    List<SavingsProduct> findByBankId(@Param("bankId") String bankId);
    /**
     * 상품명으로 검색
     */
    @Query("SELECT sp FROM SavingsProduct sp JOIN sp.financialProduct fp WHERE fp.productName LIKE %:productName%")
    List<SavingsProduct> findByProductNameContaining(@Param("productName") String productName);


    List<SavingsProduct> findByPaymentMethod(String paymentMethod);
}
