package com.hana_ti.home_planner.domain.calculation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnualIncomeRequestDto {
    
    // JWT 토큰으로 사용자 정보를 조회하므로 별도 요청 파라미터는 필요 없음
    // 필요시 추가 파라미터를 여기에 정의할 수 있음
    
    private String calculationType; // 계산 방식 (실제소득, 추정소득, 혼합)
    private Boolean includeBonus; // 상여금 포함 여부
    private Boolean includeOvertime; // 초과근무수당 포함 여부
}
