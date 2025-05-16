package com.flowelle.cycles.repository;

import com.flowelle.cycles.model.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomRepository extends JpaRepository<Symptom, Long> {
    List<Symptom> findByCycleId(Long cycleId);
} 