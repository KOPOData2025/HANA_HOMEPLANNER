package com.hana_ti.home_planner.domain.financial.service;

import com.hana_ti.home_planner.domain.financial.dto.FinancialProductDetailResponseDto;
import com.hana_ti.home_planner.domain.financial.dto.FinancialProductResponseDto;
import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import com.hana_ti.home_planner.domain.loan.repository.LoanProductRepository;
import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import com.hana_ti.home_planner.domain.savings.repository.SavingsProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class FinancialProductService {

    private final FinancialProductRepository financialProductRepository;
    private final SavingsProductRepository savingsProductRepository;
    private final LoanProductRepository loanProductRepository;

    /**
     * 모든 금융상품 조회
     */
    public List<FinancialProductResponseDto> getAllProducts() {
        log.info("모든 금융상품 조회 시작");
        
        List<FinancialProduct> products = financialProductRepository.findAll();
        
        log.info("조회된 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 활성 은행의 금융상품만 조회
     */
    public List<FinancialProductResponseDto> getActiveProducts() {
        log.info("활성 은행의 금융상품 조회 시작");
        
        List<FinancialProduct> products = financialProductRepository.findByActiveBanks();
        
        log.info("조회된 활성 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 금융상품 ID로 상세 조회 (모든 연관 정보 포함)
     */
    public FinancialProductResponseDto getProductById(String productId) {
        log.info("금융상품 상세 조회 시작 - ID: {}", productId);
        
        FinancialProduct product = financialProductRepository.findByIdWithBank(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 금융상품을 찾을 수 없습니다: " + productId));
        
        log.info("금융상품 조회 완료 - 상품명: {}, 은행명: {}, 은행상태: {}", 
                product.getProductName(), product.getBank().getBankName(), product.getBank().getStatus());
        
        return FinancialProductResponseDto.from(product);
    }

    /**
     * 금융상품 ID로 완전 상세 조회 (SV_PROD 또는 LN_PROD 테이블의 모든 정보 포함)
     */
    public FinancialProductDetailResponseDto getProductDetailById(String productId) {
        log.info("금융상품 완전 상세 조회 시작 - ID: {}", productId);
        
        FinancialProduct product = financialProductRepository.findByIdWithBank(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 금융상품을 찾을 수 없습니다: " + productId));
        
        log.info("기본 금융상품 조회 완료 - 상품명: {}, 상품타입: {}", product.getProductName(), product.getProductType());
        
        // 상품 타입에 따라 적금상품 또는 대출상품 상세 정보 조회
        if (product.getProductType() == ProductType.SAVING) {
            Optional<SavingsProduct> savingsProduct = savingsProductRepository.findById(productId);
            if (savingsProduct.isPresent()) {
                log.info("적금상품 상세 정보 조회 완료 - 납입방법: {}, 기본금리: {}", 
                        savingsProduct.get().getPaymentMethod(), savingsProduct.get().getBaseInterestRate());
                return FinancialProductDetailResponseDto.fromSavingsProduct(savingsProduct.get(), product);
            } else {
                log.warn("적금상품 상세 정보를 찾을 수 없습니다 - ID: {}", productId);
                throw new IllegalArgumentException("적금상품 상세 정보를 찾을 수 없습니다: " + productId);
            }
        } else if (product.getProductType() == ProductType.LOAN) {
            Optional<LoanProduct> loanProduct = loanProductRepository.findById(productId);
            if (loanProduct.isPresent()) {
                log.info("대출상품 상세 정보 조회 완료 - 대출유형: {}, 최소금리: {}, 최대금리: {}", 
                        loanProduct.get().getLoanType(), loanProduct.get().getMinInterestRate(), loanProduct.get().getMaxInterestRate());
                return FinancialProductDetailResponseDto.fromLoanProduct(loanProduct.get(), product);
            } else {
                log.warn("대출상품 상세 정보를 찾을 수 없습니다 - ID: {}", productId);
                throw new IllegalArgumentException("대출상품 상세 정보를 찾을 수 없습니다: " + productId);
            }
        } else {
            log.warn("지원하지 않는 상품 타입입니다 - ID: {}, 타입: {}", productId, product.getProductType());
            throw new IllegalArgumentException("지원하지 않는 상품 타입입니다: " + product.getProductType());
        }
    }

    /**
     * 적금상품 전용 상세 조회 (SV_PROD 테이블의 모든 정보 포함)
     */
    public FinancialProductDetailResponseDto getSavingsProductDetailById(String productId) {
        log.info("적금상품 전용 상세 조회 시작 - ID: {}", productId);
        
        FinancialProduct product = financialProductRepository.findByIdWithBank(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 금융상품을 찾을 수 없습니다: " + productId));
        
        log.info("기본 금융상품 조회 완료 - 상품명: {}, 상품타입: {}", product.getProductName(), product.getProductType());
        
        Optional<SavingsProduct> savingsProduct = savingsProductRepository.findById(productId);
        if (savingsProduct.isPresent()) {
            log.info("적금상품 상세 정보 조회 완료 - 납입방법: {}, 기본금리: {}", 
                    savingsProduct.get().getPaymentMethod(), savingsProduct.get().getBaseInterestRate());
            return FinancialProductDetailResponseDto.fromSavingsProduct(savingsProduct.get(), product);
        } else {
            log.warn("적금상품 상세 정보를 찾을 수 없습니다 - ID: {}", productId);
            throw new IllegalArgumentException("적금상품 상세 정보를 찾을 수 없습니다: " + productId);
        }
    }

    /**
     * 대출상품 전용 상세 조회 (LN_PROD 테이블의 모든 정보 포함)
     */
    public FinancialProductDetailResponseDto getLoanProductDetailById(String productId) {
        log.info("대출상품 전용 상세 조회 시작 - ID: {}", productId);
        
        FinancialProduct product = financialProductRepository.findByIdWithBank(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 금융상품을 찾을 수 없습니다: " + productId));
        
        log.info("기본 금융상품 조회 완료 - 상품명: {}, 상품타입: {}", product.getProductName(), product.getProductType());
        
        Optional<LoanProduct> loanProduct = loanProductRepository.findById(productId);
        if (loanProduct.isPresent()) {
            log.info("대출상품 상세 정보 조회 완료 - 대출유형: {}, 최소금리: {}, 최대금리: {}", 
                    loanProduct.get().getLoanType(), loanProduct.get().getMinInterestRate(), loanProduct.get().getMaxInterestRate());
            return FinancialProductDetailResponseDto.fromLoanProduct(loanProduct.get(), product);
        } else {
            log.warn("대출상품 상세 정보를 찾을 수 없습니다 - ID: {}", productId);
            throw new IllegalArgumentException("대출상품 상세 정보를 찾을 수 없습니다: " + productId);
        }
    }

    /**
     * 은행별 금융상품 조회
     */
    public List<FinancialProductResponseDto> getProductsByBank(String bankId) {
        log.info("은행별 금융상품 조회 시작 - 은행ID: {}", bankId);
        
        List<FinancialProduct> products = financialProductRepository.findByBankBankId(bankId);
        
        log.info("조회된 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 상품 유형별 조회
     */
    public List<FinancialProductResponseDto> getProductsByType(ProductType productType) {
        log.info("상품 유형별 조회 시작 - 유형: {}", productType);
        
        List<FinancialProduct> products = financialProductRepository.findByProductType(productType);
        
        log.info("조회된 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 은행별 + 상품 유형별 조회
     */
    public List<FinancialProductResponseDto> getProductsByBankAndType(String bankId, ProductType productType) {
        log.info("은행별 + 상품 유형별 조회 시작 - 은행ID: {}, 유형: {}", bankId, productType);
        
        List<FinancialProduct> products = financialProductRepository.findByBankBankIdAndProductType(bankId, productType);
        
        log.info("조회된 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 상품명으로 검색
     */
    public List<FinancialProductResponseDto> searchProductsByName(String productName) {
        log.info("상품명 검색 시작 - 검색어: {}", productName);
        
        List<FinancialProduct> products = financialProductRepository.findByProductNameContaining(productName);
        
        log.info("검색된 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 은행명으로 금융상품 검색
     */
    public List<FinancialProductResponseDto> searchProductsByBankName(String bankName) {
        log.info("은행명으로 금융상품 검색 시작 - 검색어: {}", bankName);
        
        List<FinancialProduct> products = financialProductRepository.findByBankNameContaining(bankName);
        
        log.info("검색된 금융상품 수: {}개", products.size());
        
        return products.stream()
                .map(FinancialProductResponseDto::from)
                .collect(Collectors.toList());
    }
}
