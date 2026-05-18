package com.flowelle.auth.service;

import com.flowelle.auth.exception.OpenAiConfigurationException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenAiRealtimeServiceTest {

    @Test
    void createVoiceCheckInSessionReturnsOpenAiResponse() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        OpenAiRealtimeService service = new OpenAiRealtimeService(restTemplate);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "realtimeModel", "gpt-realtime-2");
        ReflectionTestUtils.setField(service, "transcriptionModel", "gpt-4o-mini-transcribe");

        server.expect(once(), requestTo("https://api.openai.com/v1/realtime/client_secrets"))
                .andExpect(method(POST))
                .andExpect(header(AUTHORIZATION, "Bearer test-key"))
                .andExpect(jsonPath("$.session.model").value("gpt-realtime-2"))
                .andExpect(jsonPath("$.session.audio.input.transcription.model").value("gpt-4o-mini-transcribe"))
                .andExpect(jsonPath("$.session.audio.input.turn_detection.type").value("server_vad"))
                .andExpect(jsonPath("$.session.tools[0].name").value("prepare_symptom_log"))
                .andRespond(withSuccess(
                        "{\"client_secret\":{\"value\":\"ephemeral-key\"}}",
                        APPLICATION_JSON
                ));

        Map<String, Object> response = service.createVoiceCheckInSession();

        assertThat(response).containsKey("client_secret");
        server.verify();
    }

    @Test
    void createVoiceCheckInSessionRequiresApiKey() {
        OpenAiRealtimeService service = new OpenAiRealtimeService(new RestTemplate());
        ReflectionTestUtils.setField(service, "apiKey", "");
        ReflectionTestUtils.setField(service, "realtimeModel", "gpt-realtime-2");
        ReflectionTestUtils.setField(service, "transcriptionModel", "gpt-4o-mini-transcribe");

        assertThatThrownBy(service::createVoiceCheckInSession)
                .isInstanceOf(OpenAiConfigurationException.class)
                .hasMessageContaining("OPENAI_API_KEY");
    }

    @Test
    void createPeriodVoiceSessionUsesPeriodToolAndCurrentDateInstructions() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        OpenAiRealtimeService service = new OpenAiRealtimeService(restTemplate);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "realtimeModel", "gpt-realtime-2");
        ReflectionTestUtils.setField(service, "transcriptionModel", "gpt-4o-mini-transcribe");

        server.expect(once(), requestTo("https://api.openai.com/v1/realtime/client_secrets"))
                .andExpect(method(POST))
                .andExpect(header(AUTHORIZATION, "Bearer test-key"))
                .andExpect(jsonPath("$.session.model").value("gpt-realtime-2"))
                .andExpect(jsonPath("$.session.audio.input.transcription.model").value("gpt-4o-mini-transcribe"))
                .andExpect(jsonPath("$.session.tools[0].name").value("prepare_period_log"))
                .andExpect(jsonPath("$.session.tools[0].parameters.properties.flow.enum[2]").value("heavy"))
                .andExpect(jsonPath("$.session.instructions").value(org.hamcrest.Matchers.containsString("2026-05-13")))
                .andRespond(withSuccess(
                        "{\"client_secret\":{\"value\":\"ephemeral-key\"}}",
                        APPLICATION_JSON
                ));

        Map<String, Object> response = service.createVoiceCheckInSession("period", "2026-05-13");

        assertThat(response).containsKey("client_secret");
        server.verify();
    }
}
