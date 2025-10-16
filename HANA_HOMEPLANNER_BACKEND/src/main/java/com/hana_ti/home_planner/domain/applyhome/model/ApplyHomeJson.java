package com.hana_ti.home_planner.domain.applyhome.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applyhome_json")
public class ApplyHomeJson {

    @Id
    private String id;

    @Field("주택유형")
    private String houseType;

    @Field("해당지역")
    private String region;

    @Field("기타지역")
    private String otherRegion;

    @Field("규제지역여부")
    private String regulation;

    @Field("재당첨제한")
    private String reWinningLimit;

    @Field("전매제한")
    private String resaleLimit;

    @Field("거주의무기간")
    private String residencePeriod;

    @Field("분양가상한제")
    private String priceCap;

    @Field("택지유형")
    private String landType;

    @Field("계약금상납일")
    private String contractDate;

    @Field("잔금처리일")
    private String balanceDate;

    @Field("공급 금액 및 납부일")
    private SupplyPriceInfo supplyPriceInfo;

    @Field("신청 기준")
    private ApplyCondition applyCondition;

    @Field("신청자격")
    private ApplyQualification applyQualification;

    @Field("특별공급 세대수")
    private Map<String, Map<String, Integer>> specialSupplyCount;

    @Field("일반공급 세대수")
    private Map<String, Map<String, Integer>> generalSupplyCount;

    /**
     * 공급 금액 및 납부일 정보 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplyPriceInfo {
        @Field("납부일")
        private List<PaymentDate> paymentDates;

        @Field("주택형")
        private List<HouseType> houseTypes;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class PaymentDate {
            @Field("구분")
            private String type;

            @Field("납부일")
            private String paymentDate;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class HouseType {
            @Field("타입")
            private String type;

            @Field("계약금")
            private List<Object> contractAmounts;

            @Field("중도금")
            private List<Object> intermediateAmounts;

            @Field("잔금")
            private List<Object> balanceAmounts;
        }
    }

    /**
     * 신청 기준 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyCondition {
        @Field("무주택")
        private String noHouse;

        @Field("자산")
        private AssetCriteria asset;

        @Field("소득 기준")
        private IncomeCriteria income;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class AssetCriteria {
            @Field("자산 체크 여부")
            private String assetCheck;

            @Field("부동산")
            private Object realEstate;

            @Field("자동차")
            private Object vehicle;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class IncomeCriteria {
            @Field("우선공급")
            private Object prioritySupply;

            @Field("일반공급")
            private Object generalSupply;
        }
    }

    /**
     * 신청자격 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyQualification {
        @Field("특별공급")
        private SpecialSupply specialSupply;

        @Field("일반공급")
        private GeneralSupply generalSupply;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SpecialSupply {
            @Field("기관추천")
            private SupplyType institutionRecommendation;

            @Field("다자녀가구")
            private SupplyType multiChildFamily;

            @Field("신혼부부")
            private SupplyType newlyweds;

            @Field("노부모부양")
            private SupplyType elderlyParentSupport;

            @Field("생애최초")
            private SupplyType firstTimeBuyer;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class GeneralSupply {
            @Field("1순위")
            private SupplyType firstPriority;

            @Field("2순위")
            private SupplyType secondPriority;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SupplyType {
            @Field("청약통장 자격 요건")
            private SubscriptionAccountRequirement subscriptionAccountRequirement;

            @Field("세대주 요건")
            private String householdHeadRequirement;

            @Field("소득 또는 자산 기준")
            private String incomeOrAssetCriteria;

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class SubscriptionAccountRequirement {
                @Field("가입 여부")
                private String membershipRequired;

                @Field("가입 개월 수")
                private Object membershipMonths;

                @Field("예치금 충족 여부")
                private String depositFulfillment;

                @Field("필요 예치금")
                private Object requiredDeposit;
            }
        }
    }
}
