package com.flowelle.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import com.flowelle.auth.dto.AifChatMessageRequest;
import com.flowelle.auth.model.User;
import com.flowelle.auth.model.UserPreferences;
import com.flowelle.auth.repository.UserPreferencesRepository;
import com.flowelle.auth.service.AifChatProxyService;

class AifChatControllerTest {
    private final UserPreferencesRepository preferencesRepository = mock(UserPreferencesRepository.class);
    private final AifChatProxyService proxyService = mock(AifChatProxyService.class);
    private final AifChatController controller = new AifChatController(preferencesRepository, proxyService);
    private final User user = User.builder().id(42L).email("user@example.com").build();
    private final AifChatMessageRequest request = new AifChatMessageRequest(UUID.randomUUID(), "How long is my cycle?", "en");

    @Test
    void consentDisabledStillForwardsGeneralChatWithoutFlowelleFacts() {
        UserPreferences preferences = UserPreferences.builder().userId(42L).aiCoachEnabled(false).build();
        when(preferencesRepository.findById(42L)).thenReturn(Optional.of(preferences));
        ResponseEntity<Map> forwarded = ResponseEntity.ok(Map.of("toolCalls", java.util.List.of(
                Map.of("name", "cycle-summary", "status", "SKIPPED"))));
        when(proxyService.forward(request, user, preferences)).thenReturn(forwarded);

        ResponseEntity<Map> response = controller.chat(user, request);

        assertThat(response).isSameAs(forwarded);
        verify(proxyService).forward(request, user, preferences);
    }

    @Test
    void consentEnabledForwardsToProxy() {
        UserPreferences preferences = UserPreferences.builder().userId(42L).aiCoachEnabled(true).build();
        when(preferencesRepository.findById(42L)).thenReturn(Optional.of(preferences));
        ResponseEntity<Map> forwarded = ResponseEntity.ok(Map.of("message", "grounded answer"));
        when(proxyService.forward(request, user, preferences)).thenReturn(forwarded);

        ResponseEntity<Map> response = controller.chat(user, request);

        assertThat(response).isSameAs(forwarded);
        verify(proxyService).forward(request, user, preferences);
    }
}
