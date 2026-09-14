package com.settleup.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Expense {
    private Long id;
    private Long groupId;
    private Long paidBy;
    private BigDecimal amount;
    private String description;
    private LocalDateTime expenseDate;

    public Expense() {
    }

    public Expense(Long id, Long groupId, Long paidBy, BigDecimal amount, String description, LocalDateTime expenseDate) {
        this.id = id;
        this.groupId = groupId;
        this.paidBy = paidBy;
        this.amount = amount;
        this.description = description;
        this.expenseDate = expenseDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public Long getPaidBy() { return paidBy; }
    public void setPaidBy(Long paidBy) { this.paidBy = paidBy; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDateTime expenseDate) { this.expenseDate = expenseDate; }
}