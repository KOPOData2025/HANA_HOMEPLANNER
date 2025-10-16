package com.hana_ti.home_planner.domain.user.service;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import com.hana_ti.home_planner.domain.applyhome.service.ApplyHomeService;
import com.hana_ti.home_planner.domain.user.dto.HouseApplyRequestDto;
import com.hana_ti.home_planner.domain.user.dto.HouseApplyResponseDto;
import com.hana_ti.home_planner.domain.user.entity.UserHouseApply;
import com.hana_ti.home_planner.domain.user.repository.UserHouseApplyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserHouseApplyService {
    
    private final UserHouseApplyRepository userHouseApplyRepository;
    private final ApplyHomeService applyHomeService;
    
    /**
     * 주택청약 신청하기
     */
    public HouseApplyResponseDto addHouseApply(String userId, HouseApplyRequestDto request) {
        log.info("주택청약 신청 요청 - 사용자: {}, 주택관리번호: {}", userId, request.getHouseManageNo());
        
        // 이미 신청한 주택인지 확인
        if (userHouseApplyRepository.existsByUserIdAndHouseManageNo(userId, request.getHouseManageNo())) {
            log.warn("이미 신청한 주택입니다 - 사용자: {}, 주택관리번호: {}", userId, request.getHouseManageNo());
            throw new IllegalArgumentException("이미 신청한 주택입니다.");
        }
        
        // 신청하기 저장 (APPLY 상태로)
        UserHouseApply userHouseApply = UserHouseApply.builder()
                .userId(userId)
                .houseManageNo(request.getHouseManageNo())
                .applyStatus(UserHouseApply.ApplyStatus.APPLY)
                .build();
        
        UserHouseApply savedApply = userHouseApplyRepository.save(userHouseApply);
        
        log.info("주택청약 신청 완료 - ID: {}, 사용자: {}, 주택관리번호: {}", 
                savedApply.getApplyId(), userId, request.getHouseManageNo());
        
        return HouseApplyResponseDto.builder()
                .applyId(savedApply.getApplyId())
                .userId(savedApply.getUserId())
                .houseManageNo(savedApply.getHouseManageNo())
                .applyStatus(savedApply.getApplyStatus())
                .appliedAt(savedApply.getAppliedAt())
                .statusDescription(savedApply.getApplyStatus().getDescription())
                .build();
    }
    
    /**
     * 사용자의 신청 목록 조회
     */
    @Transactional(readOnly = true)
    public List<HouseApplyResponseDto> getUserHouseApplies(String userId) {
        log.info("사용자 신청 목록 조회 - 사용자: {}", userId);
        
        List<UserHouseApply> applies = userHouseApplyRepository.findByUserIdOrderByAppliedAtDesc(userId);
        
        return applies.stream()
                .map(apply -> {
                    // 주택 상세 정보 조회 (MongoDB ApplyHomeData 사용)
                    ApplyHomeData houseInfo = getHouseInfoByManageNo(apply.getHouseManageNo());
                    
                    return HouseApplyResponseDto.builder()
                            .applyId(apply.getApplyId())
                            .userId(apply.getUserId())
                            .houseManageNo(apply.getHouseManageNo())
                            .applyStatus(apply.getApplyStatus())
                            .appliedAt(apply.getAppliedAt())
                            .statusDescription(apply.getApplyStatus().getDescription())
                            .houseInfo(houseInfo)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 주택관리번호로 주택 정보 조회 (MongoDB ApplyHomeData 사용)
     */
    private ApplyHomeData getHouseInfoByManageNo(String houseManageNo) {
        try {
            log.info("MongoDB에서 주택 정보 조회 - 주택관리번호: {}", houseManageNo);
            
            List<ApplyHomeData> houseInfoList = applyHomeService.getApplyHomeDataByHouseManageNo(houseManageNo);
            
            if (!houseInfoList.isEmpty()) {
                ApplyHomeData houseInfo = houseInfoList.get(0); // 첫 번째 결과 반환
                log.info("주택 정보 조회 성공 - 주택명: {}, 주택관리번호: {}", 
                        houseInfo.getHouseName(), houseInfo.getHouseManageNo());
                return houseInfo;
            } else {
                log.warn("주택 정보를 찾을 수 없음 - 주택관리번호: {}", houseManageNo);
            }
        } catch (Exception e) {
            log.error("주택 정보 조회 중 오류 발생 - 주택관리번호: {}", houseManageNo, e);
        }
        
        return null; // 주택 정보를 찾을 수 없는 경우
    }

}
