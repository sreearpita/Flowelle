package com.flowelle.cycles.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import com.flowelle.cycles.repository.AifCallbackNonceRepository;
import com.flowelle.cycles.security.AifCallbackUnauthorizedException;

class AifCallbackReplayGuardTest {
    @Test
    void rejectsDuplicateRequestIds() {
        var repository = mock(AifCallbackNonceRepository.class);
        when(repository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("duplicate"));
        var guard = new AifCallbackReplayGuard(repository);

        assertThatThrownBy(() -> guard.accept(UUID.randomUUID()))
                .isInstanceOf(AifCallbackUnauthorizedException.class)
                .hasMessageContaining("already been processed");
    }
}
