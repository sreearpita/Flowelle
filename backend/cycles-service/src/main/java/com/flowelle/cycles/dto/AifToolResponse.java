package com.flowelle.cycles.dto;

import java.util.Map;

public record AifToolResponse(
        String toolName,
        String status,
        String summary,
        Map<String, Object> facts,
        String userExplanation) {
}
