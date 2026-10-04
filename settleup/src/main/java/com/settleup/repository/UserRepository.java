package com.settleup.repository;

import com.settleup.dto.UserSearchResult;
import com.settleup.entity.User;
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
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> userRowMapper = (rs, rowNum) -> new User(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("password"),
            rs.getTimestamp("created_at").toLocalDateTime()
    );

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> results = jdbcTemplate.query(sql, userRowMapper, email);
        return results.stream().findFirst();
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        List<User> results = jdbcTemplate.query(sql, userRowMapper, id);
        return results.stream().findFirst();
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public Long save(User user) {
        String sql = "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());
            ps.setTimestamp(4, Timestamp.valueOf(user.getCreatedAt()));
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    public int countUsers() {
        String sql = "SELECT COUNT(*) FROM users";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    // Finds users whose name contains the typed text (case-insensitive), skipping
    // anyone already in the group. At most 8 results.
    // The typed text is passed as a ? parameter, never joined into the SQL string.
    // We also escape % and _ (LIKE wildcards) so they match literally.
    public List<UserSearchResult> searchUsersNotInGroup(String text, Long groupId) {
        String escaped = text
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        String pattern = "%" + escaped + "%";

        String sql = """
                SELECT u.id, u.name
                FROM users u
                WHERE u.name ILIKE ? ESCAPE '\\'
                  AND NOT EXISTS (
                      SELECT 1 FROM group_members gm
                      WHERE gm.group_id = ? AND gm.user_id = u.id
                  )
                ORDER BY u.name
                LIMIT 8
                """;

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> new UserSearchResult(rs.getLong("id"), rs.getString("name")),
                pattern, groupId);
    }
}