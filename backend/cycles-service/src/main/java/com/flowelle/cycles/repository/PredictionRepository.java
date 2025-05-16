package com.flowelle.cycles.repository;

import com.flowelle.cycles.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, UUID> {
    List<Prediction> findByUserId(UUID userId);
    List<Prediction> findByCycleId(UUID cycleId);
} 