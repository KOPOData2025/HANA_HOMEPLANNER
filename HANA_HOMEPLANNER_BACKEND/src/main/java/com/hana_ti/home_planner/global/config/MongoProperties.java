package com.hana_ti.home_planner.global.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * MongoDB 설정 프로퍼티 클래스
 * application.yml의 mongodb 설정을 바인딩
 */
@Data
@Component
@ConfigurationProperties(prefix = "mongodb")
public class MongoProperties {

    private String uri;
    private String database;
    private Collections collections = new Collections();

    @Data
    public static class Collections {
        private String applyhomeJson;
        private String applyhomeData;
    }
}
