package com.flowelle.auth.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.flowelle.auth.dto.AifChatMessageRequest;
import com.flowelle.auth.security.AifUserContextTokenService;

@Service
public class AifChatProxyService {
    private final RestTemplate restTemplate;
    private final AifUserContextTokenService tokenService;
    private final String aiFriendUrl;
    private final String tenantKey;

    public AifChatProxyService(
            RestTemplate restTemplate,
            AifUserContextTokenService tokenService,
            @Value("${aif.proxy.url:}") String aiFriendUrl,
            @Value("${aif.proxy.tenant-key:}") String tenantKey) {
        this.restTemplate = restTemplate;
        this.tokenService = tokenService;
        this.aiFriendUrl = aiFriendUrl;
        this.tenantKey = tenantKey;
    }

    public ResponseEntity<Map> forward(AifChatMessageRequest request, com.flowelle.auth.model.User user,
            com.flowelle.auth.model.UserPreferences preferences) {
        if (aiFriendUrl.isBlank() || tenantKey.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("error", "AI-Friend proxy is not configured"));
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-AIF-Tenant-Key", tenantKey);
            headers.set("X-AIF-User-Context", tokenService.issue(user, preferences));
            return restTemplate.postForEntity(aiFriendUrl + "/v2/chat/messages", new HttpEntity<>(request, headers), Map.class);
        } catch (RestClientException | IllegalStateException exception) {
            return ResponseEntity.status(502).body(Map.of("error", "AI-Friend is unavailable"));
        }
    }
}
