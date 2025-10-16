package com.hana_ti.home_planner.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseLikeRequestDto {
    
    @NotBlank(message = "주택관리번호는 필수입니다")
    @Size(max = 20, message = "주택관리번호는 20자 이하여야 합니다")
    private String houseManageNo;
}
