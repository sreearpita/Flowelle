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
@Table(name = "daily_logs")
public class DailyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "cycle_id")
    private Long cycleId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "period_flow")
    private String periodFlow;

    @Column(name = "mood")
    private String mood;

    @Column(name = "energy")
    private Integer energy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "source")
    private String source;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
