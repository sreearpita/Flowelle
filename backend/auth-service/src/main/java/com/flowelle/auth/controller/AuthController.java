package com.flowelle.auth.controller;

import com.flowelle.auth.dto.AuthResponse;
import com.flowelle.auth.dto.LoginRequest;
import com.flowelle.auth.dto.RegisterRequest;
import com.flowelle.auth.dto.UserResponse;
import com.flowelle.auth.dto.UpdateProfileRequest;
import com.flowelle.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PutMapping;
import com.flowelle.auth.repository.UserPreferencesRepository;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final UserPreferencesRepository userPreferencesRepository;

    @PostMapping("/register")
    @Operation(
        summary = "Register a new user",
        description = "Register a new user with email, password, and personal information"
    )
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(
        summary = "Authenticate user",
        description = "Authenticate a user with email and password"
    )
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current user",
        description = "Retrieve the details of the currently authenticated user"
    )
    public ResponseEntity<UserResponse> getCurrentUser() {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.flowelle.auth.model.User user) {
            var preferences = userPreferencesRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User preferences not found"));
            var response = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                preferences.getCycleLength(),
                preferences.getPeriodLength(),
                preferences.getBirthControlUse()
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/me")
    @Operation(
        summary = "Update user profile",
        description = "Update the current user's profile information"
    )
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.flowelle.auth.model.User user) {
            var updatedUser = authService.updateProfile(user.getId(), request);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
} 