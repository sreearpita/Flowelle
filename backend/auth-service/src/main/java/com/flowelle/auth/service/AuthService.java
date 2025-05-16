package com.flowelle.auth.service;

import com.flowelle.auth.dto.AuthResponse;
import com.flowelle.auth.dto.LoginRequest;
import com.flowelle.auth.dto.RegisterRequest;
import com.flowelle.auth.dto.UserResponse;
import com.flowelle.auth.model.Role;
import com.flowelle.auth.model.User;
import com.flowelle.auth.model.UserPreferences;
import com.flowelle.auth.repository.UserPreferencesRepository;
import com.flowelle.auth.repository.UserRepository;
import com.flowelle.auth.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.USER)
                .build();
        
        // Save user
        user = userRepository.save(user);

        // Create default preferences
        var preferences = new UserPreferences();
        preferences.setUser(user);
        preferencesRepository.save(preferences);

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Create UserResponse
        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );

        // Return response
        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Get user
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Create UserResponse
        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );

        // Return response
        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }
} 