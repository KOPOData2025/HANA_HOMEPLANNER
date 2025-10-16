package com.hana_ti.home_planner.domain.savings.controller;

import com.hana_ti.home_planner.domain.savings.dto.SavingsProductResponseDto;
import com.hana_ti.home_planner.domain.savings.service.SavingsProductService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/savings-products")
@RequiredArgsConstructor
@Slf4j
public class SavingsProductController {

    private final SavingsProductService savingsProductService;

    /**
     * 모든 예금/적금상품 조회
     * GET /api/savings-products
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getAllSavingsProducts() {
        log.info("모든 예금/적금상품 조회 API 호출");
        
        List<SavingsProductResponseDto> products = savingsProductService.getAllSavingsProducts();
        
        log.info("모든 예금/적금상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("예금/적금상품 목록 조회 완료", products));
    }

    /**
     * 예금/적금상품 상세 조회 (상품 ID 필요)
     * GET /api/savings-products/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<SavingsProductResponseDto>> getSavingsProductById(@PathVariable String productId) {
        log.info("예금/적금상품 상세 조회 API 호출 - ID: {}", productId);
        
        SavingsProductResponseDto product = savingsProductService.getSavingsProductById(productId);
        
        log.info("예금/적금상품 상세 조회 완료 - 상품명: {}", product.getProductName());
        
        return ResponseEntity.ok(ApiResponse.success("예금/적금상품 상세 정보 조회 완료", product));
    }

    /**
     * 은행별 예금/적금상품 조회
     * GET /api/savings-products/bank/{bankId}
     */
    @GetMapping("/bank/{bankId}")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getSavingsProductsByBank(@PathVariable String bankId) {
        log.info("은행별 예금/적금상품 조회 API 호출 - 은행ID: {}", bankId);
        
        List<SavingsProductResponseDto> products = savingsProductService.getSavingsProductsByBank(bankId);
        
        log.info("은행별 예금/적금상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("은행별 예금/적금상품 조회 완료", products));
    }

    /**
     * 상품명으로 검색
     * GET /api/savings-products/search?q={productName}
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> searchSavingsProductsByName(
            @RequestParam(name = "q") String productName) {
        log.info("상품명 검색 API 호출 - 검색어: {}", productName);
        
        List<SavingsProductResponseDto> products = savingsProductService.searchSavingsProductsByName(productName);
        
        log.info("상품명 검색 완료 - 검색된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("예금/적금상품명 검색 완료", products));
    }

    /**
     * 최소 예치금액으로 필터링
     * GET /api/savings-products/filter/min-deposit?amount={amount}
     */
    @GetMapping("/filter/min-deposit")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getSavingsProductsByMinDepositAmount(
            @RequestParam BigDecimal amount) {
        log.info("최소 예치금액 필터링 API 호출 - 금액: {}", amount);
        
        List<SavingsProductResponseDto> products = savingsProductService.getSavingsProductsByMinDepositAmount(amount);
        
        log.info("최소 예치금액 필터링 완료 - 필터링된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("최소 예치금액 기준 필터링 완료", products));
    }

    /**
     * 최대 예치금액으로 필터링
     * GET /api/savings-products/filter/max-deposit?amount={amount}
     */
    @GetMapping("/filter/max-deposit")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getSavingsProductsByMaxDepositAmount(
            @RequestParam BigDecimal amount) {
        log.info("최대 예치금액 필터링 API 호출 - 금액: {}", amount);
        
        List<SavingsProductResponseDto> products = savingsProductService.getSavingsProductsByMaxDepositAmount(amount);
        
        log.info("최대 예치금액 필터링 완료 - 필터링된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("최대 예치금액 기준 필터링 완료", products));
    }

    /**
     * 기본 금리로 필터링
     * GET /api/savings-products/filter/base-rate?rate={rate}
     */
    @GetMapping("/filter/base-rate")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getSavingsProductsByBaseInterestRate(
            @RequestParam BigDecimal rate) {
        log.info("기본 금리 필터링 API 호출 - 금리: {}%", rate);
        
        List<SavingsProductResponseDto> products = savingsProductService.getSavingsProductsByBaseInterestRate(rate);
        
        log.info("기본 금리 필터링 완료 - 필터링된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("기본 금리 기준 필터링 완료", products));
    }

    /**
     * 우대 금리로 필터링
     * GET /api/savings-products/filter/preferential-rate?rate={rate}
     */
    @GetMapping("/filter/preferential-rate")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getSavingsProductsByPreferentialRate(
            @RequestParam BigDecimal rate) {
        log.info("우대 금리 필터링 API 호출 - 금리: {}%", rate);
        
        List<SavingsProductResponseDto> products = savingsProductService.getSavingsProductsByPreferentialRate(rate);
        
        log.info("우대 금리 필터링 완료 - 필터링된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("우대 금리 기준 필터링 완료", products));
    }

    /**
     * 상환방식별 조회
     * GET /api/savings-products/filter/payment-method?method={method}
     */
    @GetMapping("/filter/payment-method")
    public ResponseEntity<ApiResponse<List<SavingsProductResponseDto>>> getSavingsProductsByPaymentMethod(
            @RequestParam String method) {
        log.info("상환방식별 조회 API 호출 - 상환방식: {}", method);
        
        List<SavingsProductResponseDto> products = savingsProductService.getSavingsProductsByPaymentMethod(method);
        
        log.info("상환방식별 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("상환방식별 조회 완료", products));
    }
}
