package com.hana_ti.home_planner.domain.bank.entity;

public enum BankStatus {
    ACTIVE("활성"),
    INACTIVE("비활성"),
    SUSPENDED("중단");

    private final String description;

    BankStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
