package com.flowelle.auth.controller;

import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowelle.auth.dto.AifToolRequest;
import com.flowelle.auth.dto.AifToolResponse;
import com.flowelle.auth.dto.FlowelleUserPreferencesResponse;
import com.flowelle.auth.security.AifCallbackUnauthorizedException;
import com.flowelle.auth.security.AifCallbackVerifier;
import com.flowelle.auth.service.AifPreferencesToolService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/aif/tools")
@RequiredArgsConstructor
public class AifToolController {
    private static final String USER_PREFERENCES_TOOL = "user-preferences";
    private static final String PREFERENCES_READ_SCOPE = "preferences:read";
    private static final TypeReference<Map<String, Object>> FACTS_TYPE = new TypeReference<>() {
    };

    private final AifCallbackVerifier verifier;
    private final ObjectMapper objectMapper;
    private final AifPreferencesToolService aifPreferencesToolService;

    @PostMapping("/user-preferences")
    public ResponseEntity<AifToolResponse> userPreferences(
            @RequestHeader HttpHeaders headers,
            @RequestBody String rawBody) throws JsonProcessingException {
        verifier.verify(
                headers.getFirst(AifCallbackVerifier.KEY_ID_HEADER),
                headers.getFirst(AifCallbackVerifier.TIMESTAMP_HEADER),
                headers.getFirst(AifCallbackVerifier.SIGNATURE_HEADER),
                rawBody);

        AifToolRequest request = objectMapper.readValue(rawBody, AifToolRequest.class);
        validateEnvelope(request, headers, USER_PREFERENCES_TOOL, PREFERENCES_READ_SCOPE);

        return aifPreferencesToolService.buildPreferences(request)
                .map(this::okResponse)
                .orElseGet(this::noDataResponse);
    }

    private ResponseEntity<AifToolResponse> okResponse(FlowelleUserPreferencesResponse preferences) {
        return ResponseEntity.ok(new AifToolResponse(
                USER_PREFERENCES_TOOL,
                "OK",
                preferences.summary(),
                objectMapper.convertValue(preferences, FACTS_TYPE),
                preferences.userExplanation()));
    }

    private ResponseEntity<AifToolResponse> noDataResponse() {
        return ResponseEntity.ok(new AifToolResponse(
                USER_PREFERENCES_TOOL,
                "NO_DATA",
                "No Flowelle preference data is available yet.",
                Map.of(),
                "I could not find enough Flowelle preference data to answer from your account."));
    }

    private void validateEnvelope(
            AifToolRequest request,
            HttpHeaders headers,
            String expectedTool,
            String requiredScope) {
        if (request == null) {
            throw new IllegalArgumentException("request body is required");
        }
        if (request.requestId() == null) {
            throw new IllegalArgumentException("requestId is required");
        }
        if (!StringUtils.hasText(request.tenantSlug())) {
            throw new IllegalArgumentException("tenantSlug is required");
        }
        if (!StringUtils.hasText(request.externalUserId())) {
            throw new IllegalArgumentException("externalUserId is required");
        }
        if (!expectedTool.equals(request.toolName())) {
            throw new IllegalArgumentException("Invalid toolName");
        }

        String requestIdHeader = requireHeader(headers, AifCallbackVerifier.REQUEST_ID_HEADER);
        if (!requestIdHeader.equals(request.requestId().toString())) {
            throw new AifCallbackUnauthorizedException("AI-Friend callback request id mismatch");
        }

        String tenantHeader = requireHeader(headers, AifCallbackVerifier.TENANT_HEADER);
        if (!tenantHeader.equals(request.tenantSlug())) {
            throw new AifCallbackUnauthorizedException("AI-Friend callback tenant mismatch");
        }

        Set<String> scopes = request.scopes() == null ? Set.of() : request.scopes();
        if (!scopes.contains(requiredScope)) {
            throw new IllegalArgumentException("Missing required scope");
        }
    }

    private String requireHeader(HttpHeaders headers, String headerName) {
        String value = headers.getFirst(headerName);
        if (!StringUtils.hasText(value)) {
            throw new AifCallbackUnauthorizedException("Missing AI-Friend callback signature headers");
        }
        return value;
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<Map<String, String>> invalidJson() {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid JSON request body"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(AifCallbackUnauthorizedException.class)
    public ResponseEntity<Map<String, String>> unauthorized(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", exception.getMessage()));
    }
}
