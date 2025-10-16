package com.hana_ti.home_planner.domain.savings.service;

import com.hana_ti.home_planner.domain.savings.dto.SavingsProductResponseDto;
import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import com.hana_ti.home_planner.domain.savings.repository.SavingsProductRepository;
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
public class SavingsProductService {

    private final SavingsProductRepository savingsProductRepository;

    /**
     * 모든 예금/적금상품 조회
     */
    public List<SavingsProductResponseDto> getAllSavingsProducts() {
        log.info("모든 예금/적금상품 조회 시작");
        
        List<SavingsProduct> products = savingsProductRepository.findAll();
        
        log.info("조회된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 예금/적금상품 상세 조회
     */
    public SavingsProductResponseDto getSavingsProductById(String productId) {
        log.info("예금/적금상품 상세 조회 시작 - ID: {}", productId);
        
        SavingsProduct product = savingsProductRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 예금/적금상품을 찾을 수 없습니다: " + productId));
        
        log.info("예금/적금상품 조회 완료 - 상품명: {}", product.getFinancialProduct().getProductName());
        
        return SavingsProductResponseDto.from(product);
    }

    /**
     * 은행별 예금/적금상품 조회
     */
    public List<SavingsProductResponseDto> getSavingsProductsByBank(String bankId) {
        log.info("은행별 예금/적금상품 조회 시작 - 은행ID: {}", bankId);
        
        List<SavingsProduct> products = savingsProductRepository.findByBankId(bankId);
        
        log.info("조회된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 상품명으로 검색
     */
    public List<SavingsProductResponseDto> searchSavingsProductsByName(String productName) {
        log.info("상품명 검색 시작 - 검색어: {}", productName);
        
        List<SavingsProduct> products = savingsProductRepository.findByProductNameContaining(productName);
        
        log.info("검색된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 최소 예치금액으로 필터링
     */
    public List<SavingsProductResponseDto> getSavingsProductsByMinDepositAmount(BigDecimal minAmount) {
        log.info("최소 예치금액으로 필터링 시작 - 최소금액: {}", minAmount);
        
        List<SavingsProduct> products = savingsProductRepository.findAll().stream()
                .filter(product -> product.getMinDepositAmount() == null || 
                                 product.getMinDepositAmount().compareTo(minAmount) <= 0)
                .collect(Collectors.toList());
        
        log.info("필터링된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 최대 예치금액으로 필터링
     */
    public List<SavingsProductResponseDto> getSavingsProductsByMaxDepositAmount(BigDecimal maxAmount) {
        log.info("최대 예치금액으로 필터링 시작 - 최대금액: {}", maxAmount);
        
        List<SavingsProduct> products = savingsProductRepository.findAll().stream()
                .filter(product -> product.getMaxDepositAmount() == null || 
                                 product.getMaxDepositAmount().compareTo(maxAmount) >= 0)
                .collect(Collectors.toList());
        
        log.info("필터링된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 기본 금리로 필터링
     */
    public List<SavingsProductResponseDto> getSavingsProductsByBaseInterestRate(BigDecimal minRate) {
        log.info("기본 금리로 필터링 시작 - 최소금리: {}%", minRate);
        
        List<SavingsProduct> products = savingsProductRepository.findAll().stream()
                .filter(product -> product.getBaseInterestRate() != null && 
                                 product.getBaseInterestRate().compareTo(minRate) >= 0)
                .collect(Collectors.toList());
        
        log.info("필터링된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 우대 금리로 필터링
     */
    public List<SavingsProductResponseDto> getSavingsProductsByPreferentialRate(BigDecimal minRate) {
        log.info("우대 금리로 필터링 시작 - 최소우대금리: {}%", minRate);
        
        List<SavingsProduct> products = savingsProductRepository.findAll().stream()
                .filter(product -> product.getPreferentialInterestRate() != null && 
                                 product.getPreferentialInterestRate().compareTo(minRate) >= 0)
                .collect(Collectors.toList());
        
        log.info("필터링된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 상환방식별 조회
     */
    public List<SavingsProductResponseDto> getSavingsProductsByPaymentMethod(String paymentMethod) {
        log.info("상환방식별 조회 시작 - 상환방식: {}", paymentMethod);
        
        List<SavingsProduct> products = savingsProductRepository.findByPaymentMethod(paymentMethod);
        
        log.info("조회된 예금/적금상품 수: {}개", products.size());
        
        return products.stream()
                .map(SavingsProductResponseDto::from)
                .collect(Collectors.toList());
    }
}
