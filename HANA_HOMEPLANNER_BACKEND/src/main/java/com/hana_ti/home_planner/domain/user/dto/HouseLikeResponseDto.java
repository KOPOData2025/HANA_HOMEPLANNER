package com.hana_ti.home_planner.domain.user.dto;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseLikeResponseDto {
    
    private Long likeId;
    private String userId;
    private String houseManageNo;
    private LocalDateTime likedAt;
    private boolean isLiked;
    
    // 주택 상세 정보 (MongoDB ApplyHomeData 사용)
    private ApplyHomeData houseInfo;
}
