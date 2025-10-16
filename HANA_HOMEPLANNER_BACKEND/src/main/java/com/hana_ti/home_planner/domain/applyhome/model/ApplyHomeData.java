package com.hana_ti.home_planner.domain.applyhome.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applyhome_data")
public class ApplyHomeData {

    @Id
    private String id; // _id : "2025000387"

    @Field("BSNS_MBY_NM")
    private String businessEntityName;

    @Field("CNSTRCT_ENTRPS_NM")
    private String constructorName;

    @Field("CNTRCT_CNCLS_BGNDE")
    private String contractStartDate;

    @Field("CNTRCT_CNCLS_ENDDE")
    private String contractEndDate;

    @Field("GNRL_RNK1_CRSPAREA_ENDDE")
    private String generalRank1AreaEndDate;

    @Field("GNRL_RNK1_CRSPAREA_RCPTDE")
    private String generalRank1AreaStartDate;

    @Field("GNRL_RNK1_ETC_AREA_ENDDE")
    private String generalRank1EtcAreaEndDate;

    @Field("GNRL_RNK1_ETC_AREA_RCPTDE")
    private String generalRank1EtcAreaStartDate;

    @Field("GNRL_RNK1_ETC_GG_ENDDE")
    private String generalRank1EtcGyeonggiEndDate;

    @Field("GNRL_RNK1_ETC_GG_RCPTDE")
    private String generalRank1EtcGyeonggiStartDate;

    @Field("GNRL_RNK2_CRSPAREA_ENDDE")
    private String generalRank2AreaEndDate;

    @Field("GNRL_RNK2_CRSPAREA_RCPTDE")
    private String generalRank2AreaStartDate;

    @Field("GNRL_RNK2_ETC_AREA_ENDDE")
    private String generalRank2EtcAreaEndDate;

    @Field("GNRL_RNK2_ETC_AREA_RCPTDE")
    private String generalRank2EtcAreaStartDate;

    @Field("GNRL_RNK2_ETC_GG_ENDDE")
    private String generalRank2EtcGyeonggiEndDate;

    @Field("GNRL_RNK2_ETC_GG_RCPTDE")
    private String generalRank2EtcGyeonggiStartDate;

    @Field("HMPG_ADRES")
    private String homepageUrl;

    @Field("HOUSE_DTL_SECD")
    private String houseDetailCode;

    @Field("HOUSE_DTL_SECD_NM")
    private String houseDetailName;

    @Field("HOUSE_MANAGE_NO")
    private String houseManageNo;

    @Field("HOUSE_NM")
    private String houseName;

    @Field("HOUSE_SECD")
    private String houseCode;

    @Field("HOUSE_SECD_NM")
    private String houseTypeName;

    @Field("HSSPLY_ADRES")
    private String supplyAddress;

    @Field("HSSPLY_ZIP")
    private String supplyZip;

    @Field("IMPRMN_BSNS_AT")
    private String improvementBusinessAt;

    @Field("LRSCL_BLDLND_AT")
    private String largeScaleBuildingAt;

    @Field("MDAT_TRGET_AREA_SECD")
    private String targetAreaCode;

    @Field("MDHS_TELNO")
    private String contactNumber;

    @Field("MVN_PREARNGE_YM")
    private String moveInYearMonth;

    @Field("NPLN_PRVOPR_PUBLIC_HOUSE_AT")
    private String unplannedPublicHouseAt;

    @Field("NSPRC_NM")
    private String newsProviderName;

    @Field("PARCPRC_ULS_AT")
    private String parcelPriceDisclosureAt;

    @Field("PBLANC_NO")
    private String announcementNo;

    @Field("PBLANC_URL")
    private String announcementUrl;

    @Field("PRZWNER_PRESNATN_DE")
    private String winnerAnnouncementDate;

    @Field("PUBLIC_HOUSE_EARTH_AT")
    private String publicHouseEarthAt;

    @Field("PUBLIC_HOUSE_SPCLW_APPLC_AT")
    private String publicHouseSpecialApplyAt;

    @Field("RCEPT_BGNDE")
    private String receiptStartDate;

    @Field("RCEPT_ENDDE")
    private String receiptEndDate;

    @Field("RCRIT_PBLANC_DE")
    private String recruitAnnouncementDate;

    @Field("RENT_SECD")
    private String rentCode;

    @Field("RENT_SECD_NM")
    private String rentTypeName;

    @Field("SPECLT_RDN_EARTH_AT")
    private String specialLandAt;

    @Field("SPSPLY_RCEPT_BGNDE")
    private String specialSupplyStartDate;

    @Field("SPSPLY_RCEPT_ENDDE")
    private String specialSupplyEndDate;

    @Field("SUBSCRPT_AREA_CODE")
    private String subscriptionAreaCode;

    @Field("SUBSCRPT_AREA_CODE_NM")
    private String subscriptionAreaName;

    @Field("TOT_SUPLY_HSHLDCO")
    private Integer totalSupplyHouseholds;

    @Field("geocode_status")
    private String geocodeStatus;

    @Field("s3_pdf_urls")
    private List<String> s3PdfUrls;

    @Field("x")
    private Double longitude;

    @Field("y")
    private Double latitude;
}
