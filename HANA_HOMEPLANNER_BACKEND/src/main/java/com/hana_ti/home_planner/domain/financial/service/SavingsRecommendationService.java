package com.hana_ti.home_planner.domain.financial.service;

import com.hana_ti.home_planner.domain.financial.dto.SavingsRecommendationRequestDto;
import com.hana_ti.home_planner.domain.financial.dto.SavingsRecommendationResponseDto;
import com.hana_ti.home_planner.domain.financial.repository.FinancialProductRepository;
import com.hana_ti.home_planner.domain.savings.entity.SavingsProduct;
import com.hana_ti.home_planner.domain.savings.repository.SavingsProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SavingsRecommendationService {

    private final SavingsProductRepository savingsProductRepository;
    private final FinancialProductRepository financialProductRepository;

    /**
     * 적금 상품 추천 메인 로직
     */
    public SavingsRecommendationResponseDto recommendSavings(SavingsRecommendationRequestDto request) {
        log.info("적금 상품 추천 시작 - 목표금액: {}, 남은개월: {}, 월저축액: {}", 
                request.getTargetAmount(), request.getRemainingMonths(), 
                request.getMonthlySaving());

        // 1. 모든 적금 상품 조회
        List<SavingsProduct> allProducts = savingsProductRepository.findAll();
        log.info("전체 적금 상품 조회 완료 - 총 {}개 상품", allProducts.size());

        // 2. 조건 필터링
        List<SavingsProduct> filteredProducts = filterProductsByCriteria(allProducts, request);
        log.info("조건 필터링 완료 - {}개 상품 남음", filteredProducts.size());

        if (filteredProducts.isEmpty()) {
            log.warn("조건에 맞는 적금 상품이 없습니다");
            return createEmptyResponse();
        }

        // 3. 우선순위 스코어링 및 최적 상품 선택
        SavingsProduct bestProduct = selectBestProduct(filteredProducts, request);
        log.info("최적 상품 선택 완료 - 상품ID: {}", bestProduct.getProductId());

        // 4. 응답 생성
        return createRecommendationResponse(bestProduct, request);
    }

    /**
     * 조건 필터링
     */
    private List<SavingsProduct> filterProductsByCriteria(List<SavingsProduct> products, 
                                                         SavingsRecommendationRequestDto request) {
        return products.stream()
                .filter(product -> {
                    // 월 저축액 범위 체크
                    return isAmountInRange(product, request.getMonthlySaving());
                })
                .toList();
    }

    /**
     * 월 저축액이 상품 범위에 맞는지 체크
     */
    private boolean isAmountInRange(SavingsProduct product, BigDecimal monthlySaving) {
        BigDecimal minAmount = product.getMinDepositAmount();
        BigDecimal maxAmount = product.getMaxDepositAmount();
        
        // 최소금액이 null이면 제한 없음
        if (minAmount == null && maxAmount == null) {
            return true;
        }
        
        // 최소금액만 있는 경우
        if (minAmount != null && maxAmount == null) {
            return monthlySaving.compareTo(minAmount) >= 0;
        }
        
        // 최대금액만 있는 경우
        if (minAmount == null && maxAmount != null) {
            return monthlySaving.compareTo(maxAmount) <= 0;
        }
        
        // 둘 다 있는 경우
        return monthlySaving.compareTo(minAmount) >= 0 && 
               monthlySaving.compareTo(maxAmount) <= 0;
    }

    /**
     * 우선순위 스코어링으로 최적 상품 선택
     */
    private SavingsProduct selectBestProduct(List<SavingsProduct> products, 
                                           SavingsRecommendationRequestDto request) {
        return products.stream()
                .max(Comparator.comparingDouble(product -> calculateScore(product, request)))
                .orElse(products.get(0));
    }

    /**
     * 상품 스코어 계산
     */
    private double calculateScore(SavingsProduct product, SavingsRecommendationRequestDto request) {
        double score = 0.0;
        
        // 1. 기간 적합도 (기간 차이 적을수록 가산점)
        double termScore = calculateTermScore(product, request.getRemainingMonths());
        score += termScore * 0.5; // 50% 가중치
        
        // 2. 금리 점수 (기본+우대 금리 합산 기준)
        double interestScore = calculateInterestScore(product);
        score += interestScore * 0.5; // 50% 가중치
        
        log.debug("상품 스코어 계산 - 상품ID: {}, 기간점수: {}, 금리점수: {}, 총점: {}", 
                product.getProductId(), termScore, interestScore, score);
        
        return score;
    }

    /**
     * 기간 적합도 점수 계산
     */
    private double calculateTermScore(SavingsProduct product, Integer remainingMonths) {
        Integer productTerm = product.getTermMonths();
        if (productTerm == null) {
            return 0.0;
        }
        
        // 기간 차이의 절댓값이 작을수록 높은 점수
        int diff = Math.abs(productTerm - remainingMonths);
        return Math.max(0, 100 - diff * 2); // 차이 1개월당 2점 감점
    }

    /**
     * 금리 점수 계산
     */
    private double calculateInterestScore(SavingsProduct product) {
        BigDecimal baseRate = product.getBaseInterestRate();
        BigDecimal prefRate = product.getPreferentialInterestRate();
        
        BigDecimal totalRate = BigDecimal.ZERO;
        if (baseRate != null) {
            totalRate = totalRate.add(baseRate);
        }
        if (prefRate != null) {
            totalRate = totalRate.add(prefRate);
        }
        
        return totalRate.doubleValue() * 10; // 금리 1%당 10점
    }


    /**
     * 추천 응답 생성
     */
    private SavingsRecommendationResponseDto createRecommendationResponse(SavingsProduct product, 
                                                                        SavingsRecommendationRequestDto request) {
        // FinancialProduct 정보 조회
        var financialProduct = financialProductRepository.findByIdWithBank(product.getProductId()).orElse(null);
        
        // 예상 만기 수령액 계산
        BigDecimal expectedAmount = calculateExpectedMaturityAmount(
                request.getMonthlySaving(), 
                product.getTermMonths() != null ? product.getTermMonths() : request.getRemainingMonths(),
                product.getBaseInterestRate(),
                product.getPreferentialInterestRate()
        );
        
        // 목표금액 대비 달성률 계산
        double achievementRate = expectedAmount.divide(request.getTargetAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        
        // 코멘트 생성
        String comment = generateComment(achievementRate, request.getTargetAmount(), expectedAmount);
        
        // 총 금리 계산
        BigDecimal totalInterestRate = BigDecimal.ZERO;
        if (product.getBaseInterestRate() != null) {
            totalInterestRate = totalInterestRate.add(product.getBaseInterestRate());
        }
        if (product.getPreferentialInterestRate() != null) {
            totalInterestRate = totalInterestRate.add(product.getPreferentialInterestRate());
        }
        
        var recommendedProduct = SavingsRecommendationResponseDto.RecommendedSavingsProductDto.builder()
                .prodId(product.getProductId())
                .prodName(financialProduct != null ? financialProduct.getProductName() : "상품명 없음")
                .bankName(financialProduct != null && financialProduct.getBank() != null ? 
                         financialProduct.getBank().getBankName() : "은행명 없음")
                .termMonths(product.getTermMonths())
                .monthlyDeposit(request.getMonthlySaving())
                .expectedMaturityAmount(expectedAmount)
                .interestRate(totalInterestRate)
                .isTaxPrefer("Y".equals(product.getIsTaxPreferenceApplied()))
                .docUrl(product.getDocumentUrl())
                .targetDescription(product.getTargetDescription())
                .interestPaymentMethod(product.getInterestPaymentMethod())
                .status(product.getStatus())
                .comment(comment)
                .build();
        
        log.info("적금 추천 완료 - 상품명: {}, 예상만기금액: {}, 달성률: {}%", 
                recommendedProduct.getProdName(), expectedAmount, achievementRate);
        
        return SavingsRecommendationResponseDto.builder()
                .recommendedProduct(recommendedProduct)
                .build();
    }

    /**
     * 예상 만기 수령액 계산
     * 공식: (월납입액 × 개월수) × (1 + 금리/12 × 개월수)
     */
    private BigDecimal calculateExpectedMaturityAmount(BigDecimal monthlyDeposit, Integer months, 
                                                     BigDecimal baseRate, BigDecimal prefRate) {
        if (months == null || monthlyDeposit == null) {
            return BigDecimal.ZERO;
        }
        
        // 총 금리 계산
        BigDecimal totalRate = BigDecimal.ZERO;
        if (baseRate != null) {
            totalRate = totalRate.add(baseRate);
        }
        if (prefRate != null) {
            totalRate = totalRate.add(prefRate);
        }
        
        // 월 이자율
        BigDecimal monthlyRate = totalRate.divide(BigDecimal.valueOf(1200), 6, RoundingMode.HALF_UP);
        
        // 기본 원금
        BigDecimal principal = monthlyDeposit.multiply(BigDecimal.valueOf(months));
        
        // 이자 계산 (단리)
        BigDecimal interest = principal.multiply(monthlyRate).multiply(BigDecimal.valueOf(months));
        
        return principal.add(interest);
    }

    /**
     * 코멘트 생성
     */
    private String generateComment(double achievementRate, BigDecimal targetAmount, BigDecimal expectedAmount) {
        if (achievementRate >= 100) {
            return String.format("목표금액 %,.0f원을 달성했습니다! 예상 수령액은 %,.0f원입니다.", 
                    targetAmount, expectedAmount);
        } else if (achievementRate >= 95) {
            BigDecimal shortage = targetAmount.subtract(expectedAmount);
            return String.format("목표금액 %,.0f원 대비 %.1f%% 달성. 약 %,.0f원의 추가 저축이 필요합니다.", 
                    targetAmount, achievementRate, shortage);
        } else if (achievementRate >= 80) {
            BigDecimal shortage = targetAmount.subtract(expectedAmount);
            return String.format("목표금액 %,.0f원 대비 %.1f%% 달성. %,.0f원의 추가 저축이 필요합니다.", 
                    targetAmount, achievementRate, shortage);
        } else {
            BigDecimal shortage = targetAmount.subtract(expectedAmount);
            return String.format("목표금액 %,.0f원 대비 %.1f%% 달성. 상당한 추가 저축(%,.0f원)이 필요합니다.", 
                    targetAmount, achievementRate, shortage);
        }
    }

    /**
     * 빈 응답 생성 (조건에 맞는 상품이 없을 때)
     */
    private SavingsRecommendationResponseDto createEmptyResponse() {
        var emptyProduct = SavingsRecommendationResponseDto.RecommendedSavingsProductDto.builder()
                .prodId("NONE")
                .prodName("추천 상품 없음")
                .bankName("")
                .termMonths(0)
                .monthlyDeposit(BigDecimal.ZERO)
                .expectedMaturityAmount(BigDecimal.ZERO)
                .interestRate(BigDecimal.ZERO)
                .isTaxPrefer(false)
                .docUrl("")
                .targetDescription("")
                .interestPaymentMethod("")
                .status("INACTIVE")
                .comment("조건에 맞는 적금 상품을 찾을 수 없습니다. 조건을 조정해보세요.")
                .build();
        
        return SavingsRecommendationResponseDto.builder()
                .recommendedProduct(emptyProduct)
                .build();
    }
}
