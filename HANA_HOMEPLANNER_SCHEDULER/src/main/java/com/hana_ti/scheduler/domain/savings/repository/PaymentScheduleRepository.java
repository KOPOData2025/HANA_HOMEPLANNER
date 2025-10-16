package com.hana_ti.scheduler.domain.savings.repository;

import com.hana_ti.scheduler.domain.savings.entity.PaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, String> {
    /**
     * 계좌별 특정 날짜 이하 납입 스케줄 조회 (PENDING 상태)
     */
    List<PaymentSchedule> findByAccountIdAndDueDateLessThanEqualAndStatus(String accountId, LocalDate dueDate, PaymentSchedule.PaymentStatus status);

    /**
     * 계좌별 특정 날짜 이전 연체 납입 스케줄 조회 (OVERDUE 상태)
     */
    List<PaymentSchedule> findByAccountIdAndDueDateBeforeAndStatus(String accountId, LocalDate dueDate, PaymentSchedule.PaymentStatus status);

    /**
     * 사용자별 계좌별 특정 날짜 이하 납입 스케줄 조회 (PENDING 상태)
     */
    List<PaymentSchedule> findByUserIdAndAccountIdAndDueDateLessThanEqualAndStatus(String userId, String accountId, LocalDate dueDate, PaymentSchedule.PaymentStatus status);

    /**
     * 사용자별 계좌별 특정 날짜 이전 연체 납입 스케줄 조회 (OVERDUE 상태)
     */
    List<PaymentSchedule> findByUserIdAndAccountIdAndDueDateBeforeAndStatus(String userId, String accountId, LocalDate dueDate, PaymentSchedule.PaymentStatus status);
}
