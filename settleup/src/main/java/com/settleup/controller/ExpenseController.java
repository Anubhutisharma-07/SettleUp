package com.settleup.controller;

import com.settleup.dto.AddExpenseRequest;
import com.settleup.entity.Expense;
import com.settleup.exception.ForbiddenException;
import com.settleup.repository.ExpenseGroupRepository;
import com.settleup.repository.UserRepository;
import com.settleup.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;
    private final ExpenseGroupRepository expenseGroupRepository;

    public ExpenseController(ExpenseService expenseService,
                             UserRepository userRepository,
                             ExpenseGroupRepository expenseGroupRepository) {
        this.expenseService = expenseService;
        this.userRepository = userRepository;
        this.expenseGroupRepository = expenseGroupRepository;
    }

    // Authorization check: the logged-in user (from the verified JWT) must belong
    // to this group. Returns the user's id so callers don't look it up twice.
    private Long requireMember(Authentication authentication, Long groupId) {
        Long userId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ForbiddenException("Access denied."))
                .getId();

        if (!expenseGroupRepository.isMember(groupId, userId)) {
            throw new ForbiddenException("You are not a member of this group.");
        }
        return userId;
    }

    @PostMapping
    public Expense addExpense(Authentication authentication,
                              @PathVariable Long groupId,
                              @Valid @RequestBody AddExpenseRequest request) {
        Long userId = requireMember(authentication, groupId);
        return expenseService.addExpense(groupId, userId, request.getAmount(), request.getDescription());
    }

    @GetMapping
    public List<Expense> getExpenses(Authentication authentication, @PathVariable Long groupId) {
        requireMember(authentication, groupId);
        return expenseService.getExpensesForGroup(groupId);
    }
}