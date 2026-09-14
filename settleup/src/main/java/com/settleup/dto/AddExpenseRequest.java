package com.settleup.dto;

import java.math.BigDecimal;

public class AddExpenseRequest {
    private BigDecimal amount;
    private String description;

    public AddExpenseRequest() {
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}