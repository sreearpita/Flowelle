package com.flowelle.auth.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "cycle_length")
    @Builder.Default
    private Integer cycleLength = 28;

    @Column(name = "period_length")
    @Builder.Default
    private Integer periodLength = 5;

    @Column(name = "birth_control_use")
    @Builder.Default
    private Boolean birthControlUse = false;

    @Column(name = "notifications_enabled")
    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "ai_coach_enabled")
    @Builder.Default
    private Boolean aiCoachEnabled = false;

    @Column(name = "voice_processing_enabled")
    @Builder.Default
    private Boolean voiceProcessingEnabled = false;

    @Column(name = "analytics_opt_in")
    @Builder.Default
    private Boolean analyticsOptIn = false;

    @Column(name = "reminder_time")
    private LocalTime reminderTime;

    @Column(name = "export_requested_at")
    private LocalDateTime exportRequestedAt;

    @Column(name = "delete_requested_at")
    private LocalDateTime deleteRequestedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 
