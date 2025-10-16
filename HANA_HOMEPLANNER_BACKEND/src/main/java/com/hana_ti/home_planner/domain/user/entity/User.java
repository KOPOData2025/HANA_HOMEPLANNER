package com.hana_ti.home_planner.domain.user.entity;

import com.hana_ti.home_planner.domain.address.entity.Address;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @Generated(event = EventType.INSERT)
    @Column(name = "user_id", length = 20, insertable = false, updatable = false)
    private String userId;

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "pwd", length = 255, nullable = false)
    private String pwd;

    @Column(name = "user_nm", length = 100, nullable = false)
    private String userNm;

    @Column(name = "res_num", length = 255, nullable = false, unique = true)
    private String resNum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addr_id", nullable = false)
    private Address address;

    @Column(name = "phn_num", length = 30, nullable = false, unique = true)
    private String phnNum;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_typ", length = 50)
    private UserType userTyp;

    @Column(name = "refresh_token", length = 1000)
    private String refreshToken;

    @Column(name = "upd_at")
    private LocalDateTime updAt;

    public static User create(String email, String pwd, String userNm, String resNum,
                            Address address, String phnNum, UserType userTyp) {
        User user = new User();
        // user_id는 트리거에서 자동 생성되므로 설정하지 않음
        user.email = email;
        user.pwd = pwd;
        user.userNm = userNm;
        user.resNum = resNum;
        user.address = address;
        user.phnNum = phnNum;
        user.userTyp = userTyp != null ? userTyp : UserType.INDIVIDUAL;
        user.updAt = LocalDateTime.now();
        return user;
    }

    public void updateInfo(String userNm, String phnNum) {
        this.userNm = userNm;
        this.phnNum = phnNum;
        this.updAt = LocalDateTime.now();
    }

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
        this.updAt = LocalDateTime.now();
    }
}