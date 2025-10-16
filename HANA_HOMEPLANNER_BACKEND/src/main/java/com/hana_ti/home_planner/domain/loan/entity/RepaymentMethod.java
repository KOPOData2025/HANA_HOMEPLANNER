package com.hana_ti.home_planner.domain.loan.entity;

public enum RepaymentMethod {
    EQUAL_INSTALLMENT("원리금균등상환"),
    EQUAL_PRINCIPAL("원금균등상환"),
    INTEREST_ONLY("만기일시상환"),
    BALLOON("풍선상환");

    private final String description;

    RepaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
