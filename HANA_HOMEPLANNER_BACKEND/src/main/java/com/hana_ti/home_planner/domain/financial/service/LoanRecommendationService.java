package com.hana_ti.home_planner.domain.financial.service;

import com.hana_ti.home_planner.domain.financial.dto.*;
import com.hana_ti.home_planner.domain.financial.entity.FinancialProduct;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import com.hana_ti.home_planner.domain.loan.repository.LoanProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanRecommendationService {

    private final LoanProductRepository loanProductRepository;
    private final FinancialProductRepository financialProductRepository;

    /**
     * 대출 상품 추천 메인 로직 (DB 기반)
     */
    public LoanRecommendationResponseDto recommend(LoanRecommendationRequestDto request) {
        log.info("대출 상품 추천 시작 - 연소득: {}, 주택가격: {}, 전용면적: {}, 순자산: {}, 생애최초: {}, 신혼부부: {}, 자녀수: {}, 신생아특례: {}", 
                request.getAnnualIncome(), request.getHousePrice(), request.getExclusiveArea(), 
                request.getNetAssets(), request.isFirstTimeBuyer(), request.isNewlywed(), 
                request.getNumberOfChildren(), request.isHasNewbornInTwoYears());

        List<RecommendedProductDto> recommendations;

        // 1. LN_PROD의 모든 상품을 조회
        List<LoanProduct> allProducts = loanProductRepository.findAll();
        log.info("전체 대출 상품 조회 완료 - 총 {}개 상품", allProducts.size());

        // 2. 수입, 주택가격, 자산 데이터를 활용해서 1차 필터링
        List<LoanProduct> filteredProducts = filterProductsByBasicCriteria(allProducts, request);
        log.info("기본 조건 필터링 완료 - {}개 상품 남음", filteredProducts.size());

        // 3. 사용자가 입력한 신청조건에 따라 TARGET_TYPE에서 조회
        String targetType = determineTargetType(request);
        log.info("대상 타입 결정: {}", targetType);

        List<LoanProduct> targetSpecificProducts = filterProductsByTargetType(filteredProducts, targetType);
        
        if (!targetSpecificProducts.isEmpty()) {
            log.info("대상 타입별 상품 {}개 발견", targetSpecificProducts.size());
            recommendations = convertToRecommendedProducts(targetSpecificProducts, targetType);
        } else {
            // 4. 없으면 그냥 일반 타입의 상품 결과로 필터링 해서 반환
            log.info("대상 타입별 상품 없음 - 일반 상품으로 대체");
            List<LoanProduct> generalProducts = filterProductsByTargetType(filteredProducts, "일반");
            recommendations = convertToRecommendedProducts(generalProducts, "일반");
        }

        // 추천 요약 생성
        String summary = generateRecommendationSummary(recommendations, request, targetType);

        log.info("대출 상품 추천 완료 - 총 {}개 상품 추천", recommendations.size());

        return LoanRecommendationResponseDto.builder()
                .recommendations(recommendations)
                .totalRecommendations(recommendations.size())
                .recommendationSummary(summary)
                .recommendationDate(LocalDateTime.now())
                .message("대출 상품 추천이 완료되었습니다.")
                .build();
    }

    /**
     * 기본 조건으로 상품 필터링 (소득, 주택가격, 순자산, 전용면적)
     */
    private List<LoanProduct> filterProductsByBasicCriteria(List<LoanProduct> products, LoanRecommendationRequestDto request) {
        return products.stream()
                .filter(product -> {
                    // 소득 기준 체크
                    if (product.getMaxIncome() != null && 
                        request.getAnnualIncome().compareTo(product.getMaxIncome()) > 0) {
                        return false;
                    }
                    
                    // 주택가격 기준 체크
                    if (product.getMaxHousePrice() != null && 
                        request.getHousePrice().compareTo(product.getMaxHousePrice()) > 0) {
                        return false;
                    }
                    
                    // 순자산 기준 체크
                    if (product.getMaxAssets() != null && 
                        request.getNetAssets().compareTo(product.getMaxAssets()) > 0) {
                        return false;
                    }
                    
                    // 전용면적 기준 체크
                    if (product.getMaxArea() != null && 
                        request.getExclusiveArea().compareTo(product.getMaxArea()) > 0) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    /**
     * 사용자 조건에 따른 대상 타입 결정
     */
    private String determineTargetType(LoanRecommendationRequestDto request) {
        // 우선순위: 신생아 > 신혼부부 > 다자녀 > 생애최초 > 일반
        // 데이터베이스의 실제 TARGET_TYPE 값과 매칭
        
        if (request.isHasNewbornInTwoYears()) {
            return "신생아";
        }
        
        if (request.isNewlywed()) {
            return "신혼부부";
        }
        
        if (request.getNumberOfChildren() != null && request.getNumberOfChildren() >= 2) {
            return "다자녀";
        }
        
        if (request.isFirstTimeBuyer()) {
            return "생애최초";
        }
        
        return "일반";
    }

    /**
     * 대상 타입별 상품 필터링
     */
    private List<LoanProduct> filterProductsByTargetType(List<LoanProduct> products, String targetType) {
        return products.stream()
                .filter(product -> {
                    if (product.getTargetType() == null) {
                        return "일반".equals(targetType);
                    }
                    return product.getTargetType().equals(targetType);
                })
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    /**
     * LoanProduct를 RecommendedProductDto로 변환
     */
    @Transactional(readOnly = true)
    private List<RecommendedProductDto> convertToRecommendedProducts(List<LoanProduct> products, String targetType) {
        return products.stream()
                .map(product -> {
                    // FinancialProduct 정보를 은행 정보와 함께 조회 (지연 로딩 문제 해결)
                    FinancialProduct financialProduct = financialProductRepository.findByIdWithBank(product.getProductId()).orElse(null);
                    
                    String bankName = "은행명 없음";
                    if (financialProduct != null && financialProduct.getBank() != null) {
                        bankName = financialProduct.getBank().getBankName();
                    }
                    
                    return RecommendedProductDto.builder()
                            .productId(product.getProductId())
                            .productName(financialProduct != null ? financialProduct.getProductName() : "상품명 없음")
                            .productType(getProductTypeDescription(product.getLoanType()))
                            .description(generateProductDescription(product, targetType))
                            .estimatedInterestRate(String.format("연 %.2f%% ~ %.2f%%", 
                                    product.getMinInterestRate(), product.getMaxInterestRate()))
                            .maxLoanAmount(product.getMaxLoanAmount())
                            .keyFeatures(generateKeyFeatures(product, targetType))
                            .bankName(bankName)
                            .minInterestRate(product.getMinInterestRate())
                            .maxInterestRate(product.getMaxInterestRate())
                            .maxLoanPeriodMonths(product.getMaxLoanPeriodMonths())
                            .repayMethod(product.getRepaymentMethod())
                            .baseInterestRate(product.getBaseInterestRate())
                            .preferentialInterestRate(product.getPreferentialInterestRate())
                            .gracePeriodMonths(product.getGracePeriodMonths())
                            .earlyRepayPenaltyRate(product.getEarlyRepayPenaltyRate())
                            .repaymentFrequency(product.getRepaymentFrequency())
                            .minCreditScore(product.getMinCreditScore())
                            .targetDescription(product.getTargetDescription())
                            .securityType(product.getSecurityType())
                            .guaranteeRequirement(product.getGuaranteeRequirement())
                            .documentUrl(product.getDocumentUrl())
                            .build();
                })
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    /**
     * 대출 유형에 따른 상품 분류 설명 생성
     */
    private String getProductTypeDescription(String loanType) {
        if (loanType == null) return "일반 대출";
        
        switch (loanType) {
            case "주택담보대출":
                return "주택담보대출";
            case "전세대출":
                return "전세대출";
            case "신용대출":
                return "신용대출";
            default:
                return loanType;
        }
    }

    /**
     * 상품 설명 생성
     */
    private String generateProductDescription(LoanProduct product, String targetType) {
        StringBuilder description = new StringBuilder();
        
        if ("신생아특례".equals(targetType)) {
            description.append("2년 내 출산 가구를 위한 최저금리 상품입니다. ");
        } else if ("신혼부부".equals(targetType)) {
            description.append("신혼부부를 위한 특별 혜택 상품입니다. ");
        } else if ("다자녀가구".equals(targetType)) {
            description.append("다자녀가구를 위한 특별 혜택 상품입니다. ");
        } else if ("생애최초".equals(targetType)) {
            description.append("생애최초 주택구입자를 위한 특별 상품입니다. ");
        } else if ("저소득층".equals(targetType)) {
            description.append("저소득층을 위한 특별 상품입니다. ");
        } else {
            description.append("고객님의 조건에 맞는 대출 상품입니다. ");
        }
        
        if (product.getLoanProductDescription() != null) {
            description.append(product.getLoanProductDescription());
        }
        
        return description.toString();
    }

    /**
     * 주요 특징 생성
     */
    private List<String> generateKeyFeatures(LoanProduct product, String targetType) {
        List<String> features = new ArrayList<>();
        
        // 금리 특징
        if (product.getMinInterestRate() != null && product.getMaxInterestRate() != null) {
            if (product.getMinInterestRate().compareTo(new BigDecimal("3.0")) < 0) {
                features.add("업계 최저 수준 금리");
            } else {
                features.add("경쟁력 있는 금리");
            }
        }
        
        // 대상별 특징
        switch (targetType) {
            case "신생아특례":
                features.add("높은 소득 및 주택가격 기준");
                features.add("LTV 최대 80%");
                break;
            case "신혼부부":
            case "다자녀가구":
            case "생애최초":
                features.add("정부지원 최저 수준 금리");
                features.add("생애최초/신혼부부 등 우대");
                features.add("LTV 최대 80%(생애최초)");
                break;
            case "저소득층":
                features.add("저소득층 특별 혜택");
                features.add("완화된 신용 기준");
                break;
            default:
                features.add("다양한 금리 옵션");
                features.add("유연한 상환 조건");
                break;
        }
        
        // 상환 방법 특징
        if ("고정금리".equals(product.getInterestRateType())) {
            features.add("장기 고정금리");
        } else {
            features.add("변동금리 옵션");
        }
        
        return features;
    }

    /**
     * 추천 요약 생성 (DB 기반)
     */
    private String generateRecommendationSummary(List<RecommendedProductDto> recommendations, LoanRecommendationRequestDto request, String targetType) {
        if (recommendations.isEmpty()) {
            return "고객님의 조건에 맞는 대출 상품이 없습니다. 조건을 조정하여 다시 검토해보세요.";
        }

        StringBuilder summary = new StringBuilder();
        summary.append("고객님의 조건에 맞는 ").append(recommendations.size()).append("개의 대출 상품을 추천드립니다. ");
        
        // 대상 타입별 추천 요약
        switch (targetType) {
            case "신생아특례":
                summary.append("신생아 특례 상품으로 최저금리 혜택을 받으실 수 있습니다. ");
                break;
            case "신혼부부":
                summary.append("신혼부부 전용 상품으로 특별 혜택을 받으실 수 있습니다. ");
                break;
            case "다자녀가구":
                summary.append("다자녀가구 전용 상품으로 특별 혜택을 받으실 수 있습니다. ");
                break;
            case "생애최초":
                summary.append("생애최초 주택구입자 상품으로 특별 혜택을 받으실 수 있습니다. ");
                break;
            case "저소득층":
                summary.append("저소득층 전용 상품으로 특별 혜택을 받으실 수 있습니다. ");
                break;
            default:
                summary.append("다양한 일반 대출 상품 중에서 선택하실 수 있습니다. ");
                break;
        }
        
        // 금리 정보 추가
        if (!recommendations.isEmpty()) {
            BigDecimal minRate = recommendations.stream()
                    .map(RecommendedProductDto::getMinInterestRate)
                    .min(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO);
            summary.append("최저 금리는 ").append(minRate).append("%부터 시작됩니다.");
        }

        return summary.toString();
    }
}
