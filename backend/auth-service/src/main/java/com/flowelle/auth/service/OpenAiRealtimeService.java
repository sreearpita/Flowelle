package com.flowelle.auth.service;

import com.flowelle.auth.exception.OpenAiConfigurationException;
import com.flowelle.auth.exception.OpenAiSessionException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenAiRealtimeService {
    private static final String CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";

    private final RestTemplate restTemplate;

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.realtime.model:gpt-realtime-2}")
    private String realtimeModel;

    @Value("${openai.realtime.transcription-model:gpt-4o-mini-transcribe}")
    private String transcriptionModel;

    public Map<String, Object> createVoiceCheckInSession() {
        return createVoiceCheckInSession("symptom", null);
    }

    public Map<String, Object> createVoiceCheckInSession(String mode, String currentDate) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new OpenAiConfigurationException("OPENAI_API_KEY is not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            return restTemplate.postForObject(
                    CLIENT_SECRETS_URL,
                    new HttpEntity<>(sessionRequest(normalizeMode(mode), currentDate), headers),
                    Map.class
            );
        } catch (HttpStatusCodeException e) {
            throw new OpenAiSessionException("OpenAI Realtime session creation failed", e);
        } catch (RestClientException e) {
            throw new OpenAiSessionException("Unable to contact OpenAI Realtime API", e);
        }
    }

    private String normalizeMode(String mode) {
        return "period".equalsIgnoreCase(mode) ? "period" : "symptom";
    }

    private Map<String, Object> sessionRequest(String mode, String currentDate) {
        return Map.of(
                "session", Map.of(
                        "type", "realtime",
                        "model", realtimeModel,
                        "instructions", instructions(mode, currentDate),
                        "output_modalities", List.of("text"),
                        "audio", Map.of(
                                "input", Map.of(
                                        "transcription", Map.of(
                                                "model", transcriptionModel,
                                                "language", "en"
                                        ),
                                        "turn_detection", Map.of("type", "server_vad")
                                )
                        ),
                        "tool_choice", "auto",
                        "tools", List.of("period".equals(mode) ? periodLogTool() : symptomLogTool())
                )
        );
    }

    private Map<String, Object> symptomLogTool() {
        return Map.of(
                "type", "function",
                "name", "prepare_symptom_log",
                "description", "Prepare a structured symptom log entry for user review. Do not save data.",
                "parameters", Map.of(
                        "type", "object",
                        "additionalProperties", false,
                        "required", List.of("date", "symptoms"),
                        "properties", Map.of(
                                "date", Map.of(
                                        "type", "string",
                                        "description", "The symptom date in yyyy-MM-dd format."
                                ),
                                "symptoms", Map.of(
                                        "type", "array",
                                        "minItems", 1,
                                        "items", Map.of(
                                                "type", "object",
                                                "additionalProperties", false,
                                                "required", List.of("type", "severity"),
                                                "properties", Map.of(
                                                        "type", Map.of(
                                                                "type", "string",
                                                                "enum", List.of(
                                                                        "cramps",
                                                                        "headache",
                                                                        "fatigue",
                                                                        "bloating",
                                                                        "breast_tenderness",
                                                                        "mood_changes",
                                                                        "anxiety",
                                                                        "stress",
                                                                        "irritability",
                                                                        "brain_fog",
                                                                        "low_motivation"
                                                                )
                                                        ),
                                                        "severity", Map.of(
                                                                "type", "integer",
                                                                "minimum", 1,
                                                                "maximum", 5,
                                                                "description", "Normalize mild to 1 or 2, moderate to 3, and severe to 4 or 5."
                                                        ),
                                                        "notes", Map.of(
                                                                "type", "string",
                                                                "description", "Optional brief user-provided note."
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );
    }

    private Map<String, Object> periodLogTool() {
        return Map.of(
                "type", "function",
                "name", "prepare_period_log",
                "description", "Prepare a structured period start entry for user review. Do not save data.",
                "parameters", Map.of(
                        "type", "object",
                        "additionalProperties", false,
                        "required", List.of("startDate"),
                        "properties", Map.of(
                                "startDate", Map.of(
                                        "type", "string",
                                        "description", "The period start date in yyyy-MM-dd format."
                                ),
                                "flow", Map.of(
                                        "type", "string",
                                        "enum", List.of("light", "medium", "heavy", "spotting"),
                                        "description", "Optional menstrual flow level spoken by the user."
                                ),
                                "notes", Map.of(
                                        "type", "string",
                                        "description", "Optional brief user-provided note."
                                )
                        )
                )
        );
    }

    private String instructions(String mode, String currentDate) {
        if ("period".equals(mode)) {
            return periodInstructions(currentDate);
        }

        return """
                You are Flowelle Voice Check-In. You only help extract menstrual wellness symptom logs for user review.
                You are not a medical diagnostic tool and must not provide medical advice, clinical recommendations, or diagnosis.
                Listen to the user's speech and call prepare_symptom_log with structured data when there is enough information.
                If the user does not mention a date, use today's date. If symptoms or severity are unclear, ask a brief clarification.
                Only use these symptom types: cramps, headache, fatigue, bloating, breast_tenderness, mood_changes, anxiety, stress, irritability, brain_fog, low_motivation.
                Normalize severity to an integer from 1 to 5. Do not save anything; the app will show a review card first.
                """;
    }

    private String periodInstructions(String currentDate) {
        String dateContext = currentDate == null || currentDate.isBlank()
                ? "Use today's date if no date was spoken."
                : "Today's date is " + currentDate + ". Resolve relative dates such as yesterday using this date.";

        return """
                You are Flowelle Voice Period Logger. You only help extract menstrual period start entries for user review.
                You are not a medical diagnostic tool and must not provide medical advice, clinical recommendations, or diagnosis.
                Listen to the user's speech and call prepare_period_log with structured data when there is enough information.
                %s
                Extract the period start date as startDate in yyyy-MM-dd format.
                If the user mentions flow, normalize it to one of: light, medium, heavy, spotting.
                Put user notes such as cramps, timing, or context in notes. Do not include medical advice.
                Do not save anything; the app will show a review card first.
                """.formatted(dateContext);
    }
}
