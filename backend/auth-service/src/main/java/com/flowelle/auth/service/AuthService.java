package com.flowelle.auth.service;

import com.flowelle.auth.dto.AuthResponse;
import com.flowelle.auth.dto.DataExportDto;
import com.flowelle.auth.dto.LoginRequest;
import com.flowelle.auth.dto.PrivacySettingsDto;
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
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.LocalTime;

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

    @Transactional
    public PrivacySettingsDto getPrivacySettings(Long userId) {
        var preferences = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User preferences not found"));
        return toPrivacySettings(preferences);
    }

    @Transactional
    public PrivacySettingsDto updatePrivacySettings(Long userId, PrivacySettingsDto request) {
        var preferences = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User preferences not found"));

        if (request.getAiCoachEnabled() != null) {
            preferences.setAiCoachEnabled(request.getAiCoachEnabled());
        }
        if (request.getVoiceProcessingEnabled() != null) {
            preferences.setVoiceProcessingEnabled(request.getVoiceProcessingEnabled());
        }
        if (request.getAnalyticsOptIn() != null) {
            preferences.setAnalyticsOptIn(request.getAnalyticsOptIn());
        }
        if (request.getNotificationsEnabled() != null) {
            preferences.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getReminderTime() != null && !request.getReminderTime().isBlank()) {
            preferences.setReminderTime(LocalTime.parse(request.getReminderTime()));
        } else if (request.getReminderTime() != null) {
            preferences.setReminderTime(null);
        }

        preferencesRepository.save(preferences);
        return toPrivacySettings(preferences);
    }

    @Transactional
    public DataExportDto exportUserData(Long userId, String authorizationHeader) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var preferences = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User preferences not found"));

        preferences.setExportRequestedAt(LocalDateTime.now());
        preferencesRepository.save(preferences);

        Object cycleData = null;
        String exportNotice = "Export includes account preferences and cycle-service data available at request time.";
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
            }
            ResponseEntity<Object> response = restTemplate.exchange(
                    cyclesServiceUrl + "/api/cycles/export?userId=" + userId,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Object.class
            );
            cycleData = response.getBody();
        } catch (Exception e) {
            exportNotice = exportNotice + " Cycle-service export was unavailable: " + e.getMessage();
        }

        return DataExportDto.builder()
                .generatedAt(LocalDateTime.now().toString())
                .profile(toUserResponse(user, preferences))
                .privacy(toPrivacySettings(preferences))
                .cycleData(cycleData)
                .exportNotice(exportNotice)
                .build();
    }

    @Transactional
    public PrivacySettingsDto requestDataDeletion(Long userId, String authorizationHeader) {
        var preferences = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User preferences not found"));

        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
            }
            restTemplate.exchange(
                    cyclesServiceUrl + "/api/cycles/data?userId=" + userId,
                    HttpMethod.DELETE,
                    new HttpEntity<>(headers),
                    Void.class
            );
        } catch (Exception e) {
            System.err.println("Failed to delete cycle-service data: " + e.getMessage());
        }

        preferences.setDeleteRequestedAt(LocalDateTime.now());
        preferencesRepository.save(preferences);
        return toPrivacySettings(preferences);
    }

    private UserResponse toUserResponse(User user, UserPreferences preferences) {
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

    private PrivacySettingsDto toPrivacySettings(UserPreferences preferences) {
        return PrivacySettingsDto.builder()
                .aiCoachEnabled(Boolean.TRUE.equals(preferences.getAiCoachEnabled()))
                .voiceProcessingEnabled(Boolean.TRUE.equals(preferences.getVoiceProcessingEnabled()))
                .analyticsOptIn(Boolean.TRUE.equals(preferences.getAnalyticsOptIn()))
                .notificationsEnabled(Boolean.TRUE.equals(preferences.getNotificationsEnabled()))
                .reminderTime(preferences.getReminderTime() != null ? preferences.getReminderTime().toString() : null)
                .exportRequestedAt(preferences.getExportRequestedAt() != null ? preferences.getExportRequestedAt().toString() : null)
                .deleteRequestedAt(preferences.getDeleteRequestedAt() != null ? preferences.getDeleteRequestedAt().toString() : null)
                .build();
    }
}
