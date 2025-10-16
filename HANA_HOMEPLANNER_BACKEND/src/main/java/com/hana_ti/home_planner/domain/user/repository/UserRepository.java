package com.hana_ti.home_planner.domain.user.repository;

import com.hana_ti.home_planner.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    
    boolean existsByPhnNum(String phnNum);

    boolean existsByResNum(String resNum);

       Optional<User> findByRefreshToken(String refreshToken);
}