package com.settleup.service;

import com.settleup.entity.ExpenseGroup;
import com.settleup.entity.GroupMember;
import com.settleup.repository.ExpenseGroupRepository;
import com.settleup.repository.GroupMemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupService {

    private final ExpenseGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;

    public GroupService(ExpenseGroupRepository groupRepository, GroupMemberRepository memberRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
    }

    // Creates a group and automatically makes the creator an ADMIN member
    public ExpenseGroup createGroup(String name, Long creatorUserId) {
        ExpenseGroup group = new ExpenseGroup();
        group.setName(name);
        group.setCreatedBy(creatorUserId);
        group.setCreatedAt(LocalDateTime.now());

        Long groupId = groupRepository.save(group);
        group.setId(groupId);

        memberRepository.addMember(groupId, creatorUserId, GroupMember.Role.ADMIN);

        return group;
    }

    // Adds a new member to an existing group — only an ADMIN should be allowed to call this
    public void addMember(Long groupId, Long requestingUserId, Long newUserId) {
        if (!memberRepository.isAdmin(groupId, requestingUserId)) {
            throw new IllegalStateException("Only group admins can add members");
        }
        if (memberRepository.isMember(groupId, newUserId)) {
            throw new IllegalStateException("User is already a member of this group");
        }
        memberRepository.addMember(groupId, newUserId, GroupMember.Role.MEMBER);
    }

    public List<ExpenseGroup> getGroupsForUser(Long userId) {
        return groupRepository.findGroupsByUserId(userId);
    }

    public List<GroupMember> getGroupMembers(Long groupId) {
        return memberRepository.findByGroupId(groupId);
    }
}