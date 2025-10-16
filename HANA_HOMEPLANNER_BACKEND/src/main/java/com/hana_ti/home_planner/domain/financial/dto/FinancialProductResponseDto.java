package com.hana_ti.home_planner.domain.financial.dto;

import com.hana_ti.home_planner.domain.bank.entity.BankStatus;
import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FinancialProductResponseDto {

    private String productId;
    private String productName;
    private ProductType productType;
    private String productTypeDescription;
    private BankInfoDto bank;

    @Getter
    @Builder
    public static class BankInfoDto {
        private String bankId;
        private String bankName;
        private Integer bankCode;
        private BankStatus status;
        private String statusDescription;
    }

    public static FinancialProductResponseDto from(FinancialProduct product) {
        BankInfoDto bankInfo = BankInfoDto.builder()
                .bankId(product.getBank().getBankId())
                .bankName(product.getBank().getBankName())
                .bankCode(product.getBank().getBankCode())
                .status(product.getBank().getStatus())
                .statusDescription(product.getBank().getStatus().getDescription())
                .build();

        return FinancialProductResponseDto.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productType(product.getProductType())
                .productTypeDescription(product.getProductType().getDescription())
                .bank(bankInfo)
                .build();
    }
}
