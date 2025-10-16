package com.hana_ti.scheduler.domain.loan.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "LOAN_CONTRACT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoanContract {

    @Id
    @Column(name = "LOAN_ID", length = 36, nullable = false)
    private String loanId;

    @Column(name = "APP_ID", length = 36, nullable = false)
    private String appId;

    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "PROD_ID", length = 36, nullable = false)
    private String productId;

    @Column(name = "LOAN_AMOUNT", precision = 18, scale = 2, nullable = false)
    private BigDecimal loanAmount;

    @Column(name = "INTEREST_RATE", precision = 5, scale = 2, nullable = false)
    private BigDecimal interestRate;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "REPAY_TYPE", length = 20, nullable = false)
    private RepaymentType repayType;

    @Column(name = "DISBURSE_ACCOUNT_ID", length = 36, nullable = false)
    private String disburseAccountId;

    @Column(name = "LOAN_ACCOUNT_ID", length = 36, nullable = false)
    private String loanAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private ContractStatus status;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    public static LoanContract create(String loanId, String appId, String userId, String productId,
                                    BigDecimal loanAmount, BigDecimal interestRate,
                                    LocalDate startDate, LocalDate endDate,
                                    RepaymentType repayType, String disburseAccountId, String loanAccountId) {
        LoanContract contract = new LoanContract();
        contract.loanId = loanId;
        contract.appId = appId;
        contract.userId = userId;
        contract.productId = productId;
        contract.loanAmount = loanAmount;
        contract.interestRate = interestRate;
        contract.startDate = startDate;
        contract.endDate = endDate;
        contract.repayType = repayType;
        contract.disburseAccountId = disburseAccountId;
        contract.loanAccountId = loanAccountId;
        contract.status = ContractStatus.ACTIVE;
        contract.createdAt = LocalDateTime.now();
        return contract;
    }

    public void updateStatus(ContractStatus newStatus) {
        this.status = newStatus;
    }

    public void updateInterestRate(BigDecimal newInterestRate) {
        this.interestRate = newInterestRate;
    }

    public enum RepaymentType {
        EQ_PRINCIPAL("원금균등상환"),
        EQ_INSTALLMENT("원리금균등상환"),
        BULLET("만기일시상환");

        private final String description;

        RepaymentType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum ContractStatus {
        ACTIVE("활성"),
        DISBURSED("실행완료"),
        COMPLETED("완료"),
        DEFAULT("연체"),
        CANCELLED("취소");

        private final String description;

        ContractStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
