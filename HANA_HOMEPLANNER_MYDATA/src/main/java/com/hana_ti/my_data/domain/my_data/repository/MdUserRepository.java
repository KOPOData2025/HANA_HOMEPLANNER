package com.hana_ti.my_data.domain.my_data.repository;

import com.hana_ti.my_data.domain.my_data.entity.MdUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MdUserRepository extends JpaRepository<MdUser, Long> {

    /**
     * CI 값으로 사용자 조회
     * @param ci 마이데이터 CI
     * @return 사용자 정보 (Optional)
     */
    Optional<MdUser> findByCi(String ci);

    /**
     * 모든 사용자 조회 (디버깅용)
     * @return 모든 사용자 목록
     */
    List<MdUser> findAll();
}
