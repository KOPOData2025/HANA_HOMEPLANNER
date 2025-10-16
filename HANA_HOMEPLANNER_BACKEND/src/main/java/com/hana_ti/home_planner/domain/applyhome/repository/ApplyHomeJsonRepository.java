package com.hana_ti.home_planner.domain.applyhome.repository;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeJson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplyHomeJsonRepository extends MongoRepository<ApplyHomeJson, String> {
}
