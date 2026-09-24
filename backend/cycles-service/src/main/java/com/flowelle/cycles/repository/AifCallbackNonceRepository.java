package com.flowelle.cycles.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flowelle.cycles.model.AifCallbackNonce;

public interface AifCallbackNonceRepository extends JpaRepository<AifCallbackNonce, UUID> {
    long deleteByExpiresAtBefore(Instant cutoff);

    @Modifying
    @Query(value = "insert into aif_callback_nonces (request_id, expires_at) values (:requestId, :expiresAt)", nativeQuery = true)
    int insert(@Param("requestId") UUID requestId, @Param("expiresAt") Instant expiresAt);
}
