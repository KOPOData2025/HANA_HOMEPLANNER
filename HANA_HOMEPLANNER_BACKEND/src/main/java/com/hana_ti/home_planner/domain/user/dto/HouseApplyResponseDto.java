package com.hana_ti.home_planner.domain.user.dto;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import com.hana_ti.home_planner.domain.user.entity.UserHouseApply;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseApplyResponseDto {
    
    private Long applyId;
    private String userId;
    private String houseManageNo;
    private UserHouseApply.ApplyStatus applyStatus;
    private LocalDateTime appliedAt;
    private String statusDescription;
    
    // 주택 상세 정보 (MongoDB ApplyHomeData 사용)
    private ApplyHomeData houseInfo;
}
