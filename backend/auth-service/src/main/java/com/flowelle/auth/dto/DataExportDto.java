package com.flowelle.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataExportDto {
    private String generatedAt;
    private UserResponse profile;
    private PrivacySettingsDto privacy;
    private WellnessProfileDto wellnessProfile;
    private Object cycleData;
    private String exportNotice;
}
