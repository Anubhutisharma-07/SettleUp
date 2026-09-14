package com.settleup.repository;

import com.settleup.entity.ExpenseGroup;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class ExpenseGroupRepository {

    private final JdbcTemplate jdbcTemplate;

    public ExpenseGroupRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ExpenseGroup> groupRowMapper = (rs, rowNum) -> new ExpenseGroup(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getLong("created_by"),
            rs.getTimestamp("created_at").toLocalDateTime()
    );

    public Long save(ExpenseGroup group) {
        String sql = "INSERT INTO expense_groups (name, created_by, created_at) VALUES (?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, group.getName());
            ps.setLong(2, group.getCreatedBy());
            ps.setTimestamp(3, Timestamp.valueOf(group.getCreatedAt()));
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    public Optional<ExpenseGroup> findById(Long id) {
        String sql = "SELECT * FROM expense_groups WHERE id = ?";
        List<ExpenseGroup> results = jdbcTemplate.query(sql, groupRowMapper, id);
        return results.stream().findFirst();
    }

    // Finds all groups a given user belongs to, via the group_members join table
    public List<ExpenseGroup> findGroupsByUserId(Long userId) {
        String sql = """
                SELECT eg.* FROM expense_groups eg
                INNER JOIN group_members gm ON eg.id = gm.group_id
                WHERE gm.user_id = ?
                """;
        return jdbcTemplate.query(sql, groupRowMapper, userId);
    }
}