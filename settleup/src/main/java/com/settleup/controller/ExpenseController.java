package com.settleup.controller;

import com.settleup.dto.AddExpenseRequest;
import com.settleup.entity.Expense;
import com.settleup.repository.UserRepository;
import com.settleup.security.JwtUtil;
import com.settleup.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseService expenseService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.expenseService = expenseService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"))
                .getId();
    }

    @PostMapping
    public Expense addExpense(@RequestHeader("Authorization") String authHeader,
                              @PathVariable Long groupId,
                              @Valid @RequestBody AddExpenseRequest request) {
        Long userId = getUserIdFromToken(authHeader);
        return expenseService.addExpense(groupId, userId, request.getAmount(), request.getDescription());
    }

    @GetMapping
    public List<Expense> getExpenses(@PathVariable Long groupId) {
        return expenseService.getExpensesForGroup(groupId);
    }
}