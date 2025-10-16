package com.hana_ti.home_planner.domain.loan.entity;

public enum LoanType {
    MORTGAGE("주택담보대출"),
    PERSONAL("개인신용대출"),
    BUSINESS("사업자대출"),
    AUTO("자동차대출"),
    STUDENT("학자금대출");

    private final String description;

    LoanType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
