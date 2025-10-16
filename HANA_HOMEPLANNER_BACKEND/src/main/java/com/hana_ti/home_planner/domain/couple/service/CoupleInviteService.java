package com.hana_ti.home_planner.domain.couple.service;

import com.hana_ti.home_planner.domain.couple.dto.CoupleInviteDetailResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.CoupleInviteResponseDto;
import com.hana_ti.home_planner.domain.couple.entity.CoupleInvite;
import com.hana_ti.home_planner.domain.couple.repository.CoupleInviteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CoupleInviteService {

    private final CoupleInviteRepository coupleInviteRepository;

    @Value("${app.base-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * 커플 초대 링크 생성
     * @param userId 초대한 사용자 ID
     * @return 초대 응답 DTO
     */
    @Transactional
    public CoupleInviteResponseDto createInvite(String userId) {
        log.info("커플 초대 링크 생성 요청 - 사용자 ID: {}", userId);

        // 1. 기존 활성 초대가 있는지 확인
        long activeInviteCount = coupleInviteRepository.countByUserIdAndStatus(userId, CoupleInvite.InviteStatus.PENDING);
        if (activeInviteCount > 0) {
            log.warn("이미 활성 초대가 존재합니다 - 사용자 ID: {}", userId);
            // 기존 활성 초대를 만료 처리
            coupleInviteRepository.updateExpiredInvites(LocalDateTime.now());
        }

        // 2. 고유 토큰 생성
        String token = UUID.randomUUID().toString();
        
        // 3. 만료일 설정 (3일 후)
        LocalDateTime expiredAt = LocalDateTime.now().plusDays(3);

        // 4. 초대 정보 저장
        CoupleInvite invite = CoupleInvite.builder()
                .userId(userId)
                .token(token)
                .status(CoupleInvite.InviteStatus.PENDING)
                .expiredAt(expiredAt)
                .build();

        CoupleInvite savedInvite = coupleInviteRepository.save(invite);
        
        log.info("커플 초대 링크 생성 완료 - 초대 ID: {}, 토큰: {}, 만료일: {}", 
                savedInvite.getInviteId(), token, expiredAt);

        // 5. 응답 DTO 생성
        return CoupleInviteResponseDto.from(token, frontendUrl);
    }


    /**
     * inviteId로 커플 초대 조회
     * @param inviteId 초대 ID
     * @return 초대 상세 정보
     */
    public CoupleInviteDetailResponseDto getCoupleInviteById(String inviteId) {
        log.info("초대 ID로 커플 초대 조회 시작 - 초대ID: {}", inviteId);

        CoupleInvite coupleInvite = coupleInviteRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + inviteId));

        log.info("초대 ID로 커플 초대 조회 완료 - 초대ID: {}, 상태: {}", coupleInvite.getInviteId(), coupleInvite.getStatus());

        return CoupleInviteDetailResponseDto.from(coupleInvite);
    }
}
