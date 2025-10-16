package com.hana_ti.home_planner.domain.my_data.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hana_ti.home_planner.domain.my_data.dto.external.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalMyDataService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${external.my-data.server.url}")
    private String externalServerUrl;

    /**
     * resNum으로 사용자 정보 조회
     */
    public ExternalUserResponseDto getUserByResNum(String resNum) {
        log.info("외부 서버에서 사용자 정보 조회 시작 - resNum: {}", resNum);
        
        try {
            String url = externalServerUrl + "/api/my-data/users?resNum=" + resNum;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<ExternalUserResponseDto> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<ExternalUserResponseDto>>() {});
                
                if (apiResponse.isSuccess()) {
                    ExternalUserResponseDto user = apiResponse.getData();
                    log.info("외부 서버에서 사용자 정보 조회 완료 - userId: {}, name: {}", 
                            user.getUserId(), user.getName());
                    return user;
                } else {
                    log.error("외부 서버에서 사용자 정보 조회 실패 - resNum: {}", resNum);
                    throw new RuntimeException("외부 서버에서 사용자 정보를 찾을 수 없습니다: " + resNum);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 사용자 정보 조회 중 오류 발생 - resNum: {}", resNum, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * userId로 거래내역 조회
     */
    public List<ExternalBankTransactionResponseDto> getBankTransactionsByUserId(Long userId) {
        log.info("외부 서버에서 거래내역 조회 시작 - userId: {}", userId);
        
        try {
            String url = externalServerUrl + "/api/my-data/bank-transactions/by-user?userId=" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalBankTransactionResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalBankTransactionResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalBankTransactionResponseDto> transactions = apiResponse.getData();
                    log.info("외부 서버에서 거래내역 조회 완료 - 거래 건수: {}", transactions.size());
                    return transactions;
                } else {
                    log.error("외부 서버에서 거래내역 조회 실패 - userId: {}", userId);
                    throw new RuntimeException("외부 서버에서 거래내역을 찾을 수 없습니다: " + userId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 거래내역 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * userId로 은행 계좌 조회
     */
    public List<ExternalBankAccountResponseDto> getBankAccountsByUserId(Long userId) {
        log.info("외부 서버에서 은행 계좌 조회 시작 - userId: {}", userId);
        
        try {
            String url = externalServerUrl + "/api/my-data/bank-accounts/by-user?userId=" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalBankAccountResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalBankAccountResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalBankAccountResponseDto> accounts = apiResponse.getData();
                    log.info("외부 서버에서 은행 계좌 조회 완료 - 계좌 수: {}", accounts.size());
                    return accounts;
                } else {
                    log.error("외부 서버에서 은행 계좌 조회 실패 - userId: {}", userId);
                    throw new RuntimeException("외부 서버에서 은행 계좌를 찾을 수 없습니다: " + userId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 은행 계좌 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * userId로 은행 대출 조회
     */
    public List<ExternalBankLoanResponseDto> getBankLoansByUserId(Long userId) {
        log.info("외부 서버에서 은행 대출 조회 시작 - userId: {}", userId);
        
        try {
            String url = externalServerUrl + "/api/my-data/bank-loans/by-user?userId=" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalBankLoanResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalBankLoanResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalBankLoanResponseDto> loans = apiResponse.getData();
                    log.info("외부 서버에서 은행 대출 조회 완료 - 대출 수: {}", loans.size());
                    return loans;
                } else {
                    log.error("외부 서버에서 은행 대출 조회 실패 - userId: {}", userId);
                    throw new RuntimeException("외부 서버에서 은행 대출을 찾을 수 없습니다: " + userId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 은행 대출 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * userId로 카드 조회
     */
    public List<ExternalCardResponseDto> getCardsByUserId(Long userId) {
        log.info("외부 서버에서 카드 조회 시작 - userId: {}", userId);
        
        try {
            String url = externalServerUrl + "/api/my-data/cards/by-user?userId=" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalCardResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalCardResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalCardResponseDto> cards = apiResponse.getData();
                    log.info("외부 서버에서 카드 조회 완료 - 카드 수: {}", cards.size());
                    return cards;
                } else {
                    log.error("외부 서버에서 카드 조회 실패 - userId: {}", userId);
                    throw new RuntimeException("외부 서버에서 카드를 찾을 수 없습니다: " + userId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 카드 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * cardId로 카드 대출 조회
     */
    public List<ExternalCardLoanResponseDto> getCardLoansByCardId(Long cardId) {
        log.info("외부 서버에서 카드 대출 조회 시작 - cardId: {}", cardId);
        
        try {
            String url = externalServerUrl + "/api/my-data/card-loans?cardId=" + cardId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalCardLoanResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalCardLoanResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalCardLoanResponseDto> loans = apiResponse.getData();
                    log.info("외부 서버에서 카드 대출 조회 완료 - 대출 수: {}", loans.size());
                    return loans;
                } else {
                    log.error("외부 서버에서 카드 대출 조회 실패 - cardId: {}", cardId);
                    throw new RuntimeException("외부 서버에서 카드 대출을 찾을 수 없습니다: " + cardId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 카드 대출 조회 중 오류 발생 - cardId: {}", cardId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * userId로 할부 대출 조회
     */
    public List<ExternalInstallmentLoanResponseDto> getInstallmentLoansByUserId(Long userId) {
        log.info("외부 서버에서 할부 대출 조회 시작 - userId: {}", userId);
        
        try {
            String url = externalServerUrl + "/api/my-data/installment-loans?userId=" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalInstallmentLoanResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalInstallmentLoanResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalInstallmentLoanResponseDto> loans = apiResponse.getData();
                    log.info("외부 서버에서 할부 대출 조회 완료 - 대출 수: {}", loans.size());
                    return loans;
                } else {
                    log.error("외부 서버에서 할부 대출 조회 실패 - userId: {}", userId);
                    throw new RuntimeException("외부 서버에서 할부 대출을 찾을 수 없습니다: " + userId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 할부 대출 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * CI 값으로 사용자 정보 조회
     */
    public ExternalUserResponseDto getUserByCi(String ci) {
        log.info("외부 서버에서 CI 값으로 사용자 정보 조회 시작 - CI: {}", ci);
        
        try {
            String url = externalServerUrl + "/api/my-data/users?resNum" + ci;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<ExternalUserResponseDto> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<ExternalUserResponseDto>>() {});
                
                if (apiResponse.isSuccess()) {
                    ExternalUserResponseDto user = apiResponse.getData();
                    log.info("외부 서버에서 CI 값으로 사용자 정보 조회 완료 - userId: {}, name: {}", 
                            user.getUserId(), user.getName());
                    return user;
                } else {
                    log.error("외부 서버에서 CI 값으로 사용자 정보 조회 실패 - CI: {}", ci);
                    throw new RuntimeException("외부 서버에서 CI 값으로 사용자 정보를 찾을 수 없습니다: " + ci);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 CI 값으로 사용자 정보 조회 중 오류 발생 - CI: {}", ci, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }

    /**
     * userId로 보험 대출 조회
     */
    public List<ExternalInsuranceLoanResponseDto> getInsuranceLoansByUserId(Long userId) {
        log.info("외부 서버에서 보험 대출 조회 시작 - userId: {}", userId);
        
        try {
            String url = externalServerUrl + "/api/my-data/insurance-loans?userId=" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                String.class
            );
            
            if (response.getBody() != null) {
                ExternalApiResponseDto<List<ExternalInsuranceLoanResponseDto>> apiResponse = 
                    objectMapper.readValue(response.getBody(), new TypeReference<ExternalApiResponseDto<List<ExternalInsuranceLoanResponseDto>>>() {});
                
                if (apiResponse.isSuccess()) {
                    List<ExternalInsuranceLoanResponseDto> loans = apiResponse.getData();
                    log.info("외부 서버에서 보험 대출 조회 완료 - 대출 수: {}", loans.size());
                    return loans;
                } else {
                    log.error("외부 서버에서 보험 대출 조회 실패 - userId: {}", userId);
                    throw new RuntimeException("외부 서버에서 보험 대출을 찾을 수 없습니다: " + userId);
                }
            } else {
                throw new RuntimeException("외부 서버 응답이 비어있습니다.");
            }
            
        } catch (Exception e) {
            log.error("외부 서버 보험 대출 조회 중 오류 발생 - userId: {}", userId, e);
            throw new RuntimeException("외부 서버 호출 실패: " + e.getMessage());
        }
    }
}
