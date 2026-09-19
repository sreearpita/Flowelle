package com.flowelle.cycles.service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowelle.cycles.model.AifCallbackNonce;
import com.flowelle.cycles.repository.AifCallbackNonceRepository;
import com.flowelle.cycles.security.AifCallbackUnauthorizedException;

@Service
public class AifCallbackReplayGuard {
    private static final Duration RETENTION = Duration.ofMinutes(5);
    private final AifCallbackNonceRepository repository;

    public AifCallbackReplayGuard(AifCallbackNonceRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void accept(UUID requestId) {
        if (requestId == null) {
            throw new AifCallbackUnauthorizedException("Missing AI-Friend callback request id");
        }
        Instant now = Instant.now();
        repository.deleteByExpiresAtBefore(now);
        try {
            repository.saveAndFlush(new AifCallbackNonce(requestId, now.plus(RETENTION)));
        } catch (DataIntegrityViolationException exception) {
            throw new AifCallbackUnauthorizedException("AI-Friend callback request has already been processed");
        }
    }
}
