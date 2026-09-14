package com.settleup.service;

import com.settleup.entity.Expense;
import com.settleup.entity.ExpenseSplit;
import com.settleup.repository.ExpenseRepository;
import com.settleup.repository.GroupMemberRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository memberRepository;

    public ExpenseService(ExpenseRepository expenseRepository, GroupMemberRepository memberRepository) {
        this.expenseRepository = expenseRepository;
        this.memberRepository = memberRepository;
    }

    /**
     * Adds an expense to a group and splits it EQUALLY among all current group members.
     * Only a group member can add an expense.
     */
    public Expense addExpense(Long groupId, Long paidByUserId, BigDecimal amount, String description) {
        if (!memberRepository.isMember(groupId, paidByUserId)) {
            throw new IllegalStateException("Only group members can add expenses");
        }

        Expense expense = new Expense();
        expense.setGroupId(groupId);
        expense.setPaidBy(paidByUserId);
        expense.setAmount(amount);
        expense.setDescription(description);
        expense.setExpenseDate(LocalDateTime.now());

        Long expenseId = expenseRepository.saveExpense(expense);
        expense.setId(expenseId);

        // Split equally among all current members of the group
        List<Long> memberUserIds = memberRepository.findByGroupId(groupId)
                .stream()
                .map(m -> m.getUserId())
                .toList();

        int memberCount = memberUserIds.size();
        BigDecimal equalShare = amount.divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);

        for (Long userId : memberUserIds) {
            ExpenseSplit split = new ExpenseSplit();
            split.setExpenseId(expenseId);
            split.setUserId(userId);
            split.setAmountOwed(equalShare);
            expenseRepository.saveSplit(split);
        }

        return expense;
    }

    public List<Expense> getExpensesForGroup(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    public List<ExpenseRepository.UserBalance> getBalances(Long groupId) {
        return expenseRepository.getNetBalancesForGroup(groupId);
    }
}