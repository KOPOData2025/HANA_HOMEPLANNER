package com.hana_ti.home_planner.domain.my_data.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MD_BANK_ACCOUNT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MdBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACCOUNT_ID")
    private Long accountId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ORG_CODE", length = 10, nullable = false)
    private String orgCode;

    @Column(name = "ACCOUNT_NUM", length = 50, nullable = false)
    private String accountNum;

    @Column(name = "ACCOUNT_TYPE", length = 20)
    private String accountType;

    @Column(name = "ACCOUNT_NAME", length = 200)
    private String accountName;

    @Column(name = "BALANCE_AMT", precision = 18, scale = 2)
    private BigDecimal balanceAmt;

    @Column(name = "STATUS", length = 10)
    private String status;

    @Column(name = "OPENED_DATE")
    private LocalDate openedDate;

    @Column(name = "CONSENT_YN", length = 1, nullable = false)
    private String consentYn;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Builder
    public MdBankAccount(Long userId, String orgCode, String accountNum, String accountType, 
                        String accountName, BigDecimal balanceAmt, String status, 
                        LocalDate openedDate, String consentYn) {
        this.userId = userId;
        this.orgCode = orgCode;
        this.accountNum = accountNum;
        this.accountType = accountType;
        this.accountName = accountName;
        this.balanceAmt = balanceAmt;
        this.status = status;
        this.openedDate = openedDate;
        this.consentYn = consentYn != null ? consentYn : "Y";
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 카드 기본정보 엔티티
     * MD_CARD 테이블과 매핑됩니다.
     */
    @Entity
    @Table(name = "MD_CARD")
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class MdCard {

        @Id
        @Column(name = "CARD_ID")
        private Long cardId;

        @Column(name = "USER_ID", nullable = false)
        private Long userId;

        @Column(name = "ORG_CODE", length = 10, nullable = false)
        private String orgCode;

        @Column(name = "CARD_NUM", length = 50, nullable = false)
        private String cardNum;

        @Column(name = "CARD_NAME", length = 200)
        private String cardName;

        @Column(name = "CARD_TYPE", length = 20)
        private String cardType;

        @Column(name = "CREATED_AT")
        private LocalDateTime createdAt;
    }
}
