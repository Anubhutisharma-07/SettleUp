package com.settleup.entity;

import java.time.LocalDateTime;

public class ExpenseGroup {
    private Long id;
    private String name;
    private Long createdBy;
    private LocalDateTime createdAt;

    public ExpenseGroup() {
    }

    public ExpenseGroup(Long id, String name, Long createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}