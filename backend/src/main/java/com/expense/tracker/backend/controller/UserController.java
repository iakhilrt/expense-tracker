package com.expense.tracker.backend.controller;

import com.expense.tracker.backend.entity.User;
import com.expense.tracker.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "governmentModeEnabled", user.isGovernmentModeEnabled()
        ));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> settings) {
        User user = getCurrentUser();

        if (settings.containsKey("governmentModeEnabled")) {
            Object val = settings.get("governmentModeEnabled");
            if (!(val instanceof Boolean)) {
                throw new RuntimeException("Invalid value for governmentModeEnabled");
            }
            user.setGovernmentModeEnabled((Boolean) val);
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Settings updated successfully"));
    }
}