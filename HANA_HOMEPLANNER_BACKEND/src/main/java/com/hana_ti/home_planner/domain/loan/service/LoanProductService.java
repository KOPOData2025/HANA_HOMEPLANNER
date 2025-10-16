package com.hana_ti.home_planner.domain.loan.service;

import com.hana_ti.home_planner.domain.loan.dto.LoanProductResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import com.hana_ti.home_planner.domain.loan.repository.LoanProductRepository;
import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class LoanProductService {

    private final LoanProductRepository loanProductRepository;
    private final FinancialProductRepository financialProductRepository;

    /**
     * 모든 대출상품 조회
     */
    public List<LoanProductResponseDto> getAllLoanProducts() {
        log.info("모든 대출상품 조회 시작");
        
        List<LoanProduct> products = loanProductRepository.findAll();
        
        log.info("조회된 대출상품 수: {}개", products.size());
        
        return products.stream()
                .map(product -> {
                    FinancialProduct financialProduct = financialProductRepository.findById(product.getProductId()).orElse(null);
                    return LoanProductResponseDto.from(product, financialProduct);
                })
                .collect(Collectors.toList());
    }

    /**
     * 대출상품 상세 조회
     */
    public LoanProductResponseDto getLoanProductById(String productId) {
        log.info("대출상품 상세 조회 시작 - ID: {}", productId);
        
        LoanProduct product = loanProductRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 대출상품을 찾을 수 없습니다: " + productId));
        
        FinancialProduct financialProduct = financialProductRepository.findById(productId).orElse(null);
        
        log.info("대출상품 조회 완료 - 상품ID: {}", product.getProductId());
        
        return LoanProductResponseDto.from(product, financialProduct);
    }

    /**
     * 은행별 대출상품 조회
     */
    public List<LoanProductResponseDto> getLoanProductsByBank(String bankId) {
        log.info("은행별 대출상품 조회 시작 - 은행ID: {}", bankId);
        
        List<LoanProduct> products = loanProductRepository.findByBankId(bankId);
        
        // FinancialProduct를 별도로 조회하여 은행 ID 필터링
        List<LoanProductResponseDto> filteredProducts = products.stream()
                .map(product -> {
                    FinancialProduct financialProduct = financialProductRepository.findById(product.getProductId()).orElse(null);
                    return LoanProductResponseDto.from(product, financialProduct);
                })
                .filter(dto -> dto.getBank().getBankId().equals(bankId))
                .collect(Collectors.toList());
        
        log.info("조회된 대출상품 수: {}개", filteredProducts.size());
        
        return filteredProducts;
    }

    /**
     * 최대 대출 금액 기준 조회
     */
    public List<LoanProductResponseDto> getLoanProductsByMinAmount(BigDecimal minAmount) {
        log.info("최대 대출 금액 기준 조회 시작 - 최소 금액: {}", minAmount);
        
        List<LoanProduct> products = loanProductRepository.findByMaxLoanAmountGreaterThanEqual(minAmount);
        
        log.info("조회된 대출상품 수: {}개", products.size());
        
        return products.stream()
                .map(product -> {
                    FinancialProduct financialProduct = financialProductRepository.findById(product.getProductId()).orElse(null);
                    return LoanProductResponseDto.from(product, financialProduct);
                })
                .collect(Collectors.toList());
    }

    /**
     * 상품명으로 검색
     */
    public List<LoanProductResponseDto> searchLoanProductsByName(String productName) {
        log.info("상품명 검색 시작 - 검색어: {}", productName);
        
        List<LoanProduct> products = loanProductRepository.findByProductNameContaining(productName);
        
        // FinancialProduct를 별도로 조회하여 상품명 필터링
        List<LoanProductResponseDto> filteredProducts = products.stream()
                .map(product -> {
                    FinancialProduct financialProduct = financialProductRepository.findById(product.getProductId()).orElse(null);
                    return LoanProductResponseDto.from(product, financialProduct);
                })
                .filter(dto -> dto.getProductName().toLowerCase().contains(productName.toLowerCase()))
                .collect(Collectors.toList());
        
        log.info("검색된 대출상품 수: {}개", filteredProducts.size());
        
        return filteredProducts;
    }
}
