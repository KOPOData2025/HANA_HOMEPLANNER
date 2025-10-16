package com.hana_ti.home_planner.domain.financial.entity;

public enum ProductType {
    SAVING("예금/적금"),
    JOINT_SAVING("공동 예금/적금"),
    LOAN("대출"),
    JOINT_LOAN("공동 대출"),
    DEPOSIT("예금"),
    HOUSING_SUBSCRIPTION("주택청약"),
    NORMAL("일반");

    private final String description;

    ProductType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
