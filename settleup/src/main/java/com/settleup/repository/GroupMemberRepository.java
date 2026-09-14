package com.settleup.repository;

import com.settleup.entity.GroupMember;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class GroupMemberRepository {

    private final JdbcTemplate jdbcTemplate;

    public GroupMemberRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<GroupMember> memberRowMapper = (rs, rowNum) -> new GroupMember(
            rs.getLong("id"),
            rs.getLong("group_id"),
            rs.getLong("user_id"),
            GroupMember.Role.valueOf(rs.getString("role")),
            rs.getTimestamp("joined_at").toLocalDateTime()
    );

    public void addMember(Long groupId, Long userId, GroupMember.Role role) {
        String sql = "INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())";
        jdbcTemplate.update(sql, groupId, userId, role.name());
    }

    public List<GroupMember> findByGroupId(Long groupId) {
        String sql = "SELECT * FROM group_members WHERE group_id = ?";
        return jdbcTemplate.query(sql, memberRowMapper, groupId);
    }

    public boolean isMember(Long groupId, Long userId) {
        String sql = "SELECT COUNT(*) FROM group_members WHERE group_id = ? AND user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, groupId, userId);
        return count != null && count > 0;
    }

    public boolean isAdmin(Long groupId, Long userId) {
        String sql = "SELECT COUNT(*) FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'ADMIN'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, groupId, userId);
        return count != null && count > 0;
    }
}