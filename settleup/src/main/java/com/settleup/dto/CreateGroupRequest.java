package com.settleup.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateGroupRequest {

    @NotBlank(message = "Group name is required")
    private String name;

    public CreateGroupRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}