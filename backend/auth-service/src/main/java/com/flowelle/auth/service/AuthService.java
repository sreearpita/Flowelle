package com.flowelle.auth.service;

import com.flowelle.auth.dto.AuthResponse;
import com.flowelle.auth.dto.LoginRequest;
import com.flowelle.auth.dto.RegisterRequest;
import com.flowelle.auth.dto.UserResponse;
import com.flowelle.auth.dto.UpdateProfileRequest;
import com.flowelle.auth.model.Role;
import com.flowelle.auth.model.User;
import com.flowelle.auth.model.UserPreferences;
import com.flowelle.auth.repository.UserPreferencesRepository;
import com.flowelle.auth.repository.UserRepository;
import com.flowelle.auth.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;

    @Value("${cycles.service.url}")
    private String cyclesServiceUrl;

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

        // Create preferences with cycle data
        var preferences = UserPreferences.builder()
                .user(user)
                .cycleLength(request.getCycleLength())
                .periodLength(request.getPeriodLength())
                .birthControlUse(request.getBirthControlUse())
                .build();
        preferencesRepository.save(preferences);

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Create initial cycle in cycles service
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, Object> cycleRequest = new HashMap<>();
            cycleRequest.put("userId", user.getId().toString());
            cycleRequest.put("startDate", request.getLastPeriodDate());
            cycleRequest.put("cycleLength", request.getCycleLength());
            cycleRequest.put("periodLength", request.getPeriodLength());

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(cycleRequest, headers);
            restTemplate.postForObject(cyclesServiceUrl + "/api/cycles", requestEntity, Object.class);
        } catch (Exception e) {
            // Log the error but don't fail the registration
            System.err.println("Failed to create initial cycle: " + e.getMessage());
        }

        // Create UserResponse
        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            preferences.getCycleLength(),
            preferences.getPeriodLength(),
            preferences.getBirthControlUse()
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

        // Get user preferences
        var preferences = preferencesRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User preferences not found"));

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Create UserResponse
        UserResponse userResponse = new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            preferences.getCycleLength(),
            preferences.getPeriodLength(),
            preferences.getBirthControlUse()
        );

        // Return response
        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        // Get user and preferences
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var preferences = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User preferences not found"));

        // Update user
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        userRepository.save(user);

        // Update preferences
        preferences.setCycleLength(request.getCycleLength());
        preferences.setPeriodLength(request.getPeriodLength());
        preferences.setBirthControlUse(request.getBirthControlUse());
        preferencesRepository.save(preferences);

        // Return updated user response
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            preferences.getCycleLength(),
            preferences.getPeriodLength(),
            preferences.getBirthControlUse()
        );
    }
} 