package com.hana_ti.home_planner.domain.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_HOUSE_LIKE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHouseLike {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LIKE_ID")
    private Long likeId;
    
    @Column(name = "USER_ID", nullable = false, length = 36)
    private String userId;
    
    @Column(name = "HOUSE_MANAGE_NO", nullable = false, length = 20)
    private String houseManageNo;
    
    @CreationTimestamp
    @Column(name = "LIKED_AT", nullable = false)
    private LocalDateTime likedAt;
    
    // 중복 방지를 위한 복합 유니크 제약조건
    @Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"USER_ID", "HOUSE_MANAGE_NO"})
    })
    public static class UserHouseLikeTable {}
}
