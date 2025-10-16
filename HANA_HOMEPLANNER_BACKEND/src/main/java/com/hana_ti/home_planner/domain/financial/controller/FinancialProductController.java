package com.hana_ti.home_planner.domain.financial.controller;

import com.hana_ti.home_planner.domain.financial.dto.*;
import com.hana_ti.home_planner.domain.financial.entity.ProductType;
import com.hana_ti.home_planner.domain.financial.service.FinancialProductService;
import com.hana_ti.home_planner.domain.financial.service.LoanRecommendationService;
import com.hana_ti.home_planner.domain.financial.service.SavingsRecommendationService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/financial-products")
@RequiredArgsConstructor
@Slf4j
public class FinancialProductController {

    private final FinancialProductService financialProductService;
    private final LoanRecommendationService loanRecommendationService;
    private final SavingsRecommendationService savingsRecommendationService;

    /**
     * 모든 금융상품 조회
     * GET /api/financial-products
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> getAllProducts() {
        log.info("모든 금융상품 조회 API 호출");
        
        List<FinancialProductResponseDto> products = financialProductService.getAllProducts();
        
        log.info("모든 금융상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("금융상품 목록 조회 완료", products));
    }

    /**
     * 활성 은행의 금융상품만 조회
     * GET /api/financial-products/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> getActiveProducts() {
        log.info("활성 금융상품 조회 API 호출");
        
        List<FinancialProductResponseDto> products = financialProductService.getActiveProducts();
        
        log.info("활성 금융상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("활성 금융상품 목록 조회 완료", products));
    }

    /**
     * 금융상품 상세 조회 (모든 연관 정보 포함)
     * GET /api/financial-products/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<FinancialProductResponseDto>> getProductById(@PathVariable String productId) {
        log.info("금융상품 상세 조회 API 호출 - ID: {}", productId);
        
        try {
            FinancialProductResponseDto product = financialProductService.getProductById(productId);
            
            log.info("금융상품 상세 조회 완료 - 상품명: {}, 은행명: {}, 상품유형: {}", 
                    product.getProductName(), product.getBank().getBankName(), product.getProductTypeDescription());
            
            return ResponseEntity.ok(ApiResponse.success("금융상품 상세 정보 조회 완료", product));
        } catch (IllegalArgumentException e) {
            log.warn("금융상품 상세 조회 실패 - ID: {}, 오류: {}", productId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("해당 금융상품을 찾을 수 없습니다: " + productId));
        } catch (Exception e) {
            log.error("금융상품 상세 조회 중 오류 발생 - ID: {}", productId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("금융상품 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 금융상품 완전 상세 조회 (SV_PROD 또는 LN_PROD 테이블의 모든 정보 포함)
     * GET /api/financial-products/{productId}/detail
     */
    @GetMapping("/{productId}/detail")
    public ResponseEntity<ApiResponse<FinancialProductDetailResponseDto>> getProductDetailById(@PathVariable String productId) {
        log.info("금융상품 완전 상세 조회 API 호출 - ID: {}", productId);
        
        try {
            FinancialProductDetailResponseDto productDetail = financialProductService.getProductDetailById(productId);
            
            log.info("금융상품 완전 상세 조회 완료 - 상품명: {}, 상품타입: {}, 은행명: {}", 
                    productDetail.getProductName(), productDetail.getProductTypeDescription(), productDetail.getBank().getBankName());
            
            return ResponseEntity.ok(ApiResponse.success("금융상품 완전 상세 정보 조회 완료", productDetail));
        } catch (IllegalArgumentException e) {
            log.warn("금융상품 완전 상세 조회 실패 - ID: {}, 오류: {}", productId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("금융상품 완전 상세 조회 중 오류 발생 - ID: {}", productId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("금융상품 완전 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 적금상품 전용 상세 조회 (SV_PROD 테이블의 모든 정보 포함)
     * GET /api/financial-products/savings/{productId}/detail
     */
    @GetMapping("/savings/{productId}/detail")
    public ResponseEntity<ApiResponse<FinancialProductDetailResponseDto>> getSavingsProductDetailById(@PathVariable String productId) {
        log.info("적금상품 전용 상세 조회 API 호출 - ID: {}", productId);
        
        try {
            FinancialProductDetailResponseDto productDetail = financialProductService.getSavingsProductDetailById(productId);
            
            log.info("적금상품 전용 상세 조회 완료 - 상품명: {}, 은행명: {}", 
                    productDetail.getProductName(), productDetail.getBank().getBankName());
            
            return ResponseEntity.ok(ApiResponse.success("적금상품 상세 정보 조회 완료", productDetail));
        } catch (IllegalArgumentException e) {
            log.warn("적금상품 전용 상세 조회 실패 - ID: {}, 오류: {}", productId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("적금상품 전용 상세 조회 중 오류 발생 - ID: {}", productId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("적금상품 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 대출상품 전용 상세 조회 (LN_PROD 테이블의 모든 정보 포함)
     * GET /api/financial-products/loans/{productId}/detail
     */
    @GetMapping("/loans/{productId}/detail")
    public ResponseEntity<ApiResponse<FinancialProductDetailResponseDto>> getLoanProductDetailById(@PathVariable String productId) {
        log.info("대출상품 전용 상세 조회 API 호출 - ID: {}", productId);
        
        try {
            FinancialProductDetailResponseDto productDetail = financialProductService.getLoanProductDetailById(productId);
            
            log.info("대출상품 전용 상세 조회 완료 - 상품명: {}, 은행명: {}", 
                    productDetail.getProductName(), productDetail.getBank().getBankName());
            
            return ResponseEntity.ok(ApiResponse.success("대출상품 상세 정보 조회 완료", productDetail));
        } catch (IllegalArgumentException e) {
            log.warn("대출상품 전용 상세 조회 실패 - ID: {}, 오류: {}", productId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("대출상품 전용 상세 조회 중 오류 발생 - ID: {}", productId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대출상품 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 은행별 금융상품 조회
     * GET /api/financial-products/bank/{bankId}
     */
    @GetMapping("/bank/{bankId}")
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> getProductsByBank(@PathVariable String bankId) {
        log.info("은행별 금융상품 조회 API 호출 - 은행ID: {}", bankId);
        
        List<FinancialProductResponseDto> products = financialProductService.getProductsByBank(bankId);
        
        log.info("은행별 금융상품 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("은행별 금융상품 조회 완료", products));
    }

    /**
     * 상품 유형별 조회
     * GET /api/financial-products/type/{productType}
     */
    @GetMapping("/type/{productType}")
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> getProductsByType(@PathVariable ProductType productType) {
        log.info("상품 유형별 조회 API 호출 - 유형: {}", productType);
        
        List<FinancialProductResponseDto> products = financialProductService.getProductsByType(productType);
        
        log.info("상품 유형별 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success(productType.getDescription() + " 상품 조회 완료", products));
    }

    /**
     * 은행별 + 상품 유형별 조회
     * GET /api/financial-products/bank/{bankId}/type/{productType}
     */
    @GetMapping("/bank/{bankId}/type/{productType}")
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> getProductsByBankAndType(
            @PathVariable String bankId, @PathVariable ProductType productType) {
        log.info("은행별 + 상품 유형별 조회 API 호출 - 은행ID: {}, 유형: {}", bankId, productType);
        
        List<FinancialProductResponseDto> products = financialProductService.getProductsByBankAndType(bankId, productType);
        
        log.info("은행별 + 상품 유형별 조회 완료 - 조회된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("특정 은행의 " + productType.getDescription() + " 상품 조회 완료", products));
    }

    /**
     * 상품명으로 검색
     * GET /api/financial-products/search/name?q={productName}
     */
    @GetMapping("/search/name")
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> searchProductsByName(
            @RequestParam(name = "q") String productName) {
        log.info("상품명 검색 API 호출 - 검색어: {}", productName);
        
        List<FinancialProductResponseDto> products = financialProductService.searchProductsByName(productName);
        
        log.info("상품명 검색 완료 - 검색된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("상품명 검색 완료", products));
    }

    /**
     * 은행명으로 금융상품 검색
     * GET /api/financial-products/search/bank?q={bankName}
     */
    @GetMapping("/search/bank")
    public ResponseEntity<ApiResponse<List<FinancialProductResponseDto>>> searchProductsByBankName(
            @RequestParam(name = "q") String bankName) {
        log.info("은행명으로 금융상품 검색 API 호출 - 검색어: {}", bankName);
        
        List<FinancialProductResponseDto> products = financialProductService.searchProductsByBankName(bankName);
        
        log.info("은행명으로 금융상품 검색 완료 - 검색된 상품 수: {}개", products.size());
        
        return ResponseEntity.ok(ApiResponse.success("은행명 기준 금융상품 검색 완료", products));
    }

    /**
     * 대출 상품 추천 API
     * POST /api/financial-products/recommend-loans
     */
    @PostMapping("/recommend-loans")
    public ResponseEntity<ApiResponse<LoanRecommendationResponseDto>> recommendLoans(
            @Valid @RequestBody LoanRecommendationRequestDto request) {
        log.info("대출 상품 추천 API 호출 - 연소득: {}, 주택가격: {}, 생애최초: {}, 신혼부부: {}", 
                request.getAnnualIncome(), request.getHousePrice(), request.isFirstTimeBuyer(), request.isNewlywed());

        try {
            LoanRecommendationResponseDto response = loanRecommendationService.recommend(request);
            log.info("대출 상품 추천 성공 - 총 {}개 상품 추천", response.getTotalRecommendations());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("대출 상품 추천 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대출 상품 추천에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 적금 상품 추천 API
     * POST /api/financial-products/recommend-savings
     */
    @PostMapping("/recommend-savings")
    public ResponseEntity<ApiResponse<SavingsRecommendationResponseDto>> recommendSavings(
            @Valid @RequestBody SavingsRecommendationRequestDto request) {
        log.info("적금 상품 추천 API 호출 - 목표금액: {}, 남은개월: {}, 월저축액: {}", 
                request.getTargetAmount(), request.getRemainingMonths(), 
                request.getMonthlySaving());

        try {
            SavingsRecommendationResponseDto response = savingsRecommendationService.recommendSavings(request);
            log.info("적금 상품 추천 성공 - 추천상품: {}", 
                    response.getRecommendedProduct().getProdName());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("적금 상품 추천 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("적금 상품 추천에 실패했습니다: " + e.getMessage()));
        }
    }
}
