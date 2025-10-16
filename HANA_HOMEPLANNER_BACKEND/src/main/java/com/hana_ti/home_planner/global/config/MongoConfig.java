package com.hana_ti.home_planner.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;


@Configuration
@EnableMongoRepositories(basePackages = "com.hana_ti.home_planner.domain.applyhome.repository")
public class MongoConfig {
}
