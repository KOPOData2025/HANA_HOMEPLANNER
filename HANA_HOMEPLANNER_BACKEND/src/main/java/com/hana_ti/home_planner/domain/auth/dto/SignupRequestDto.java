package com.hana_ti.home_planner.domain.auth.dto;

import com.hana_ti.home_planner.domain.user.entity.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {
    // 사용자 정보
    private String email;
    private String pwd;
    private String userNm;
    private String resNum;
    private String ci;
    private String phnNum;
    private UserType userTyp;
    
    // 주소 정보
    private String sido;
    private String sigungu;
    private String eupmyeondong;
    private String roadNm;
    private BigDecimal lat;
    private BigDecimal lon;
}