package com.settleup.service;

import com.settleup.entity.User;
import com.settleup.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String name, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(hashedPassword);
        newUser.setCreatedAt(LocalDateTime.now());

        Long generatedId = userRepository.save(newUser);
        newUser.setId(generatedId);

        return newUser;
    }

    // Used later during login to verify credentials
    public Optional<User> validateLogin(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent() && passwordEncoder.matches(rawPassword, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }
}