package com.hana_ti.home_planner.domain.loan.entity;

public enum InterestRateType {
    FIXED("고정금리"),
    VARIABLE("변동금리"),
    MIXED("혼합금리");

    private final String description;

    InterestRateType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
