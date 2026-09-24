package com.flowelle.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flowelle.auth.model.WellnessProfile;

public interface WellnessProfileRepository extends JpaRepository<WellnessProfile, Long> {
}
