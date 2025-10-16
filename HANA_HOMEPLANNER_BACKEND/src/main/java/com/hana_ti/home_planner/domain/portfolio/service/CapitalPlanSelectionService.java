package com.hana_ti.home_planner.domain.portfolio.service;

import com.hana_ti.home_planner.domain.portfolio.dto.CapitalPlanSelectionRequestDto;
import com.hana_ti.home_planner.domain.portfolio.dto.CapitalPlanSelectionResponseDto;
import com.hana_ti.home_planner.domain.portfolio.entity.CapitalPlanSelection;
import com.hana_ti.home_planner.domain.portfolio.repository.CapitalPlanSelectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CapitalPlanSelectionService {

    private final CapitalPlanSelectionRepository capitalPlanSelectionRepository;

    /**
     * 포트폴리오 선택 저장
     */
    @Transactional
    public CapitalPlanSelectionResponseDto saveSelection(CapitalPlanSelectionRequestDto request, String userId) {
        log.info("포트폴리오 선택 저장 시작 - 사용자: {}, 플랜타입: {}", userId, request.getPlanType());

        CapitalPlanSelection selection = CapitalPlanSelection.builder()
                .userId(userId)
                .houseMngNo(request.getHouseMngNo())
                .savingsId(request.getSavingsId())
                .loanId(request.getLoanId())
                .planType(request.getPlanType())
                .planName(request.getPlanName())
                .loanAmount(request.getLoanAmount())
                .requiredMonthlySaving(request.getRequiredMonthlySaving())
                .totalSavingAtMoveIn(request.getTotalSavingAtMoveIn())
                .shortfallCovered(request.getShortfallCovered())
                .planComment(request.getPlanComment())
                .planRecommendation(request.getPlanRecommendation())
                .desiredMonthlySaving(request.getDesiredMonthlySaving())
                .desiredSavingMaturityAmount(request.getDesiredSavingMaturityAmount())
                .shortfallAfterDesiredSaving(request.getShortfallAfterDesiredSaving())
                .comparisonStatus(request.getComparisonStatus())
                .comparisonComment(request.getComparisonComment())
                .comparisonRecommendation(request.getComparisonRecommendation())
                .build();

        CapitalPlanSelection savedSelection = capitalPlanSelectionRepository.save(selection);
        log.info("포트폴리오 선택 저장 완료 - ID: {}", savedSelection.getSelectionId());

        return convertToResponseDto(savedSelection);
    }

    /**
     * 사용자별 포트폴리오 선택 목록 조회
     */
    public List<CapitalPlanSelectionResponseDto> getSelectionsByUserId(String userId) {
        log.info("사용자별 포트폴리오 선택 목록 조회 - 사용자: {}", userId);

        List<CapitalPlanSelection> selections = capitalPlanSelectionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        log.info("조회된 선택 목록 개수: {}", selections.size());

        return selections.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 사용자의 최신 포트폴리오 선택 조회
     */
    public Optional<CapitalPlanSelectionResponseDto> getLatestSelectionByUserId(String userId) {
        log.info("사용자 최신 포트폴리오 선택 조회 - 사용자: {}", userId);

        Optional<CapitalPlanSelection> latestSelection = capitalPlanSelectionRepository.findLatestByUserId(userId);
        
        if (latestSelection.isPresent()) {
            log.info("최신 선택 발견 - ID: {}, 플랜타입: {}", 
                    latestSelection.get().getSelectionId(), latestSelection.get().getPlanType());
            return Optional.of(convertToResponseDto(latestSelection.get()));
        } else {
            log.info("최신 선택 없음 - 사용자: {}", userId);
            return Optional.empty();
        }
    }

    /**
     * 포트폴리오 선택 상세 조회
     */
    public Optional<CapitalPlanSelectionResponseDto> getSelectionById(Long selectionId) {
        log.info("포트폴리오 선택 상세 조회 - ID: {}", selectionId);

        Optional<CapitalPlanSelection> selection = capitalPlanSelectionRepository.findById(selectionId);
        
        if (selection.isPresent()) {
            log.info("선택 정보 발견 - 사용자: {}, 플랜타입: {}", 
                    selection.get().getUserId(), selection.get().getPlanType());
            return Optional.of(convertToResponseDto(selection.get()));
        } else {
            log.info("선택 정보 없음 - ID: {}", selectionId);
            return Optional.empty();
        }
    }

    /**
     * 포트폴리오 선택 수정
     */
    @Transactional
    public Optional<CapitalPlanSelectionResponseDto> updateSelection(Long selectionId, CapitalPlanSelectionRequestDto request, String userId) {
        log.info("포트폴리오 선택 수정 시작 - 사용자: {}, ID: {}", userId, selectionId);

        Optional<CapitalPlanSelection> existingSelection = capitalPlanSelectionRepository.findById(selectionId);
        
        if (existingSelection.isEmpty()) {
            log.warn("수정할 선택 정보 없음 - ID: {}", selectionId);
            return Optional.empty();
        }

        CapitalPlanSelection selection = existingSelection.get();
        
        // 사용자 권한 확인
        if (!selection.getUserId().equals(userId)) {
            log.warn("권한 없음 - 사용자: {}, 선택 소유자: {}, ID: {}", userId, selection.getUserId(), selectionId);
            return Optional.empty();
        }
        
        // 선택 정보 업데이트
        selection.setHouseMngNo(request.getHouseMngNo());
        selection.setSavingsId(request.getSavingsId());
        selection.setLoanId(request.getLoanId());
        selection.setPlanType(request.getPlanType());
        selection.setPlanName(request.getPlanName());
        selection.setLoanAmount(request.getLoanAmount());
        selection.setRequiredMonthlySaving(request.getRequiredMonthlySaving());
        selection.setTotalSavingAtMoveIn(request.getTotalSavingAtMoveIn());
        selection.setShortfallCovered(request.getShortfallCovered());
        selection.setPlanComment(request.getPlanComment());
        selection.setPlanRecommendation(request.getPlanRecommendation());
        selection.setDesiredMonthlySaving(request.getDesiredMonthlySaving());
        selection.setDesiredSavingMaturityAmount(request.getDesiredSavingMaturityAmount());
        selection.setShortfallAfterDesiredSaving(request.getShortfallAfterDesiredSaving());
        selection.setComparisonStatus(request.getComparisonStatus());
        selection.setComparisonComment(request.getComparisonComment());
        selection.setComparisonRecommendation(request.getComparisonRecommendation());

        CapitalPlanSelection updatedSelection = capitalPlanSelectionRepository.save(selection);
        log.info("포트폴리오 선택 수정 완료 - ID: {}", updatedSelection.getSelectionId());

        return Optional.of(convertToResponseDto(updatedSelection));
    }

    /**
     * 포트폴리오 선택 삭제
     */
    @Transactional
    public boolean deleteSelection(Long selectionId, String userId) {
        log.info("포트폴리오 선택 삭제 시작 - 사용자: {}, ID: {}", userId, selectionId);

        Optional<CapitalPlanSelection> existingSelection = capitalPlanSelectionRepository.findById(selectionId);
        
        if (existingSelection.isEmpty()) {
            log.warn("삭제할 선택 정보 없음 - ID: {}", selectionId);
            return false;
        }

        CapitalPlanSelection selection = existingSelection.get();
        
        // 사용자 권한 확인
        if (!selection.getUserId().equals(userId)) {
            log.warn("권한 없음 - 사용자: {}, 선택 소유자: {}, ID: {}", userId, selection.getUserId(), selectionId);
            return false;
        }

        capitalPlanSelectionRepository.deleteById(selectionId);
        log.info("포트폴리오 선택 삭제 완료 - ID: {}", selectionId);

        return true;
    }

    /**
     * 사용자별 포트폴리오 선택 통계 조회
     */
    public PortfolioSelectionStatsDto getSelectionStatsByUserId(String userId) {
        log.info("사용자별 포트폴리오 선택 통계 조회 - 사용자: {}", userId);

        long totalCount = capitalPlanSelectionRepository.countByUserId(userId);
        List<Object[]> planTypeCounts = capitalPlanSelectionRepository.countByUserIdAndPlanType(userId);

        PortfolioSelectionStatsDto stats = PortfolioSelectionStatsDto.builder()
                .userId(userId)
                .totalSelections(totalCount)
                .conservativeCount(0L)
                .balancedCount(0L)
                .aggressiveCount(0L)
                .build();

        // 플랜 타입별 통계 설정
        for (Object[] result : planTypeCounts) {
            String planType = (String) result[0];
            Long count = (Long) result[1];
            
            switch (planType) {
                case "보수형":
                    stats.setConservativeCount(count);
                    break;
                case "균형형":
                    stats.setBalancedCount(count);
                    break;
                case "공격형":
                    stats.setAggressiveCount(count);
                    break;
            }
        }

        log.info("통계 조회 완료 - 총 선택: {}, 보수형: {}, 균형형: {}, 공격형: {}", 
                stats.getTotalSelections(), stats.getConservativeCount(), 
                stats.getBalancedCount(), stats.getAggressiveCount());

        return stats;
    }

    /**
     * 주택관리번호별 포트폴리오 선택 목록 조회
     */
    public List<CapitalPlanSelectionResponseDto> getSelectionsByHouseMngNo(Long houseMngNo) {
        log.info("주택관리번호별 포트폴리오 선택 목록 조회 - 주택관리번호: {}", houseMngNo);

        List<CapitalPlanSelection> selections = capitalPlanSelectionRepository.findByHouseMngNoOrderByCreatedAtDesc(houseMngNo);
        log.info("조회된 선택 목록 개수: {}", selections.size());

        return selections.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 사용자와 주택관리번호로 포트폴리오 선택 목록 조회
     */
    public List<CapitalPlanSelectionResponseDto> getSelectionsByUserIdAndHouseMngNo(String userId, Long houseMngNo) {
        log.info("사용자와 주택관리번호별 포트폴리오 선택 목록 조회 - 사용자: {}, 주택관리번호: {}", userId, houseMngNo);

        List<CapitalPlanSelection> selections = capitalPlanSelectionRepository.findByUserIdAndHouseMngNoOrderByCreatedAtDesc(userId, houseMngNo);
        log.info("조회된 선택 목록 개수: {}", selections.size());

        return selections.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 주택관리번호별 포트폴리오 선택 통계 조회
     */
    public PortfolioSelectionStatsDto getSelectionStatsByHouseMngNo(Long houseMngNo) {
        log.info("주택관리번호별 포트폴리오 선택 통계 조회 - 주택관리번호: {}", houseMngNo);

        long totalCount = capitalPlanSelectionRepository.countByHouseMngNo(houseMngNo);
        
        PortfolioSelectionStatsDto stats = PortfolioSelectionStatsDto.builder()
                .userId(null) // 주택관리번호 기준이므로 userId는 null
                .totalSelections(totalCount)
                .conservativeCount(0L)
                .balancedCount(0L)
                .aggressiveCount(0L)
                .build();

        log.info("통계 조회 완료 - 총 선택: {}", stats.getTotalSelections());
        return stats;
    }

    /**
     * 엔티티를 응답 DTO로 변환
     */
    private CapitalPlanSelectionResponseDto convertToResponseDto(CapitalPlanSelection selection) {
        return CapitalPlanSelectionResponseDto.builder()
                .selectionId(selection.getSelectionId())
                .userId(selection.getUserId())
                .houseMngNo(selection.getHouseMngNo())
                .savingsId(selection.getSavingsId())
                .loanId(selection.getLoanId())
                .planType(selection.getPlanType())
                .planName(selection.getPlanName())
                .loanAmount(selection.getLoanAmount())
                .requiredMonthlySaving(selection.getRequiredMonthlySaving())
                .totalSavingAtMoveIn(selection.getTotalSavingAtMoveIn())
                .shortfallCovered(selection.getShortfallCovered())
                .planComment(selection.getPlanComment())
                .planRecommendation(selection.getPlanRecommendation())
                .desiredMonthlySaving(selection.getDesiredMonthlySaving())
                .desiredSavingMaturityAmount(selection.getDesiredSavingMaturityAmount())
                .shortfallAfterDesiredSaving(selection.getShortfallAfterDesiredSaving())
                .comparisonStatus(selection.getComparisonStatus())
                .comparisonComment(selection.getComparisonComment())
                .comparisonRecommendation(selection.getComparisonRecommendation())
                .createdAt(selection.getCreatedAt())
                .build();
    }

    /**
     * 포트폴리오 선택 통계 DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class PortfolioSelectionStatsDto {
        private String userId;
        private Long totalSelections;
        @lombok.Builder.Default
        private Long conservativeCount = 0L;
        @lombok.Builder.Default
        private Long balancedCount = 0L;
        @lombok.Builder.Default
        private Long aggressiveCount = 0L;
    }
}
