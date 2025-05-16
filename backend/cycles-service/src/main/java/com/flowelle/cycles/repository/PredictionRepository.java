package com.flowelle.cycles.repository;

import com.flowelle.cycles.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUserId(Long userId);
    List<Prediction> findByCycleId(Long cycleId);
} 