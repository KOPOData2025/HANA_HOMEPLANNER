package com.hana_ti.home_planner.domain.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_HOUSE_APPLY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHouseApply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "APPLY_ID")
    private Long applyId;
    
    @Column(name = "USER_ID", nullable = false, length = 36)
    private String userId;
    
    @Column(name = "HOUSE_MANAGE_NO", nullable = false, length = 20)
    private String houseManageNo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "APPLY_STATUS", nullable = false, length = 20)
    private ApplyStatus applyStatus;
    
    @CreationTimestamp
    @Column(name = "APPLIED_AT", nullable = false)
    private LocalDateTime appliedAt;
    
    // 신청 상태 열거형
    public enum ApplyStatus {
        APPLY("신청"),
        CANCEL("취소"),
        WIN("당첨"),
        FAIL("탈락");
        
        private final String description;
        
        ApplyStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // 중복 신청 방지를 위한 복합 유니크 제약조건
    @Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"USER_ID", "HOUSE_MANAGE_NO"})
    })
    public static class UserHouseApplyTable {}
}
