package com.hana_ti.home_planner.domain.couple.service;

import com.hana_ti.home_planner.domain.couple.dto.CoupleAcceptResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.CoupleStatusResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.PartnerDetailResponseDto;
import com.hana_ti.home_planner.domain.couple.dto.PartnerInfoResponseDto;
import com.hana_ti.home_planner.domain.couple.entity.Couple;
import com.hana_ti.home_planner.domain.couple.entity.CoupleInvite;
import com.hana_ti.home_planner.domain.couple.repository.CoupleInviteRepository;
import com.hana_ti.home_planner.domain.couple.repository.CoupleRepository;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CoupleAcceptService {

    private final CoupleInviteRepository coupleInviteRepository;
    private final CoupleRepository coupleRepository;
    private final UserRepository userRepository;

    /**
     * 커플 초대 수락
     * @param inviteToken 초대 토큰
     * @param acceptorId 수락자 사용자 ID
     * @return 커플 관계 정보
     */
    @Transactional
    public CoupleAcceptResponseDto acceptInvite(String inviteToken, String acceptorId) {
        log.info("커플 초대 수락 요청 - 초대 토큰: {}, 수락자 ID: {}", inviteToken, acceptorId);

        // 1. 초대 토큰으로 초대 정보 조회
        CoupleInvite invite = coupleInviteRepository.findByToken(inviteToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대 토큰입니다: " + inviteToken));

        // 2. 초대 상태 확인
        if (invite.getStatus() != CoupleInvite.InviteStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 초대입니다: " + inviteToken);
        }

        // 3. 만료 여부 확인
        if (invite.isExpired()) {
            // 만료된 초대 상태로 업데이트
            invite.updateStatus(CoupleInvite.InviteStatus.EXPIRED);
            coupleInviteRepository.save(invite);
            throw new IllegalArgumentException("만료된 초대입니다: " + inviteToken);
        }

        // 4. 자기 자신을 초대한 경우 체크
        if (invite.getUserId().equals(acceptorId)) {
            throw new IllegalArgumentException("자기 자신을 초대할 수 없습니다.");
        }

        // 5. 이미 커플 관계가 있는지 확인
        if (coupleRepository.existsActiveCouple(invite.getUserId(), acceptorId)) {
            throw new IllegalArgumentException("이미 커플 관계가 존재합니다.");
        }

        // 6. 커플 관계 생성
        String coupleId = UUID.randomUUID().toString();
        Couple couple = Couple.builder()
                .coupleId(coupleId)
                .userId1(invite.getUserId())  // 초대한 사용자 (토큰으로 조회)
                .userId2(acceptorId)          // 수락자 사용자 ID
                .status(Couple.CoupleStatus.ACTIVE)
                .build();

        Couple savedCouple = coupleRepository.save(couple);

        // 7. 초대 상태를 수락으로 업데이트
        invite.updateStatus(CoupleInvite.InviteStatus.ACCEPTED);
        coupleInviteRepository.save(invite);

        log.info("커플 초대 수락 완료 - 커플 ID: {}, 사용자1: {}, 사용자2: {}", 
                coupleId, invite.getUserId(), acceptorId);

        return CoupleAcceptResponseDto.from(savedCouple);
    }

    /**
     * 사용자의 커플 관계 조회
     * @param userId 사용자 ID
     * @return 커플 관계 목록
     */
    public java.util.List<CoupleAcceptResponseDto> getCouplesByUserId(String userId) {
        log.info("사용자 커플 관계 조회 - 사용자 ID: {}", userId);
        
        return coupleRepository.findActiveByUserId(userId).stream()
                .map(CoupleAcceptResponseDto::from)
                .toList();
    }

    /**
     * 회원가입 완료 후 자동 초대 수락
     * @param userId 회원가입 완료된 사용자 ID
     * @return 커플 관계 정보 (초대가 있는 경우)
     */
    @Transactional
    public java.util.Optional<CoupleAcceptResponseDto> autoAcceptInviteAfterSignup(String userId) {
        log.info("회원가입 완료 후 자동 초대 수락 - 사용자 ID: {}", userId);

        try {
            // 1. 해당 사용자를 위한 활성 초대 조회
            List<CoupleInvite> pendingInvites = coupleInviteRepository.findByUserIdAndStatus(userId, CoupleInvite.InviteStatus.PENDING);
            
            if (pendingInvites.isEmpty()) {
                log.info("해당 사용자를 위한 활성 초대가 없습니다 - 사용자 ID: {}", userId);
                return java.util.Optional.empty();
            }

            // 2. 가장 최근 초대 선택 (여러 개가 있을 경우)
            CoupleInvite invite = pendingInvites.get(0);
            
            // 3. 만료 여부 확인
            if (invite.isExpired()) {
                log.warn("만료된 초대입니다 - 초대 ID: {}", invite.getInviteId());
                invite.updateStatus(CoupleInvite.InviteStatus.EXPIRED);
                coupleInviteRepository.save(invite);
                return java.util.Optional.empty();
            }

            // 4. 초대한 사용자와 커플 관계 생성
            String coupleId = UUID.randomUUID().toString();
            Couple couple = Couple.builder()
                    .coupleId(coupleId)
                    .userId1(invite.getUserId())  // 초대한 사용자
                    .userId2(userId)              // 회원가입 완료된 사용자
                    .status(Couple.CoupleStatus.ACTIVE)
                    .build();

            Couple savedCouple = coupleRepository.save(couple);

            // 5. 초대 상태를 수락으로 업데이트
            invite.updateStatus(CoupleInvite.InviteStatus.ACCEPTED);
            coupleInviteRepository.save(invite);

            log.info("자동 초대 수락 완료 - 커플 ID: {}, 사용자1: {}, 사용자2: {}", 
                    coupleId, invite.getUserId(), userId);

            return java.util.Optional.of(CoupleAcceptResponseDto.from(savedCouple));
        } catch (Exception e) {
            log.error("자동 초대 수락 중 오류 발생 - 사용자 ID: {}", userId, e);
            return java.util.Optional.empty();
        }
    }

    /**
     * 두 사용자 간의 커플 관계 조회
     * @param userId1 사용자 1 ID
     * @param userId2 사용자 2 ID
     * @return 커플 관계 (Optional)
     */
    public java.util.Optional<CoupleAcceptResponseDto> getCoupleByUserIds(String userId1, String userId2) {
        log.info("두 사용자 간 커플 관계 조회 - 사용자1: {}, 사용자2: {}", userId1, userId2);
        
        return coupleRepository.findByUserIds(userId1, userId2)
                .map(CoupleAcceptResponseDto::from);
    }

    /**
     * 사용자의 커플 연동 상태 확인
     * @param userId 사용자 ID
     * @return 커플 상태 정보
     */
    public CoupleStatusResponseDto checkCoupleStatus(String userId) {
        log.info("사용자 커플 연동 상태 확인 - 사용자 ID: {}", userId);

        // 활성 커플 관계 조회
        List<Couple> activeCouples = coupleRepository.findActiveByUserId(userId);

        if (activeCouples.isEmpty()) {
            log.info("사용자에게 연동된 커플이 없습니다 - 사용자 ID: {}", userId);
            return CoupleStatusResponseDto.noCouple();
        }

        // 첫 번째 활성 커플 관계 사용 (일반적으로 한 명당 하나의 커플 관계)
        Couple couple = activeCouples.get(0);
        
        // 상대방 사용자 ID 결정
        String partnerUserId = couple.getUserId1().equals(userId) ? 
                couple.getUserId2() : couple.getUserId1();

        log.info("사용자에게 연동된 커플이 있습니다 - 사용자 ID: {}, 커플 ID: {}, 상대방 ID: {}", 
                userId, couple.getCoupleId(), partnerUserId);

        return CoupleStatusResponseDto.hasCouple(
                couple.getCoupleId(),
                partnerUserId,
                couple.getStatus().name(),
                couple.getCreatedAt()
        );
    }

    /**
     * 파트너 정보 조회
     * @param userId 현재 사용자 ID
     * @param partnerUserId 파트너 사용자 ID
     * @return 파트너 정보
     */
    public PartnerInfoResponseDto getPartnerInfo(String userId, String partnerUserId) {
        log.info("파트너 정보 조회 시작 - 사용자 ID: {}, 파트너 ID: {}", userId, partnerUserId);

        try {
            // 1. 두 사용자 간의 커플 관계 확인
            Optional<Couple> coupleOpt = coupleRepository.findByUserIds(userId, partnerUserId);
            if (coupleOpt.isEmpty()) {
                log.warn("사용자와 파트너 간의 커플 관계가 없습니다 - 사용자 ID: {}, 파트너 ID: {}", userId, partnerUserId);
                return PartnerInfoResponseDto.noPartner();
            }

            Couple couple = coupleOpt.get();
            
            // 2. 커플 상태가 ACTIVE인지 확인
            if (couple.getStatus() != Couple.CoupleStatus.ACTIVE) {
                log.warn("커플 관계가 비활성 상태입니다 - 커플 ID: {}, 상태: {}", couple.getCoupleId(), couple.getStatus());
                return PartnerInfoResponseDto.noPartner();
            }

            // 3. 파트너 사용자 정보 조회
            Optional<User> partnerOpt = userRepository.findById(partnerUserId);
            if (partnerOpt.isEmpty()) {
                log.warn("파트너 사용자 정보를 찾을 수 없습니다 - 파트너 ID: {}", partnerUserId);
                return PartnerInfoResponseDto.noPartner();
            }

            User partner = partnerOpt.get();

            // 4. 파트너 정보 응답 생성
            PartnerInfoResponseDto response = PartnerInfoResponseDto.withPartner(
                    partner.getUserId(),
                    partner.getEmail(),
                    partner.getUserNm(),
                    partner.getPhnNum(),
                    partner.getUserTyp() != null ? partner.getUserTyp().name() : null,
                    couple.getCoupleId(),
                    couple.getStatus().name(),
                    couple.getCreatedAt()
            );

            log.info("파트너 정보 조회 완료 - 파트너 ID: {}, 이름: {}, 이메일: {}", 
                    partner.getUserId(), partner.getUserNm(), partner.getEmail());

            return response;

        } catch (Exception e) {
            log.error("파트너 정보 조회 중 오류 발생 - 사용자 ID: {}, 파트너 ID: {}", userId, partnerUserId, e);
            return PartnerInfoResponseDto.noPartner();
        }
    }

    /**
     * 파트너 상세 정보 조회 (성명, 휴대폰번호, 이메일)
     * @param userId 현재 사용자 ID
     * @return 파트너 상세 정보
     */
    public PartnerDetailResponseDto getPartnerDetail(String userId) {
        log.info("파트너 상세 정보 조회 시작 - 사용자 ID: {}", userId);

        try {
            // 1. 사용자의 활성 커플 관계 조회
            List<Couple> activeCouples = coupleRepository.findActiveByUserId(userId);
            if (activeCouples.isEmpty()) {
                log.warn("사용자에게 연동된 커플이 없습니다 - 사용자 ID: {}", userId);
                throw new IllegalArgumentException("연동된 커플이 없습니다");
            }

            // 첫 번째 활성 커플 관계 사용
            Couple couple = activeCouples.get(0);
            
            // 2. 상대방 사용자 ID 결정
            String partnerUserId = couple.getUserId1().equals(userId) ? 
                    couple.getUserId2() : couple.getUserId1();

            // 3. 파트너 사용자 정보 조회
            Optional<User> partnerOpt = userRepository.findById(partnerUserId);
            if (partnerOpt.isEmpty()) {
                log.warn("파트너 사용자 정보를 찾을 수 없습니다 - 파트너 ID: {}", partnerUserId);
                throw new IllegalArgumentException("파트너 정보를 찾을 수 없습니다");
            }

            User partner = partnerOpt.get();

            // 4. 파트너 상세 정보 응답 생성
            PartnerDetailResponseDto response = PartnerDetailResponseDto.of(
                    partner.getUserId(),
                    partner.getUserNm(),
                    partner.getPhnNum(),
                    partner.getEmail(),
                    couple.getCoupleId(),
                    couple.getStatus().name()
            );

            log.info("파트너 상세 정보 조회 완료 - 파트너 ID: {}, 이름: {}, 휴대폰: {}, 이메일: {}", 
                    partner.getUserId(), partner.getUserNm(), partner.getPhnNum(), partner.getEmail());

            return response;

        } catch (Exception e) {
            log.error("파트너 상세 정보 조회 중 오류 발생 - 사용자 ID: {}", userId, e);
            throw new IllegalArgumentException("파트너 상세 정보 조회에 실패했습니다: " + e.getMessage());
        }
    }
}
