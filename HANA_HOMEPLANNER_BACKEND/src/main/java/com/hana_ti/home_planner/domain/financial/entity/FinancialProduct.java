package com.hana_ti.home_planner.domain.financial.entity;

import com.hana_ti.home_planner.domain.bank.entity.Bank;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fi_prod")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FinancialProduct {

    @Id
    @Column(name = "prod_id", length = 36)
    private String productId;

    @Column(name = "prod_nm", length = 255, nullable = false)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "prod_typ", length = 50, nullable = false)
    private ProductType productType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bnk_id", nullable = false)
    private Bank bank;

    public static FinancialProduct create(String productId, String productName, ProductType productType, Bank bank) {
        FinancialProduct product = new FinancialProduct();
        product.productId = productId;
        product.productName = productName;
        product.productType = productType;
        product.bank = bank;
        return product;
    }
}
