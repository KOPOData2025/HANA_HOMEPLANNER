package com.hana_ti.home_planner.domain.calander.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsScheduleRegistrationRequestDto {

    private String accountNum;              // 계좌번호
    private String accountTypeDescription;   // 계좌 타입 설명
    private String title;                   // 캘린더에 표시될 제목
}
