package com.hana_ti.home_planner.domain.applyhome.service;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeJson;
import com.hana_ti.home_planner.domain.applyhome.repository.ApplyHomeDataRepository;
import com.hana_ti.home_planner.domain.applyhome.repository.ApplyHomeJsonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class ApplyHomeService {

    private final ApplyHomeJsonRepository applyHomeJsonRepository;
    private final ApplyHomeDataRepository applyHomeDataRepository;

    /**
     * ID로 ApplyHomeJson 데이터 조회
     */
    public Optional<ApplyHomeJson> getApplyHomeJsonById(String id) {
        log.info("ID로 ApplyHomeJson 데이터 조회 - ID: {}", id);
        
        Optional<ApplyHomeJson> result = applyHomeJsonRepository.findById(id);
        
        if (result.isPresent()) {
            log.info("ID별 ApplyHomeJson 조회 완료 - ID: {}", id);
        } else {
            log.warn("ID별 ApplyHomeJson 조회 실패 - ID: {} (데이터 없음)", id);
        }
        return result;
    }

    /**
     * 모든 ApplyHomeJson 데이터 조회
     */
    public List<ApplyHomeJson> getAllApplyHomeJson() {
        log.info("모든 ApplyHomeJson 데이터 조회 시작");
        
        List<ApplyHomeJson> result = applyHomeJsonRepository.findAll();
        
        log.info("ApplyHomeJson 데이터 조회 완료 - 총 {}건", result.size());
        return result;
    }

    /**
     * 모든 ApplyHomeData 데이터 조회
     */
    public List<ApplyHomeData> getAllApplyHomeData() {
        log.info("모든 ApplyHomeData 데이터 조회 시작");
        
        List<ApplyHomeData> result = applyHomeDataRepository.findAll();
        
        log.info("ApplyHomeData 데이터 조회 완료 - 총 {}건", result.size());
        return result;
    }

    /**
     * ID로 ApplyHomeData 데이터 조회
     */
    public Optional<ApplyHomeData> getApplyHomeDataById(String id) {
        log.info("ID로 ApplyHomeData 데이터 조회 - ID: {}", id);
        
        Optional<ApplyHomeData> result = applyHomeDataRepository.findById(id);
        
        if (result.isPresent()) {
            log.info("ID별 ApplyHomeData 조회 완료 - ID: {}", id);
        } else {
            log.warn("ID별 ApplyHomeData 조회 실패 - ID: {} (데이터 없음)", id);
        }
        return result;
    }

    /**
     * 주택관리번호로 ApplyHomeData 조회
     */
    public List<ApplyHomeData> getApplyHomeDataByHouseManageNo(String houseManageNo) {
        log.info("주택관리번호로 ApplyHomeData 조회 - 관리번호: {}", houseManageNo);
        
        List<ApplyHomeData> result = applyHomeDataRepository.findByHouseManageNo(houseManageNo);
        
        log.info("주택관리번호별 ApplyHomeData 조회 완료 - 관리번호: {}, 건수: {}", houseManageNo, result.size());
        return result;
    }

}
