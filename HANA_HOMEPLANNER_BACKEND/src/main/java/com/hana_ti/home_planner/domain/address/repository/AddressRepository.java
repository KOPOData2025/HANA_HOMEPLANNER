package com.hana_ti.home_planner.domain.address.repository;

import com.hana_ti.home_planner.domain.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, String> {
}