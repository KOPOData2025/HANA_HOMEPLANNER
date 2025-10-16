package com.hana_ti.home_planner.domain.savings.repository;

import com.hana_ti.home_planner.domain.savings.entity.PaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, String> {

    /**
     * 계좌별 납입 스케줄 조회
     */
    List<PaymentSchedule> findByAccountIdOrderByDueDateAsc(String accountId);

   }
