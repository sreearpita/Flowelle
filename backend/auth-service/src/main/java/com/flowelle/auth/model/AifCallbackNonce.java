package com.flowelle.auth.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "aif_callback_nonces")
public class AifCallbackNonce {
    @Id
    private UUID requestId;
    private Instant expiresAt;

    protected AifCallbackNonce() {
    }

    public AifCallbackNonce(UUID requestId, Instant expiresAt) {
        this.requestId = requestId;
        this.expiresAt = expiresAt;
    }
}
