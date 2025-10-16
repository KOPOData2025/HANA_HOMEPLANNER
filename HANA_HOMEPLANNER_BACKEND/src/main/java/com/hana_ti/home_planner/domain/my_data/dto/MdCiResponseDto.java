package com.hana_ti.home_planner.domain.my_data.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MdCiResponseDto {

    private String userId;
    private String userName;
    private String ci;
    private LocalDateTime inquiryTime;
    
    // 계좌 현황
    private List<MdBankAccountResponseDto> bankAccounts;
    private int bankAccountCount;
    
    // 카드 현황
    private List<MdCardResponseDto> cards;
    private int cardCount;
    
    // 대출 현황
    private List<MdBankLoanResponseDto> bankLoans;
    private int bankLoanCount;
    
    private List<MdCardLoanResponseDto> cardLoans;
    private int cardLoanCount;
    
    private List<MdInstallmentLoanResponseDto> installmentLoans;
    private int installmentLoanCount;
    
    private List<MdInsuranceLoanResponseDto> insuranceLoans;
    private int insuranceLoanCount;
    
    // 요약 정보
    private Summary summary;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private int totalAccountCount;
        private int totalCardCount;
        private int totalLoanCount;
        private String totalAssets;
        private String totalLiabilities;
        private String netWorth;
    }

    /**
     * CI 값으로 조회한 마이데이터 응답 생성
     */
    public static MdCiResponseDto create(String userId, String userName, String ci,
                                        List<MdBankAccountResponseDto> bankAccounts,
                                        List<MdCardResponseDto> cards,
                                        List<MdBankLoanResponseDto> bankLoans,
                                        List<MdCardLoanResponseDto> cardLoans,
                                        List<MdInstallmentLoanResponseDto> installmentLoans,
                                        List<MdInsuranceLoanResponseDto> insuranceLoans) {
        
        return MdCiResponseDto.builder()
                .userId(userId)
                .userName(userName)
                .ci(ci)
                .inquiryTime(LocalDateTime.now())
                .bankAccounts(bankAccounts)
                .bankAccountCount(bankAccounts != null ? bankAccounts.size() : 0)
                .cards(cards)
                .cardCount(cards != null ? cards.size() : 0)
                .bankLoans(bankLoans)
                .bankLoanCount(bankLoans != null ? bankLoans.size() : 0)
                .cardLoans(cardLoans)
                .cardLoanCount(cardLoans != null ? cardLoans.size() : 0)
                .installmentLoans(installmentLoans)
                .installmentLoanCount(installmentLoans != null ? installmentLoans.size() : 0)
                .insuranceLoans(insuranceLoans)
                .insuranceLoanCount(insuranceLoans != null ? insuranceLoans.size() : 0)
                .summary(Summary.builder()
                        .totalAccountCount(bankAccounts != null ? bankAccounts.size() : 0)
                        .totalCardCount(cards != null ? cards.size() : 0)
                        .totalLoanCount((bankLoans != null ? bankLoans.size() : 0) +
                                      (cardLoans != null ? cardLoans.size() : 0) +
                                      (installmentLoans != null ? installmentLoans.size() : 0) +
                                      (insuranceLoans != null ? insuranceLoans.size() : 0))
                        .build())
                .build();
    }
}
