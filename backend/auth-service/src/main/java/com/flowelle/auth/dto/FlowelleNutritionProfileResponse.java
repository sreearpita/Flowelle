package com.flowelle.auth.dto;

import java.util.Set;

public record FlowelleNutritionProfileResponse(
        String dietaryPattern,
        Set<String> allergens,
        Set<String> intolerances,
        Set<String> nutritionGoals,
        String summary,
        String userExplanation) {
}
