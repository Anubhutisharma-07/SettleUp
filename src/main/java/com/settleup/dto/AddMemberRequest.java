package com.settleup.dto;

public class AddMemberRequest {
    private Long userId;

    public AddMemberRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}