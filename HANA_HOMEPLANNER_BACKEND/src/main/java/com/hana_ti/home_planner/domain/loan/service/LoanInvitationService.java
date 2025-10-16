package com.hana_ti.home_planner.domain.loan.service;

import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationAcceptRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationDetailResponseDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationRequestDto;
import com.hana_ti.home_planner.domain.loan.dto.LoanInvitationResponseDto;
import com.hana_ti.home_planner.domain.loan.entity.LoanApplication;
import com.hana_ti.home_planner.domain.loan.entity.LoanInvitation;
import com.hana_ti.home_planner.domain.loan.entity.LoanProduct;
import com.hana_ti.home_planner.domain.loan.repository.LoanApplicationRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanInvitationRepository;
import com.hana_ti.home_planner.domain.loan.repository.LoanProductRepository;
import com.hana_ti.home_planner.domain.user.entity.User;
import com.hana_ti.home_planner.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LoanInvitationService {

    private final LoanInvitationRepository loanInvitationRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanProductRepository loanProductRepository;
    private final UserRepository userRepository;

    /**
     * 대출 초대 생성
     */
    @Transactional
    public LoanInvitationResponseDto createLoanInvitation(LoanInvitationRequestDto request) {
        log.info("대출 초대 생성 시작 - 신청ID: {}, 초대자: {}, 역할: {}", 
                request.getAppId(), request.getInviterId(), request.getRole());

        // 1. 대출 신청 존재 여부 확인
        LoanApplication application = loanApplicationRepository.findById(request.getAppId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + request.getAppId()));

        // 2. 공동 대출인지 확인
        if (!"Y".equals(application.getIsJoint())) {
            throw new IllegalArgumentException("공동 대출이 아닌 신청에는 초대를 생성할 수 없습니다.");
        }

        // 3. 초대 역할 검증
        LoanInvitation.InvitationRole role = validateAndParseRole(request.getRole());

        // 4. 중복 초대 확인
        validateDuplicateInvitation(request.getAppId(), request.getInviterId());

        // 5. 초대 생성
        String inviteId = UUID.randomUUID().toString();
        LoanInvitation invitation = LoanInvitation.createWithJointInfo(
                inviteId,
                request.getAppId(),
                request.getInviterId(),
                role,
                request.getJointName(),
                request.getJointPhone(),
                request.getJointCi()
        );

        // 6. 초대 저장
        LoanInvitation savedInvitation = loanInvitationRepository.save(invitation);

        log.info("대출 초대 생성 완료 - 초대ID: {}, 상태: {}", 
                savedInvitation.getInviteId(), savedInvitation.getStatus());

        return LoanInvitationResponseDto.from(savedInvitation);
    }

    /**
     * 초대 수락 (기존 방식 - joint_ci 없이)
     */
    @Transactional
    public LoanInvitationResponseDto acceptInvitation(String inviteId) {
        log.info("대출 초대 수락 시작 - 초대ID: {}", inviteId);

        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        if (invitation.getStatus() != LoanInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("수락 가능한 상태가 아닙니다. 현재 상태: " + invitation.getStatus());
        }

        invitation.updateStatus(LoanInvitation.InvitationStatus.ACCEPTED);

        log.info("대출 초대 수락 완료 - 초대ID: {}", inviteId);

        return LoanInvitationResponseDto.from(invitation);
    }

    /**
     * 초대 수락 (joint_ci 포함)
     */
    @Transactional
    public LoanInvitationResponseDto acceptInvitationWithJointCi(String inviteId, LoanInvitationAcceptRequestDto request) {
        log.info("대출 초대 수락 시작 (joint_ci 포함) - 초대ID: {}, joint_ci: {}", inviteId, request.getJointCi());

        // 1. 초대 조회
        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        if (invitation.getStatus() != LoanInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("수락 가능한 상태가 아닙니다. 현재 상태: " + invitation.getStatus());
        }

        // 2. joint_ci 업데이트
        invitation.updateJointInfo(
                invitation.getJointName(),
                invitation.getJointPhone(),
                request.getJointCi()
        );

        // 3. 초대 상태를 ACCEPTED로 변경
        invitation.updateStatus(LoanInvitation.InvitationStatus.ACCEPTED);

        // 4. 대출 신청 조회 및 상태 변경
        LoanApplication application = loanApplicationRepository.findById(invitation.getAppId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + invitation.getAppId()));

        // 5. 대출 신청 상태를 JOINT_ACCEPTED로 변경
        application.updateStatus(
                LoanApplication.ApplicationStatus.JOINT_ACCEPTED,
                invitation.getInviterId(),
                "공동대출자 초대 수락"
        );

        log.info("대출 초대 수락 완료 (joint_ci 포함) - 초대ID: {}, 신청ID: {}, 상태: JOINT_ACCEPTED", 
                inviteId, application.getAppId());

        return LoanInvitationResponseDto.from(invitation);
    }

    /**
     * 초대 수락 및 대출 신청 상태 변경
     * 초대를 ACCEPTED로 변경하고, 해당 대출 신청을 UNDER_REVIEW로 변경
     */
    @Transactional
    public LoanInvitationResponseDto acceptInvitationAndUpdateApplication(String inviteId) {
        log.info("초대 수락 및 대출 신청 상태 변경 시작 - 초대ID: {}", inviteId);

        // 1. 초대 조회 및 상태 확인
        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        if (invitation.getStatus() != LoanInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("수락 가능한 상태가 아닙니다. 현재 상태: " + invitation.getStatus());
        }

        // 2. 대출 신청 조회
        LoanApplication application = loanApplicationRepository.findById(invitation.getAppId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + invitation.getAppId()));

        // 3. 초대 상태를 ACCEPTED로 변경
        invitation.updateStatus(LoanInvitation.InvitationStatus.ACCEPTED);
        log.info("초대 상태 변경 완료 - 초대ID: {}, 상태: ACCEPTED", inviteId);

        // 4. 대출 신청 상태를 UNDER_REVIEW로 변경
        application.updateStatus(
                LoanApplication.ApplicationStatus.UNDER_REVIEW,
                invitation.getInviterId(), // 초대자 ID를 심사자로 설정
                "초대 수락으로 인한 심사 시작"
        );
        log.info("대출 신청 상태 변경 완료 - 신청ID: {}, 상태: UNDER_REVIEW", application.getAppId());

        log.info("초대 수락 및 대출 신청 상태 변경 완료 - 초대ID: {}, 신청ID: {}", inviteId, application.getAppId());

        return LoanInvitationResponseDto.from(invitation);
    }

    /**
     * 초대 거절
     */
    @Transactional
    public LoanInvitationResponseDto rejectInvitation(String inviteId) {
        log.info("대출 초대 거절 시작 - 초대ID: {}", inviteId);

        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        if (invitation.getStatus() != LoanInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("거절 가능한 상태가 아닙니다. 현재 상태: " + invitation.getStatus());
        }

        invitation.updateStatus(LoanInvitation.InvitationStatus.REJECTED);

        log.info("대출 초대 거절 완료 - 초대ID: {}", inviteId);

        return LoanInvitationResponseDto.from(invitation);
    }

    /**
     * 대출 신청별 초대 목록 조회
     */
    public List<LoanInvitationResponseDto> getInvitationsByAppId(String appId) {
        log.info("대출 신청별 초대 목록 조회 - 신청ID: {}", appId);

        List<LoanInvitation> invitations = loanInvitationRepository.findByAppIdOrderByCreatedAtDesc(appId);

        return invitations.stream()
                .map(LoanInvitationResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 초대자별 초대 목록 조회
     */
    public List<LoanInvitationResponseDto> getInvitationsByInviterId(String inviterId) {
        log.info("초대자별 초대 목록 조회 - 초대자ID: {}", inviterId);

        List<LoanInvitation> invitations = loanInvitationRepository.findByInviterIdOrderByCreatedAtDesc(inviterId);

        return invitations.stream()
                .map(LoanInvitationResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 초대 상세 조회
     */
    public LoanInvitationResponseDto getInvitationById(String inviteId) {
        log.info("초대 상세 조회 - 초대ID: {}", inviteId);

        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        return LoanInvitationResponseDto.from(invitation);
    }

    /**
     * 초대 역할 검증 및 파싱
     */
    private LoanInvitation.InvitationRole validateAndParseRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("초대 역할은 필수입니다.");
        }

        try {
            return LoanInvitation.InvitationRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 초대 역할입니다: " + role + 
                    ". 가능한 값: PRIMARY, JOINT");
        }
    }

    /**
     * 중복 초대 검증
     */
    private void validateDuplicateInvitation(String appId, String inviterId) {
        Optional<LoanInvitation> existingInvitation = loanInvitationRepository.findByAppIdOrderByCreatedAtDesc(appId)
                .stream()
                .filter(invitation -> invitation.getInviterId().equals(inviterId))
                .findFirst();

        if (existingInvitation.isPresent()) {
            LoanInvitation.InvitationStatus status = existingInvitation.get().getStatus();
            if (status == LoanInvitation.InvitationStatus.PENDING) {
                throw new IllegalArgumentException("이미 대기중인 초대가 있습니다.");
            } else if (status == LoanInvitation.InvitationStatus.ACCEPTED) {
                throw new IllegalArgumentException("이미 수락된 초대가 있습니다.");
            }
        }
    }

    /**
     * 공동 대출자 정보 업데이트
     */
    @Transactional
    public LoanInvitationResponseDto updateJointInfo(String inviteId, String jointName, String jointPhone, String jointCi) {
        log.info("공동 대출자 정보 업데이트 시작 - 초대ID: {}", inviteId);

        // 1. 초대 존재 여부 확인
        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        // 2. 초대 상태 확인 (PENDING 상태에서만 수정 가능)
        if (invitation.getStatus() != LoanInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("대기중인 초대만 수정할 수 있습니다.");
        }

        // 3. 공동 대출자 정보 업데이트
        invitation.updateJointInfo(jointName, jointPhone, jointCi);

        // 4. 저장
        LoanInvitation savedInvitation = loanInvitationRepository.save(invitation);

        log.info("공동 대출자 정보 업데이트 완료 - 초대ID: {}", inviteId);

        return LoanInvitationResponseDto.from(savedInvitation);
    }

    /**
     * 초대 상세 정보 조회
     */
    public LoanInvitationDetailResponseDto getInvitationDetail(String inviteId) {
        log.info("초대 상세 정보 조회 시작 - 초대ID: {}", inviteId);

        // 1. 초대 정보 조회
        LoanInvitation invitation = loanInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대입니다: " + inviteId));

        // 2. 초대한 사용자 정보 조회
        User inviter = userRepository.findById(invitation.getInviterId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다: " + invitation.getInviterId()));

        // 3. 대출 신청 정보 조회
        LoanApplication application = loanApplicationRepository.findById(invitation.getAppId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 신청입니다: " + invitation.getAppId()));

        // 4. 대출 상품 정보 조회
        LoanProduct product = loanProductRepository.findById(application.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 대출 상품입니다: " + application.getProductId()));

        log.info("초대 상세 정보 조회 완료 - 초대ID: {}, 초대자: {}, 상품명: {}", 
                inviteId, inviter.getUserNm(), product.getLoanType());

        return LoanInvitationDetailResponseDto.from(invitation, inviter.getUserNm(), application, product);
    }
}
