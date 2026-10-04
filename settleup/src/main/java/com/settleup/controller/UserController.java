package com.settleup.controller;

import com.settleup.dto.UserResponse;
import com.settleup.dto.UserSearchResult;
import com.settleup.exception.ForbiddenException;
import com.settleup.repository.GroupMemberRepository;
import com.settleup.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final int MIN_SEARCH_LENGTH = 3;

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    public UserController(UserRepository userRepository, GroupMemberRepository groupMemberRepository) {
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @GetMapping("/count")
    public int countUsers() {
        return userRepository.countUsers();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Search users by name so an admin can add them to a group.
    // Only admins of the given group may search, and results exclude current members.
    @GetMapping("/search")
    public List<UserSearchResult> search(Authentication authentication,
                                         @RequestParam("q") String q,
                                         @RequestParam("groupId") Long groupId) {
        Long callerId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ForbiddenException("Access denied."))
                .getId();

        if (!groupMemberRepository.isAdmin(groupId, callerId)) {
            throw new ForbiddenException("Only group admins can search for users to add.");
        }

        String text = q.trim();
        if (text.length() < MIN_SEARCH_LENGTH) {
            throw new IllegalArgumentException("Type at least " + MIN_SEARCH_LENGTH + " characters to search.");
        }

        return userRepository.searchUsersNotInGroup(text, groupId);
    }
}