package com.settleup.service;

import com.settleup.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class SettlementService {

    private final ExpenseRepository expenseRepository;

    public SettlementService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public record Transaction(Long fromUserId, String fromUserName,
                              Long toUserId, String toUserName,
                              BigDecimal amount) {
    }

    /**
     * Fetches live balances from the DB for a group, then settles them.
     * This is the method the controller calls.
     */
    public List<Transaction> computeSettlement(Long groupId) {
        List<ExpenseRepository.UserBalance> balances = expenseRepository.getNetBalancesForGroup(groupId);
        return settleBalances(balances);
    }

    /**
     * Pure function: takes a list of net balances, returns the minimum-transaction
     * settlement plan. No DB dependency — fully unit-testable in isolation.
     *
     * Greedy approach: repeatedly match the biggest debtor with the biggest creditor,
     * settle the smaller of the two amounts, repeat until everyone is at zero.
     */
    public List<Transaction> settleBalances(List<ExpenseRepository.UserBalance> balances) {
        List<Balance> debtors = new ArrayList<>();
        List<Balance> creditors = new ArrayList<>();

        for (ExpenseRepository.UserBalance b : balances) {
            if (b.netBalance().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new Balance(b.userId(), b.userName(), b.netBalance().abs()));
            } else if (b.netBalance().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new Balance(b.userId(), b.userName(), b.netBalance()));
            }
            // balance == 0 → already settled, skip
        }

        List<Transaction> transactions = new ArrayList<>();

        int i = 0, j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            Balance debtor = debtors.get(i);
            Balance creditor = creditors.get(j);

            BigDecimal settledAmount = debtor.amount.min(creditor.amount);

            transactions.add(new Transaction(
                    debtor.userId, debtor.userName,
                    creditor.userId, creditor.userName,
                    settledAmount
            ));

            debtor.amount = debtor.amount.subtract(settledAmount);
            creditor.amount = creditor.amount.subtract(settledAmount);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) {
                i++;
            }
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) {
                j++;
            }
        }

        return transactions;
    }

    private static class Balance {
        Long userId;
        String userName;
        BigDecimal amount;

        Balance(Long userId, String userName, BigDecimal amount) {
            this.userId = userId;
            this.userName = userName;
            this.amount = amount;
        }
    }
}