package com.flowelle.auth.dto;

import java.util.Set;

public record FlowelleExerciseProfileResponse(
        String activityLevel,
        Set<String> preferredActivities,
        Set<String> exerciseGoals,
        Set<String> exerciseLimitations,
        String summary,
        String userExplanation) {
}
