package com.flowelle.auth.controller;

import com.flowelle.auth.dto.RealtimeSessionRequest;
import com.flowelle.auth.dto.RealtimeSessionResponse;
import com.flowelle.auth.exception.OpenAiConfigurationException;
import com.flowelle.auth.exception.OpenAiSessionException;
import com.flowelle.auth.service.OpenAiRealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ai/realtime")
@RequiredArgsConstructor
public class AiController {
    private final OpenAiRealtimeService openAiRealtimeService;

    @PostMapping("/session")
    public ResponseEntity<RealtimeSessionResponse> createRealtimeSession(
            @RequestBody(required = false) RealtimeSessionRequest request
    ) {
        String mode = request != null ? request.getMode() : null;
        String currentDate = request != null ? request.getCurrentDate() : null;
        return ResponseEntity.ok(new RealtimeSessionResponse(
                openAiRealtimeService.createVoiceCheckInSession(mode, currentDate)
        ));
    }

    @ExceptionHandler(OpenAiConfigurationException.class)
    public ResponseEntity<Map<String, String>> handleConfigurationError(OpenAiConfigurationException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(OpenAiSessionException.class)
    public ResponseEntity<Map<String, String>> handleSessionError(OpenAiSessionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", ex.getMessage()));
    }
}
