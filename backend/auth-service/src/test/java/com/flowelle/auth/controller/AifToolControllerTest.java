package com.flowelle.auth.controller;

import java.util.Optional;

import com.flowelle.auth.dto.FlowelleUserPreferencesResponse;
import com.flowelle.auth.security.AifCallbackUnauthorizedException;
import com.flowelle.auth.security.AifCallbackVerifier;
import com.flowelle.auth.security.JwtService;
import com.flowelle.auth.service.AifPreferencesToolService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AifToolController.class)
@AutoConfigureMockMvc(addFilters = false)
class AifToolControllerTest {
    private static final String REQUEST_ID = "00000000-0000-0000-0000-000000000001";
    private static final String SESSION_ID = "00000000-0000-0000-0000-000000000002";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AifCallbackVerifier verifier;

    @MockBean
    private AifPreferencesToolService aifPreferencesToolService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void userPreferencesReturnsBoundedFactsForValidSignedRequest() throws Exception {
        when(aifPreferencesToolService.buildPreferences(any())).thenReturn(Optional.of(new FlowelleUserPreferencesResponse(
                28,
                5,
                false,
                true,
                true,
                false,
                true,
                "Flowelle preferences indicate a typical cycle length of 28 days and period length of 5 days.",
                "I used your Flowelle preferences.")));

        mockMvc.perform(post("/aif/tools/user-preferences")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("user-preferences", "preferences:read")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.facts.cycleLength").value(28))
                .andExpect(jsonPath("$.facts.notificationsEnabled").value(true));
    }

    @Test
    void userPreferencesRejectsMissingRequiredScope() throws Exception {
        mockMvc.perform(post("/aif/tools/user-preferences")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("user-preferences", "cycle:read")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Missing required scope"));
    }

    @Test
    void userPreferencesRejectsInvalidSignature() throws Exception {
        doThrow(new AifCallbackUnauthorizedException("Invalid AI-Friend callback signature"))
                .when(verifier)
                .verify(anyString(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/aif/tools/user-preferences")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("user-preferences", "preferences:read")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid AI-Friend callback signature"));
    }

    @Test
    void userPreferencesReturnsNoDataEnvelopeWhenPreferencesAreMissing() throws Exception {
        when(aifPreferencesToolService.buildPreferences(any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/aif/tools/user-preferences")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("user-preferences", "preferences:read")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NO_DATA"))
                .andExpect(jsonPath("$.facts").isEmpty());
    }

    private HttpHeaders validHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(AifCallbackVerifier.KEY_ID_HEADER, "dev-v1");
        headers.add(AifCallbackVerifier.TIMESTAMP_HEADER, "2026-06-07T00:00:00Z");
        headers.add(AifCallbackVerifier.SIGNATURE_HEADER, "signature");
        headers.add(AifCallbackVerifier.REQUEST_ID_HEADER, REQUEST_ID);
        headers.add(AifCallbackVerifier.TENANT_HEADER, "demo");
        return headers;
    }

    private String validBody(String toolName, String scope) {
        return """
                {
                  "requestId": "%s",
                  "tenantSlug": "demo",
                  "externalUserId": "123",
                  "sessionId": "%s",
                  "toolName": "%s",
                  "scopes": ["%s"],
                  "locale": "en-US",
                  "parameters": {}
                }
                """.formatted(REQUEST_ID, SESSION_ID, toolName, scope);
    }
}
