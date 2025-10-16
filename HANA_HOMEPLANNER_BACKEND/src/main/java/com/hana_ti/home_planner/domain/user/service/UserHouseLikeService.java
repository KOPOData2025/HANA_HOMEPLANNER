package com.hana_ti.home_planner.domain.user.service;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import com.hana_ti.home_planner.domain.applyhome.service.ApplyHomeService;
import com.hana_ti.home_planner.domain.user.dto.HouseLikeRequestDto;
import com.hana_ti.home_planner.domain.user.dto.HouseLikeResponseDto;
import com.hana_ti.home_planner.domain.user.entity.UserHouseLike;
import com.hana_ti.home_planner.domain.user.repository.UserHouseLikeRepository;
import com.hana_ti.home_planner.global.exception.ResourceNotFoundException;
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
public class UserHouseLikeService {
    
    private final UserHouseLikeRepository userHouseLikeRepository;
    private final ApplyHomeService applyHomeService;
    
    /**
     * 주택 찜하기
     */
    public HouseLikeResponseDto addHouseLike(String userId, HouseLikeRequestDto request) {
        log.info("주택 찜하기 요청 - 사용자: {}, 주택관리번호: {}", userId, request.getHouseManageNo());
        
        // 이미 찜한 주택인지 확인
        if (userHouseLikeRepository.existsByUserIdAndHouseManageNo(userId, request.getHouseManageNo())) {
            log.warn("이미 찜한 주택입니다 - 사용자: {}, 주택관리번호: {}", userId, request.getHouseManageNo());
            throw new IllegalArgumentException("이미 찜한 주택입니다.");
        }
        
        // 찜하기 저장
        UserHouseLike userHouseLike = UserHouseLike.builder()
                .userId(userId)
                .houseManageNo(request.getHouseManageNo())
                .build();
        
        UserHouseLike savedLike = userHouseLikeRepository.save(userHouseLike);
        
        log.info("주택 찜하기 완료 - ID: {}, 사용자: {}, 주택관리번호: {}", 
                savedLike.getLikeId(), userId, request.getHouseManageNo());
        
        return HouseLikeResponseDto.builder()
                .likeId(savedLike.getLikeId())
                .userId(savedLike.getUserId())
                .houseManageNo(savedLike.getHouseManageNo())
                .likedAt(savedLike.getLikedAt())
                .isLiked(true)
                .build();
    }
    
    /**
     * 주택 찜해제
     */
    public void removeHouseLike(String userId, String houseManageNo) {
        log.info("주택 찜해제 요청 - 사용자: {}, 주택관리번호: {}", userId, houseManageNo);
        
        // 찜한 주택이 존재하는지 확인
        if (!userHouseLikeRepository.existsByUserIdAndHouseManageNo(userId, houseManageNo)) {
            log.warn("찜하지 않은 주택입니다 - 사용자: {}, 주택관리번호: {}", userId, houseManageNo);
            throw new ResourceNotFoundException("찜한 주택", "주택관리번호", houseManageNo);
        }
        
        // 찜해제
        userHouseLikeRepository.deleteByUserIdAndHouseManageNo(userId, houseManageNo);
        
        log.info("주택 찜해제 완료 - 사용자: {}, 주택관리번호: {}", userId, houseManageNo);
    }
    
    /**
     * 사용자의 찜한 주택 목록 조회
     */
    @Transactional(readOnly = true)
    public List<HouseLikeResponseDto> getUserHouseLikes(String userId) {
        log.info("사용자 찜한 주택 목록 조회 - 사용자: {}", userId);
        
        List<UserHouseLike> likes = userHouseLikeRepository.findByUserIdOrderByLikedAtDesc(userId);
        
        return likes.stream()
                .map(like -> {
                    // 주택 상세 정보 조회 (MongoDB ApplyHomeData 사용)
                    ApplyHomeData houseInfo = getHouseInfoByManageNo(like.getHouseManageNo());
                    
                    return HouseLikeResponseDto.builder()
                            .likeId(like.getLikeId())
                            .userId(like.getUserId())
                            .houseManageNo(like.getHouseManageNo())
                            .likedAt(like.getLikedAt())
                            .isLiked(true)
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
