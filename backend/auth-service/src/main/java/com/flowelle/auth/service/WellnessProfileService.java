package com.flowelle.auth.service;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowelle.auth.dto.FlowelleExerciseProfileResponse;
import com.flowelle.auth.dto.FlowelleNutritionProfileResponse;
import com.flowelle.auth.dto.WellnessProfileDto;
import com.flowelle.auth.model.ActivityLevel;
import com.flowelle.auth.model.DietaryPattern;
import com.flowelle.auth.model.WellnessProfile;
import com.flowelle.auth.repository.WellnessProfileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WellnessProfileService {
    private final WellnessProfileRepository repository;

    @Transactional
    public WellnessProfileDto get(Long userId) {
        return toDto(repository.findById(userId).orElseGet(() -> empty(userId)));
    }

    @Transactional
    public WellnessProfileDto update(Long userId, WellnessProfileDto request) {
        WellnessProfile profile = repository.findById(userId).orElseGet(() -> empty(userId));
        profile.setDietaryPattern(parseEnum(request.dietaryPattern(), DietaryPattern.class, "dietaryPattern"));
        profile.setActivityLevel(parseEnum(request.activityLevel(), ActivityLevel.class, "activityLevel"));
        profile.setAllergens(normalize(request.allergens()));
        profile.setIntolerances(normalize(request.intolerances()));
        profile.setNutritionGoals(normalize(request.nutritionGoals()));
        profile.setPreferredActivities(normalize(request.preferredActivities()));
        profile.setExerciseGoals(normalize(request.exerciseGoals()));
        profile.setExerciseLimitations(normalize(request.exerciseLimitations()));
        profile.touch();
        return toDto(repository.save(profile));
    }

    public FlowelleNutritionProfileResponse nutrition(Long userId) {
        WellnessProfile profile = repository.findById(userId).orElse(null);
        if (profile == null || (profile.getDietaryPattern() == null && profile.getAllergens().isEmpty()
                && profile.getIntolerances().isEmpty() && profile.getNutritionGoals().isEmpty())) return null;
        return new FlowelleNutritionProfileResponse(
                value(profile.getDietaryPattern()), profile.getAllergens(), profile.getIntolerances(),
                profile.getNutritionGoals(), "Flowelle nutrition preferences are available.",
                "I used your Flowelle nutrition preferences.");
    }

    public FlowelleExerciseProfileResponse exercise(Long userId) {
        WellnessProfile profile = repository.findById(userId).orElse(null);
        if (profile == null || (profile.getActivityLevel() == null && profile.getPreferredActivities().isEmpty()
                && profile.getExerciseGoals().isEmpty() && profile.getExerciseLimitations().isEmpty())) return null;
        return new FlowelleExerciseProfileResponse(
                value(profile.getActivityLevel()), profile.getPreferredActivities(), profile.getExerciseGoals(),
                profile.getExerciseLimitations(), "Flowelle exercise preferences are available.",
                "I used your Flowelle exercise preferences.");
    }

    @Transactional
    public void delete(Long userId) {
        repository.deleteById(userId);
    }

    private WellnessProfile empty(Long userId) {
        WellnessProfile profile = WellnessProfile.builder().userId(userId).build();
        profile.touch();
        return profile;
    }

    private WellnessProfileDto toDto(WellnessProfile p) {
        return new WellnessProfileDto(value(p.getDietaryPattern()), value(p.getActivityLevel()), p.getAllergens(),
                p.getIntolerances(), p.getNutritionGoals(), p.getPreferredActivities(), p.getExerciseGoals(),
                p.getExerciseLimitations());
    }

    private String value(Enum<?> value) { return value == null ? null : value.name(); }

    private Set<String> normalize(Set<String> values) {
        return values == null ? Set.of() : values.stream().filter(v -> v != null && !v.isBlank())
                .map(v -> v.trim().toUpperCase(Locale.ROOT)).collect(Collectors.toUnmodifiableSet());
    }

    private <T extends Enum<T>> T parseEnum(String value, Class<T> type, String field) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid " + field); }
    }
}
