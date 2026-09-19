package com.flowelle.auth.controller;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowelle.auth.dto.AifChatMessageRequest;
import com.flowelle.auth.model.User;
import com.flowelle.auth.repository.UserPreferencesRepository;
import com.flowelle.auth.service.AifChatProxyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/aif/chat")
@RequiredArgsConstructor
public class AifChatController {
    private final UserPreferencesRepository preferencesRepository;
    private final AifChatProxyService proxyService;

    @PostMapping("/messages")
    public ResponseEntity<Map> chat(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AifChatMessageRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication is required"));
        }
        var preferences = preferencesRepository.findById(user.getId()).orElse(null);
        if (preferences == null || !Boolean.TRUE.equals(preferences.getAiCoachEnabled())) {
            return ResponseEntity.status(403).body(Map.of("error", "AI coaching consent is required"));
        }
        return proxyService.forward(request, user, preferences);
    }
}
