package com.flowelle.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivacySettingsDto {
    private Boolean aiCoachEnabled;
    private Boolean voiceProcessingEnabled;
    private Boolean analyticsOptIn;
    private Boolean notificationsEnabled;
    private String reminderTime;
    private String exportRequestedAt;
    private String deleteRequestedAt;
}
