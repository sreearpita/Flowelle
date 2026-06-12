package com.flowelle.cycles.controller;

import java.util.Optional;

import com.flowelle.cycles.dto.FlowelleCycleSummaryResponse;
import com.flowelle.cycles.security.AifCallbackUnauthorizedException;
import com.flowelle.cycles.security.AifCallbackVerifier;
import com.flowelle.cycles.service.AifCycleToolService;
import com.flowelle.cycles.support.ContractFixtures;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AifCallbackVerifier verifier;

    @MockBean
    private AifCycleToolService aifCycleToolService;

    @Test
    void cycleSummaryReturnsBoundedFactsForSharedRequestFixture() throws Exception {
        when(aifCycleToolService.buildCycleSummary(any())).thenReturn(Optional.of(new FlowelleCycleSummaryResponse(
                "2026-06-20",
                "2026-06-01",
                "2026-06-07",
                "2026-06-06",
                82,
                "Based on 4 logged cycles",
                true,
                28,
                5,
                "Predicted next period starts 2026-06-20.",
                "I used your Flowelle cycle summary.")));

        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ContractFixtures.read("/contracts/aif/cycle-summary-request.json")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.facts.nextPeriod").value("2026-06-20"))
                .andExpect(jsonPath("$.facts.cycleLength").value(28))
                .andExpect(jsonPath("$.userExplanation").value("I used your Flowelle cycle summary."));
    }

    @Test
    void cycleSummaryRejectsMissingRequiredScope() throws Exception {
        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody("cycle-summary", "preferences:read")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Missing required scope"));
    }

    @Test
    void cycleSummaryRejectsInvalidSignature() throws Exception {
        doThrow(new AifCallbackUnauthorizedException("Invalid AI-Friend callback signature"))
                .when(verifier)
                .verify(anyString(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ContractFixtures.read("/contracts/aif/cycle-summary-request.json")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid AI-Friend callback signature"));
    }

    @Test
    void cycleSummaryRejectsExpiredTimestamp() throws Exception {
        doThrow(new AifCallbackUnauthorizedException("Expired AI-Friend callback timestamp"))
                .when(verifier)
                .verify(anyString(), anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ContractFixtures.read("/contracts/aif/cycle-summary-request.json")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Expired AI-Friend callback timestamp"));
    }

    @Test
    void cycleSummaryRejectsRequestIdMismatch() throws Exception {
        HttpHeaders headers = validHeaders();
        headers.set(AifCallbackVerifier.REQUEST_ID_HEADER, "00000000-0000-0000-0000-000000009999");

        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(headers)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ContractFixtures.read("/contracts/aif/cycle-summary-request.json")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AI-Friend callback request id mismatch"));
    }

    @Test
    void cycleSummaryRejectsTenantMismatch() throws Exception {
        HttpHeaders headers = validHeaders();
        headers.set(AifCallbackVerifier.TENANT_HEADER, "other-tenant");

        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(headers)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ContractFixtures.read("/contracts/aif/cycle-summary-request.json")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("AI-Friend callback tenant mismatch"));
    }

    @Test
    void cycleSummaryReturnsNoDataEnvelopeWhenNoCycleExists() throws Exception {
        when(aifCycleToolService.buildCycleSummary(any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/aif/tools/cycle-summary")
                        .headers(validHeaders())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ContractFixtures.read("/contracts/aif/cycle-summary-request.json")))
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
                  "externalUserId": "flowelle-user-1",
                  "sessionId": "00000000-0000-0000-0000-000000000002",
                  "toolName": "%s",
                  "scopes": ["%s"],
                  "locale": "en-US",
                  "parameters": {}
                }
                """.formatted(REQUEST_ID, toolName, scope);
    }
}
