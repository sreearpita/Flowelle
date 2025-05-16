package com.flowelle.cycles.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "predictions")
public class Prediction {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "cycle_id", nullable = false)
    private UUID cycleId;

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