package com.settleup.dto;

import com.settleup.entity.GroupMember;

import java.time.LocalDateTime;

public record MemberResponse(Long id, Long groupId, Long userId, String userName,
                             GroupMember.Role role, LocalDateTime joinedAt) {
}