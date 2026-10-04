package com.settleup.controller;

import com.settleup.dto.LoginRequest;
import com.settleup.dto.SignupRequest;
import com.settleup.entity.User;
import com.settleup.security.JwtUtil;
import com.settleup.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@Valid @RequestBody SignupRequest request) {
        User newUser = userService.registerUser(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        String token = jwtUtil.generateToken(newUser.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", newUser.getId());
        response.put("name", newUser.getName());
        response.put("email", newUser.getEmail());

        return response;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.validateLogin(request.getEmail(), request.getPassword());

        Map<String, Object> response = new HashMap<>();

        if (userOpt.isEmpty()) {
            // 401 = "we don't know who you are". The same message is used for an unknown
            // email and a wrong password, so an attacker can't tell which emails exist.
            response.put("error", "Invalid email or password");
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail());

        response.put("token", token);
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}