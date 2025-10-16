package com.hana_ti.my_data.domain.my_data.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotalAssetResponseDto {

    private Long userId;
    private Summary summary; // 요약 정보
    private Assets assets; // 자산 상세 정보
    private Liabilities liabilities; // 부채 상세 정보
    private Analysis analysis; // 자산 분석 및 제언

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private BigDecimal netWorth; // 순자산 (총자산 - 총부채)
        private BigDecimal totalAssets; // 실제 총자산 (대출 제외)
        private BigDecimal totalLiabilities; // 총부채
        private LocalDateTime lastUpdated; // 마지막 업데이트 시간
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Assets {
        private BigDecimal total; // 총 자산
        private AssetBreakdown breakdown; // 자산 종류별 요약
        private List<AssetDetail> details; // 자산 상세 리스트
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssetBreakdown {
        private BigDecimal bankAccounts; // 은행 계좌
        private BigDecimal investments; // 투자 (주식, 펀드 등)
        private BigDecimal realEstate; // 부동산 자산
        private BigDecimal otherAssets; // 기타 자산
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssetDetail {
        private String type; // 계좌 유형 (입출금, 예/적금 등)
        private String name; // 계좌명
        private BigDecimal balance; // 잔액
        private String bankName; // 은행명
        private String status; // 상태
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Liabilities {
        private BigDecimal total; // 총 부채
        private LiabilityBreakdown breakdown; // 부채 종류별 요약
        private List<LiabilityDetail> details; // 부채 상세 리스트
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LiabilityBreakdown {
        private BigDecimal bankLoans; // 은행 대출
        private BigDecimal cardLoans; // 카드 대출
        private BigDecimal installmentLoans; // 할부 대출
        private BigDecimal insuranceLoans; // 보험 대출
        private BigDecimal otherLiabilities; // 기타 부채
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LiabilityDetail {
        private String type; // 대출 유형 (은행대출, 카드대출 등)
        private String name; // 대출명
        private BigDecimal balance; // 잔액
        private BigDecimal interestRate; // 금리
        private String bankName; // 은행명
        private String status; // 상태
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Analysis {
        private BigDecimal debtToAssetRatio; // 부채비율 (부채/자산)
        private String riskLevel; // 위험도
        private String recommendation; // 권장사항
        private BigDecimal monthlyCashFlow; // 월간 현금흐름
        private BigDecimal emergencyFund; // 비상금
        private BigDecimal emergencyFundRatio; // 비상금 비율
    }
}
