package com.hana_ti.home_planner.domain.applyhome.repository;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplyHomeDataRepository extends MongoRepository<ApplyHomeData, String> {

    /**
     * 주택관리번호로 청약홈 데이터 조회
     */
    List<ApplyHomeData> findByHouseManageNo(String houseManageNo);
}
