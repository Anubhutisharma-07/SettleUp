package com.settleup.entity;

import java.math.BigDecimal;

public class ExpenseSplit {
    private Long id;
    private Long expenseId;
    private Long userId;
    private BigDecimal amountOwed;

    public ExpenseSplit() {
    }

    public ExpenseSplit(Long id, Long expenseId, Long userId, BigDecimal amountOwed) {
        this.id = id;
        this.expenseId = expenseId;
        this.userId = userId;
        this.amountOwed = amountOwed;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getExpenseId() { return expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getAmountOwed() { return amountOwed; }
    public void setAmountOwed(BigDecimal amountOwed) { this.amountOwed = amountOwed; }
}