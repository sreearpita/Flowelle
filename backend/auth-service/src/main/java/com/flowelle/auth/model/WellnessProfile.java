package com.flowelle.auth.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "wellness_profiles")
public class WellnessProfile {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_pattern", length = 40)
    private DietaryPattern dietaryPattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level", length = 40)
    private ActivityLevel activityLevel;

    @ElementCollection
    @CollectionTable(name = "wellness_profile_allergens", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "allergen", length = 40)
    @Builder.Default
    private Set<String> allergens = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "wellness_profile_intolerances", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "intolerance", length = 40)
    @Builder.Default
    private Set<String> intolerances = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "wellness_profile_nutrition_goals", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "goal", length = 50)
    @Builder.Default
    private Set<String> nutritionGoals = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "wellness_profile_activities", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "activity", length = 50)
    @Builder.Default
    private Set<String> preferredActivities = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "wellness_profile_exercise_goals", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "goal", length = 50)
    @Builder.Default
    private Set<String> exerciseGoals = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "wellness_profile_limitations", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "limitation", length = 60)
    @Builder.Default
    private Set<String> exerciseLimitations = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void touch() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
