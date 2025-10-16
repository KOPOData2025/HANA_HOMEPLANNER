package com.hana_ti.home_planner.domain.house.repository;

import com.hana_ti.home_planner.domain.house.entity.AvgHomePrice;
import com.hana_ti.home_planner.domain.house.entity.AvgHomePriceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvgHomePriceRepository extends JpaRepository<AvgHomePrice, AvgHomePriceId> {

}