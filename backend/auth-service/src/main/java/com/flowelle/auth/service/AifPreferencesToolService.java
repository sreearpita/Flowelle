package com.flowelle.auth.service;

import java.util.Optional;

import com.flowelle.auth.dto.AifToolRequest;
import com.flowelle.auth.dto.FlowelleUserPreferencesResponse;
import com.flowelle.auth.model.UserPreferences;
import com.flowelle.auth.repository.UserPreferencesRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AifPreferencesToolService {
    private final UserPreferencesRepository userPreferencesRepository;

    public Optional<FlowelleUserPreferencesResponse> buildPreferences(AifToolRequest request) {
        Long userId = parseUserId(request.externalUserId());
        return userPreferencesRepository.findById(userId)
                .map(this::toResponse);
    }

    private FlowelleUserPreferencesResponse toResponse(UserPreferences preferences) {
        String summary = "Flowelle preferences indicate a typical cycle length of "
                + preferences.getCycleLength()
                + " days and period length of "
                + preferences.getPeriodLength()
                + " days.";

        return new FlowelleUserPreferencesResponse(
                preferences.getCycleLength(),
                preferences.getPeriodLength(),
                preferences.getBirthControlUse(),
                preferences.getNotificationsEnabled(),
                preferences.getAiCoachEnabled(),
                preferences.getVoiceProcessingEnabled(),
                preferences.getAnalyticsOptIn(),
                summary,
                "I used your Flowelle preferences.");
    }

    private Long parseUserId(String externalUserId) {
        try {
            return Long.parseLong(externalUserId);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("externalUserId must be a Flowelle numeric user id");
        }
    }
}
