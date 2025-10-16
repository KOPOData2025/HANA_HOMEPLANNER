package com.hana_ti.home_planner.domain.address.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.SQLInsert;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.math.BigDecimal;

@Entity
@Table(name = "address")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Address {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "addr_id", length = 20, insertable = false, updatable = false)
    private String addrId;

    @Column(name = "sido", length = 50)
    private String sido;

    @Column(name = "sigungu", length = 50)
    private String sigungu;

    @Column(name = "eupmyeondong", length = 50)
    private String eupmyeondong;

    @Column(name = "road_nm", length = 100)
    private String roadNm;

    @Column(name = "lat", precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(name = "lon", precision = 10, scale = 7)
    private BigDecimal lon;

    public static Address create(String sido, String sigungu, String eupmyeondong, 
                               String roadNm, BigDecimal lat, BigDecimal lon) {
        Address address = new Address();
        // addr_id는 트리거에서 자동 생성되므로 설정하지 않음
        address.sido = sido;
        address.sigungu = sigungu;
        address.eupmyeondong = eupmyeondong;
        address.roadNm = roadNm;
        address.lat = lat;
        address.lon = lon;
        return address;
    }
}