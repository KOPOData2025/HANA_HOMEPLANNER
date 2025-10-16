package com.hana_ti.home_planner.domain.house.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hana_ti.home_planner.domain.house.dto.SubscriptionCalendarResponseDto;
import com.hana_ti.home_planner.domain.house.dto.SubscriptionInfoDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionCalendarService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${subscription.api.key:52e08cf4d5ad9f8be810229a20c1d618c2ac17c08c9401955f38f658fe678c37}")
    private String apiKey;

    private static final String BASE_URL = "https://api.odcloud" +
            ".kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 청약 캘린더 정보 조회 (오늘부터 한 달 이내 접수 예정)
     */
    public SubscriptionCalendarResponseDto getSubscriptionCalendar(String houseSecd) {
        log.info("청약 캘린더 정보 조회 시작 - 주택구분: {}", houseSecd);

        // 날짜 범위 계산
        LocalDate today = LocalDate.now();
        LocalDate oneMonthAgo = today.minusMonths(1);
        LocalDate startOfWeek = oneMonthAgo.minusDays(oneMonthAgo.getDayOfWeek().getValue() - 1);
        LocalDate oneMonthLater = today.plusMonths(1);

        String searchStartDate = startOfWeek.format(DATE_FORMATTER);
        String searchEndDate = today.format(DATE_FORMATTER);
        String targetPeriod = today.format(DATE_FORMATTER) + " ~ " + oneMonthLater.format(DATE_FORMATTER);

        log.info("검색 기간: {} ~ {}", searchStartDate, searchEndDate);
        log.info("청약 대상 기간: {}", targetPeriod);

        try {
            // API 호출하여 전체 데이터 조회
            List<SubscriptionInfoDto> allData = fetchSubscriptionData(searchStartDate, searchEndDate, houseSecd);
            
            // 오늘부터 한 달 이내 접수 예정 데이터 필터링
            List<SubscriptionInfoDto> filteredData = filterFutureSubscriptions(allData, today, oneMonthLater);

            String searchPeriod = searchStartDate + " ~ " + searchEndDate;
            
            log.info("전체 조회된 데이터: {}건, 필터링된 데이터: {}건", allData.size(), filteredData.size());

            return SubscriptionCalendarResponseDto.of(
                searchPeriod,
                targetPeriod,
                allData.size(),
                filteredData.size(),
                filteredData
            );

        } catch (Exception e) {
            log.error("청약 캘린더 정보 조회 중 오류 발생", e);
            return SubscriptionCalendarResponseDto.of(
                searchStartDate + " ~ " + searchEndDate,
                targetPeriod,
                0,
                0,
                Collections.emptyList()
            );
        }
    }

    /**
     * 외부 API에서 청약 데이터 조회
     * 
     * 청약 기간이 지정된 검색 범위와 겹치는 모든 데이터를 조회합니다.
     * - 청약 시작일 <= 검색종료일
     * - 청약 종료일 >= 검색시작일
     * 
     * @param startDate 검색 시작일 (yyyy-MM-dd)
     * @param endDate 검색 종료일 (yyyy-MM-dd)
     * @param houseSecd 주택구분코드 (선택사항)
     * @return 조회된 청약 정보 리스트
     */
    private List<SubscriptionInfoDto> fetchSubscriptionData(String startDate, String endDate, String houseSecd) {
        List<SubscriptionInfoDto> allData = new ArrayList<>();
        int page = 1;
        int perPage = 100;

        while (true) {
            try {
                Map<String, Object> params = new HashMap<>();
                params.put("page", page);
                params.put("perPage", perPage);
                params.put("serviceKey", apiKey);
                // 청약 기간이 겹치는 데이터 조회 (청약 시작일 <= 검색종료일 AND 청약 종료일 >= 검색시작일)
                params.put("cond[RCEPT_BGNDE::LTE]", endDate);    // 청약 시작일 <= 검색종료일
                params.put("cond[RCEPT_ENDDE::GTE]", startDate);  // 청약 종료일 >= 검색시작일
                
                if (houseSecd != null && !houseSecd.trim().isEmpty()) {
                    params.put("cond[HOUSE_SECD::EQ]", houseSecd);
                }

                // URL 생성
                StringBuilder urlBuilder = new StringBuilder(BASE_URL);
                urlBuilder.append("?");
                
                for (Map.Entry<String, Object> entry : params.entrySet()) {
                    urlBuilder.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
                }
                
                String url = urlBuilder.toString();
                if (url.endsWith("&")) {
                    url = url.substring(0, url.length() - 1);
                }

                log.debug("API 호출 URL: {}", url);

                String response = restTemplate.getForObject(url, String.class);
                log.debug("API 응답: {}", response);
                
                JsonNode jsonNode = objectMapper.readTree(response);
                
                // API 에러 체크
                if (jsonNode.has("code") && jsonNode.get("code").asInt() != 0) {
                    String errorMsg = jsonNode.has("msg") ? jsonNode.get("msg").asText() : "알 수 없는 에러";
                    log.error("API 에러 발생 - 코드: {}, 메시지: {}", jsonNode.get("code").asInt(), errorMsg);
                    throw new RuntimeException("청약홈 API 에러: " + errorMsg);
                }

                if (!jsonNode.has("data")) {
                    log.warn("API 응답에 data 필드가 없습니다: {}", response);
                    break;
                }

                JsonNode dataNode = jsonNode.get("data");
                List<SubscriptionInfoDto> pageData = parseSubscriptionData(dataNode);
                allData.addAll(pageData);

                // 전체 데이터 수 확인
                int totalCount = jsonNode.has("totalCount") ? jsonNode.get("totalCount").asInt() : 0;
                if (page * perPage >= totalCount) {
                    break;
                }
                
                page++;

            } catch (Exception e) {
                log.error("API 호출 중 오류 발생 - 페이지: {}", page, e);
                break;
            }
        }

        return allData;
    }

    /**
     * JSON 데이터를 SubscriptionInfoDto로 변환
     */
    private List<SubscriptionInfoDto> parseSubscriptionData(JsonNode dataNode) {
        List<SubscriptionInfoDto> result = new ArrayList<>();

        if (dataNode.isArray()) {
            for (JsonNode item : dataNode) {
                try {
                    SubscriptionInfoDto dto = SubscriptionInfoDto.of(
                        getJsonValue(item, "HOUSE_SECD"),
                        getJsonValue(item, "HOUSE_DTL_SECD_NM"),
                        getJsonValue(item, "HOUSE_NM"),
                        getJsonValue(item, "RCEPT_BGNDE"),
                        getJsonValue(item, "RCEPT_ENDDE"),
                        getJsonValue(item, "SUBSCRPT_AREA_CODE_NM"),
                        getJsonValue(item, "PBLANC_URL"),
                        getJsonValue(item, "RCRIT_PBLANC_DE"),
                        getJsonValue(item, "PRZWNER_PRESNATN_DE"),
                        getJsonValue(item, "CNTRCT_CNCLS_DE")
                    );
                    result.add(dto);
                } catch (Exception e) {
                    log.warn("데이터 파싱 중 오류 발생", e);
                }
            }
        }

        return result;
    }

    /**
     * JSON에서 안전하게 값 추출
     */
    private String getJsonValue(JsonNode node, String fieldName) {
        return node.has(fieldName) && !node.get(fieldName).isNull() 
            ? node.get(fieldName).asText() 
            : "정보 없음";
    }

    /**
     * 오늘부터 한 달 이내 접수 예정 데이터 필터링
     */
    private List<SubscriptionInfoDto> filterFutureSubscriptions(List<SubscriptionInfoDto> allData, 
                                                              LocalDate today, LocalDate oneMonthLater) {
        return allData.stream()
                .filter(item -> {
                    try {
                        String rceptBgnDe = item.getRceptBgnDe();
                        if ("정보 없음".equals(rceptBgnDe)) {
                            return false;
                        }
                        
                        LocalDate rceptDate = LocalDate.parse(rceptBgnDe, DATE_FORMATTER);
                        return !rceptDate.isBefore(today) && !rceptDate.isAfter(oneMonthLater);
                    } catch (Exception e) {
                        log.warn("날짜 파싱 오류: {}", item.getRceptBgnDe());
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * API 키 유효성 검증
     */
    public boolean validateApiKey() {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("page", 1);
            params.put("perPage", 1);
            params.put("serviceKey", apiKey);
            
            StringBuilder urlBuilder = new StringBuilder(BASE_URL);
            urlBuilder.append("?");
            
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                urlBuilder.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
            }
            
            String url = urlBuilder.toString();
            if (url.endsWith("&")) {
                url = url.substring(0, url.length() - 1);
            }

            log.info("API 키 유효성 검증 URL: {}", url);
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(response);
            
            if (jsonNode.has("code") && jsonNode.get("code").asInt() == 0) {
                log.info("API 키 유효성 검증 성공");
                return true;
            } else {
                String errorMsg = jsonNode.has("msg") ? jsonNode.get("msg").asText() : "알 수 없는 에러";
                log.error("API 키 유효성 검증 실패 - 코드: {}, 메시지: {}", 
                    jsonNode.has("code") ? jsonNode.get("code").asInt() : "N/A", errorMsg);
                return false;
            }
            
        } catch (Exception e) {
            log.error("API 키 유효성 검증 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 입력받은 날짜 범위 내 청약 정보 조회
     * 
     * 지정된 기간과 청약 기간이 겹치는 모든 데이터를 조회합니다.
     * 예: 8월 1일~31일 검색 시, 7월 25일~8월 15일 청약도 포함됩니다.
     * 
     * @param startDate 검색 시작일 (yyyy-MM-dd)
     * @param endDate 검색 종료일 (yyyy-MM-dd)
     * @return 청약 캘린더 응답 DTO
     */
    public SubscriptionCalendarResponseDto getSubscriptionByDateRange(String startDate, String endDate) {
        log.info("날짜 범위 청약 정보 조회 시작 - 시작일: {}, 종료일: {}", startDate, endDate);

        try {
            // 날짜 형식 검증
            LocalDate.parse(startDate, DATE_FORMATTER);
            LocalDate.parse(endDate, DATE_FORMATTER);
            
            // API 호출하여 전체 데이터 조회 (필터링 없이)
            List<SubscriptionInfoDto> allData = fetchSubscriptionData(startDate, endDate, null);
            
            String searchPeriod = startDate + " ~ " + endDate;
            
            log.info("날짜 범위 조회된 전체 데이터: {}건", allData.size());

            return SubscriptionCalendarResponseDto.of(
                searchPeriod,
                searchPeriod, // 타겟 기간도 동일하게 설정
                allData.size(),
                allData.size(), // 필터링하지 않으므로 동일
                allData
            );

        } catch (Exception e) {
            log.error("날짜 범위 청약 정보 조회 중 오류 발생", e);
            return SubscriptionCalendarResponseDto.of(
                startDate + " ~ " + endDate,
                startDate + " ~ " + endDate,
                0,
                0,
                Collections.emptyList()
            );
        }
    }
}