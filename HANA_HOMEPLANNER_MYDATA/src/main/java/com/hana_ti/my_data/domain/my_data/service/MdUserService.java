package com.hana_ti.my_data.domain.my_data.service;

import com.hana_ti.my_data.domain.my_data.dto.MdUserResponseDto;
import com.hana_ti.my_data.domain.my_data.entity.MdUser;
import com.hana_ti.my_data.domain.my_data.repository.MdUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MdUserService {

    private final MdUserRepository mdUserRepository;

    /**
     * resNum으로 사용자 조회
     * @param resNum 마이데이터 CI (resNum)
     * @return 사용자 정보
     */
    public MdUserResponseDto getUserByResNum(String resNum) {
        log.info("resNum으로 사용자 조회 요청: {}", resNum);
        
        MdUser mdUser = mdUserRepository.findByCi(resNum)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + resNum));
        
        MdUserResponseDto userDto = MdUserResponseDto.from(mdUser);
        
        log.info("사용자 조회 완료: userId={}, name={}", mdUser.getUserId(), mdUser.getName());
        return userDto;
    }

    /**
     * 모든 사용자 조회 (디버깅용)
     * @return 모든 사용자 목록
     */
    public List<MdUserResponseDto> getAllUsers() {
        log.info("모든 사용자 조회 요청");
        
        List<MdUser> users = mdUserRepository.findAll();
        List<MdUserResponseDto> userDtos = users.stream()
                .map(MdUserResponseDto::from)
                .toList();
        
        log.info("모든 사용자 조회 완료: {}건", userDtos.size());
        return userDtos;
    }
}
