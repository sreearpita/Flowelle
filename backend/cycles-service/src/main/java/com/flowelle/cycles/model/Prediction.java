package com.flowelle.cycles.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "predictions")
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "next_period_date")
    private LocalDate nextPeriodDate;

    @Column(name = "fertile_window_start")
    private LocalDate fertileWindowStart;

    @Column(name = "fertile_window_end")
    private LocalDate fertileWindowEnd;

    @Column(name = "ovulation_date")
    private LocalDate ovulationDate;

    @Column(name = "confidence_score")
    private Float confidenceScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 