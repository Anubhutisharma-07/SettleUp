package com.settleup.controller;

import com.settleup.dto.AddMemberRequest;
import com.settleup.dto.CreateGroupRequest;
import com.settleup.entity.ExpenseGroup;
import com.settleup.entity.GroupMember;
import com.settleup.repository.ExpenseRepository;
import com.settleup.repository.UserRepository;
import com.settleup.security.JwtUtil;
import com.settleup.service.ExpenseService;
import com.settleup.service.GroupService;
import com.settleup.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final ExpenseService expenseService;
    private final SettlementService settlementService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public GroupController(GroupService groupService, ExpenseService expenseService,
                           SettlementService settlementService, JwtUtil jwtUtil,
                           UserRepository userRepository) {
        this.groupService = groupService;
        this.expenseService = expenseService;
        this.settlementService = settlementService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"))
                .getId();
    }

    @PostMapping
    public ExpenseGroup createGroup(@RequestHeader("Authorization") String authHeader,
                                    @Valid @RequestBody CreateGroupRequest request) {
        Long userId = getUserIdFromToken(authHeader);
        return groupService.createGroup(request.getName(), userId);
    }

    @PostMapping("/{groupId}/members")
    public Map<String, String> addMember(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable Long groupId,
                                         @Valid @RequestBody AddMemberRequest request) {
        Long requestingUserId = getUserIdFromToken(authHeader);
        groupService.addMember(groupId, requestingUserId, request.getUserId());
        return Map.of("message", "Member added successfully");
    }

    @GetMapping
    public List<ExpenseGroup> getMyGroups(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        return groupService.getGroupsForUser(userId);
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMember> getMembers(@PathVariable Long groupId) {
        return groupService.getGroupMembers(groupId);
    }

    @GetMapping("/{groupId}/balances")
    public List<ExpenseRepository.UserBalance> getBalances(@PathVariable Long groupId) {
        return expenseService.getBalances(groupId);
    }

    @GetMapping("/{groupId}/settlements")
    public List<SettlementService.Transaction> getSettlement(@PathVariable Long groupId) {
        return settlementService.computeSettlement(groupId);
    }
}