package com.flowelle.auth.controller;

import com.flowelle.auth.exception.OpenAiConfigurationException;
import com.flowelle.auth.security.JwtService;
import com.flowelle.auth.service.OpenAiRealtimeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiController.class)
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OpenAiRealtimeService openAiRealtimeService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void createRealtimeSessionRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/ai/realtime/session"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void createRealtimeSessionReturnsClientSecretForAuthenticatedUser() throws Exception {
        when(openAiRealtimeService.createVoiceCheckInSession(null, null))
                .thenReturn(Map.of("client_secret", Map.of("value", "ephemeral-key")));

        mockMvc.perform(post("/ai/realtime/session").with(user("user@example.com")).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.client_secret.value").value("ephemeral-key"));
    }

    @Test
    void createRealtimeSessionPassesPeriodModeAndCurrentDate() throws Exception {
        when(openAiRealtimeService.createVoiceCheckInSession(eq("period"), eq("2026-05-13")))
                .thenReturn(Map.of("client_secret", Map.of("value", "period-key")));

        mockMvc.perform(
                        post("/ai/realtime/session")
                                .with(user("user@example.com"))
                                .with(csrf())
                                .contentType("application/json")
                                .content("{\"mode\":\"period\",\"currentDate\":\"2026-05-13\"}")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.client_secret.value").value("period-key"));
    }

    @Test
    void createRealtimeSessionReturnsServiceUnavailableWhenApiKeyIsMissing() throws Exception {
        when(openAiRealtimeService.createVoiceCheckInSession(null, null))
                .thenThrow(new OpenAiConfigurationException("OPENAI_API_KEY is not configured"));

        mockMvc.perform(post("/ai/realtime/session").with(user("user@example.com")).with(csrf()))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("OPENAI_API_KEY is not configured"));
    }
}
