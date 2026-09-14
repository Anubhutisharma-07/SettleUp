package com.settleup.repository;

import com.settleup.entity.Expense;
import com.settleup.entity.ExpenseSplit;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class ExpenseRepository {

    private final JdbcTemplate jdbcTemplate;

    public ExpenseRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Expense> expenseRowMapper = (rs, rowNum) -> new Expense(
            rs.getLong("id"),
            rs.getLong("group_id"),
            rs.getLong("paid_by"),
            rs.getBigDecimal("amount"),
            rs.getString("description"),
            rs.getTimestamp("expense_date").toLocalDateTime()
    );

    private final RowMapper<ExpenseSplit> splitRowMapper = (rs, rowNum) -> new ExpenseSplit(
            rs.getLong("id"),
            rs.getLong("expense_id"),
            rs.getLong("user_id"),
            rs.getBigDecimal("amount_owed")
    );

    public Long saveExpense(Expense expense) {
        String sql = "INSERT INTO expenses (group_id, paid_by, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, expense.getGroupId());
            ps.setLong(2, expense.getPaidBy());
            ps.setBigDecimal(3, expense.getAmount());
            ps.setString(4, expense.getDescription());
            ps.setTimestamp(5, Timestamp.valueOf(expense.getExpenseDate()));
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    public void saveSplit(ExpenseSplit split) {
        String sql = "INSERT INTO expense_splits (expense_id, user_id, amount_owed) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, split.getExpenseId(), split.getUserId(), split.getAmountOwed());
    }

    public List<Expense> findByGroupId(Long groupId) {
        String sql = "SELECT * FROM expenses WHERE group_id = ? ORDER BY expense_date DESC";
        return jdbcTemplate.query(sql, expenseRowMapper, groupId);
    }

    public List<ExpenseSplit> findSplitsByExpenseId(Long expenseId) {
        String sql = "SELECT * FROM expense_splits WHERE expense_id = ?";
        return jdbcTemplate.query(sql, splitRowMapper, expenseId);
    }

    /**
     * Computes each user's net balance within a group:
     * positive = they are owed money (they paid more than their share)
     * negative = they owe money (their share exceeds what they paid)
     */
    public List<UserBalance> getNetBalancesForGroup(Long groupId) {
        String sql = """
                SELECT
                    u.id AS user_id,
                    u.name AS user_name,
                    COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0) AS net_balance
                FROM users u
                INNER JOIN group_members gm ON gm.user_id = u.id AND gm.group_id = ?
                LEFT JOIN (
                    SELECT paid_by, SUM(amount) AS total_paid
                    FROM expenses
                    WHERE group_id = ?
                    GROUP BY paid_by
                ) paid ON paid.paid_by = u.id
                LEFT JOIN (
                    SELECT es.user_id, SUM(es.amount_owed) AS total_owed
                    FROM expense_splits es
                    INNER JOIN expenses e ON e.id = es.expense_id
                    WHERE e.group_id = ?
                    GROUP BY es.user_id
                ) owed ON owed.user_id = u.id
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new UserBalance(
                rs.getLong("user_id"),
                rs.getString("user_name"),
                rs.getBigDecimal("net_balance")
        ), groupId, groupId, groupId);
    }

    // Simple inner record to hold the balance query result
    public record UserBalance(Long userId, String userName, BigDecimal netBalance) {
    }
}