package com.flowelle.cycles.controller;

import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowelle.cycles.dto.AifToolRequest;
import com.flowelle.cycles.dto.AifToolResponse;
import com.flowelle.cycles.dto.FlowelleCycleSummaryResponse;
import com.flowelle.cycles.security.AifCallbackUnauthorizedException;
import com.flowelle.cycles.security.AifCallbackVerifier;
import com.flowelle.cycles.service.AifCycleToolService;

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
@RequestMapping("/api/aif/tools")
@RequiredArgsConstructor
public class AifToolController {
    private static final String CYCLE_SUMMARY_TOOL = "cycle-summary";
    private static final String CYCLE_READ_SCOPE = "cycle:read";
    private static final TypeReference<Map<String, Object>> FACTS_TYPE = new TypeReference<>() {
    };

    private final AifCallbackVerifier verifier;
    private final ObjectMapper objectMapper;
    private final AifCycleToolService aifCycleToolService;

    @PostMapping("/cycle-summary")
    public ResponseEntity<AifToolResponse> cycleSummary(
            @RequestHeader HttpHeaders headers,
            @RequestBody String rawBody) throws JsonProcessingException {
        verifier.verify(
                headers.getFirst(AifCallbackVerifier.KEY_ID_HEADER),
                headers.getFirst(AifCallbackVerifier.TIMESTAMP_HEADER),
                headers.getFirst(AifCallbackVerifier.SIGNATURE_HEADER),
                rawBody);

        AifToolRequest request = objectMapper.readValue(rawBody, AifToolRequest.class);
        validateEnvelope(request, headers, CYCLE_SUMMARY_TOOL, CYCLE_READ_SCOPE);

        return aifCycleToolService.buildCycleSummary(request)
                .map(this::okResponse)
                .orElseGet(this::noDataResponse);
    }

    private ResponseEntity<AifToolResponse> okResponse(FlowelleCycleSummaryResponse summary) {
        return ResponseEntity.ok(new AifToolResponse(
                CYCLE_SUMMARY_TOOL,
                "OK",
                summary.summary(),
                objectMapper.convertValue(summary, FACTS_TYPE),
                summary.userExplanation()));
    }

    private ResponseEntity<AifToolResponse> noDataResponse() {
        return ResponseEntity.ok(new AifToolResponse(
                CYCLE_SUMMARY_TOOL,
                "NO_DATA",
                "No cycle data is available yet.",
                Map.of(),
                "I could not find enough Flowelle cycle data to answer from your history."));
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
