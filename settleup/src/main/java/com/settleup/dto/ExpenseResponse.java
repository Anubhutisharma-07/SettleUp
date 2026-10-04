package com.settleup.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ExpenseResponse(Long id, Long groupId, Long paidBy, String paidByName,
                              BigDecimal amount, String description, LocalDateTime expenseDate) {
}