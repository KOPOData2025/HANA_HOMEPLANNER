package com.hana_ti.home_planner.domain.bank.service;

import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationRequestDto;
import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationResponseDto;
import com.hana_ti.home_planner.domain.bank.dto.AccountInvitationAcceptRequestDto;
import com.hana_ti.home_planner.domain.bank.entity.Account;
import com.hana_ti.home_planner.domain.bank.entity.AccountInvitation;
import com.hana_ti.home_planner.domain.bank.entity.AccountParticipant;
import com.hana_ti.home_planner.domain.bank.repository.AccountInvitationRepository;
import com.hana_ti.home_planner.domain.bank.repository.AccountParticipantRepository;
import com.hana_ti.home_planner.domain.bank.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AccountInvitationService {

    private final AccountInvitationRepository accountInvitationRepository;
    private final AccountParticipantRepository accountParticipantRepository;
    private final AccountRepository accountRepository;

    /**
     * 공동 적금 초대 생성
     */
    @Transactional
    public AccountInvitationResponseDto createInvitation(String inviterId, AccountInvitationRequestDto request) {
        log.info("공동 적금 초대 생성 시작 - 초대자ID: {}, 계좌번호: {}", 
                inviterId, request.getAccountNumber());

        // 1. 계좌번호로 계좌 조회
        Account account = accountRepository.findByAccountNum(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("계좌를 찾을 수 없습니다: " + request.getAccountNumber()));

        // 2. 초대자가 계좌 소유자인지 확인
        if(!account.getUserId().equals(inviterId)){
            throw new IllegalArgumentException("초대자는 해당 계좌의 소유자가 아닙니다");
        }

        // 3. 초대 생성
        String inviteId = UUID.randomUUID().toString();
        AccountInvitation invitation = AccountInvitation.create(
                inviteId,
                account.getAccountId(),
                inviterId,
                AccountInvitation.Role.JOINT
        );

        AccountInvitation savedInvitation = accountInvitationRepository.save(invitation);
        log.info("공동 적금 초대 생성 완료 - 초대ID: {}, 상태: {}", 
                savedInvitation.getInviteId(), savedInvitation.getStatus());

        return AccountInvitationResponseDto.builder()
                .inviteId(savedInvitation.getInviteId())
                .accountId(savedInvitation.getAccountId())
                .inviterId(savedInvitation.getInviterId())
                .role(savedInvitation.getRole())
                .status(savedInvitation.getStatus())
                .createdAt(savedInvitation.getCreatedAt())
                .respondedAt(savedInvitation.getRespondedAt())
                .build();
    }

    /**
     * 초대 수락 (사용자 ID와 함께)
     */
    @Transactional
    public AccountInvitationResponseDto acceptInvitation(String inviteId, String userId) {
        log.info("초대 수락 시작 - 초대ID: {}, 사용자ID: {}", inviteId, userId);

        // 1. 초대 조회
        AccountInvitation invitation = accountInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + inviteId));

        // 2. 초대 상태 확인
        if (invitation.getStatus() != AccountInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("이미 응답된 초대입니다. 현재 상태: " + invitation.getStatus());
        }

        // 3. 사용자가 이미 계좌 참여자인지 확인
        boolean isAlreadyParticipant = accountParticipantRepository.existsByAccountIdAndUserId(invitation.getAccountId(), userId);
        if (isAlreadyParticipant) {
            throw new IllegalArgumentException("해당 사용자는 이미 계좌 참여자입니다");
        }

        // 4. 초대 수락 처리
        invitation.accept();
        
        // 5. 계좌 참여자로 추가
        AccountParticipant participant = AccountParticipant.create(
                UUID.randomUUID().toString(),
                invitation.getAccountId(),
                userId,
                AccountParticipant.Role.JOINT,
                BigDecimal.ZERO // 초기 기여율은 0% (나중에 설정)
        );
        accountParticipantRepository.save(participant);
        log.info("계좌 참여자 추가 완료 - 참여자ID: {}, 사용자ID: {}, 역할: {}", 
                participant.getParticipantId(), participant.getUserId(), participant.getRole());

        AccountInvitation savedInvitation = accountInvitationRepository.save(invitation);
        log.info("초대 수락 완료 - 초대ID: {}, 상태: {}", 
                savedInvitation.getInviteId(), savedInvitation.getStatus());

        return AccountInvitationResponseDto.builder()
                .inviteId(savedInvitation.getInviteId())
                .accountId(savedInvitation.getAccountId())
                .inviterId(savedInvitation.getInviterId())
                .role(savedInvitation.getRole())
                .status(savedInvitation.getStatus())
                .createdAt(savedInvitation.getCreatedAt())
                .respondedAt(savedInvitation.getRespondedAt())
                .build();
    }

    /**
     * 초대 수락 (요청 DTO 사용)
     */
    @Transactional
    public AccountInvitationResponseDto acceptInvitationWithRequest(String userId, AccountInvitationAcceptRequestDto request) {
        log.info("초대 수락 시작 - 사용자ID: {}, 초대ID: {}", userId, request.getInviteId());

        // 1. 초대 조회 및 ACCOUNT_ID 추출
        AccountInvitation invitation = accountInvitationRepository.findById(request.getInviteId())
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + request.getInviteId()));

        String accountId = invitation.getAccountId();
        log.info("계좌 ID 추출 완료 - 계좌ID: {}", accountId);

        // 2. 초대 상태 확인
        if (invitation.getStatus() != AccountInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("이미 응답된 초대입니다. 현재 상태: " + invitation.getStatus());
        }

        // 3. 사용자가 이미 계좌 참여자인지 확인
        boolean isAlreadyParticipant = accountParticipantRepository.existsByAccountIdAndUserId(accountId, userId);
        if (isAlreadyParticipant) {
            throw new IllegalArgumentException("해당 사용자는 이미 계좌 참여자입니다");
        }

        // 4. 초대 수락 처리
        invitation.accept();
        
        // 5. ACCOUNT_PARTICIPANT 생성 및 저장
        String participantId = UUID.randomUUID().toString();
        AccountParticipant participant = AccountParticipant.create(
                participantId,
                accountId,
                userId,
                AccountParticipant.Role.JOINT,
                null // CONTRIBUTION_RT는 NULL로 설정
        );
        AccountParticipant savedParticipant = accountParticipantRepository.save(participant);
        log.info("계좌 참여자 생성 완료 - 참여자ID: {}, 계좌ID: {}, 사용자ID: {}, 역할: {}, 기여율: {}", 
                savedParticipant.getParticipantId(), 
                savedParticipant.getAccountId(), 
                savedParticipant.getUserId(), 
                savedParticipant.getRole(),
                savedParticipant.getContributionRate());

        AccountInvitation savedInvitation = accountInvitationRepository.save(invitation);
        log.info("초대 수락 완료 - 초대ID: {}, 상태: {}", 
                savedInvitation.getInviteId(), savedInvitation.getStatus());

        return AccountInvitationResponseDto.builder()
                .inviteId(savedInvitation.getInviteId())
                .accountId(savedInvitation.getAccountId())
                .inviterId(savedInvitation.getInviterId())
                .role(savedInvitation.getRole())
                .status(savedInvitation.getStatus())
                .createdAt(savedInvitation.getCreatedAt())
                .respondedAt(savedInvitation.getRespondedAt())
                .build();
    }

    /**
     * 대기중인 초대 목록 조회 (모든 사용자가 볼 수 있음)
     */
    public List<AccountInvitationResponseDto> getPendingInvitations() {
        log.info("대기중인 초대 목록 조회");

        List<AccountInvitation> invitations = accountInvitationRepository.findByStatus(AccountInvitation.InvitationStatus.PENDING);
        
        return invitations.stream()
                .map(invitation -> AccountInvitationResponseDto.builder()
                        .inviteId(invitation.getInviteId())
                        .accountId(invitation.getAccountId())
                        .inviterId(invitation.getInviterId())
                        .role(invitation.getRole())
                        .status(invitation.getStatus())
                        .createdAt(invitation.getCreatedAt())
                        .respondedAt(invitation.getRespondedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 계좌의 초대 목록 조회
     */
    public List<AccountInvitationResponseDto> getInvitationsByAccount(String accountId) {
        log.info("계좌 초대 목록 조회 - 계좌ID: {}", accountId);

        List<AccountInvitation> invitations = accountInvitationRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
        
        return invitations.stream()
                .map(invitation -> AccountInvitationResponseDto.builder()
                        .inviteId(invitation.getInviteId())
                        .accountId(invitation.getAccountId())
                        .inviterId(invitation.getInviterId())
                        .role(invitation.getRole())
                        .status(invitation.getStatus())
                        .createdAt(invitation.getCreatedAt())
                        .respondedAt(invitation.getRespondedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 초대 만료 처리
     */
    @Transactional
    public void expireInvitation(String inviteId) {
        log.info("초대 만료 처리 시작 - 초대ID: {}", inviteId);

        AccountInvitation invitation = accountInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다: " + inviteId));

        if (invitation.getStatus() != AccountInvitation.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("대기중인 초대만 만료 처리할 수 있습니다. 현재 상태: " + invitation.getStatus());
        }

        invitation.expire();
        accountInvitationRepository.save(invitation);
        
        log.info("초대 만료 처리 완료 - 초대ID: {}", inviteId);
    }
}
