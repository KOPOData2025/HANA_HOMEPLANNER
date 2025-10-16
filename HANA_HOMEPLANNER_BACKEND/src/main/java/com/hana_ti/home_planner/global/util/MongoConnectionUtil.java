package com.hana_ti.home_planner.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class MongoConnectionUtil {

    @Value("${mongodb.database}")
    private String databaseName;

    @Value("${mongodb.collections.applyhome_json}")
    private String applyHomeJsonCollection;

    @Value("${mongodb.collections.applyhome_data}")
    private String applyHomeDataCollection;

    /**
     * 데이터베이스 이름 반환
     */
    public String getDatabaseName() {
        return databaseName;
    }

    /**
     * ApplyHome JSON 컬렉션 이름 반환
     */
    public String getApplyHomeJsonCollection() {
        return applyHomeJsonCollection;
    }

    /**
     * ApplyHome Data 컬렉션 이름 반환
     */
    public String getApplyHomeDataCollection() {
        return applyHomeDataCollection;
    }

    /**
     * MongoDB 연결 상태 로깅
     */
    public void logConnectionInfo() {
        log.info("MongoDB 연결 정보:");
        log.info("- 데이터베이스: {}", databaseName);
        log.info("- ApplyHome JSON 컬렉션: {}", applyHomeJsonCollection);
        log.info("- ApplyHome Data 컬렉션: {}", applyHomeDataCollection);
    }
}
