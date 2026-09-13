package com.settleup.service;

import com.settleup.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SettlementServiceTest {

    private final SettlementService settlementService = new SettlementService(null);

    @Test
    void singleDebtorSingleCreditor_producesOneTransaction() {
        List<ExpenseRepository.UserBalance> balances = List.of(
                new ExpenseRepository.UserBalance(1L, "Alice", new BigDecimal("-500.00")),
                new ExpenseRepository.UserBalance(2L, "Bob", new BigDecimal("500.00"))
        );

        List<SettlementService.Transaction> result = settlementService.settleBalances(balances);

        assertEquals(1, result.size());
        SettlementService.Transaction txn = result.get(0);
        assertEquals(1L, txn.fromUserId());
        assertEquals(2L, txn.toUserId());
        assertEquals(new BigDecimal("500.00"), txn.amount());
    }

    @Test
    void alreadySettledGroup_producesNoTransactions() {
        List<ExpenseRepository.UserBalance> balances = List.of(
                new ExpenseRepository.UserBalance(1L, "Alice", BigDecimal.ZERO),
                new ExpenseRepository.UserBalance(2L, "Bob", BigDecimal.ZERO)
        );

        List<SettlementService.Transaction> result = settlementService.settleBalances(balances);

        assertTrue(result.isEmpty());
    }

    @Test
    void multipleDebtorsAndCreditors_minimizesTransactionCount() {
        List<ExpenseRepository.UserBalance> balances = List.of(
                new ExpenseRepository.UserBalance(1L, "Alice", new BigDecimal("-300.00")),
                new ExpenseRepository.UserBalance(2L, "Bob", new BigDecimal("-200.00")),
                new ExpenseRepository.UserBalance(3L, "Charlie", new BigDecimal("500.00"))
        );

        List<SettlementService.Transaction> result = settlementService.settleBalances(balances);

        assertEquals(2, result.size());

        BigDecimal totalSettled = result.stream()
                .map(SettlementService.Transaction::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("500.00"), totalSettled);
    }

    @Test
    void unevenSplit_partiallySettlesLargerDebtInMultipleSteps() {
        List<ExpenseRepository.UserBalance> balances = List.of(
                new ExpenseRepository.UserBalance(1L, "Alice", new BigDecimal("-700.00")),
                new ExpenseRepository.UserBalance(2L, "Bob", new BigDecimal("400.00")),
                new ExpenseRepository.UserBalance(3L, "Charlie", new BigDecimal("300.00"))
        );

        List<SettlementService.Transaction> result = settlementService.settleBalances(balances);

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).fromUserId());
        assertEquals(2L, result.get(0).toUserId());
        assertEquals(new BigDecimal("400.00"), result.get(0).amount());

        assertEquals(1L, result.get(1).fromUserId());
        assertEquals(3L, result.get(1).toUserId());
        assertEquals(new BigDecimal("300.00"), result.get(1).amount());
    }

    @Test
    void emptyBalanceList_producesNoTransactions() {
        List<SettlementService.Transaction> result = settlementService.settleBalances(List.of());
        assertTrue(result.isEmpty());
    }
}