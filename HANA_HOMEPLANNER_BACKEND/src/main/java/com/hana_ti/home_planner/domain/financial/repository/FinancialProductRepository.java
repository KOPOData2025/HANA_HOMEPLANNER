package com.hana_ti.home_planner.domain.financial.repository;

import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialProductRepository extends JpaRepository<FinancialProduct, String> {

    /**
     * 은행별 금융상품 조회
     */
    List<FinancialProduct> findByBankBankId(String bankId);

    /**
     * 상품 유형별 조회
     */
    List<FinancialProduct> findByProductType(ProductType productType);

    /**
     * 상품명으로 검색 (부분 일치)
     */
    List<FinancialProduct> findByProductNameContaining(String productName);

    /**
     * 은행별 + 상품 유형별 조회
     */
    List<FinancialProduct> findByBankBankIdAndProductType(String bankId, ProductType productType);

    /**
     * 은행명으로 금융상품 검색
     */
    @Query("SELECT fp FROM FinancialProduct fp JOIN fp.bank b WHERE b.bankName LIKE %:bankName%")
    List<FinancialProduct> findByBankNameContaining(@Param("bankName") String bankName);

    /**
     * 활성 은행의 금융상품만 조회
     */
    @Query("SELECT fp FROM FinancialProduct fp JOIN fp.bank b WHERE b.status = 'ACTIVE' ORDER BY b.bankName, fp.productName")
    List<FinancialProduct> findByActiveBanks();

    /**
     * 은행 정보와 함께 상품 조회 (지연 로딩 문제 해결)
     */
    @Query("SELECT fp FROM FinancialProduct fp JOIN FETCH fp.bank WHERE fp.productId = :productId")
    Optional<FinancialProduct> findByIdWithBank(@Param("productId") String productId);
}
