package com.hana_ti.home_planner.domain.loan.controller;

import com.hana_ti.home_planner.domain.loan.dto.LoanProductResponseDto;
import com.hana_ti.home_planner.domain.loan.service.LoanProductService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/loan-products")
@RequiredArgsConstructor
@Slf4j
public class LoanProductController {

    private final LoanProductService loanProductService;

    /**
     * 모든 대출상품 조회
     * GET /api/loan-products
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LoanProductResponseDto>>> getAllLoanProducts() {
        log.info("모든 대출상품 조회 API 호출");
        
        List<LoanProductResponseDto> products = loanProductService.getAllLoanProducts();
        
        log.info("모든 대출상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("대출상품 목록 조회 완료", products));
    }

    /**
     * 대출상품 상세 조회
     * GET /api/loan-products/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<LoanProductResponseDto>> getLoanProductById(@PathVariable String productId) {
        log.info("대출상품 상세 조회 API 호출 - ID: {}", productId);
        
        LoanProductResponseDto product = loanProductService.getLoanProductById(productId);
        
        log.info("대출상품 상세 조회 완료 - 상품명: {}", product.getProductName());
        
        return ResponseEntity.ok(ApiResponse.success("대출상품 상세 정보 조회 완료", product));
    }

    /**
     * 은행별 대출상품 조회
     * GET /api/loan-products/bank/{bankId}
     */
    @GetMapping("/bank/{bankId}")
    public ResponseEntity<ApiResponse<List<LoanProductResponseDto>>> getLoanProductsByBank(@PathVariable String bankId) {
        log.info("은행별 대출상품 조회 API 호출 - 은행ID: {}", bankId);
        
        List<LoanProductResponseDto> products = loanProductService.getLoanProductsByBank(bankId);
        
        log.info("은행별 대출상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("은행별 대출상품 조회 완료", products));
    }

    /**
     * 최대 대출 금액 기준 조회
     * GET /api/loan-products/amount?min={minAmount}
     */
    @GetMapping("/amount")
    public ResponseEntity<ApiResponse<List<LoanProductResponseDto>>> getLoanProductsByMinAmount(
            @RequestParam(name = "min") BigDecimal minAmount) {
        log.info("최대 대출 금액 기준 조회 API 호출 - 최소 금액: {}", minAmount);
        
        List<LoanProductResponseDto> products = loanProductService.getLoanProductsByMinAmount(minAmount);
        
        log.info("최대 대출 금액 기준 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("대출 금액 기준 상품 조회 완료", products));
    }

    /**
     * 상품명으로 검색
     * GET /api/loan-products/search?q={productName}
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<LoanProductResponseDto>>> searchLoanProductsByName(
            @RequestParam(name = "q") String productName) {
        log.info("상품명 검색 API 호출 - 검색어: {}", productName);
        
        List<LoanProductResponseDto> products = loanProductService.searchLoanProductsByName(productName);
        
        log.info("상품명 검색 완료 - 검색된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("대출상품명 검색 완료", products));
    }
}
