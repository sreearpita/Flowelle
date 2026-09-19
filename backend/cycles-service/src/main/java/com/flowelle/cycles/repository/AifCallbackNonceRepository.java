package com.flowelle.cycles.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flowelle.cycles.model.AifCallbackNonce;

public interface AifCallbackNonceRepository extends JpaRepository<AifCallbackNonce, UUID> {
    long deleteByExpiresAtBefore(Instant cutoff);
}
