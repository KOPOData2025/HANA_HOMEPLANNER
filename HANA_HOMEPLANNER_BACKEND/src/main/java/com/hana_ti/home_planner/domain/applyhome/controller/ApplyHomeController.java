package com.hana_ti.home_planner.domain.applyhome.controller;

import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeJson;
import com.hana_ti.home_planner.domain.applyhome.service.ApplyHomeService;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applyhome")
@RequiredArgsConstructor
@Slf4j
public class ApplyHomeController {

    private final ApplyHomeService applyHomeService;

    /**
     * ID로 ApplyHomeJson 데이터 조회
     */
    @GetMapping("/json/{id}")
    public ResponseEntity<ApiResponse<ApplyHomeJson>> getApplyHomeJsonById(@PathVariable String id) {
        log.info("ID로 ApplyHomeJson 조회 API 호출 - ID: {}", id);

        try {
            Optional<ApplyHomeJson> result = applyHomeService.getApplyHomeJsonById(id);
            
            if (result.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("ID별 ApplyHomeJson 데이터를 조회했습니다.", result.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("ID별 ApplyHomeJson 조회 실패 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("데이터 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 모든 ApplyHomeJson 데이터 조회
     */
    @GetMapping("/json/all")
    public ResponseEntity<ApiResponse<List<ApplyHomeJson>>> getAllApplyHomeJson() {
        log.info("모든 ApplyHomeJson 데이터 조회 API 호출");

        try {
            List<ApplyHomeJson> result = applyHomeService.getAllApplyHomeJson();
            return ResponseEntity.ok(ApiResponse.success("ApplyHomeJson 데이터를 조회했습니다.", result));
        } catch (Exception e) {
            log.error("ApplyHomeJson 데이터 조회 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("데이터 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 모든 ApplyHomeData 데이터 조회
     */
    @GetMapping("/data/all")
    public ResponseEntity<ApiResponse<List<ApplyHomeData>>> getAllApplyHomeData() {
        log.info("모든 ApplyHomeData 데이터 조회 API 호출");

        try {
            List<ApplyHomeData> result = applyHomeService.getAllApplyHomeData();
            return ResponseEntity.ok(ApiResponse.success("ApplyHomeData 데이터를 조회했습니다.", result));
        } catch (Exception e) {
            log.error("ApplyHomeData 데이터 조회 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("데이터 조회에 실패했습니다: " + e.getMessage()));
        }
    }


}
