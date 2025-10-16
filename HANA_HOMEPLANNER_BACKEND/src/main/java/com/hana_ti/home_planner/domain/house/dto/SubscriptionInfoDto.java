package com.hana_ti.home_planner.domain.house.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubscriptionInfoDto {

    private String houseSecd;           // 주택구분코드
    private String houseSecdNm;         // 주택구분명
    private String houseNm;             // 주택명
    private String rceptBgnDe;          // 청약접수 시작일
    private String rceptEndDe;          // 청약접수 종료일
    private String subscrptAreaCodeNm;  // 지역명
    private String pblancUrl;           // 공고 URL
    private String rcruitPblancDe;      // 모집공고일
    private String prizeWnerPresnatnDe; // 당첨자 발표일
    private String cntrctCnclsDe;       // 계약체결일

    public static SubscriptionInfoDto of(String houseSecd, String houseSecdNm, String houseNm,
                                       String rceptBgnDe, String rceptEndDe, String subscrptAreaCodeNm,
                                       String pblancUrl, String rcruitPblancDe, String prizeWnerPresnatnDe,
                                       String cntrctCnclsDe) {
        return SubscriptionInfoDto.builder()
                .houseSecd(houseSecd)
                .houseSecdNm(houseSecdNm)
                .houseNm(houseNm)
                .rceptBgnDe(rceptBgnDe)
                .rceptEndDe(rceptEndDe)
                .subscrptAreaCodeNm(subscrptAreaCodeNm)
                .pblancUrl(pblancUrl)
                .rcruitPblancDe(rcruitPblancDe)
                .prizeWnerPresnatnDe(prizeWnerPresnatnDe)
                .cntrctCnclsDe(cntrctCnclsDe)
                .build();
    }
}