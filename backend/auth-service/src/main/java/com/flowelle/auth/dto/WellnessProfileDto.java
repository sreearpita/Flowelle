package com.flowelle.auth.dto;

import java.util.Set;

import jakarta.validation.constraints.Size;

public record WellnessProfileDto(
        String dietaryPattern,
        String activityLevel,
        @Size(max = 12) Set<@Size(max = 40) String> allergens,
        @Size(max = 8) Set<@Size(max = 40) String> intolerances,
        @Size(max = 6) Set<@Size(max = 50) String> nutritionGoals,
        @Size(max = 8) Set<@Size(max = 50) String> preferredActivities,
        @Size(max = 6) Set<@Size(max = 50) String> exerciseGoals,
        @Size(max = 8) Set<@Size(max = 60) String> exerciseLimitations) {
}
