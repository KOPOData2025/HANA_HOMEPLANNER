package com.hana_ti.home_planner.domain.savings.entity;

public enum PaymentMethod {
    자유적립식("자유롭게 적립하는 방식"),
    정기적립식("정기적으로 적립하는 방식"),
    거치식("거치식 적립 방식");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
